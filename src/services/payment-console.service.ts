"use client";

import { appendAuditLog } from "@/mock/audit.mock";
import {
  auditPreviewForDistribution,
  ensurePaymentConsoleStore,
  getPaymentConsoleStoreItem,
  replacePaymentConsoleStoreItem,
} from "@/mock/payment-console.mock";
import { distributionService } from "@/services/distribution.service";
import type { ApiResponse } from "@/types/api";
import type { AuthUser, UserRole } from "@/types/auth";
import type { DistributionApprovalHistoryItem, DistributionDetails } from "@/types/distribution";
import type { PaymentStatus } from "@/types/payment";
import type {
  PaymentConsoleData,
  PaymentConsoleExportResult,
  PaymentConsoleFilters,
  PaymentConsoleMutationResult,
  PaymentConsolePaymentRecord,
  PaymentConsoleScope,
  PaymentConsoleStoreItem,
  PaymentConsoleTimelineItem,
} from "@/types/payment-console";

function clone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}

function isCashMethod(method: DistributionDetails["method"]) {
  return method === "BANK_TRANSFER" || method === "MOBILE_MONEY" || method === "CASH";
}

function canViewDistribution(role: UserRole, distribution: DistributionDetails, user: AuthUser | null) {
  if (role === "SUPER_ADMIN" || role === "AUDITOR") {
    return true;
  }

  return distribution.organizationId === user?.organizationId;
}

function canSubmit(distribution: DistributionDetails, user: AuthUser | null) {
  return distribution.approvalStatus === "DRAFT" && distribution.createdByUserId === user?.id;
}

function canApproveOrReject(role: UserRole, distribution: DistributionDetails, user: AuthUser | null) {
  if (distribution.approvalStatus !== "SUBMITTED") {
    return false;
  }

  if (role !== "ORG_ADMIN") {
    return false;
  }

  return (
    distribution.organizationId === user?.organizationId &&
    distribution.createdByUserId !== user?.id
  );
}

function canProcess(role: UserRole, distribution: DistributionDetails) {
  return role === "SUPER_ADMIN" && distribution.approvalStatus === "APPROVED" && isCashMethod(distribution.method);
}

function highRiskReasons(distribution: DistributionDetails) {
  const reasons: string[] = [];
  if ((distribution.validationSummary.estimatedTotalAmount ?? 0) >= 500000000) {
    reasons.push("Estimated payout exceeds N500M.");
  }
  if (distribution.beneficiaryCount >= 10000) {
    reasons.push("Beneficiary count exceeds 10,000.");
  }
  if (distribution.validationSummary.flaggedBeneficiaries > 0) {
    reasons.push("Flagged beneficiaries require compliance attention.");
  }
  return reasons;
}

function paymentBelongsToFailureRule(payment: PaymentConsolePaymentRecord) {
  return (
    payment.verificationStatus === "FAILED" ||
    payment.verificationStatus === "FLAGGED" ||
    !payment.bankVerified ||
    !payment.hasAccountMetadata ||
    payment.riskFlags.includes("DUPLICATE_REVIEW")
  );
}

function paymentTimelineEvent(
  distributionId: string,
  label: string,
  description: string,
  actor: string,
  tone: PaymentConsoleTimelineItem["tone"],
) {
  return {
    id: `${distributionId}_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
    label,
    description,
    timestamp: new Date().toISOString(),
    actor,
    tone,
  } satisfies PaymentConsoleTimelineItem;
}

function summarizeExecution(payments: PaymentConsolePaymentRecord[]) {
  const paidPayments = payments.filter((payment) => payment.status === "PAID").length;
  const failedPayments = payments.filter((payment) => payment.status === "FAILED" || payment.status === "RETRY_PENDING").length;
  const pendingPayments = payments.filter((payment) => payment.status === "PENDING").length;
  const processingPayments = payments.filter((payment) => payment.status === "PROCESSING").length;
  const reversedPayments = payments.filter((payment) => payment.status === "REVERSED").length;
  const total = Math.max(payments.length, 1);
  const progressPercentage = Math.round(((paidPayments + failedPayments + reversedPayments) / total) * 100);

  return {
    progressPercentage,
    paidPayments,
    failedPayments,
    pendingPayments,
    processingPayments,
    reversedPayments,
  };
}

function determineExecutionStatus(payments: PaymentConsolePaymentRecord[]) {
  const paid = payments.filter((payment) => payment.status === "PAID").length;
  const failed = payments.filter((payment) => payment.status === "FAILED" || payment.status === "RETRY_PENDING").length;
  const processing = payments.filter((payment) => payment.status === "PROCESSING").length;
  const pending = payments.filter((payment) => payment.status === "PENDING").length;
  const reversed = payments.filter((payment) => payment.status === "REVERSED").length;

  if (!payments.length || (pending === payments.length && paid === 0 && failed === 0 && processing === 0)) {
    return "NOT_STARTED" as const;
  }

  if (processing > 0) {
    return "PROCESSING" as const;
  }

  if (reversed > 0 && paid === 0 && failed === 0 && pending === 0) {
    return "REVERSED" as const;
  }

  if (paid > 0 && failed > 0) {
    return "PARTIALLY_PROCESSED" as const;
  }

  if (paid === payments.length) {
    return "COMPLETED" as const;
  }

  if (failed === payments.length) {
    return "FAILED" as const;
  }

  return "PARTIALLY_PROCESSED" as const;
}

function auditActor(user: AuthUser) {
  return {
    userId: user.id,
    userName: user.name,
    userEmail: user.email,
    role: user.role,
  };
}

function appendDistributionAudit(user: AuthUser, distribution: DistributionDetails, action: "APPROVE" | "UPDATE" | "CANCEL" | "EXPORT", description: string, metadata: Record<string, unknown>) {
  appendAuditLog({
    timestamp: new Date().toISOString(),
    ...auditActor(user),
    organizationId: distribution.organizationId,
    organizationName: distribution.organizationName,
    module: "DISTRIBUTION",
    action,
    resourceId: distribution.id,
    resourceName: distribution.name,
    result: "SUCCESS",
    ipAddress: "197.210.55.12",
    description,
    metadata,
    relatedRecords: [
      { id: distribution.organizationId, type: "ORGANIZATION", name: distribution.organizationName },
      { id: distribution.programId, type: "PROGRAM", name: distribution.programName },
      { id: distribution.id, type: "DISTRIBUTION", name: distribution.name },
    ],
    timeline: [
      { id: `${distribution.id}_audit_1`, label: "Event captured", timestamp: new Date().toISOString() },
      { id: `${distribution.id}_audit_2`, label: "Validation completed", timestamp: new Date(Date.now() + 120000).toISOString() },
      { id: `${distribution.id}_audit_3`, label: "Audit record stored", timestamp: new Date(Date.now() + 240000).toISOString() },
    ],
  });
}

function getDistributionOrNull(distributionId: string) {
  return distributionService.getDistributionSnapshot(distributionId);
}

function filteredPayments(payments: PaymentConsolePaymentRecord[], filters: PaymentConsoleFilters) {
  return payments.filter((payment) => {
    if (filters.search.trim()) {
      const term = filters.search.trim().toLowerCase();
      const searchable = [
        payment.beneficiaryName,
        payment.beneficiaryState,
        payment.bankName,
        payment.paymentReference ?? "",
      ].join(" ").toLowerCase();
      if (!searchable.includes(term)) {
        return false;
      }
    }

    if (filters.state !== "ALL" && payment.beneficiaryState !== filters.state) {
      return false;
    }

    if (filters.verificationStatus !== "ALL" && payment.verificationStatus !== filters.verificationStatus) {
      return false;
    }

    if (filters.paymentStatus !== "ALL" && payment.status !== filters.paymentStatus) {
      return false;
    }

    if (filters.showOnlyFailed && payment.status !== "FAILED" && payment.status !== "RETRY_PENDING") {
      return false;
    }

    return true;
  });
}

function readinessSummary(distribution: DistributionDetails, payments: PaymentConsolePaymentRecord[]) {
  return {
    totalBeneficiaries: distribution.beneficiaryCount,
    eligibleBeneficiaries: payments.filter((payment) => !paymentBelongsToFailureRule(payment)).length,
    pendingPayments: payments.filter((payment) => payment.status === "PENDING" || payment.status === "PROCESSING" || payment.status === "RETRY_PENDING").length,
    paidPayments: payments.filter((payment) => payment.status === "PAID").length,
    failedPayments: payments.filter((payment) => payment.status === "FAILED").length,
    reversedPayments: payments.filter((payment) => payment.status === "REVERSED").length,
    estimatedTotalPayout: payments.reduce((sum, payment) => sum + payment.amount, 0),
  };
}

function validationSummary(payments: PaymentConsolePaymentRecord[]) {
  return {
    verifiedBeneficiaries: payments.filter((payment) => payment.verificationStatus === "VERIFIED").length,
    pendingVerification: payments.filter((payment) => payment.verificationStatus === "PENDING").length,
    failedVerification: payments.filter((payment) => payment.verificationStatus === "FAILED").length,
    flaggedBeneficiaries: payments.filter((payment) => payment.verificationStatus === "FLAGGED").length,
    duplicateRecords: payments.filter((payment) => payment.duplicateCheck === "FAILED" || payment.duplicateCheck === "REVIEW_REQUIRED").length,
    bankFailures: payments.filter((payment) => !payment.bankVerified).length,
    missingPaymentProfiles: payments.filter((payment) => !payment.hasAccountMetadata).length,
  };
}

function governanceSummary(distribution: DistributionDetails) {
  const approvedEntry = distribution.approvalHistory.find((item) => item.label === "Approved");
  const latestApproval = distribution.approvalHistory[0];

  return {
    approvalStatus: distribution.approvalStatus,
    executionStatus: distribution.executionStatus,
    approvedBy: approvedEntry?.actor,
    approvedAt: approvedEntry?.timestamp,
    latestApprovalNote: latestApproval?.note,
    createdBy: distribution.createdBy,
    createdAt: distribution.createdAt,
    updatedAt: distribution.updatedAt,
    rejectionReason: distribution.rejectionReason,
  };
}

function toConsoleData(distribution: DistributionDetails, store: PaymentConsoleStoreItem): PaymentConsoleData {
  const payments = clone(store.payments);
  const readiness = readinessSummary(distribution, payments);
  const validation = validationSummary(payments);
  const execution = summarizeExecution(payments);
  const riskReasons = highRiskReasons(distribution);
  const auditPreview = auditPreviewForDistribution(distribution.id);

  return {
    distribution,
    readiness,
    governance: governanceSummary(distribution),
    validation,
    risk: {
      isHighRisk: riskReasons.length > 0,
      reasons: riskReasons,
    },
    payments,
    execution,
    failedPreview: payments
      .filter((payment) => payment.status === "FAILED" || payment.status === "RETRY_PENDING")
      .slice(0, 5)
      .map((payment) => ({
        id: payment.id,
        beneficiaryName: payment.beneficiaryName,
        reason: payment.failureReason ?? "Mock failure recorded",
        status: payment.status,
      })),
    executionTimeline: clone(store.executionTimeline),
    approvalHistory: clone(distribution.approvalHistory),
    auditPreview: auditPreview.map((item) => ({
      id: item.id,
      timestamp: item.timestamp,
      actor: item.userName,
      role: item.role,
      action: item.action,
      result: item.result,
      description: item.description,
    })),
    isCashDistribution: isCashMethod(distribution.method),
  };
}

function withStore(distributionId: string) {
  const distribution = getDistributionOrNull(distributionId);
  if (!distribution) {
    return null;
  }

  const ensured = ensurePaymentConsoleStore(distributionId);
  const store = ensured ?? getPaymentConsoleStoreItem(distributionId) ?? {
    distributionId,
    beneficiaryIds: [],
    payments: [],
    executionTimeline: [],
  };

  return { distribution, store };
}

function updateDistributionExecution(distribution: DistributionDetails, store: PaymentConsoleStoreItem, actor: string, note: string) {
  const executionStatus = determineExecutionStatus(store.payments);
  const updated = distributionService.updateExecutionState(distribution.id, executionStatus, actor, note);
  return updated;
}

function updateStoreAndDistribution(distribution: DistributionDetails, store: PaymentConsoleStoreItem, note: string, actor: string) {
  const replaced = replacePaymentConsoleStoreItem(store);
  const updatedDistribution = updateDistributionExecution(distribution, store, actor, note) ?? distribution;
  return {
    distribution: updatedDistribution,
    store: replaced ?? store,
  };
}

function nextPaymentStatusForRetry(payment: PaymentConsolePaymentRecord): PaymentStatus {
  return paymentBelongsToFailureRule(payment) ? "FAILED" : "PAID";
}

export const paymentConsoleService = {
  async getConsole(distributionId: string, scope: PaymentConsoleScope): Promise<ApiResponse<PaymentConsoleData | null>> {
    const result = withStore(distributionId);
    if (!result) {
      return { success: false, message: "Distribution not found", data: null };
    }

    if (!canViewDistribution(scope.role, result.distribution, scope.user)) {
      return { success: false, message: "You do not have access to this distribution payment console.", data: null };
    }

    return {
      success: true,
      message: "Payment console loaded successfully",
      data: toConsoleData(result.distribution, result.store),
    };
  },

  async submitForApproval(distributionId: string, user: AuthUser): Promise<ApiResponse<PaymentConsoleMutationResult>> {
    const result = withStore(distributionId);
    if (!result) {
      return { success: false, message: "Distribution not found", data: { console: null } };
    }

    if (user.role !== "PROGRAM_OFFICER" || !canSubmit(result.distribution, user)) {
      return { success: false, message: "You cannot submit this distribution for approval.", data: { console: null } };
    }

    const historyEntry: DistributionApprovalHistoryItem = {
      id: `${distributionId}_submit_${Date.now()}`,
      label: "Submitted for approval",
      actor: user.name,
      timestamp: new Date().toISOString(),
      note: "Distribution submitted from the payment execution console.",
    };

    const updatedDistribution = distributionService.updateApprovalState(distributionId, {
      approvalStatus: "SUBMITTED",
      historyEntry,
    });

    if (!updatedDistribution) {
      return { success: false, message: "Distribution not found", data: { console: null } };
    }

    appendDistributionAudit(user, updatedDistribution, "UPDATE", "Distribution submitted for approval from payment console", {
      approvalStatus: "SUBMITTED",
    });

    return {
      success: true,
      message: "Distribution submitted for approval",
      data: {
        console: toConsoleData(updatedDistribution, result.store),
      },
    };
  },

  async approveDistribution(distributionId: string, user: AuthUser): Promise<ApiResponse<PaymentConsoleMutationResult>> {
    const result = withStore(distributionId);
    if (!result) {
      return { success: false, message: "Distribution not found", data: { console: null } };
    }

    if (!canApproveOrReject(user.role, result.distribution, user)) {
      return { success: false, message: "You cannot approve this distribution.", data: { console: null } };
    }

    const historyEntry: DistributionApprovalHistoryItem = {
      id: `${distributionId}_approve_${Date.now()}`,
      label: "Approved",
      actor: user.name,
      timestamp: new Date().toISOString(),
      note: "Payment governance checks cleared for execution.",
    };

    const updatedDistribution = distributionService.updateApprovalState(distributionId, {
      approvalStatus: "APPROVED",
      executionStatus: "NOT_STARTED",
      historyEntry,
    });

    if (!updatedDistribution) {
      return { success: false, message: "Distribution not found", data: { console: null } };
    }

    appendDistributionAudit(user, updatedDistribution, "APPROVE", "Distribution approved from payment console", {
      approvalStatus: "APPROVED",
    });

    return {
      success: true,
      message: "Distribution approved",
      data: { console: toConsoleData(updatedDistribution, result.store) },
    };
  },

  async rejectDistribution(distributionId: string, user: AuthUser, reason: string): Promise<ApiResponse<PaymentConsoleMutationResult>> {
    const result = withStore(distributionId);
    if (!result) {
      return { success: false, message: "Distribution not found", data: { console: null } };
    }

    if (!canApproveOrReject(user.role, result.distribution, user)) {
      return { success: false, message: "You cannot reject this distribution.", data: { console: null } };
    }

    const historyEntry: DistributionApprovalHistoryItem = {
      id: `${distributionId}_reject_${Date.now()}`,
      label: "Rejected",
      actor: user.name,
      timestamp: new Date().toISOString(),
      note: reason,
    };

    const updatedDistribution = distributionService.updateApprovalState(distributionId, {
      approvalStatus: "REJECTED",
      executionStatus: "FAILED",
      historyEntry,
      rejectionReason: reason,
    });

    if (!updatedDistribution) {
      return { success: false, message: "Distribution not found", data: { console: null } };
    }

    appendDistributionAudit(user, updatedDistribution, "CANCEL", "Distribution rejected from payment console", {
      approvalStatus: "REJECTED",
      reason,
    });

    return {
      success: true,
      message: "Distribution rejected",
      data: { console: toConsoleData(updatedDistribution, result.store) },
    };
  },

  async processPayments(distributionId: string, paymentIds: string[], user: AuthUser): Promise<ApiResponse<PaymentConsoleMutationResult>> {
    const result = withStore(distributionId);
    if (!result) {
      return { success: false, message: "Distribution not found", data: { console: null } };
    }

    if (!canProcess(user.role, result.distribution)) {
      return { success: false, message: "You cannot process payments for this distribution.", data: { console: null } };
    }

    const eligibleStatuses: PaymentStatus[] = ["PENDING", "FAILED", "RETRY_PENDING"];
    const updatedPayments = result.store.payments.map<PaymentConsolePaymentRecord>((payment) => {
      if (!paymentIds.includes(payment.id) || !eligibleStatuses.includes(payment.status)) {
        return payment;
      }

      const nextStatus: PaymentStatus = paymentBelongsToFailureRule(payment) ? "FAILED" : "PAID";
      return {
        ...payment,
        status: nextStatus,
        processedBy: user.name,
        processedAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        paymentReference: payment.paymentReference ?? `PAY-${distributionId.replace("distribution_", "")}-${payment.id.slice(-4)}`,
        failureReason: nextStatus === "FAILED" ? payment.failureReason ?? "Payment failed due to validation exception." : undefined,
      };
    });

    const nextStore: PaymentConsoleStoreItem = {
      ...result.store,
      payments: updatedPayments,
      executionTimeline: [
        paymentTimelineEvent(
          distributionId,
          paymentIds.length > 1 ? "Selected payments processed" : "Payment processed",
          paymentIds.length > 1
            ? `${paymentIds.length} selected payments were processed from the execution console.`
            : "Single beneficiary payment was processed from the execution console.",
          user.name,
          updatedPayments.some((payment) => paymentIds.includes(payment.id) && payment.status === "FAILED") ? "warning" : "success",
        ),
        ...result.store.executionTimeline,
      ],
    };

    const synced = updateStoreAndDistribution(result.distribution, nextStore, "Payment execution updated", user.name);
    appendDistributionAudit(user, synced.distribution, "UPDATE", "Payment execution processed from console", {
      paymentIds,
      paidCount: updatedPayments.filter((payment) => paymentIds.includes(payment.id) && payment.status === "PAID").length,
      failedCount: updatedPayments.filter((payment) => paymentIds.includes(payment.id) && payment.status === "FAILED").length,
    });

    return {
      success: true,
      message: paymentIds.length > 1 ? "Selected payments processed" : "Payment processed",
      data: {
        console: toConsoleData(synced.distribution, synced.store),
        updatedPayments: updatedPayments.filter((payment) => paymentIds.includes(payment.id)),
      },
    };
  },

  async processAllPayments(distributionId: string, user: AuthUser): Promise<ApiResponse<PaymentConsoleMutationResult>> {
    const result = withStore(distributionId);
    if (!result) {
      return { success: false, message: "Distribution not found", data: { console: null } };
    }

    const canProcessAll =
      canProcess(user.role, result.distribution) &&
      ["NOT_STARTED", "FAILED", "PARTIALLY_PROCESSED"].includes(result.distribution.executionStatus);

    if (!canProcessAll) {
      return { success: false, message: "Process all payments is not available for this distribution.", data: { console: null } };
    }

    const pendingIds = result.store.payments
      .filter((payment) => payment.status === "PENDING" || payment.status === "FAILED" || payment.status === "RETRY_PENDING")
      .map((payment) => payment.id);

    return this.processPayments(distributionId, pendingIds, user);
  },

  async retryPayments(distributionId: string, paymentIds: string[], user: AuthUser): Promise<ApiResponse<PaymentConsoleMutationResult>> {
    const result = withStore(distributionId);
    if (!result) {
      return { success: false, message: "Distribution not found", data: { console: null } };
    }

    if (!canProcess(user.role, result.distribution)) {
      return { success: false, message: "You cannot retry payments for this distribution.", data: { console: null } };
    }

    const updatedPayments = result.store.payments.map<PaymentConsolePaymentRecord>((payment) => {
      if (!paymentIds.includes(payment.id) || (payment.status !== "FAILED" && payment.status !== "RETRY_PENDING")) {
        return payment;
      }

      const nextStatus = nextPaymentStatusForRetry(payment);
      return {
        ...payment,
        status: nextStatus,
        processedBy: user.name,
        processedAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        paymentReference: payment.paymentReference ?? `PAY-${distributionId.replace("distribution_", "")}-${payment.id.slice(-4)}`,
        failureReason: nextStatus === "FAILED" ? payment.failureReason ?? "Retry failed due to unresolved validation issue." : undefined,
      };
    });

    const nextStore: PaymentConsoleStoreItem = {
      ...result.store,
      payments: updatedPayments,
      executionTimeline: [
        paymentTimelineEvent(
          distributionId,
          paymentIds.length > 1 ? "Failed payments retried" : "Failed payment retried",
          paymentIds.length > 1
            ? `${paymentIds.length} failed payments were retried from the execution console.`
            : "Failed payment was retried from the execution console.",
          user.name,
          updatedPayments.some((payment) => paymentIds.includes(payment.id) && payment.status === "FAILED") ? "warning" : "success",
        ),
        ...result.store.executionTimeline,
      ],
    };

    const synced = updateStoreAndDistribution(result.distribution, nextStore, "Payment retry action completed", user.name);
    appendDistributionAudit(user, synced.distribution, "UPDATE", "Failed payments retried from console", {
      paymentIds,
    });

    return {
      success: true,
      message: paymentIds.length > 1 ? "Selected failed payments retried" : "Payment retry completed",
      data: {
        console: toConsoleData(synced.distribution, synced.store),
        updatedPayments: updatedPayments.filter((payment) => paymentIds.includes(payment.id)),
      },
    };
  },

  async reversePayment(distributionId: string, paymentId: string, user: AuthUser, reason: string): Promise<ApiResponse<PaymentConsoleMutationResult>> {
    const result = withStore(distributionId);
    if (!result) {
      return { success: false, message: "Distribution not found", data: { console: null } };
    }

    if (user.role !== "ORG_ADMIN" || user.organizationId !== result.distribution.organizationId) {
      return { success: false, message: "You cannot reverse payments for this distribution.", data: { console: null } };
    }

    const updatedPayments = result.store.payments.map<PaymentConsolePaymentRecord>((payment) => {
      if (payment.id !== paymentId || payment.status !== "PAID") {
        return payment;
      }

      return {
        ...payment,
        status: "REVERSED" as const,
        processedBy: user.name,
        processedAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        failureReason: reason,
      };
    });

    const nextStore: PaymentConsoleStoreItem = {
      ...result.store,
      payments: updatedPayments,
      executionTimeline: [
        paymentTimelineEvent(
          distributionId,
          "Payment reversed",
          "A paid beneficiary settlement was reversed from the execution console.",
          user.name,
          "warning",
        ),
        ...result.store.executionTimeline,
      ],
    };

    const synced = updateStoreAndDistribution(result.distribution, nextStore, "Payment reversed after review", user.name);
    appendDistributionAudit(user, synced.distribution, "CANCEL", "Payment reversed from console", {
      paymentId,
      reason,
    });

    return {
      success: true,
      message: "Payment reversed",
      data: {
        console: toConsoleData(synced.distribution, synced.store),
        updatedPayments: updatedPayments.filter((payment) => payment.id === paymentId),
      },
    };
  },

  exportPaymentsCsv(distributionId: string, filters: PaymentConsoleFilters): PaymentConsoleExportResult | null {
    const result = withStore(distributionId);
    if (!result) {
      return null;
    }

    const rows = filteredPayments(result.store.payments, filters);
    const header = [
      "Beneficiary Name",
      "Beneficiary NIN",
      "State",
      "Bank Name",
      "Account Number",
      "Amount",
      "Verification Status",
      "Duplicate Check",
      "Bank Verified",
      "Has BVN",
      "Payment Status",
      "Reference",
      "Failure Reason",
    ];

    const csvRows = [
      header.join(","),
      ...rows.map((payment) =>
        [
          payment.beneficiaryName,
          payment.beneficiaryNin,
          payment.beneficiaryState,
          payment.bankName,
          payment.accountNumber,
          payment.amount,
          payment.verificationStatus,
          payment.duplicateCheck,
          payment.bankVerified ? "Yes" : "No",
          payment.hasBvn ? "Yes" : "No",
          payment.status,
          payment.paymentReference ?? "",
          payment.failureReason ?? "",
        ]
          .map((value) => `"${String(value).replaceAll('"', '""')}"`)
          .join(","),
      ),
    ];

    return {
      filename: `${distributionId}-payment-list.csv`,
      content: csvRows.join("\n"),
    };
  },

  downloadCsv(result: PaymentConsoleExportResult) {
    const blob = new Blob([result.content], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = result.filename;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  },
};
