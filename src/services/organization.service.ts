import { organizationsData } from "@/mock/organizations.mock";
import type { ApiResponse } from "@/types/api";
import type {
  Organization,
  OrganizationDetails,
  OrganizationListParams,
  OrganizationListResponse,
  OrganizationPayload,
  OrganizationStatus,
} from "@/types/organization";

let organizationStore = [...organizationsData];

export const organizationService = {
  async getOrganizations(params: OrganizationListParams = {}): Promise<ApiResponse<OrganizationListResponse>> {
    const {
      limit = 10,
      page = 1,
      scopeOrganizationId = null,
      search = "",
      status = "ALL",
      type = "ALL",
    } = params;

    let filtered = [...organizationStore];

    if (scopeOrganizationId) {
      filtered = filtered.filter((item) => item.id === scopeOrganizationId);
    }

    if (search.trim()) {
      const term = search.trim().toLowerCase();
      filtered = filtered.filter(
        (item) =>
          item.name.toLowerCase().includes(term) ||
          item.shortName.toLowerCase().includes(term) ||
          item.state.toLowerCase().includes(term),
      );
    }

    if (status !== "ALL") {
      filtered = filtered.filter((item) => item.status === status);
    }

    if (type !== "ALL") {
      filtered = filtered.filter((item) => item.type === type);
    }

    const total = filtered.length;
    const totalPages = Math.max(1, Math.ceil(total / limit));
    const safePage = Math.min(page, totalPages);
    const items = filtered.slice((safePage - 1) * limit, safePage * limit).map<Organization>((item) => ({
      ...item,
    }));

    return Promise.resolve({
      success: true,
      message: "Organizations fetched successfully",
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

  async getOrganizationById(id: string): Promise<ApiResponse<OrganizationDetails | null>> {
    const organization = organizationStore.find((item) => item.id === id) ?? null;

    return Promise.resolve({
      success: Boolean(organization),
      message: organization ? "Organization details fetched successfully" : "Organization not found",
      data: organization,
    });
  },

  async createOrganization(payload: OrganizationPayload): Promise<ApiResponse<OrganizationDetails>> {
    const timestamp = new Date().toISOString();
    const next: OrganizationDetails = {
      id: `org_${String(organizationStore.length + 1).padStart(3, "0")}`,
      ...payload,
      website: payload.website || "",
      programCount: 0,
      beneficiaryCount: 0,
      totalDistributed: 0,
      createdAt: timestamp,
      updatedAt: timestamp,
      programsPreview: [],
      recentActivities: [
        {
          id: `activity_${Date.now()}`,
          actor: "Amina Bello",
          action: "Created organization profile",
          timestamp,
        },
      ],
      adminUsersPreview: [
        { id: "user_preview_001", name: "Musa Ibrahim", role: "Organization Admin", email: payload.contactEmail },
        { id: "user_preview_002", name: "Fatima Yusuf", role: "Program Manager", email: `programs@${payload.shortName.toLowerCase()}.gov.ng` },
      ],
    };

    organizationStore = [next, ...organizationStore];

    return Promise.resolve({
      success: true,
      message: "Organization created successfully",
      data: next,
    });
  },

  async updateOrganization(id: string, payload: OrganizationPayload): Promise<ApiResponse<OrganizationDetails | null>> {
    let updated: OrganizationDetails | null = null;

    organizationStore = organizationStore.map((item) => {
      if (item.id !== id) {
        return item;
      }

      updated = {
        ...item,
        ...payload,
        website: payload.website || "",
        updatedAt: new Date().toISOString(),
        recentActivities: [
          {
            id: `activity_${Date.now()}`,
            actor: "Amina Bello",
            action: "Updated organization profile",
            timestamp: new Date().toISOString(),
          },
          ...item.recentActivities,
        ],
      };

      return updated;
    });

    return Promise.resolve({
      success: Boolean(updated),
      message: updated ? "Organization updated successfully" : "Organization not found",
      data: updated,
    });
  },

  async updateOrganizationStatus(
    id: string,
    status: OrganizationStatus,
  ): Promise<ApiResponse<OrganizationDetails | null>> {
    let updated: OrganizationDetails | null = null;

    organizationStore = organizationStore.map((item) => {
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
            action: `Changed organization status to ${status.replaceAll("_", " ").toLowerCase()}`,
            timestamp: new Date().toISOString(),
          },
          ...item.recentActivities,
        ],
      };

      return updated;
    });

    return Promise.resolve({
      success: Boolean(updated),
      message: updated ? "Organization status updated successfully" : "Organization not found",
      data: updated,
    });
  },
};
