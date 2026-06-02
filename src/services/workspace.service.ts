import { getBaseWorkspaceByOrganizationId, workspaceQuickActionsByRole } from "@/mock/workspace.mock";
import type { ApiResponse } from "@/types/api";
import type { AuthUser, UserRole } from "@/types/auth";
import type { OrganizationWorkspaceResponse } from "@/types/workspace";
import { organizationsData } from "@/mock/organizations.mock";
import type { TenantContext } from "@/types/tenant";

function resolveOrganizationIdFromTenant(currentTenant: TenantContext | null) {
  if (!currentTenant) {
    return null;
  }

  const match = organizationsData.find(
    (organization) =>
      organization.id === currentTenant.id ||
      organization.shortName === currentTenant.shortCode ||
      organization.name === currentTenant.name,
  );

  return match?.id ?? null;
}

function canAccessOrganization(role: UserRole, user: AuthUser | null, organizationId: string) {
  if (role === "SUPER_ADMIN" || role === "AUDITOR") {
    return true;
  }

  return user?.organizationId === organizationId;
}

function getRoleScope(role: UserRole): OrganizationWorkspaceResponse["roleScope"] {
  if (role === "PROGRAM_OFFICER") {
    return "OPERATIONS";
  }

  if (role === "AUDITOR") {
    return "OVERSIGHT";
  }

  return "MANAGEMENT";
}

export const workspaceService = {
  async getWorkspaceByOrganizationId(
    id: string,
    role: UserRole,
    user: AuthUser | null,
  ): Promise<ApiResponse<OrganizationWorkspaceResponse | null>> {
    if (!canAccessOrganization(role, user, id)) {
      return Promise.resolve({
        success: false,
        message: "You do not have permission to access this organization workspace.",
        data: null,
      });
    }

    const base = getBaseWorkspaceByOrganizationId(id);

    if (!base) {
      return Promise.resolve({
        success: false,
        message: "Organization workspace not found.",
        data: null,
      });
    }

    return Promise.resolve({
      success: true,
      message: "Organization workspace fetched successfully",
      data: {
        ...base,
        quickActions: workspaceQuickActionsByRole[role].map((action) => ({
          ...action,
          href: action.href.replace(":id", id),
        })),
        roleScope: getRoleScope(role),
        role,
      },
    });
  },

  async getCurrentWorkspace({
    currentTenant,
    role,
    user,
  }: {
    currentTenant: TenantContext | null;
    role: UserRole;
    user: AuthUser | null;
  }): Promise<ApiResponse<OrganizationWorkspaceResponse | null>> {
    const tenantOrganizationId = resolveOrganizationIdFromTenant(currentTenant);
    const organizationId = tenantOrganizationId ?? user?.organizationId ?? null;

    if (!organizationId) {
      return Promise.resolve({
        success: false,
        message: "No organization workspace is currently selected.",
        data: null,
      });
    }

    return this.getWorkspaceByOrganizationId(organizationId, role, user);
  },

  resolveOrganizationIdFromTenant,
};
