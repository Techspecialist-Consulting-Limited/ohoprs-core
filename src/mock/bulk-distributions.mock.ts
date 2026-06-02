import { programsData } from "@/mock/programs.mock";
import type {
  BulkDistributionJobDetails,
  BulkJobStatus,
  BeneficiarySegment,
  FailedBulkRecord,
  BulkJobTimelineEvent,
} from "@/types/bulk-distribution";
import type { DistributionMethod } from "@/types/distribution";

const creatorDirectory = {
  user_001: "Amina Bello",
  user_002: "Musa Ibrahim",
  user_003: "Chioma Okafor",
  user_004: "David Audu",
} as const;

function cashLike(method: DistributionMethod) {
  return method === "BANK_TRANSFER" || method === "MOBILE_MONEY" || method === "CASH";
}

function estimatedCompletion(status: BulkJobStatus) {
  if (status === "COMPLETED" || status === "FAILED" || status === "PARTIALLY_FAILED" || status === "CANCELLED") {
    return "Completed";
  }

  if (status === "PROCESSING") {
    return "Approx. 42 minutes";
  }

  return "Awaiting queue slot";
}

function progress(status: BulkJobStatus, processedRecords: number, totalRecords: number) {
  if (status === "COMPLETED") return 100;
  if (status === "CANCELLED") return 0;
  return Math.min(100, Math.round((processedRecords / Math.max(totalRecords, 1)) * 100));
}

function buildTimeline(id: string, status: BulkJobStatus, createdAt: string, scheduledDate: string, actor: string): BulkJobTimelineEvent[] {
  const queuedAt = new Date(createdAt);
  const validatedAt = new Date(createdAt);
  validatedAt.setMinutes(validatedAt.getMinutes() + 12);
  const scheduledAt = new Date(scheduledDate);
  const processingAt = new Date(scheduledDate);
  processingAt.setMinutes(processingAt.getMinutes() + 15);

  const base: BulkJobTimelineEvent[] = [
    {
      id: `${id}_1`,
      label: "Job Created",
      description: "Bulk job configuration was submitted for enterprise processing.",
      timestamp: queuedAt.toISOString(),
      actor,
      status: "COMPLETED",
    },
    {
      id: `${id}_2`,
      label: "Validation Completed",
      description: "Program scope, segment rules, and payload structure passed mock validation.",
      timestamp: validatedAt.toISOString(),
      actor: "Validation Engine",
      status: "COMPLETED",
    },
    {
      id: `${id}_3`,
      label: "Queued",
      description: "Job entered the simulated processing queue.",
      timestamp: scheduledAt.toISOString(),
      actor: "Batch Queue",
      status: status === "QUEUED" ? "CURRENT" : "COMPLETED",
    },
  ];

  if (status !== "QUEUED") {
    base.push({
      id: `${id}_4`,
      label: "Processing Started",
      description: "Batch job started processing beneficiary records and delivery instructions.",
      timestamp: processingAt.toISOString(),
      actor: "Processing Engine",
      status: status === "PROCESSING" ? "CURRENT" : status === "FAILED" ? "FAILED" : "COMPLETED",
    });
  }

  if (status === "COMPLETED") {
    base.push({
      id: `${id}_5`,
      label: "Completed",
      description: "All records were processed successfully.",
      timestamp: new Date(processingAt.getTime() + 1000 * 60 * 45).toISOString(),
      actor: "Settlement Engine",
      status: "COMPLETED",
    });
  }

  if (status === "PARTIALLY_FAILED") {
    base.push({
      id: `${id}_5`,
      label: "Partially Failed",
      description: "Processing completed with a subset of records requiring retry or manual review.",
      timestamp: new Date(processingAt.getTime() + 1000 * 60 * 35).toISOString(),
      actor: "Exception Queue",
      status: "FAILED",
    });
  }

  if (status === "FAILED") {
    base.push({
      id: `${id}_5`,
      label: "Failed",
      description: "Batch failed after validation or downstream delivery exceptions.",
      timestamp: new Date(processingAt.getTime() + 1000 * 60 * 25).toISOString(),
      actor: "Exception Queue",
      status: "FAILED",
    });
  }

  if (status === "CANCELLED") {
    base.push({
      id: `${id}_5`,
      label: "Cancelled",
      description: "Job was cancelled before completion by an authorized operator.",
      timestamp: new Date(processingAt.getTime() + 1000 * 60 * 10).toISOString(),
      actor: "Operations Desk",
      status: "FAILED",
    });
  }

  return base.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
}

function buildFailedRecords(jobId: string, total: number): FailedBulkRecord[] {
  const reasons = [
    "Invalid bank account",
    "Duplicate beneficiary",
    "Beneficiary not verified",
    "Missing BVN",
    "Payment provider timeout",
  ];

  return Array.from({ length: Math.min(total, 5) }, (_, index) => ({
    id: `${jobId}_failed_${index + 1}`,
    beneficiaryId: `beneficiary_${String(index + 1).padStart(3, "0")}`,
    beneficiaryName: `Beneficiary ${index + 1}`,
    reason: reasons[index % reasons.length],
    status: index % 2 === 0 ? "FAILED" : "RETRY_PENDING",
  }));
}

function createJob(input: {
  id: string;
  programId: string;
  method: DistributionMethod;
  segment: BeneficiarySegment;
  status: BulkJobStatus;
  beneficiaryCount: number;
  amount?: number;
  quantity?: number;
  state?: string;
  createdByUserId: keyof typeof creatorDirectory;
  scheduledDate: string;
  createdAt: string;
  processedRecords: number;
  successfulRecords: number;
  failedRecords: number;
}): BulkDistributionJobDetails {
  const program = programsData.find((item) => item.id === input.programId)!;
  const actor = creatorDirectory[input.createdByUserId];
  const pendingRecords = Math.max(input.beneficiaryCount - input.processedRecords, 0);

  return {
    id: input.id,
    organizationId: program.organizationId,
    organizationName: program.organizationName,
    programId: program.id,
    programName: program.name,
    benefitType: program.benefitType,
    method: input.method,
    segment: input.segment,
    state: input.state,
    beneficiaryCount: input.beneficiaryCount,
    amount: cashLike(input.method) ? input.amount ?? 0 : undefined,
    quantity: cashLike(input.method) ? undefined : input.quantity ?? 0,
    status: input.status,
    totalRecords: input.beneficiaryCount,
    processedRecords: input.processedRecords,
    successfulRecords: input.successfulRecords,
    failedRecords: input.failedRecords,
    pendingRecords,
    createdByUserId: input.createdByUserId,
    createdBy: actor,
    scheduledDate: input.scheduledDate,
    createdAt: input.createdAt,
    updatedAt: new Date(new Date(input.createdAt).getTime() + 1000 * 60 * 150).toISOString(),
    estimatedCompletion: estimatedCompletion(input.status),
    progressPercentage: progress(input.status, input.processedRecords, input.beneficiaryCount),
    totalEstimatedPayout: cashLike(input.method) ? (input.amount ?? 0) * input.beneficiaryCount : undefined,
    totalEstimatedQuantity: cashLike(input.method) ? undefined : (input.quantity ?? 0) * input.beneficiaryCount,
    timeline: buildTimeline(input.id, input.status, input.createdAt, input.scheduledDate, actor),
    failedRecordPreview: buildFailedRecords(input.id, input.failedRecords),
  };
}

export const bulkDistributionJobsData: BulkDistributionJobDetails[] = [
  createJob({ id: "bulk_job_001", programId: "program_002", method: "BANK_TRANSFER", segment: "ALL_VERIFIED", status: "PROCESSING", beneficiaryCount: 100000, amount: 50000, createdByUserId: "user_002", scheduledDate: "2026-06-03T09:00:00Z", createdAt: "2026-06-02T10:00:00Z", processedRecords: 67000, successfulRecords: 65000, failedRecords: 2000 }),
  createJob({ id: "bulk_job_002", programId: "program_001", method: "FOOD_PACKAGE", segment: "SELECTED_STATE", state: "FCT", status: "QUEUED", beneficiaryCount: 50000, quantity: 1, createdByUserId: "user_003", scheduledDate: "2026-06-04T07:00:00Z", createdAt: "2026-06-02T09:00:00Z", processedRecords: 0, successfulRecords: 0, failedRecords: 0 }),
  createJob({ id: "bulk_job_003", programId: "program_004", method: "MOBILE_MONEY", segment: "PENDING_UNPAID", status: "COMPLETED", beneficiaryCount: 75000, amount: 30000, createdByUserId: "user_002", scheduledDate: "2026-05-30T09:00:00Z", createdAt: "2026-05-29T11:00:00Z", processedRecords: 75000, successfulRecords: 74200, failedRecords: 800 }),
  createJob({ id: "bulk_job_004", programId: "program_005", method: "FOOD_PACKAGE", segment: "PROGRAM_ENROLLED", status: "PARTIALLY_FAILED", beneficiaryCount: 120000, quantity: 1, createdByUserId: "user_001", scheduledDate: "2026-05-31T06:00:00Z", createdAt: "2026-05-30T13:00:00Z", processedRecords: 120000, successfulRecords: 115500, failedRecords: 4500 }),
  createJob({ id: "bulk_job_005", programId: "program_010", method: "EDUCATION_SUPPORT", segment: "CUSTOM_UPLOAD", status: "FAILED", beneficiaryCount: 22000, quantity: 1, createdByUserId: "user_001", scheduledDate: "2026-05-28T08:00:00Z", createdAt: "2026-05-27T15:00:00Z", processedRecords: 11000, successfulRecords: 10000, failedRecords: 1000 }),
  createJob({ id: "bulk_job_006", programId: "program_016", method: "MEDICAL_SUPPORT", segment: "ALL_VERIFIED", status: "COMPLETED", beneficiaryCount: 18000, quantity: 1, createdByUserId: "user_001", scheduledDate: "2026-05-27T09:00:00Z", createdAt: "2026-05-26T10:30:00Z", processedRecords: 18000, successfulRecords: 17820, failedRecords: 180 }),
  createJob({ id: "bulk_job_007", programId: "program_017", method: "BANK_TRANSFER", segment: "SELECTED_STATE", state: "Rivers", status: "PROCESSING", beneficiaryCount: 65000, amount: 25000, createdByUserId: "user_001", scheduledDate: "2026-06-03T11:00:00Z", createdAt: "2026-06-02T08:40:00Z", processedRecords: 32500, successfulRecords: 31840, failedRecords: 660 }),
  createJob({ id: "bulk_job_008", programId: "program_019", method: "AGRICULTURE_SUPPORT", segment: "PROGRAM_ENROLLED", status: "QUEUED", beneficiaryCount: 14000, quantity: 2, createdByUserId: "user_001", scheduledDate: "2026-06-05T12:00:00Z", createdAt: "2026-06-02T12:15:00Z", processedRecords: 0, successfulRecords: 0, failedRecords: 0 }),
  createJob({ id: "bulk_job_009", programId: "program_020", method: "FOOD_PACKAGE", segment: "ALL_VERIFIED", status: "CANCELLED", beneficiaryCount: 200000, quantity: 1, createdByUserId: "user_001", scheduledDate: "2026-05-29T05:30:00Z", createdAt: "2026-05-28T14:30:00Z", processedRecords: 0, successfulRecords: 0, failedRecords: 0 }),
  createJob({ id: "bulk_job_010", programId: "program_012", method: "AGRICULTURE_SUPPORT", segment: "CUSTOM_UPLOAD", status: "PARTIALLY_FAILED", beneficiaryCount: 32000, quantity: 1, createdByUserId: "user_001", scheduledDate: "2026-05-30T10:00:00Z", createdAt: "2026-05-29T09:15:00Z", processedRecords: 32000, successfulRecords: 30500, failedRecords: 1500 }),
];
