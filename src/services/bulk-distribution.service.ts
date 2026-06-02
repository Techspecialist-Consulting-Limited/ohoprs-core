import { bulkDistributionJobsData } from "@/mock/bulk-distributions.mock";
import { programsData } from "@/mock/programs.mock";
import type { ApiResponse } from "@/types/api";
import type {
  BulkDistributionJob,
  BulkDistributionJobDetails,
  BulkDistributionPayload,
  BulkJobListParams,
  BulkJobListResponse,
} from "@/types/bulk-distribution";

let bulkJobStore = [...bulkDistributionJobsData];

function isCashMethod(method: BulkDistributionPayload["method"]) {
  return method === "BANK_TRANSFER" || method === "MOBILE_MONEY" || method === "CASH";
}

export const bulkDistributionService = {
  async getBulkJobs(params: BulkJobListParams = {}): Promise<ApiResponse<BulkJobListResponse>> {
    const {
      search = "",
      page = 1,
      limit = 10,
      organizationId = "ALL",
      programId = "ALL",
      status = "ALL",
      scopeOrganizationId = null,
    } = params;

    let filtered = [...bulkJobStore];

    if (scopeOrganizationId) {
      filtered = filtered.filter((item) => item.organizationId === scopeOrganizationId);
    }

    if (organizationId !== "ALL") {
      filtered = filtered.filter((item) => item.organizationId === organizationId);
    }

    if (programId !== "ALL") {
      filtered = filtered.filter((item) => item.programId === programId);
    }

    if (status !== "ALL") {
      filtered = filtered.filter((item) => item.status === status);
    }

    if (search.trim()) {
      const term = search.trim().toLowerCase();
      filtered = filtered.filter(
        (item) =>
          item.programName.toLowerCase().includes(term) ||
          item.organizationName.toLowerCase().includes(term) ||
          item.createdBy.toLowerCase().includes(term) ||
          item.id.toLowerCase().includes(term),
      );
    }

    const total = filtered.length;
    const totalPages = Math.max(1, Math.ceil(total / limit));
    const safePage = Math.min(page, totalPages);
    const items = filtered.slice((safePage - 1) * limit, safePage * limit).map<BulkDistributionJob>((item) => ({ ...item }));

    return Promise.resolve({
      success: true,
      message: "Bulk jobs fetched successfully",
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

  async getBulkJobById(jobId: string): Promise<ApiResponse<BulkDistributionJobDetails | null>> {
    const job = bulkJobStore.find((item) => item.id === jobId) ?? null;

    return Promise.resolve({
      success: Boolean(job),
      message: job ? "Bulk job fetched successfully" : "Bulk job not found",
      data: job,
    });
  },

  async createBulkJob(
    payload: BulkDistributionPayload,
    createdByUserId: string,
    createdBy: string,
  ): Promise<ApiResponse<BulkDistributionJobDetails | null>> {
    const program = programsData.find((item) => item.id === payload.programId);

    if (!program) {
      return Promise.resolve({ success: false, message: "Program not found", data: null });
    }

    const now = new Date().toISOString();
    const next: BulkDistributionJobDetails = {
      id: `bulk_job_${String(bulkJobStore.length + 1).padStart(3, "0")}`,
      organizationId: program.organizationId,
      organizationName: program.organizationName,
      programId: program.id,
      programName: program.name,
      benefitType: program.benefitType,
      method: payload.method,
      segment: payload.segment,
      state: payload.state,
      beneficiaryCount: payload.beneficiaryCount,
      amount: isCashMethod(payload.method) ? payload.amount ?? 0 : undefined,
      quantity: isCashMethod(payload.method) ? undefined : payload.quantity ?? 0,
      status: "QUEUED",
      totalRecords: payload.beneficiaryCount,
      processedRecords: 0,
      successfulRecords: 0,
      failedRecords: 0,
      pendingRecords: payload.beneficiaryCount,
      createdByUserId,
      createdBy,
      scheduledDate: payload.scheduledDate,
      createdAt: now,
      updatedAt: now,
      estimatedCompletion: "Awaiting queue slot",
      progressPercentage: 0,
      totalEstimatedPayout: isCashMethod(payload.method) ? (payload.amount ?? 0) * payload.beneficiaryCount : undefined,
      totalEstimatedQuantity: isCashMethod(payload.method) ? undefined : (payload.quantity ?? 0) * payload.beneficiaryCount,
      timeline: [
        {
          id: `${now}_1`,
          label: "Job Created",
          description: "Bulk job created and submitted into the enterprise processing console.",
          timestamp: now,
          actor: createdBy,
          status: "COMPLETED",
        },
        {
          id: `${now}_2`,
          label: "Queued",
          description: "Awaiting simulated processing engine allocation.",
          timestamp: payload.scheduledDate,
          actor: "Batch Queue",
          status: "CURRENT",
        },
      ],
      failedRecordPreview: [],
    };

    bulkJobStore = [next, ...bulkJobStore];

    return Promise.resolve({
      success: true,
      message: "Bulk job created successfully",
      data: next,
    });
  },

  async cancelBulkJob(jobId: string): Promise<ApiResponse<BulkDistributionJobDetails | null>> {
    let updated: BulkDistributionJobDetails | null = null;

    bulkJobStore = bulkJobStore.map((item) => {
      if (item.id !== jobId) {
        return item;
      }

      updated = {
        ...item,
        status: "CANCELLED",
        updatedAt: new Date().toISOString(),
        processedRecords: 0,
        successfulRecords: 0,
        failedRecords: 0,
        pendingRecords: item.totalRecords,
        progressPercentage: 0,
        estimatedCompletion: "Completed",
        timeline: [
          {
            id: `${item.id}_cancel_${Date.now()}`,
            label: "Cancelled",
            description: "Job was cancelled by an authorized operator before completion.",
            timestamp: new Date().toISOString(),
            actor: "Operations Desk",
            status: "FAILED",
          },
          ...item.timeline,
        ],
      };

      return updated;
    });

    return Promise.resolve({
      success: Boolean(updated),
      message: updated ? "Bulk job cancelled successfully" : "Bulk job not found",
      data: updated,
    });
  },
};
