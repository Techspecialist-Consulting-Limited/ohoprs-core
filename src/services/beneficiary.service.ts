import { organizationsData } from "@/mock/organizations.mock";
import { programsData } from "@/mock/programs.mock";
import { beneficiariesData } from "@/mock/beneficiaries.mock";
import type { ApiResponse } from "@/types/api";
import type {
  Beneficiary,
  BeneficiaryDetails,
  BeneficiaryListParams,
  BeneficiaryListResponse,
  BeneficiaryPayload,
  BenefitStatus,
  VerificationStatus,
} from "@/types/beneficiary";

let beneficiaryStore = [...beneficiariesData];

function getPrograms(programIds: string[]) {
  return programIds
    .map((programId) => programsData.find((program) => program.id === programId))
    .filter(Boolean)
    .map((program) => ({
      id: program!.id,
      name: program!.name,
      benefitType: program!.benefitType,
      status: program!.status,
    }));
}

function organizationById(id: string) {
  return organizationsData.find((organization) => organization.id === id) ?? null;
}

export const beneficiaryService = {
  async getBeneficiaries(params: BeneficiaryListParams = {}): Promise<ApiResponse<BeneficiaryListResponse>> {
    const {
      benefitStatus = "ALL",
      limit = 10,
      organizationId = "ALL",
      page = 1,
      programId = "ALL",
      scopeOrganizationId = null,
      search = "",
      state = "ALL",
      verificationStatus = "ALL",
    } = params;

    let filtered = [...beneficiaryStore];

    if (scopeOrganizationId) {
      filtered = filtered.filter((item) => item.organizationId === scopeOrganizationId);
    }

    if (organizationId !== "ALL") {
      filtered = filtered.filter((item) => item.organizationId === organizationId);
    }

    if (programId !== "ALL") {
      filtered = filtered.filter((item) => item.programIds.includes(programId));
    }

    if (state !== "ALL") {
      filtered = filtered.filter((item) => item.state === state);
    }

    if (verificationStatus !== "ALL") {
      filtered = filtered.filter((item) => item.verificationStatus === verificationStatus);
    }

    if (benefitStatus !== "ALL") {
      filtered = filtered.filter((item) => item.benefitStatus === benefitStatus);
    }

    if (search.trim()) {
      const term = search.trim().toLowerCase();
      filtered = filtered.filter(
        (item) =>
          item.fullName.toLowerCase().includes(term) ||
          item.nin.includes(term) ||
          item.phone.toLowerCase().includes(term) ||
          item.organizationName.toLowerCase().includes(term),
      );
    }

    const total = filtered.length;
    const totalPages = Math.max(1, Math.ceil(total / limit));
    const safePage = Math.min(page, totalPages);
    const items = filtered.slice((safePage - 1) * limit, safePage * limit).map<Beneficiary>((item) => ({
      ...item,
    }));

    return Promise.resolve({
      success: true,
      message: "Beneficiaries fetched successfully",
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

  async getBeneficiaryById(id: string): Promise<ApiResponse<BeneficiaryDetails | null>> {
    const beneficiary = beneficiaryStore.find((item) => item.id === id) ?? null;

    return Promise.resolve({
      success: Boolean(beneficiary),
      message: beneficiary ? "Beneficiary details fetched successfully" : "Beneficiary not found",
      data: beneficiary,
    });
  },

  async createBeneficiary(payload: BeneficiaryPayload): Promise<ApiResponse<BeneficiaryDetails | null>> {
    const organization = organizationById(payload.organizationId);

    if (!organization) {
      return Promise.resolve({
        success: false,
        message: "Organization not found",
        data: null,
      });
    }

    const timestamp = new Date().toISOString();
    const programs = getPrograms(payload.programIds);
    const fullName = [payload.firstName, payload.middleName, payload.lastName].filter(Boolean).join(" ");

    const next: BeneficiaryDetails = {
      id: `beneficiary_${String(beneficiaryStore.length + 1).padStart(3, "0")}`,
      organizationId: payload.organizationId,
      organizationName: organization.name,
      firstName: payload.firstName,
      lastName: payload.lastName,
      middleName: payload.middleName,
      fullName,
      nin: payload.nin,
      bvn: payload.bvn,
      phone: payload.phone,
      email: payload.email,
      gender: payload.gender,
      dateOfBirth: payload.dateOfBirth,
      state: payload.state,
      lga: payload.lga,
      address: payload.address,
      programIds: payload.programIds,
      programs,
      verificationStatus: payload.verificationStatus,
      benefitStatus: payload.benefitStatus,
      createdAt: timestamp,
      updatedAt: timestamp,
      verificationSummary: {
        status: payload.verificationStatus,
        ninVerified: payload.verificationStatus !== "FAILED",
        bvnVerified: payload.verificationStatus === "VERIFIED" && Boolean(payload.bvn),
        lastCheckedAt: timestamp,
      },
      benefitSummary: {
        activeEnrollments: payload.programIds.length,
        totalCashReceived: 0,
        nonCashBenefitsReceived: 0,
        lastDistributionStatus: "No distributions yet",
        verificationState: payload.verificationStatus,
      },
    };

    beneficiaryStore = [next, ...beneficiaryStore];

    return Promise.resolve({
      success: true,
      message: "Beneficiary created successfully",
      data: next,
    });
  },

  async updateBeneficiary(id: string, payload: BeneficiaryPayload): Promise<ApiResponse<BeneficiaryDetails | null>> {
    const organization = organizationById(payload.organizationId);

    if (!organization) {
      return Promise.resolve({
        success: false,
        message: "Organization not found",
        data: null,
      });
    }

    let updated: BeneficiaryDetails | null = null;

    beneficiaryStore = beneficiaryStore.map((item): BeneficiaryDetails => {
      if (item.id !== id) {
        return item;
      }

      const programs = getPrograms(payload.programIds);

      updated = {
        ...item,
        organizationId: payload.organizationId,
        organizationName: organization.name,
        firstName: payload.firstName,
        lastName: payload.lastName,
        middleName: payload.middleName,
        fullName: [payload.firstName, payload.middleName, payload.lastName].filter(Boolean).join(" "),
        nin: payload.nin,
        bvn: payload.bvn,
        phone: payload.phone,
        email: payload.email,
        gender: payload.gender,
        dateOfBirth: payload.dateOfBirth,
        state: payload.state,
        lga: payload.lga,
        address: payload.address,
        programIds: payload.programIds,
        programs,
        verificationStatus: payload.verificationStatus,
        benefitStatus: payload.benefitStatus,
        updatedAt: new Date().toISOString(),
        verificationSummary: {
          ...item.verificationSummary,
          status: payload.verificationStatus,
        },
        benefitSummary: {
          ...item.benefitSummary,
          activeEnrollments: payload.programIds.length,
          verificationState: payload.verificationStatus,
        },
      };

      updated.verificationSummary = {
        status: payload.verificationStatus,
        ninVerified: payload.verificationStatus !== "FAILED",
        bvnVerified: payload.verificationStatus === "VERIFIED" && Boolean(payload.bvn),
        lastCheckedAt: new Date().toISOString(),
      };

      return updated ?? item;
    });

    return Promise.resolve({
      success: Boolean(updated),
      message: updated ? "Beneficiary updated successfully" : "Beneficiary not found",
      data: updated,
    });
  },

  async updateBeneficiaryStatuses(
    id: string,
    statuses: { verificationStatus: VerificationStatus; benefitStatus: BenefitStatus },
  ): Promise<ApiResponse<BeneficiaryDetails | null>> {
    let updated: BeneficiaryDetails | null = null;

    beneficiaryStore = beneficiaryStore.map((item): BeneficiaryDetails => {
      if (item.id !== id) {
        return item;
      }

      updated = {
        ...item,
        verificationStatus: statuses.verificationStatus,
        benefitStatus: statuses.benefitStatus,
        updatedAt: new Date().toISOString(),
        verificationSummary: {
          status: statuses.verificationStatus,
          ninVerified: statuses.verificationStatus !== "FAILED",
          bvnVerified: statuses.verificationStatus === "VERIFIED" && Boolean(item.bvn),
          lastCheckedAt: new Date().toISOString(),
        },
        benefitSummary: {
          ...item.benefitSummary,
          verificationState: statuses.verificationStatus,
        },
      };

      return updated ?? item;
    });

    return Promise.resolve({
      success: Boolean(updated),
      message: updated ? "Beneficiary status updated successfully" : "Beneficiary not found",
      data: updated,
    });
  },
};
