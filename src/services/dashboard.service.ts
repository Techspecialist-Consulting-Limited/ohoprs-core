import {
  auditorDashboardData,
  nationalDashboardData,
  organizationDashboardData,
  programOfficerDashboardData,
} from "@/mock/dashboard.mock";
import type { ApiResponse } from "@/types/api";
import type { DashboardResponse } from "@/types/dashboard";
import type { UserRole } from "@/types/auth";
import type { TenantContext } from "@/types/tenant";

export const dashboardService = {
  async getDashboardByRole(
    role: UserRole,
    currentTenant: TenantContext | null,
  ): Promise<ApiResponse<DashboardResponse>> {
    const data = (() => {
      if (role === "SUPER_ADMIN") {
        return nationalDashboardData;
      }

      if (role === "AUDITOR") {
        return auditorDashboardData;
      }

      if (role === "PROGRAM_OFFICER") {
        return {
          ...programOfficerDashboardData,
          title: currentTenant?.shortCode
            ? `${currentTenant.shortCode} Program Operations Overview`
            : "Program Operations Overview",
        };
      }

      return {
        ...organizationDashboardData,
        title: currentTenant?.name
          ? `${currentTenant.name} Overview`
          : organizationDashboardData.title,
      };
    })();

    return Promise.resolve({
      success: true,
      message: "Dashboard data fetched successfully",
      data,
    });
  },
};
