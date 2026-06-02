import { beneficiariesData } from "@/mock/beneficiaries.mock";
import type { ApiResponse } from "@/types/api";

export const beneficiaryService = {
  async getBeneficiaries(): Promise<ApiResponse<typeof beneficiariesData>> {
    return Promise.resolve({
      success: true,
      message: "Beneficiaries mock endpoint is reserved for a future phase.",
      data: beneficiariesData,
    });
  },
};
