import { organizationsData } from "@/mock/organizations.mock";
import { programsData } from "@/mock/programs.mock";
import type { ApiResponse } from "@/types/api";
import type {
  Program,
  ProgramDetails,
  ProgramListParams,
  ProgramListResponse,
  ProgramPayload,
  ProgramStatus,
} from "@/types/program";

let programStore = [...programsData];

function findOrganization(id: string) {
  return organizationsData.find((item) => item.id === id) ?? null;
}

export const programService = {
  async getPrograms(params: ProgramListParams = {}): Promise<ApiResponse<ProgramListResponse>> {
    const {
      benefitType = "ALL",
      limit = 10,
      organizationId = "ALL",
      page = 1,
      scopeOrganizationId = null,
      search = "",
      status = "ALL",
    } = params;

    let filtered = [...programStore];

    if (scopeOrganizationId) {
      filtered = filtered.filter((item) => item.organizationId === scopeOrganizationId);
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
      data: program,
    });
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
      targetBeneficiaries: payload.targetBeneficiaries,
      beneficiaryCount: 0,
      budget: payload.budget,
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
          actor: "Amina Bello",
          action: "created program",
          timestamp,
        },
      ],
    };

    programStore = [next, ...programStore];

    return Promise.resolve({
      success: true,
      message: "Program created successfully",
      data: next,
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
        targetBeneficiaries: payload.targetBeneficiaries,
        budget: payload.budget,
        updatedAt: new Date().toISOString(),
        recentActivities: [
          {
            id: `activity_${Date.now()}`,
            actor: "Amina Bello",
            action: "updated program profile",
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
      data: updated,
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
      data: updated,
    });
  },
};
