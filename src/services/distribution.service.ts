import { mockUsers } from "@/mock/auth.mock";
import { beneficiariesData } from "@/mock/beneficiaries.mock";
import { distributionsData } from "@/mock/distributions.mock";
import { programsData } from "@/mock/programs.mock";
import type { ApiResponse } from "@/types/api";
import type {
  Distribution,
  DistributionApprovalStatus,
  DistributionDetails,
  DistributionExecutionStatus,
  DistributionListParams,
  DistributionListResponse,
  DistributionMethod,
  DistributionPayload,
  DistributionPhaseType,
  DistributionRecipientPreview,
  DistributionStatus,
  DistributionTimelineItem,
} from "@/types/distribution";
import type { ProgramDetails } from "@/types/program";

let distributionStore = [...distributionsData];

function getProgram(id: string) {
  return programsData.find((item) => item.id === id) as ProgramDetails | undefined;
}

function getPhaseType(program: ProgramDetails): DistributionPhaseType {
  return program.benefitType === "CASH" ? "TRENCH" : "BATCH";
}

function getPhaseLabel(phaseType: DistributionPhaseType, phaseNumber: number) {
  return `${phaseType === "TRENCH" ? "Trench" : "Batch"} ${phaseNumber}`;
}

function getMethod(program: ProgramDetails): DistributionMethod {
  if (program.benefitType === "CASH") {
    return "BANK_TRANSFER";
  }

  if (program.benefitType === "MEDICAL") {
    return "MEDICAL_SUPPORT";
  }

  if (program.benefitType === "EDUCATION") {
    return "EDUCATION_SUPPORT";
  }

  if (program.benefitType === "AGRICULTURE") {
    return "AGRICULTURE_SUPPORT";
  }

  return "FOOD_PACKAGE";
}

function maskNin(value: string) {
  return `${value.slice(0, 3)}******${value.slice(-2)}`;
}

function accountNumberForIndex(index: number) {
  return `01${String(10000000 + index).slice(-8)}`;
}

function bankNameForIndex(index: number) {
  return ["Access Bank", "UBA", "Zenith Bank", "First Bank", "Moniepoint"][index % 5];
}

function buildTimeline(
  id: string,
  status: DistributionStatus,
  scheduledDate: string,
  createdBy: string,
): DistributionTimelineItem[] {
  const createdAt = new Date(scheduledDate);
  createdAt.setDate(createdAt.getDate() - 8);
  const scheduledAt = new Date(scheduledDate);
  scheduledAt.setDate(scheduledAt.getDate() - 4);
  const processingAt = new Date(scheduledDate);
  processingAt.setDate(processingAt.getDate() - 1);
  const finalAt = new Date(scheduledDate);

  const timeline: DistributionTimelineItem[] = [
    {
      id: `${id}_created`,
      label: "Created",
      description: "Distribution batch was created and saved for operational review.",
      status: "DRAFT",
      timestamp: createdAt.toISOString(),
      actor: createdBy,
    },
    {
      id: `${id}_scheduled`,
      label: "Scheduled",
      description: "Beneficiary targeting and implementation date were approved.",
      status: "SCHEDULED",
      timestamp: scheduledAt.toISOString(),
      actor: "Operations Desk",
    },
  ];

  if (status !== "DRAFT" && status !== "SCHEDULED") {
    timeline.push({
      id: `${id}_processing`,
      label: "Processing Started",
      description: "Batch preparation and channel validation moved into processing.",
      status: "PROCESSING",
      timestamp: processingAt.toISOString(),
      actor: "Distribution Queue",
    });
  }

  if (status === "COMPLETED") {
    timeline.push({
      id: `${id}_completed`,
      label: "Completed",
      description: "Distribution batch completed and delivery results were reconciled.",
      status: "COMPLETED",
      timestamp: finalAt.toISOString(),
      actor: "Settlement Desk",
    });
  }

  if (status === "FAILED") {
    timeline.push({
      id: `${id}_failed`,
      label: "Failed",
      description: "Distribution execution failed after validation or delivery exceptions.",
      status: "FAILED",
      timestamp: finalAt.toISOString(),
      actor: "Exception Desk",
    });
  }

  if (status === "CANCELLED") {
    timeline.push({
      id: `${id}_cancelled`,
      label: "Cancelled",
      description: "Batch was cancelled before execution after management review.",
      status: "CANCELLED",
      timestamp: finalAt.toISOString(),
      actor: "Program Control",
    });
  }

  return timeline.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
}

function createValidationSummary(beneficiaryCount: number, estimatedTotalAmount: number, flaggedBeneficiaries: number) {
  const pendingVerification = Math.min(Math.round(beneficiaryCount * 0.04), 600);
  const failedVerification = Math.min(Math.round(beneficiaryCount * 0.01), 120);
  const duplicateRecords = Math.min(Math.round(beneficiaryCount * 0.005), 60);
  const verifiedBeneficiaries = Math.max(beneficiaryCount - pendingVerification - failedVerification, 0);
  const eligibleBeneficiaries = Math.max(verifiedBeneficiaries - duplicateRecords - flaggedBeneficiaries, 0);

  return {
    verifiedBeneficiaries,
    pendingVerification,
    failedVerification,
    duplicateRecords,
    flaggedBeneficiaries,
    eligibleBeneficiaries,
    estimatedTotalAmount,
  };
}

function isHighRisk(summary: { estimatedTotalAmount: number; flaggedBeneficiaries: number }, beneficiaryCount: number) {
  return summary.estimatedTotalAmount >= 500000000 || beneficiaryCount >= 10000 || summary.flaggedBeneficiaries > 0;
}

function buildApprovalHistory(
  id: string,
  createdBy: string,
  approvalStatus: DistributionApprovalStatus,
  scheduledDate: string,
  rejectionReason?: string,
) {
  const createdAt = new Date(scheduledDate);
  createdAt.setDate(createdAt.getDate() - 8);
  const submittedAt = new Date(scheduledDate);
  submittedAt.setDate(submittedAt.getDate() - 5);
  const decidedAt = new Date(scheduledDate);
  decidedAt.setDate(decidedAt.getDate() - 3);

  const history = [
    {
      id: `${id}_approval_created`,
      label: "Created",
      actor: createdBy,
      timestamp: createdAt.toISOString(),
      note: "Distribution draft captured for payment governance review.",
    },
  ];

  if (approvalStatus !== "DRAFT") {
    history.push({
      id: `${id}_approval_submitted`,
      label: "Submitted for approval",
      actor: createdBy,
      timestamp: submittedAt.toISOString(),
      note: "Distribution submitted for authorization review.",
    });
  }

  if (approvalStatus === "APPROVED") {
    history.push({
      id: `${id}_approval_approved`,
      label: "Approved",
      actor: "Amina Bello",
      timestamp: decidedAt.toISOString(),
      note: "Approval gate cleared for payment execution.",
    });
  }

  if (approvalStatus === "REJECTED") {
    history.push({
      id: `${id}_approval_rejected`,
      label: "Rejected",
      actor: "Musa Ibrahim",
      timestamp: decidedAt.toISOString(),
      note: rejectionReason ?? "Beneficiary validation exceptions require correction.",
    });
  }

  return history.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
}

function buildRecipients(
  program: ProgramDetails,
  beneficiaryIds: string[],
  states: string[],
): DistributionRecipientPreview[] {
  const isCash = program.benefitType === "CASH";

  return beneficiariesData
    .filter((item) => item.organizationId === program.organizationId)
    .filter((item) => item.programIds.includes(program.id))
    .filter((item) => states.includes(item.state))
    .filter((item) => beneficiaryIds.includes(item.id))
    .map((item, index) => ({
      id: `${program.id}_recipient_${index + 1}`,
      beneficiaryId: item.id,
      fullName: item.fullName,
      nin: maskNin(item.nin),
      state: item.state,
      lga: isCash ? undefined : item.lga,
      address: isCash ? undefined : item.address,
      bankName: isCash ? bankNameForIndex(index) : undefined,
      accountNumber: isCash ? accountNumberForIndex(index) : undefined,
      deliveryStatus: index % 7 === 4 ? "PENDING" : index % 11 === 0 ? "FAILED" : "DELIVERED",
    }));
}

function toDistributionDetails(input: {
  id: string;
  program: ProgramDetails;
  phaseNumber: number;
  states: string[];
  beneficiaryIds: string[];
  createdByUserId: string;
  createdBy: string;
  status: DistributionStatus;
  approvalStatus: DistributionApprovalStatus;
  executionStatus: DistributionExecutionStatus;
  scheduledDate: string;
  createdAt: string;
  updatedAt: string;
  rejectionReason?: string;
}): DistributionDetails {
  const { program } = input;
  const phaseType = getPhaseType(program);
  const label = getPhaseLabel(phaseType, input.phaseNumber);
  const recipients = buildRecipients(program, input.beneficiaryIds, input.states);
  const beneficiaryCount = recipients.length;
  const amount = program.benefitType === "CASH" ? beneficiaryCount * (program.amountPerRecipient ?? 0) : undefined;
  const quantity = program.benefitType === "CASH" ? undefined : beneficiaryCount;
  const failedDeliveries = recipients.filter((item) => item.deliveryStatus === "FAILED").length;
  const successful = recipients.filter((item) => item.deliveryStatus === "DELIVERED").length;
  const totalPreview = Math.max(recipients.length, 1);
  const successRate = Math.round((successful / totalPreview) * 100);
  const completionRate =
    input.status === "COMPLETED"
      ? 100
      : input.status === "PROCESSING"
        ? 72
        : input.status === "FAILED"
          ? 48
          : input.status === "SCHEDULED"
            ? 24
            : input.status === "CANCELLED"
              ? 0
              : 10;
  const validationSummary = createValidationSummary(
    beneficiaryCount,
    amount ?? beneficiaryCount * 15000,
    input.status === "FAILED" ? Math.max(1, Math.round(beneficiaryCount * 0.01)) : 0,
  );

  return {
    id: input.id,
    organizationId: program.organizationId,
    organizationName: program.organizationName,
    programId: program.id,
    programName: program.name,
    name: label,
    phaseType,
    phaseNumber: input.phaseNumber,
    states: input.states,
    selectedBeneficiaryIds: input.beneficiaryIds,
    benefitType: program.benefitType,
    method: getMethod(program),
    description: `${label} prepared for ${beneficiaryCount.toLocaleString()} beneficiaries across ${input.states.join(", ")}.`,
    beneficiaryCount,
    amount,
    quantity,
    status: input.status,
    approvalStatus: input.approvalStatus,
    executionStatus: input.executionStatus,
    scheduledDate: input.scheduledDate,
    createdByUserId: input.createdByUserId,
    createdBy: input.createdBy,
    createdAt: input.createdAt,
    updatedAt: input.updatedAt,
    programStatus: program.status,
    organizationType: program.organizationType,
    organizationStatus: program.organizationStatus,
    recipients,
    statistics: {
      beneficiaries: beneficiaryCount,
      amountDistributed: amount ?? 0,
      successRate,
      failedDeliveries,
      completionRate,
      lastUpdated: input.updatedAt,
    },
    timeline: buildTimeline(input.id, input.status, input.scheduledDate, input.createdBy),
    recentActivities: [
      {
        id: `${input.id}_activity_1`,
        actor: input.createdBy,
        action: `Created ${label.toLowerCase()}`,
        timestamp: input.createdAt,
      },
      {
        id: `${input.id}_activity_2`,
        actor: "Operations Desk",
        action: "Validated beneficiary selection",
        timestamp: input.updatedAt,
      },
    ],
    approvalHistory: buildApprovalHistory(input.id, input.createdBy, input.approvalStatus, input.scheduledDate, input.rejectionReason),
    validationSummary,
    isHighRisk: isHighRisk(validationSummary, beneficiaryCount),
    rejectionReason: input.rejectionReason,
  };
}

function phaseExists(programId: string, phaseType: DistributionPhaseType, phaseNumber: number, excludeId?: string) {
  return distributionStore.some(
    (item) =>
      item.programId === programId &&
      item.phaseType === phaseType &&
      item.phaseNumber === phaseNumber &&
      item.id !== excludeId,
  );
}

export const distributionService = {
  async getDistributions(params: DistributionListParams = {}): Promise<ApiResponse<DistributionListResponse>> {
    const {
      benefitType = "ALL",
      limit = 10,
      organizationId = "ALL",
      page = 1,
      programId = "ALL",
      scopeOrganizationId = null,
      search = "",
      status = "ALL",
    } = params;

    let filtered = [...distributionStore];

    if (scopeOrganizationId) {
      filtered = filtered.filter((item) => item.organizationId === scopeOrganizationId);
    }

    if (organizationId !== "ALL") {
      filtered = filtered.filter((item) => item.organizationId === organizationId);
    }

    if (programId !== "ALL") {
      filtered = filtered.filter((item) => item.programId === programId);
    }

    if (status !== "ALL") {
      filtered = filtered.filter((item) => item.status === status);
    }

    if (benefitType !== "ALL") {
      filtered = filtered.filter((item) => item.benefitType === benefitType);
    }

    if (search.trim()) {
      const term = search.trim().toLowerCase();
      filtered = filtered.filter(
        (item) =>
          item.name.toLowerCase().includes(term) ||
          item.programName.toLowerCase().includes(term) ||
          item.organizationName.toLowerCase().includes(term) ||
          item.createdBy.toLowerCase().includes(term),
      );
    }

    const total = filtered.length;
    const totalPages = Math.max(1, Math.ceil(total / limit));
    const safePage = Math.min(page, totalPages);
    const items = filtered.slice((safePage - 1) * limit, safePage * limit).map<Distribution>((item) => ({ ...item }));

    return Promise.resolve({
      success: true,
      message: "Distributions fetched successfully",
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

  async getDistributionById(id: string): Promise<ApiResponse<DistributionDetails | null>> {
    const distribution = distributionStore.find((item) => item.id === id) ?? null;

    return Promise.resolve({
      success: Boolean(distribution),
      message: distribution ? "Distribution fetched successfully" : "Distribution not found",
      data: distribution,
    });
  },

  getDistributionSnapshot(id: string) {
    return distributionStore.find((item) => item.id === id) ?? null;
  },

  getUnavailablePhaseNumbers(programId: string) {
    const program = getProgram(programId);

    if (!program) {
      return [];
    }

    const phaseType = getPhaseType(program);

    return distributionStore
      .filter((item) => item.programId === programId && item.phaseType === phaseType)
      .map((item) => item.phaseNumber);
  },

  async createDistribution(
    payload: DistributionPayload,
    createdByUserId: string,
    createdBy: string,
  ): Promise<ApiResponse<DistributionDetails | null>> {
    const program = getProgram(payload.programId);

    if (!program) {
      return Promise.resolve({
        success: false,
        message: "Intervention not found",
        data: null,
      });
    }

    const phaseType = getPhaseType(program);

    if (phaseExists(program.id, phaseType, payload.phaseNumber)) {
      return Promise.resolve({
        success: false,
        message: `${getPhaseLabel(phaseType, payload.phaseNumber)} already exists for this intervention.`,
        data: null,
      });
    }

    const eligibleBeneficiaries = beneficiariesData
      .filter((item) => item.organizationId === program.organizationId)
      .filter((item) => item.programIds.includes(program.id))
      .filter((item) => payload.states.includes(item.state))
      .filter((item) => payload.beneficiaryIds.includes(item.id));

    if (eligibleBeneficiaries.length === 0) {
      return Promise.resolve({
        success: false,
        message: "Select at least one eligible beneficiary.",
        data: null,
      });
    }

    const timestamp = new Date().toISOString();
    const next = toDistributionDetails({
      id: `distribution_${String(distributionStore.length + 1).padStart(3, "0")}`,
      program,
      phaseNumber: payload.phaseNumber,
      states: payload.states,
      beneficiaryIds: eligibleBeneficiaries.map((item) => item.id),
      createdByUserId,
      createdBy,
      status: "SCHEDULED",
      approvalStatus: "DRAFT",
      executionStatus: "NOT_STARTED",
      scheduledDate: timestamp,
      createdAt: timestamp,
      updatedAt: timestamp,
    });

    distributionStore = [next, ...distributionStore];

    return Promise.resolve({
      success: true,
      message: "Distribution created successfully",
      data: next,
    });
  },

  async updateDistribution(id: string, payload: DistributionPayload): Promise<ApiResponse<DistributionDetails | null>> {
    const current = distributionStore.find((item) => item.id === id) ?? null;

    if (!current) {
      return Promise.resolve({
        success: false,
        message: "Distribution not found",
        data: null,
      });
    }

    const program = getProgram(payload.programId);

    if (!program) {
      return Promise.resolve({
        success: false,
        message: "Intervention not found",
        data: null,
      });
    }

    const phaseType = getPhaseType(program);

    if (phaseExists(program.id, phaseType, payload.phaseNumber, id)) {
      return Promise.resolve({
        success: false,
        message: `${getPhaseLabel(phaseType, payload.phaseNumber)} already exists for this intervention.`,
        data: null,
      });
    }

    const eligibleBeneficiaries = beneficiariesData
      .filter((item) => item.organizationId === program.organizationId)
      .filter((item) => item.programIds.includes(program.id))
      .filter((item) => payload.states.includes(item.state))
      .filter((item) => payload.beneficiaryIds.includes(item.id));

    let updated: DistributionDetails | null = null;

    distributionStore = distributionStore.map((item) => {
      if (item.id !== id) {
        return item;
      }

      updated = toDistributionDetails({
        id: item.id,
        program,
        phaseNumber: payload.phaseNumber,
        states: payload.states,
        beneficiaryIds: eligibleBeneficiaries.map((beneficiary) => beneficiary.id),
        createdByUserId: item.createdByUserId,
        createdBy: item.createdBy,
        status: item.status,
        approvalStatus: item.approvalStatus,
        executionStatus: item.executionStatus,
        scheduledDate: item.scheduledDate,
        createdAt: item.createdAt,
        updatedAt: new Date().toISOString(),
        rejectionReason: item.rejectionReason,
      });

      return updated;
    });

    return Promise.resolve({
      success: Boolean(updated),
      message: updated ? "Distribution updated successfully" : "Distribution not found",
      data: updated,
    });
  },

  async updateDistributionStatus(id: string, status: DistributionStatus): Promise<ApiResponse<DistributionDetails | null>> {
    let updated: DistributionDetails | null = null;

    distributionStore = distributionStore.map((item) => {
      if (item.id !== id) {
        return item;
      }

      updated = {
        ...item,
        status,
        executionStatus:
          status === "COMPLETED"
            ? "COMPLETED"
            : status === "PROCESSING"
              ? "PROCESSING"
              : status === "FAILED" || status === "CANCELLED"
                ? "FAILED"
                : item.executionStatus,
        updatedAt: new Date().toISOString(),
      };

      if (updated) {
        updated.timeline = buildTimeline(updated.id, updated.status, updated.scheduledDate, updated.createdBy);
      }

      return updated ?? item;
    });

    return Promise.resolve({
      success: Boolean(updated),
      message: updated ? "Distribution status updated successfully" : "Distribution not found",
      data: updated,
    });
  },

  updateApprovalState(
    id: string,
    payload: {
      approvalStatus: DistributionApprovalStatus;
      executionStatus?: DistributionExecutionStatus;
      rejectionReason?: string;
      historyEntry: DistributionDetails["approvalHistory"][number];
    },
  ) {
    let updated: DistributionDetails | null = null;

    distributionStore = distributionStore.map((item) => {
      if (item.id !== id) {
        return item;
      }

      updated = {
        ...item,
        approvalStatus: payload.approvalStatus,
        executionStatus: payload.executionStatus ?? item.executionStatus,
        rejectionReason: payload.rejectionReason,
        approvalHistory: [payload.historyEntry, ...item.approvalHistory],
        updatedAt: payload.historyEntry.timestamp,
      };

      return updated ?? item;
    });

    return updated;
  },

  updateExecutionState(
    id: string,
    executionStatus: DistributionExecutionStatus,
    actor: string,
    note: string,
  ) {
    let updated: DistributionDetails | null = null;

    distributionStore = distributionStore.map((item) => {
      if (item.id !== id) {
        return item;
      }

      const nextStatus: DistributionStatus =
        executionStatus === "COMPLETED"
          ? "COMPLETED"
          : executionStatus === "PROCESSING" || executionStatus === "PARTIALLY_PROCESSED"
            ? "PROCESSING"
            : executionStatus === "FAILED" || executionStatus === "REVERSED"
              ? "FAILED"
              : "SCHEDULED";
      const timestamp = new Date().toISOString();

      updated = {
        ...item,
        executionStatus,
        status: nextStatus,
        updatedAt: timestamp,
        recentActivities: [
          {
            id: `${item.id}_execution_${Date.now()}`,
            actor,
            action: note,
            timestamp,
          },
          ...item.recentActivities,
        ],
      };

      updated.timeline = buildTimeline(updated.id, updated.status, updated.scheduledDate, updated.createdBy);

      return updated ?? item;
    });

    return updated;
  },
};
