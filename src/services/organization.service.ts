import { organizationsData } from "@/mock/organizations.mock";
import type { ApiResponse } from "@/types/api";

export const organizationService = {
  async getOrganizations(): Promise<ApiResponse<typeof organizationsData>> {
    return Promise.resolve({
      success: true,
      message: "Organizations mock endpoint is reserved for a future phase.",
      data: organizationsData,
    });
  },
};
