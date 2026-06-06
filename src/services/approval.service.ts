import { approvalDetailsData } from "@/mock/approvals.mock";
import { appendAuditLog } from "@/mock/audit.mock";
import { distributionService } from "@/services/distribution.service";
import type { ApiResponse } from "@/types/api";
import type { DistributionApprovalDetails } from "@/types/approval";
import type { AuthUser } from "@/types/auth";

function approvalDetailsForDistribution(distributionId: string): DistributionApprovalDetails | null {
  const distribution = distributionService.getDistributionSnapshot(distributionId);

  if (!distribution) {
    return null;
  }

  return {
    distributionId: distribution.id,
    approvalStatus: distribution.approvalStatus,
    finalApprovalStatus: distribution.finalApprovalStatus,
    executionStatus: distribution.executionStatus,
    validationSummary: distribution.validationSummary,
    approvalSteps: distribution.distributionApprovalSteps,
    approvalHistory: distribution.approvalHistory,
    rejectionReason: distribution.rejectionReason,
    isHighRisk: distribution.isHighRisk,
  };
}

function syncApprovalCache(distributionId: string) {
  const next = approvalDetailsForDistribution(distributionId);
  const existingIndex = approvalDetailsData.findIndex((item) => item.distributionId === distributionId);

  if (!next) {
    return null;
  }

  if (existingIndex >= 0) {
    approvalDetailsData[existingIndex] = next;
  } else {
    approvalDetailsData.unshift(next);
  }

  return next;
}

function appendWorkflowAudit(params: {
  actor: AuthUser;
  action: "APPROVE" | "UPDATE" | "CANCEL";
  description: string;
  distributionId: string;
  distributionName: string;
  organizationId: string;
  organizationName: string;
  metadata: Record<string, unknown>;
}) {
  const timestamp = new Date().toISOString();

  appendAuditLog({
    timestamp,
    userId: params.actor.id,
    userName: params.actor.name,
    userEmail: params.actor.email,
    role: params.actor.role,
    organizationId: params.organizationId,
    organizationName: params.organizationName,
    module: "DISTRIBUTION",
    action: params.action,
    resourceId: params.distributionId,
    resourceName: params.distributionName,
    result: "SUCCESS",
    ipAddress: "197.210.55.12",
    description: params.description,
    metadata: params.metadata,
    relatedRecords: [
      { id: params.organizationId, type: "ORGANIZATION", name: params.organizationName },
      { id: params.distributionId, type: "DISTRIBUTION", name: params.distributionName },
    ],
    timeline: [
      { id: `${params.distributionId}_audit_1`, label: "Event captured", timestamp },
      { id: `${params.distributionId}_audit_2`, label: "Approval workflow validated", timestamp: new Date(new Date(timestamp).getTime() + 120000).toISOString() },
      { id: `${params.distributionId}_audit_3`, label: "Audit record stored", timestamp: new Date(new Date(timestamp).getTime() + 240000).toISOString() },
    ],
  });
}

export const approvalService = {
  async getApprovalByDistributionId(distributionId: string): Promise<ApiResponse<DistributionApprovalDetails | null>> {
    const details = syncApprovalCache(distributionId);

    return Promise.resolve({
      success: Boolean(details),
      message: details ? "Approval details fetched successfully" : "Approval details not found",
      data: details,
    });
  },

  async submitForApproval(distributionId: string, actor: AuthUser): Promise<ApiResponse<DistributionApprovalDetails | null>> {
    return Promise.resolve({
      success: false,
      message: "Agency approval starts automatically when a distribution is created.",
      data: syncApprovalCache(distributionId),
    });
  },

  async approveDistribution(distributionId: string, actor: AuthUser): Promise<ApiResponse<DistributionApprovalDetails | null>> {
    const distribution = distributionService.getDistributionSnapshot(distributionId);

    if (!distribution) {
      return Promise.resolve({ success: false, message: "Distribution not found", data: null });
    }

    if (distribution.organizationId !== actor.organizationId) {
      return Promise.resolve({ success: false, message: "Approval access denied", data: null });
    }
    const currentStep = distribution.distributionApprovalSteps.find((step) => step.status === "PENDING");
    if (!currentStep || currentStep.assigneeUserId !== actor.id) {
      return Promise.resolve({ success: false, message: "This approval step is assigned to another agency approver.", data: null });
    }
    distributionService.updateDistributionApprovalDecision(distributionId, {
      actorName: actor.name,
      approve: true,
    });

    appendWorkflowAudit({
      actor,
      action: "APPROVE",
      description: "Distribution approved",
      distributionId,
      distributionName: distribution.name,
      organizationId: distribution.organizationId,
      organizationName: distribution.organizationName,
      metadata: {
        approvalStatus: "APPROVED",
        highRisk: distribution.isHighRisk,
        estimatedTotalAmount: distribution.validationSummary.estimatedTotalAmount,
      },
    });

    return Promise.resolve({
      success: true,
      message:
        syncApprovalCache(distributionId)?.approvalStatus === "APPROVED"
          ? "Distribution fully approved successfully"
          : `Step ${currentStep.order} approved. The next agency approver can now review this distribution.`,
      data: syncApprovalCache(distributionId),
    });
  },

  async rejectDistribution(
    distributionId: string,
    reason: string,
    actor: AuthUser,
  ): Promise<ApiResponse<DistributionApprovalDetails | null>> {
    const distribution = distributionService.getDistributionSnapshot(distributionId);

    if (!distribution) {
      return Promise.resolve({ success: false, message: "Distribution not found", data: null });
    }

    if (!reason.trim()) {
      return Promise.resolve({ success: false, message: "Rejection reason is required", data: null });
    }

    if (distribution.organizationId !== actor.organizationId) {
      return Promise.resolve({ success: false, message: "Approval access denied", data: null });
    }
    const currentStep = distribution.distributionApprovalSteps.find((step) => step.status === "PENDING");
    if (!currentStep || currentStep.assigneeUserId !== actor.id) {
      return Promise.resolve({ success: false, message: "This approval step is assigned to another agency approver.", data: null });
    }
    distributionService.updateDistributionApprovalDecision(distributionId, {
      actorName: actor.name,
      approve: false,
      reason: reason.trim(),
    });

    appendWorkflowAudit({
      actor,
      action: "CANCEL",
      description: "Distribution rejected",
      distributionId,
      distributionName: distribution.name,
      organizationId: distribution.organizationId,
      organizationName: distribution.organizationName,
      metadata: {
        approvalStatus: "REJECTED",
        rejectionReason: reason.trim(),
      },
    });

    return Promise.resolve({
      success: true,
      message: `Distribution rejected at Step ${currentStep.order}.`,
      data: syncApprovalCache(distributionId),
    });
  },

  async approveDistributionFinalReview(distributionId: string, actor: AuthUser): Promise<ApiResponse<DistributionApprovalDetails | null>> {
    const distribution = distributionService.getDistributionSnapshot(distributionId);

    if (!distribution) {
      return Promise.resolve({ success: false, message: "Distribution not found", data: null });
    }

    if (actor.role !== "SUPER_ADMIN") {
      return Promise.resolve({ success: false, message: "Only super admin can complete final distribution approval.", data: null });
    }

    if (distribution.approvalStatus !== "APPROVED" || distribution.finalApprovalStatus !== "PENDING") {
      return Promise.resolve({ success: false, message: "This distribution is not awaiting final approval.", data: null });
    }

    distributionService.approveDistributionFinalReview(distributionId, actor.name);

    appendWorkflowAudit({
      actor,
      action: "APPROVE",
      description: "Final distribution approval completed",
      distributionId,
      distributionName: distribution.name,
      organizationId: distribution.organizationId,
      organizationName: distribution.organizationName,
      metadata: {
        finalApprovalStatus: "APPROVED",
        approvalStatus: distribution.approvalStatus,
      },
    });

    return Promise.resolve({
      success: true,
      message: "Final super admin approval completed. Agency accountant can now proceed with payment.",
      data: syncApprovalCache(distributionId),
    });
  },

  async rejectDistributionFinalReview(
    distributionId: string,
    reason: string,
    actor: AuthUser,
  ): Promise<ApiResponse<DistributionApprovalDetails | null>> {
    const distribution = distributionService.getDistributionSnapshot(distributionId);

    if (!distribution) {
      return Promise.resolve({ success: false, message: "Distribution not found", data: null });
    }

    if (actor.role !== "SUPER_ADMIN") {
      return Promise.resolve({ success: false, message: "Only super admin can reject final distribution approval.", data: null });
    }

    if (!reason.trim()) {
      return Promise.resolve({ success: false, message: "Rejection reason is required", data: null });
    }

    if (distribution.approvalStatus !== "APPROVED" || distribution.finalApprovalStatus !== "PENDING") {
      return Promise.resolve({ success: false, message: "This distribution is not awaiting final approval.", data: null });
    }

    distributionService.rejectDistributionFinalReview(distributionId, actor.name, reason.trim());

    appendWorkflowAudit({
      actor,
      action: "CANCEL",
      description: "Final distribution approval rejected",
      distributionId,
      distributionName: distribution.name,
      organizationId: distribution.organizationId,
      organizationName: distribution.organizationName,
      metadata: {
        finalApprovalStatus: "REJECTED",
        rejectionReason: reason.trim(),
      },
    });

    return Promise.resolve({
      success: true,
      message: "Final super admin approval rejected.",
      data: syncApprovalCache(distributionId),
    });
  },
};
