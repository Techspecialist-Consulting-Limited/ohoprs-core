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
    executionStatus: distribution.executionStatus,
    validationSummary: distribution.validationSummary,
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
    const distribution = distributionService.getDistributionSnapshot(distributionId);

    if (!distribution) {
      return Promise.resolve({ success: false, message: "Distribution not found", data: null });
    }

    if (actor.role === "PROGRAM_OFFICER" && distribution.createdByUserId !== actor.id) {
      return Promise.resolve({
        success: false,
        message: "You can only submit distributions you created.",
        data: null,
      });
    }

    const timestamp = new Date().toISOString();
    distributionService.updateApprovalState(distributionId, {
      approvalStatus: "SUBMITTED",
      historyEntry: {
        id: `${distributionId}_submitted_${Date.now()}`,
        label: "Submitted for approval",
        actor: actor.name,
        timestamp,
        note: "Distribution submitted for approval review.",
      },
    });

    appendWorkflowAudit({
      actor,
      action: "UPDATE",
      description: "Distribution submitted for approval",
      distributionId,
      distributionName: distribution.name,
      organizationId: distribution.organizationId,
      organizationName: distribution.organizationName,
      metadata: {
        approvalStatus: "SUBMITTED",
        beneficiaryCount: distribution.beneficiaryCount,
        estimatedTotalAmount: distribution.validationSummary.estimatedTotalAmount,
      },
    });

    return Promise.resolve({
      success: true,
      message: "Distribution submitted for approval",
      data: syncApprovalCache(distributionId),
    });
  },

  async approveDistribution(distributionId: string, actor: AuthUser): Promise<ApiResponse<DistributionApprovalDetails | null>> {
    const distribution = distributionService.getDistributionSnapshot(distributionId);

    if (!distribution) {
      return Promise.resolve({ success: false, message: "Distribution not found", data: null });
    }

    if (actor.role !== "ORG_ADMIN") {
      return Promise.resolve({ success: false, message: "Only Organization Admin can approve distributions", data: null });
    }

    if (distribution.organizationId !== actor.organizationId) {
      return Promise.resolve({ success: false, message: "Approval access denied", data: null });
    }

    if (distribution.createdByUserId === actor.id) {
      return Promise.resolve({
        success: false,
        message: "You cannot approve a distribution you created.",
        data: null,
      });
    }

    const timestamp = new Date().toISOString();
    distributionService.updateApprovalState(distributionId, {
      approvalStatus: "APPROVED",
      historyEntry: {
        id: `${distributionId}_approved_${Date.now()}`,
        label: "Approved",
        actor: actor.name,
        timestamp,
        note: distribution.isHighRisk ? "Approved as high-risk batch under supervisory review." : "Approved for payment execution.",
      },
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
      message: "Distribution approved successfully",
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

    if (actor.role !== "ORG_ADMIN") {
      return Promise.resolve({ success: false, message: "Only Organization Admin can reject distributions", data: null });
    }

    if (distribution.organizationId !== actor.organizationId) {
      return Promise.resolve({ success: false, message: "Approval access denied", data: null });
    }

    if (distribution.createdByUserId === actor.id) {
      return Promise.resolve({
        success: false,
        message: "You cannot reject a distribution you created.",
        data: null,
      });
    }

    const timestamp = new Date().toISOString();
    distributionService.updateApprovalState(distributionId, {
      approvalStatus: "REJECTED",
      executionStatus: "NOT_STARTED",
      rejectionReason: reason.trim(),
      historyEntry: {
        id: `${distributionId}_rejected_${Date.now()}`,
        label: "Rejected",
        actor: actor.name,
        timestamp,
        note: reason.trim(),
      },
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
      message: "Distribution rejected successfully",
      data: syncApprovalCache(distributionId),
    });
  },
};
