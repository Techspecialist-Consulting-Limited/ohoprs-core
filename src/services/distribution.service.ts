import { distributionsData } from "@/mock/distributions.mock";
import { programsData } from "@/mock/programs.mock";
import type { ApiResponse } from "@/types/api";
import type {
  Distribution,
  DistributionDetails,
  DistributionListParams,
  DistributionListResponse,
  DistributionPayload,
  DistributionStatus,
} from "@/types/distribution";

let distributionStore = [...distributionsData];

function programById(id: string) {
  return programsData.find((program) => program.id === id) ?? null;
}

function isCashMethod(method: DistributionPayload["method"]) {
  return method === "BANK_TRANSFER" || method === "MOBILE_MONEY" || method === "CASH";
}

export const distributionService = {
  async getDistributions(params: DistributionListParams = {}): Promise<ApiResponse<DistributionListResponse>> {
    const {
      search = "",
      page = 1,
      limit = 10,
      organizationId = "ALL",
      programId = "ALL",
      status = "ALL",
      benefitType = "ALL",
      scopeOrganizationId = null,
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
      message: distribution ? "Distribution details fetched successfully" : "Distribution not found",
      data: distribution,
    });
  },

  async createDistribution(payload: DistributionPayload, createdByUserId: string, createdBy: string): Promise<ApiResponse<DistributionDetails | null>> {
    const program = programById(payload.programId);

    if (!program) {
      return Promise.resolve({ success: false, message: "Program not found", data: null });
    }

    const timestamp = new Date().toISOString();
    const next: DistributionDetails = {
      id: `distribution_${String(distributionStore.length + 1).padStart(3, "0")}`,
      organizationId: program.organizationId,
      organizationName: program.organizationName,
      programId: program.id,
      programName: program.name,
      name: payload.name,
      benefitType: program.benefitType,
      method: payload.method,
      description: payload.description,
      beneficiaryCount: payload.beneficiaryCount,
      amount: isCashMethod(payload.method) ? payload.amount ?? 0 : undefined,
      quantity: isCashMethod(payload.method) ? undefined : payload.quantity ?? 0,
      status: payload.status,
      scheduledDate: payload.scheduledDate,
      createdByUserId,
      createdBy,
      createdAt: timestamp,
      updatedAt: timestamp,
      programStatus: program.status,
      organizationType: program.organizationType,
      organizationStatus: program.organizationStatus,
      recipients: [],
      statistics: {
        beneficiaries: payload.beneficiaryCount,
        amountDistributed: isCashMethod(payload.method) ? payload.amount ?? 0 : 0,
        successRate: 0,
        failedDeliveries: 0,
        completionRate: payload.status === "COMPLETED" ? 100 : payload.status === "PROCESSING" ? 60 : 0,
        lastUpdated: timestamp,
      },
      timeline: [
        {
          id: `timeline_${timestamp}`,
          label: "Created",
          description: "Distribution batch was created in the prototype workflow.",
          status: "DRAFT",
          timestamp,
          actor: createdBy,
        },
      ],
      recentActivities: [
        {
          id: `activity_${timestamp}`,
          actor: createdBy,
          action: "Created distribution batch",
          timestamp,
        },
      ],
    };

    distributionStore = [next, ...distributionStore];

    return Promise.resolve({
      success: true,
      message: "Distribution created successfully",
      data: next,
    });
  },

  async updateDistribution(id: string, payload: DistributionPayload): Promise<ApiResponse<DistributionDetails | null>> {
    const program = programById(payload.programId);

    if (!program) {
      return Promise.resolve({ success: false, message: "Program not found", data: null });
    }

    let updated: DistributionDetails | null = null;

    distributionStore = distributionStore.map((item) => {
      if (item.id !== id) {
        return item;
      }

      updated = {
        ...item,
        organizationId: program.organizationId,
        organizationName: program.organizationName,
        programId: program.id,
        programName: program.name,
        name: payload.name,
        benefitType: program.benefitType,
        method: payload.method,
        description: payload.description,
        beneficiaryCount: payload.beneficiaryCount,
        amount: isCashMethod(payload.method) ? payload.amount ?? 0 : undefined,
        quantity: isCashMethod(payload.method) ? undefined : payload.quantity ?? 0,
        status: payload.status,
        scheduledDate: payload.scheduledDate,
        updatedAt: new Date().toISOString(),
        programStatus: program.status,
        organizationType: program.organizationType,
        organizationStatus: program.organizationStatus,
        statistics: {
          ...item.statistics,
          beneficiaries: payload.beneficiaryCount,
          amountDistributed: isCashMethod(payload.method) ? payload.amount ?? 0 : 0,
          completionRate: payload.status === "COMPLETED" ? 100 : payload.status === "PROCESSING" ? 60 : payload.status === "FAILED" ? 30 : item.statistics.completionRate,
          lastUpdated: new Date().toISOString(),
        },
      };

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
        updatedAt: new Date().toISOString(),
        statistics: {
          ...item.statistics,
          completionRate: status === "COMPLETED" ? 100 : status === "PROCESSING" ? 60 : status === "FAILED" ? 30 : status === "SCHEDULED" ? 20 : status === "CANCELLED" ? 0 : 10,
          lastUpdated: new Date().toISOString(),
        },
        timeline: [
          {
            id: `${item.id}_status_${Date.now()}`,
            label: status === "COMPLETED" ? "Completed" : status === "FAILED" ? "Failed" : status === "CANCELLED" ? "Cancelled" : status === "PROCESSING" ? "Processing Started" : "Scheduled",
            description: `Distribution status updated to ${status.replaceAll("_", " ").toLowerCase()}.`,
            status,
            timestamp: new Date().toISOString(),
            actor: "Operations Desk",
          },
          ...item.timeline,
        ],
      };

      return updated;
    });

    return Promise.resolve({
      success: Boolean(updated),
      message: updated ? "Distribution status updated successfully" : "Distribution not found",
      data: updated,
    });
  },
};
