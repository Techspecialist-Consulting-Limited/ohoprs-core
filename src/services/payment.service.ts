import { beneficiariesData } from "@/mock/beneficiaries.mock";
import {
  paymentsData,
  toPaymentRecord,
} from "@/mock/payments.mock";
import { appendAuditLog } from "@/mock/audit.mock";
import { distributionService } from "@/services/distribution.service";
import type { ApiResponse } from "@/types/api";
import type { AuthUser } from "@/types/auth";
import type { DistributionMethod } from "@/types/distribution";
import type {
  BulkPaymentProcessResult,
  DistributionPaymentReadiness,
  PaymentDetails,
  PaymentListParams,
  PaymentListResponse,
  PaymentMethod,
  PaymentStatus,
  PaymentActionResult,
} from "@/types/payment";

let paymentStore = [...paymentsData];

function clone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}

function isPaymentMethod(method: DistributionMethod): method is PaymentMethod {
  return method === "BANK_TRANSFER" || method === "MOBILE_MONEY" || method === "CASH";
}

function maskNin(value: string) {
  return `${value.slice(0, 3)}******${value.slice(-2)}`;
}

function timelineWithUpdate(
  payment: PaymentDetails,
  label: string,
  description: string,
  actor: string,
  status: "COMPLETED" | "CURRENT" | "PENDING" | "FAILED",
) {
  const timestamp = new Date().toISOString();

  return [
    {
      id: `${payment.id}_${Date.now()}`,
      label,
      description,
      timestamp,
      actor,
      status,
    },
    ...payment.timeline,
  ];
}

function appendPaymentAudit(params: {
  actor: AuthUser;
  action: "CREATE" | "UPDATE" | "CANCEL";
  description: string;
  payment: PaymentDetails;
}) {
  const timestamp = new Date().toISOString();
  appendAuditLog({
    timestamp,
    userId: params.actor.id,
    userName: params.actor.name,
    userEmail: params.actor.email,
    role: params.actor.role,
    organizationId: params.payment.organizationId,
    organizationName: params.payment.organizationName,
    module: "DISTRIBUTION",
    action: params.action,
    resourceId: params.payment.id,
    resourceName: params.payment.reference,
    result: "SUCCESS",
    ipAddress: "197.210.55.12",
    description: params.description,
    metadata: {
      distributionId: params.payment.distributionId,
      paymentStatus: params.payment.status,
      amount: params.payment.amount,
      beneficiaryName: params.payment.beneficiaryName,
    },
    relatedRecords: [
      { id: params.payment.organizationId, type: "ORGANIZATION", name: params.payment.organizationName },
      { id: params.payment.programId, type: "PROGRAM", name: params.payment.programName },
      { id: params.payment.distributionId, type: "DISTRIBUTION", name: params.payment.distributionName },
      { id: params.payment.beneficiaryId, type: "BENEFICIARY", name: params.payment.beneficiaryName },
    ],
    timeline: [
      { id: `${params.payment.id}_audit_1`, label: "Event captured", timestamp },
      { id: `${params.payment.id}_audit_2`, label: "Validation completed", timestamp: new Date(new Date(timestamp).getTime() + 120000).toISOString() },
      { id: `${params.payment.id}_audit_3`, label: "Audit record stored", timestamp: new Date(new Date(timestamp).getTime() + 240000).toISOString() },
    ],
  });
}

function syncDistributionExecution(distributionId: string, actorName: string, note: string) {
  const nextStatus = determineExecutionStatus(distributionId);
  distributionService.updateExecutionState(distributionId, nextStatus, actorName, note);
  return nextStatus;
}

function createReadinessSummary(distributionId: string): DistributionPaymentReadiness {
  const payments = paymentStore.filter((payment) => payment.distributionId === distributionId);
  const paidPayments = payments.filter((payment) => payment.status === "PAID").length;
  const failedPayments = payments.filter(
    (payment) => payment.status === "FAILED" || payment.status === "RETRY_PENDING",
  ).length;
  const pendingPayments = payments.filter(
    (payment) => payment.status === "PENDING" || payment.status === "PROCESSING",
  ).length;
  const flaggedBeneficiaries = payments.filter((payment) => payment.status === "FAILED").length;

  return {
    distributionId,
    eligibleBeneficiaries: payments.length,
    flaggedBeneficiaries,
    pendingPayments,
    paidPayments,
    failedPayments,
    estimatedTotalPayout: payments.reduce((total, payment) => total + payment.amount, 0),
  };
}

function determineExecutionStatus(distributionId: string) {
  const payments = paymentStore.filter((payment) => payment.distributionId === distributionId);

  if (!payments.length) {
    return "NOT_STARTED" as const;
  }

  const paid = payments.filter((payment) => payment.status === "PAID").length;
  const failed = payments.filter(
    (payment) => payment.status === "FAILED" || payment.status === "RETRY_PENDING",
  ).length;
  const reversed = payments.filter((payment) => payment.status === "REVERSED").length;
  const inFlight = payments.filter(
    (payment) => payment.status === "PENDING" || payment.status === "PROCESSING",
  ).length;

  if (reversed > 0 && reversed === payments.length) {
    return "REVERSED" as const;
  }

  if (inFlight > 0) {
    return "PROCESSING" as const;
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

function ensurePaymentsForDistribution(distributionId: string) {
  const existing = paymentStore.filter((payment) => payment.distributionId === distributionId);
  if (existing.length) {
    return existing;
  }

  const distribution = distributionService.getDistributionSnapshot(distributionId);
  if (!distribution || !isPaymentMethod(distribution.method)) {
    return [];
  }

  const beneficiaries = beneficiariesData
    .filter(
      (beneficiary) =>
        beneficiary.organizationId === distribution.organizationId &&
        beneficiary.programIds.includes(distribution.programId),
    )
    .slice(0, 6);

  const amount = Math.round((distribution.amount ?? 0) / Math.max(distribution.beneficiaryCount, 1)) || 50000;
  const createdAt = new Date().toISOString();

  const generated = beneficiaries.map<PaymentDetails>((beneficiary, index) => ({
    id: `payment_${String(paymentStore.length + index + 1).padStart(4, "0")}`,
    reference: `PAY-2026-${String(paymentStore.length + index + 1).padStart(6, "0")}`,
    distributionId: distribution.id,
    distributionName: distribution.name,
    programId: distribution.programId,
    programName: distribution.programName,
    organizationId: distribution.organizationId,
    organizationName: distribution.organizationName,
    beneficiaryId: beneficiary.id,
    beneficiaryName: beneficiary.fullName,
    beneficiaryNin: maskNin(beneficiary.nin),
    beneficiaryPhone: beneficiary.phone,
    beneficiaryState: beneficiary.state,
    bankName: "Access Bank",
    accountNumber: `011${String(1000000 + index).slice(-7)}`,
    amount,
    method: distribution.method as PaymentMethod,
    status: "PENDING",
    createdAt,
    updatedAt: createdAt,
    createdBy: distribution.createdBy,
    approvedBy: distribution.approvalHistory.find((entry) => entry.label === "Approved")?.actor,
    approvedAt: distribution.approvalHistory.find((entry) => entry.label === "Approved")?.timestamp,
    timeline: [
      {
        id: `timeline_${distribution.id}_${index}_1`,
        label: "Payment record created",
        description: "Payment created for approved distribution.",
        timestamp: createdAt,
        actor: distribution.createdBy,
        status: "COMPLETED",
      },
      {
        id: `timeline_${distribution.id}_${index}_2`,
        label: "Pending execution",
        description: "Payment is waiting for processing.",
        timestamp: new Date(new Date(createdAt).getTime() + 180000).toISOString(),
        actor: "Payment Queue",
        status: "PENDING",
      },
    ],
  }));

  paymentStore = [...generated, ...paymentStore];
  return generated;
}

export const paymentService = {
  async getPayments(params: PaymentListParams = {}): Promise<ApiResponse<PaymentListResponse>> {
    const {
      search = "",
      page = 1,
      limit = 10,
      organizationId = "ALL",
      distributionId,
      scopeOrganizationId = null,
    } = params;

    let filtered = [...paymentStore];

    if (scopeOrganizationId) {
      filtered = filtered.filter((payment) => payment.organizationId === scopeOrganizationId);
    }

    if (organizationId !== "ALL") {
      filtered = filtered.filter((payment) => payment.organizationId === organizationId);
    }

    if (distributionId) {
      filtered = filtered.filter((payment) => payment.distributionId === distributionId);
    }

    if (search.trim()) {
      const term = search.trim().toLowerCase();
      filtered = filtered.filter(
        (payment) =>
          payment.reference.toLowerCase().includes(term) ||
          payment.beneficiaryName.toLowerCase().includes(term) ||
          payment.distributionName.toLowerCase().includes(term) ||
          payment.programName.toLowerCase().includes(term),
      );
    }

    const total = filtered.length;
    const totalPages = Math.max(1, Math.ceil(total / limit));
    const safePage = Math.min(page, totalPages);
    const items = filtered
      .slice((safePage - 1) * limit, safePage * limit)
      .map((payment) => toPaymentRecord(clone(payment)));

    return Promise.resolve({
      success: true,
      message: "Payments fetched successfully",
      data: {
        items,
        meta: {
          page: safePage,
          limit,
          total,
          totalPages,
        },
      },
    });
  },

  async getPaymentById(id: string): Promise<ApiResponse<PaymentDetails | null>> {
    const payment = paymentStore.find((item) => item.id === id) ?? null;

    return Promise.resolve({
      success: Boolean(payment),
      message: payment ? "Payment fetched successfully" : "Payment not found",
      data: payment ? clone(payment) : null,
    });
  },

  async getDistributionPayments(distributionId: string): Promise<ApiResponse<PaymentDetails[]>> {
    const items = ensurePaymentsForDistribution(distributionId)
      .concat(paymentStore.filter((payment) => payment.distributionId === distributionId))
      .reduce<PaymentDetails[]>((accumulator, payment) => {
        if (!accumulator.find((entry) => entry.id === payment.id)) {
          accumulator.push(clone(payment));
        }
        return accumulator;
      }, []);

    return Promise.resolve({
      success: true,
      message: "Distribution payments fetched successfully",
      data: items,
    });
  },

  async getDistributionReadiness(distributionId: string): Promise<ApiResponse<DistributionPaymentReadiness>> {
    ensurePaymentsForDistribution(distributionId);
    return Promise.resolve({
      success: true,
      message: "Distribution readiness fetched successfully",
      data: createReadinessSummary(distributionId),
    });
  },

  async processPayment(id: string, actor: AuthUser): Promise<ApiResponse<PaymentActionResult>> {
    let updated: PaymentDetails | null = null;
    const now = new Date().toISOString();

    paymentStore = paymentStore.map((payment) => {
      if (payment.id !== id) {
        return payment;
      }

      const nextStatus: PaymentStatus = Number(payment.id.split("_")[1]) % 9 === 0 ? "FAILED" : "PAID";
      updated = {
        ...payment,
        status: nextStatus,
        processedByUserId: actor.id,
        processedBy: actor.name,
        processedAt: now,
        updatedAt: now,
        failureReason: nextStatus === "FAILED" ? "Invalid bank account number." : undefined,
        timeline: timelineWithUpdate(
          payment,
          nextStatus === "FAILED" ? "Failed due to invalid bank account" : "Paid successfully",
          nextStatus === "FAILED"
            ? "Payment failed due to invalid bank account details."
            : "Payment completed successfully.",
          actor.name,
          nextStatus === "FAILED" ? "FAILED" : "COMPLETED",
        ),
      };

      return updated;
    });

    if (!updated) {
      return Promise.resolve({ success: false, message: "Payment not found", data: { payment: null } });
    }

    const nextPayment = paymentStore.find((payment) => payment.id === id);

    if (!nextPayment) {
      return Promise.resolve({ success: false, message: "Payment not found after update", data: { payment: null } });
    }

    const executionStatus = syncDistributionExecution(
      nextPayment.distributionId,
      actor.name,
      nextPayment.status === "FAILED" ? "Payment failed during provider execution" : "Payment processed successfully",
    );
    appendPaymentAudit({
      actor,
      action: "UPDATE",
      description: nextPayment.status === "FAILED" ? "Payment failed" : "Payment processed",
      payment: nextPayment,
    });

    return Promise.resolve({
      success: true,
      message: nextPayment.status === "FAILED" ? "Payment failed during mock processing" : "Payment processed successfully",
      data: { payment: clone(nextPayment), distributionExecutionStatus: executionStatus },
    });
  },

  async retryPayment(id: string, actor: AuthUser): Promise<ApiResponse<PaymentActionResult>> {
    let updated: PaymentDetails | null = null;
    const now = new Date().toISOString();

    paymentStore = paymentStore.map((payment) => {
      if (payment.id !== id) {
        return payment;
      }

      updated = {
        ...payment,
        status: "PAID",
        processedByUserId: actor.id,
        processedBy: actor.name,
        processedAt: now,
        updatedAt: now,
        failureReason: undefined,
        timeline: timelineWithUpdate(
          payment,
          "Paid successfully",
          "Payment retry completed successfully.",
          actor.name,
          "COMPLETED",
        ),
      };

      return updated;
    });

    if (!updated) {
      return Promise.resolve({ success: false, message: "Payment not found", data: { payment: null } });
    }

    const nextPayment = paymentStore.find((payment) => payment.id === id);

    if (!nextPayment) {
      return Promise.resolve({ success: false, message: "Payment not found after retry", data: { payment: null } });
    }

    const executionStatus = syncDistributionExecution(nextPayment.distributionId, actor.name, "Payment retried successfully");
    appendPaymentAudit({
      actor,
      action: "UPDATE",
      description: "Payment retried",
      payment: nextPayment,
    });

    return Promise.resolve({
      success: true,
      message: "Payment retried successfully",
      data: { payment: clone(nextPayment), distributionExecutionStatus: executionStatus },
    });
  },

  async reversePayment(id: string, actor: AuthUser): Promise<ApiResponse<PaymentActionResult>> {
    const currentPayment = paymentStore.find((payment) => payment.id === id) ?? null;

    if (!currentPayment) {
      return Promise.resolve({ success: false, message: "Payment not found", data: { payment: null } });
    }

    if (actor.role !== "ORG_ADMIN") {
      return Promise.resolve({
        success: false,
        message: "Only Organization Admin can reverse payments",
        data: { payment: null },
      });
    }

    if (actor.organizationId !== currentPayment.organizationId) {
      return Promise.resolve({
        success: false,
        message: "You can only reverse payments within your organization",
        data: { payment: null },
      });
    }

    let updated: PaymentDetails | null = null;
    const now = new Date().toISOString();

    paymentStore = paymentStore.map((payment) => {
      if (payment.id !== id) {
        return payment;
      }

      updated = {
        ...payment,
        status: "REVERSED",
        processedByUserId: actor.id,
        processedBy: actor.name,
        processedAt: now,
        updatedAt: now,
        failureReason: "Reversed after compliance review.",
        timeline: timelineWithUpdate(
          payment,
          "Reversed after review",
          "Payment was reversed after compliance review.",
          actor.name,
          "FAILED",
        ),
      };

      return updated;
    });

    if (!updated) {
      return Promise.resolve({ success: false, message: "Payment not found", data: { payment: null } });
    }

    const nextPayment = paymentStore.find((payment) => payment.id === id);

    if (!nextPayment) {
      return Promise.resolve({ success: false, message: "Payment not found after reversal", data: { payment: null } });
    }

    const executionStatus = syncDistributionExecution(nextPayment.distributionId, actor.name, "Payment reversed after review");
    appendPaymentAudit({
      actor,
      action: "CANCEL",
      description: "Payment reversed",
      payment: nextPayment,
    });

    return Promise.resolve({
      success: true,
      message: "Payment reversed successfully",
      data: { payment: clone(nextPayment), distributionExecutionStatus: executionStatus },
    });
  },

  async processAllPayments(
    distributionId: string,
    actor: AuthUser,
  ): Promise<ApiResponse<BulkPaymentProcessResult | null>> {
    const distribution = distributionService.getDistributionSnapshot(distributionId);
    if (!distribution) {
      return Promise.resolve({ success: false, message: "Distribution not found", data: null });
    }

    if (distribution.approvalStatus !== "APPROVED" || distribution.finalApprovalStatus !== "APPROVED") {
      return Promise.resolve({ success: false, message: "Final super admin approval is required before payment can start", data: null });
    }

    if (actor.role !== "AGENCY_ACCOUNTANT") {
      return Promise.resolve({ success: false, message: "Only agency accountant can start distribution payment", data: null });
    }

    const payments = ensurePaymentsForDistribution(distributionId);
    const now = new Date().toISOString();
    let paidCount = 0;
    let failedCount = 0;

    paymentStore = paymentStore.map((payment, index) => {
      if (payment.distributionId !== distributionId) {
        return payment;
      }

      const shouldFail = index % 12 === 0;
      const nextStatus: PaymentStatus = shouldFail ? "FAILED" : "PAID";

      if (nextStatus === "FAILED") {
        failedCount += 1;
      } else {
        paidCount += 1;
      }

      return {
        ...payment,
        status: nextStatus,
        processedByUserId: actor.id,
        processedBy: actor.name,
        processedAt: now,
        updatedAt: now,
        failureReason: shouldFail ? "Payment provider timeout." : undefined,
        timeline: timelineWithUpdate(
          payment,
          shouldFail ? "Failed due to provider timeout" : "Paid successfully",
          shouldFail ? "Bulk processing failed due to provider timeout." : "Bulk processing completed successfully.",
          actor.name,
          shouldFail ? "FAILED" : "COMPLETED",
        ),
      };
    });

    const executionStatus = syncDistributionExecution(
      distributionId,
      actor.name,
      "Bulk payments processed",
    );

    appendAuditLog({
      timestamp: now,
      userId: actor.id,
      userName: actor.name,
      userEmail: actor.email,
      role: actor.role,
      organizationId: distribution.organizationId,
      organizationName: distribution.organizationName,
      module: "BULK_DISTRIBUTION",
      action: "CREATE",
      resourceId: distributionId,
      resourceName: distribution.name,
      result: "SUCCESS",
      ipAddress: "197.210.55.12",
      description: "Bulk payments processed",
      metadata: {
        createdPayments: payments.length,
        paidCount,
        failedCount,
        executionStatus,
      },
      relatedRecords: [
        { id: distribution.organizationId, type: "ORGANIZATION", name: distribution.organizationName },
        { id: distribution.programId, type: "PROGRAM", name: distribution.programName },
        { id: distribution.id, type: "DISTRIBUTION", name: distribution.name },
      ],
      timeline: [
        { id: `${distributionId}_bulk_1`, label: "Event captured", timestamp: now },
        { id: `${distributionId}_bulk_2`, label: "Validation completed", timestamp: new Date(new Date(now).getTime() + 120000).toISOString() },
        { id: `${distributionId}_bulk_3`, label: "Audit record stored", timestamp: new Date(new Date(now).getTime() + 240000).toISOString() },
      ],
    });

    return Promise.resolve({
      success: true,
      message: "Bulk payments processed successfully",
      data: {
        distributionId,
        createdPayments: payments.length,
        paidCount,
        failedCount,
        executionStatus,
      },
    });
  },
};
