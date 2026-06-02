import { dashboardData } from "@/mock/dashboard.mock";
import type { ApiResponse } from "@/types/api";
import type { DashboardData } from "@/types/dashboard";

export const dashboardService = {
  async getDashboard(): Promise<ApiResponse<DashboardData>> {
    return Promise.resolve({
      success: true,
      message: "Dashboard data fetched successfully.",
      data: dashboardData,
    });
  },
};
