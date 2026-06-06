import { organizationsData } from "@/mock/organizations.mock";
import { defaultProgramDuration, fundingSourceOptions, programsData } from "@/mock/programs.mock";
import { mockUsers } from "@/mock/auth.mock";
import type { ApiResponse } from "@/types/api";
import type {
  DistributionApprovalTemplateStep,
  Program,
  ProgramApprovalStep,
  ProgramApprovalHistoryItem,
  ProgramDetails,
  ProgramFundingSource,
  ProgramListParams,
  ProgramListResponse,
  ProgramPayload,
  ProgramStatus,
} from "@/types/program";
import type { AuthUser } from "@/types/auth";

let programStore = [...programsData];

function normalizeFundingSources(sources?: ProgramFundingSource[]) {
  return sources?.length ? sources : [fundingSourceOptions[0]];
}

function normalizeApprovalSteps(steps?: ProgramApprovalStep[]) {
  return (steps ?? []).map((step, index) => ({
    ...step,
    order: index + 1,
  }));
}

function normalizeDistributionApprovalSteps(steps?: DistributionApprovalTemplateStep[]) {
  return (steps ?? []).map((step, index) => ({
    ...step,
    order: index + 1,
  }));
}

function normalizeProgram(program: ProgramDetails): ProgramDetails {
  return {
    ...program,
    duration: program.duration ?? defaultProgramDuration,
    recipientCount: program.recipientCount ?? program.beneficiaryCount,
    amountPerRecipient: program.amountPerRecipient ?? null,
    regions: program.regions ?? [],
    states: program.states ?? [],
    amount: program.amount ?? null,
    budget: program.budget ?? null,
    numberOfTrenches: program.numberOfTrenches ?? null,
    batch: program.batch ?? null,
    fundingSources: normalizeFundingSources(program.fundingSources),
    approvalSteps: normalizeApprovalSteps(program.approvalSteps),
    distributionApprovalSteps: normalizeDistributionApprovalSteps(program.distributionApprovalSteps),
    rejectionReason: program.rejectionReason ?? null,
    approvalHistory: program.approvalHistory ?? [],
    createdByUserId: program.createdByUserId ?? null,
  };
}

function getCurrentPendingStep(steps: ProgramApprovalStep[]) {
  return steps.find((step) => step.status === "PENDING") ?? null;
}

function getProgramApprovalProgress(program: Pick<ProgramDetails, "approvalSteps" | "status">) {
  const steps = normalizeApprovalSteps(program.approvalSteps);
  const approvedCount = steps.filter((step) => step.status === "APPROVED").length;
  const rejectedStep = steps.find((step) => step.status === "REJECTED") ?? null;
  const currentPendingStep = getCurrentPendingStep(steps);
  const total = steps.length;
  const isFullyApproved = total > 0 && approvedCount === total && !rejectedStep;

  return {
    approvedCount,
    total,
    rejectedStep,
    currentPendingStep,
    isFullyApproved,
  };
}

function canUserAccessApproval(program: ProgramDetails, userId?: string | null) {
  if (!userId) {
    return false;
  }

  return normalizeApprovalSteps(program.approvalSteps).some((step) => step.assigneeUserId === userId);
}

function isCurrentPendingAssignee(program: ProgramDetails, userId?: string | null) {
  if (!userId) {
    return false;
  }

  const currentStep = getCurrentPendingStep(normalizeApprovalSteps(program.approvalSteps));
  return currentStep?.assigneeUserId === userId;
}

function findOrganization(id: string) {
  return organizationsData.find((item) => item.id === id) ?? null;
}

function isDistributionEligibleProgram(program: ProgramDetails) {
  return program.status === "APPROVED" || program.status === "ACTIVE";
}

export const programService = {
  async getPrograms(params: ProgramListParams = {}): Promise<ApiResponse<ProgramListResponse>> {
    const {
      benefitType = "ALL",
      limit = 10,
      organizationId = "ALL",
      page = 1,
      scopeOrganizationId = null,
      assignedApproverUserId = null,
      search = "",
      status = "ALL",
      onlyFullyApprovedForAgencyScope = false,
    } = params;

    let filtered = [...programStore].map(normalizeProgram);

    if (scopeOrganizationId) {
      filtered = filtered.filter((item) => item.organizationId === scopeOrganizationId);
    }

    if (onlyFullyApprovedForAgencyScope) {
      filtered = filtered.filter((item) => {
        const approvalProgress = getProgramApprovalProgress(item);
        return approvalProgress.isFullyApproved && (item.status === "APPROVED" || item.status === "ACTIVE");
      });
    }

    if (assignedApproverUserId) {
      filtered = filtered
        .filter((item) => canUserAccessApproval(item, assignedApproverUserId))
        .sort((left, right) => {
          const leftActionable = isCurrentPendingAssignee(left, assignedApproverUserId) ? 1 : 0;
          const rightActionable = isCurrentPendingAssignee(right, assignedApproverUserId) ? 1 : 0;

          if (leftActionable !== rightActionable) {
            return rightActionable - leftActionable;
          }

          return new Date(right.updatedAt).getTime() - new Date(left.updatedAt).getTime();
        });
    }

    if (organizationId !== "ALL") {
      filtered = filtered.filter((item) => item.organizationId === organizationId);
    }

    if (benefitType !== "ALL") {
      filtered = filtered.filter((item) => item.benefitType === benefitType);
    }

    if (status !== "ALL") {
      filtered = filtered.filter((item) => item.status === status);
    }

    if (search.trim()) {
      const term = search.trim().toLowerCase();
      filtered = filtered.filter(
        (item) =>
          item.name.toLowerCase().includes(term) ||
          item.organizationName.toLowerCase().includes(term) ||
          item.benefitType.toLowerCase().includes(term),
      );
    }

    const total = filtered.length;
    const totalPages = Math.max(1, Math.ceil(total / limit));
    const safePage = Math.min(page, totalPages);
    const items = filtered.slice((safePage - 1) * limit, safePage * limit).map<Program>((item) => ({
      ...item,
    }));

    return Promise.resolve({
      success: true,
      message: "Programs fetched successfully",
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

  async getProgramById(id: string): Promise<ApiResponse<ProgramDetails | null>> {
    const program = programStore.find((item) => item.id === id) ?? null;

    return Promise.resolve({
      success: Boolean(program),
      message: program ? "Program details fetched successfully" : "Program not found",
      data: program ? normalizeProgram(program) : null,
    });
  },

  getProgramSnapshot(id: string) {
    const program = programStore.find((item) => item.id === id) ?? null;
    return program ? normalizeProgram(program) : null;
  },

  getProgramOptions(params?: {
    organizationId?: string | null;
    eligibleForDistribution?: boolean;
    onlyFullyApprovedForAgencyScope?: boolean;
  }) {
    const {
      organizationId = null,
      eligibleForDistribution = false,
      onlyFullyApprovedForAgencyScope = false,
    } = params ?? {};

    return programStore
      .map(normalizeProgram)
      .filter((program) => (organizationId ? program.organizationId === organizationId : true))
      .filter((program) => (eligibleForDistribution ? isDistributionEligibleProgram(program) : true))
      .filter((program) => {
        if (!onlyFullyApprovedForAgencyScope) {
          return true;
        }

        const approvalProgress = getProgramApprovalProgress(program);
        return approvalProgress.isFullyApproved && (program.status === "APPROVED" || program.status === "ACTIVE");
      })
      .map((program) => ({
        id: program.id,
        name: program.name,
        organizationId: program.organizationId,
        benefitType: program.benefitType,
        status: program.status,
      }));
  },

  async createProgram(payload: ProgramPayload): Promise<ApiResponse<ProgramDetails | null>> {
    const organization = findOrganization(payload.organizationId);

    if (!organization) {
      return Promise.resolve({
        success: false,
        message: "Organization not found",
        data: null,
      });
    }

    const timestamp = new Date().toISOString();
    const creator = mockUsers.find((user) => user.id === payload.createdByUserId) ?? mockUsers[0];
    const next: ProgramDetails = {
      id: `program_${String(programStore.length + 1).padStart(3, "0")}`,
      organizationId: payload.organizationId,
      organizationName: organization.name,
      organizationType: organization.type,
      organizationStatus: organization.status,
      name: payload.name,
      benefitType: payload.benefitType,
      description: payload.description,
      status: payload.status,
      startDate: payload.startDate,
      endDate: payload.endDate,
      duration: payload.duration,
      recipientCount: payload.recipientCount,
      amountPerRecipient: payload.amountPerRecipient,
      regions: payload.regions,
      states: payload.states,
      beneficiaryCount: 0,
      amount: payload.amount,
      budget: payload.budget,
      numberOfTrenches: payload.numberOfTrenches,
      batch: payload.batch,
      fundingSources: payload.fundingSources,
      approvalSteps: payload.approvalSteps,
      distributionApprovalSteps: payload.distributionApprovalSteps ?? [],
      rejectionReason: null,
      approvalHistory: [],
      createdByUserId: payload.createdByUserId ?? creator.id,
      totalDistributed: 0,
      createdAt: timestamp,
      updatedAt: timestamp,
      beneficiarySummary: {
        total: 0,
        verified: 0,
        pendingVerification: 0,
        flagged: 0,
      },
      distributionSummary: {
        totalBatches: 0,
        completedBatches: 0,
        pendingBatches: 0,
        failedBatches: 0,
        totalDistributed: 0,
      },
      recentActivities: [
        {
          id: `activity_${Date.now()}`,
          actor: creator.name,
          action: "created intervention",
          timestamp,
        },
      ],
    };

    programStore = [next, ...programStore];

    return Promise.resolve({
      success: true,
      message: "Program created successfully",
      data: normalizeProgram(next),
    });
  },

  async updateProgram(id: string, payload: ProgramPayload): Promise<ApiResponse<ProgramDetails | null>> {
    const organization = findOrganization(payload.organizationId);

    if (!organization) {
      return Promise.resolve({
        success: false,
        message: "Organization not found",
        data: null,
      });
    }

    let updated: ProgramDetails | null = null;

    programStore = programStore.map((item) => {
      if (item.id !== id) {
        return item;
      }

      updated = {
        ...item,
        organizationId: payload.organizationId,
        organizationName: organization.name,
        organizationType: organization.type,
        organizationStatus: organization.status,
        name: payload.name,
        benefitType: payload.benefitType,
        description: payload.description,
        status: payload.status,
        startDate: payload.startDate,
        endDate: payload.endDate,
        duration: payload.duration,
        recipientCount: payload.recipientCount,
        amountPerRecipient: payload.amountPerRecipient,
        regions: payload.regions,
        states: payload.states,
        amount: payload.amount,
        budget: payload.budget,
        numberOfTrenches: payload.numberOfTrenches,
        batch: payload.batch,
        fundingSources: payload.fundingSources,
        approvalSteps: payload.approvalSteps,
        distributionApprovalSteps: payload.distributionApprovalSteps,
        rejectionReason: item.status === "REJECTED" ? item.rejectionReason ?? null : null,
        updatedAt: new Date().toISOString(),
        recentActivities: [
          {
            id: `activity_${Date.now()}`,
            actor: "Amina Bello",
            action: "updated intervention profile",
            timestamp: new Date().toISOString(),
          },
          ...item.recentActivities,
        ],
      };

      return updated;
    });

    return Promise.resolve({
      success: Boolean(updated),
      message: updated ? "Program updated successfully" : "Program not found",
      data: updated ? normalizeProgram(updated) : null,
    });
  },

  async updateProgramStatus(id: string, status: ProgramStatus): Promise<ApiResponse<ProgramDetails | null>> {
    let updated: ProgramDetails | null = null;

    programStore = programStore.map((item) => {
      if (item.id !== id) {
        return item;
      }

      updated = {
        ...item,
        status,
        updatedAt: new Date().toISOString(),
        recentActivities: [
          {
            id: `activity_${Date.now()}`,
            actor: "Amina Bello",
            action: `changed status to ${status.toLowerCase()}`,
            timestamp: new Date().toISOString(),
          },
          ...item.recentActivities,
        ],
      };

      return updated;
    });

    return Promise.resolve({
      success: Boolean(updated),
      message: updated ? "Program status updated successfully" : "Program not found",
      data: updated ? normalizeProgram(updated) : null,
    });
  },

  async updateDistributionApprovalSteps(
    id: string,
    distributionApprovalSteps: DistributionApprovalTemplateStep[],
  ): Promise<ApiResponse<ProgramDetails | null>> {
    let updated: ProgramDetails | null = null;

    programStore = programStore.map((item) => {
      if (item.id !== id) {
        return item;
      }

      updated = {
        ...item,
        distributionApprovalSteps: normalizeDistributionApprovalSteps(distributionApprovalSteps),
        updatedAt: new Date().toISOString(),
        recentActivities: [
          {
            id: `activity_${Date.now()}`,
            actor: "Amina Bello",
            action: "updated agency approval steps for benefit distributions",
            timestamp: new Date().toISOString(),
          },
          ...item.recentActivities,
        ],
      };

      return updated;
    });

    return Promise.resolve({
      success: Boolean(updated),
      message: updated ? "Agency approval steps updated successfully" : "Program not found",
      data: updated ? normalizeProgram(updated) : null,
    });
  },

  canAccessProgram(program: ProgramDetails, role: string | null, userOrganizationId?: string | null, userId?: string | null) {
    if (role === "SUPER_ADMIN" || role === "AUDITOR") {
      return true;
    }

    if (
      role === "SYSTEM_ACCOUNTANT" ||
      role === "DIRECTOR"
    ) {
      return canUserAccessApproval(program, userId);
    }

    return userOrganizationId === program.organizationId;
  },

  async approveProgram(id: string, actor: AuthUser): Promise<ApiResponse<ProgramDetails | null>> {
    let updated: ProgramDetails | null = null;
    let message = "Program not found";

    programStore = programStore.map((item) => {
      if (item.id !== id) {
        return item;
      }

      const program = normalizeProgram(item);
      const currentStep = getCurrentPendingStep(program.approvalSteps ?? []);

      if (!currentStep) {
        message = "This intervention has no pending approval step.";
        return item;
      }

      if (currentStep.assigneeUserId !== actor.id) {
        message = `Approval is awaiting Step ${currentStep.order}: ${currentStep.assigneeName}. Complete earlier steps first.`;
        return item;
      }

      const nextSteps = (program.approvalSteps ?? []).map((step) =>
        step.id === currentStep.id
          ? { ...step, status: "APPROVED" as const, approvedAt: new Date().toISOString(), rejectionReason: null }
          : step,
      );
      const hasPending = nextSteps.some((step) => step.status === "PENDING");
      const nextStatus: ProgramStatus = hasPending ? "IN_PROGRESS" : "APPROVED";
      const historyEntry: ProgramApprovalHistoryItem = {
        id: `program_approval_${Date.now()}`,
        actor: actor.name,
        actorRole: actor.role,
        action: "APPROVED",
        stepOrder: currentStep.order,
        timestamp: new Date().toISOString(),
      };

      updated = {
        ...program,
        approvalSteps: nextSteps,
        approvalHistory: [historyEntry, ...(program.approvalHistory ?? [])],
        rejectionReason: null,
        status: nextStatus,
        updatedAt: historyEntry.timestamp,
        recentActivities: [
          {
            id: `activity_${Date.now()}`,
            actor: actor.name,
            action: `approved intervention step ${currentStep.order}`,
            timestamp: historyEntry.timestamp,
          },
          ...program.recentActivities,
        ],
      };

      message = hasPending
        ? `Step ${currentStep.order} approved. The next approver can now review this intervention.`
        : "Intervention approved successfully.";
      return updated;
    });

    return Promise.resolve({
      success: Boolean(updated),
      message,
      data: updated ? normalizeProgram(updated) : null,
    });
  },

  async rejectProgram(id: string, reason: string, actor: AuthUser): Promise<ApiResponse<ProgramDetails | null>> {
    let updated: ProgramDetails | null = null;
    let message = "Program not found";
    const trimmedReason = reason.trim();

    if (!trimmedReason) {
      return Promise.resolve({
        success: false,
        message: "A rejection reason is required.",
        data: null,
      });
    }

    programStore = programStore.map((item) => {
      if (item.id !== id) {
        return item;
      }

      const program = normalizeProgram(item);
      const currentStep = getCurrentPendingStep(program.approvalSteps ?? []);

      if (!currentStep) {
        message = "This intervention has no pending approval step.";
        return item;
      }

      if (currentStep.assigneeUserId !== actor.id) {
        message = `Approval is awaiting Step ${currentStep.order}: ${currentStep.assigneeName}. Complete earlier steps first.`;
        return item;
      }

      const timestamp = new Date().toISOString();
      const nextSteps = (program.approvalSteps ?? []).map((step) =>
        step.id === currentStep.id
          ? { ...step, status: "REJECTED" as const, approvedAt: null, rejectionReason: trimmedReason }
          : step,
      );
      const historyEntry: ProgramApprovalHistoryItem = {
        id: `program_rejection_${Date.now()}`,
        actor: actor.name,
        actorRole: actor.role,
        action: "REJECTED",
        reason: trimmedReason,
        stepOrder: currentStep.order,
        timestamp,
      };

      updated = {
        ...program,
        approvalSteps: nextSteps,
        approvalHistory: [historyEntry, ...(program.approvalHistory ?? [])],
        rejectionReason: trimmedReason,
        status: "REJECTED",
        updatedAt: timestamp,
        recentActivities: [
          {
            id: `activity_${Date.now()}`,
            actor: actor.name,
            action: `rejected intervention at step ${currentStep.order}`,
            timestamp,
          },
          ...program.recentActivities,
        ],
      };

      message = "Intervention rejected successfully.";
      return updated;
    });

    return Promise.resolve({
      success: Boolean(updated),
      message,
      data: updated ? normalizeProgram(updated) : null,
    });
  },
};
