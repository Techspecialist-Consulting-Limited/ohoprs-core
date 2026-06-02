import { distributionsData } from "@/mock/distributions.mock";
import type { ApiResponse } from "@/types/api";

export const distributionService = {
  async getDistributions(): Promise<ApiResponse<typeof distributionsData>> {
    return Promise.resolve({
      success: true,
      message: "Distributions mock endpoint is reserved for a future phase.",
      data: distributionsData,
    });
  },
};
