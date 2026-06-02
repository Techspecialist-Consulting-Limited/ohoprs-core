import { programsData } from "@/mock/programs.mock";
import type { ApiResponse } from "@/types/api";

export const programService = {
  async getPrograms(): Promise<ApiResponse<typeof programsData>> {
    return Promise.resolve({
      success: true,
      message: "Programs mock endpoint is reserved for a future phase.",
      data: programsData,
    });
  },
};
