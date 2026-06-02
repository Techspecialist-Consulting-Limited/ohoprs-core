import type { BenefitType } from "@/types/program";
import type { DistributionMethod } from "@/types/distribution";

export type BulkJobStatus =
  | "QUEUED"
  | "PROCESSING"
  | "COMPLETED"
  | "PARTIALLY_FAILED"
  | "FAILED"
  | "CANCELLED";

export type BeneficiarySegment =
  | "ALL_VERIFIED"
  | "SELECTED_STATE"
  | "PROGRAM_ENROLLED"
  | "PENDING_UNPAID"
  | "CUSTOM_UPLOAD";

export interface BulkDistributionJob {
  id: string;
  organizationId: string;
  organizationName: string;
  programId: string;
  programName: string;
  benefitType: BenefitType;
  method: DistributionMethod;
  segment: BeneficiarySegment;
  state?: string;
  beneficiaryCount: number;
  amount?: number;
  quantity?: number;
  status: BulkJobStatus;
  totalRecords: number;
  processedRecords: number;
  successfulRecords: number;
  failedRecords: number;
  pendingRecords: number;
  createdByUserId: string;
  createdBy: string;
  scheduledDate: string;
  createdAt: string;
  updatedAt: string;
}

export interface BulkJobTimelineEvent {
  id: string;
  label: string;
  description: string;
  timestamp: string;
  actor: string;
  status: "COMPLETED" | "CURRENT" | "PENDING" | "FAILED";
}

export interface FailedBulkRecord {
  id: string;
  beneficiaryName: string;
  beneficiaryId: string;
  reason: string;
  status: "FAILED" | "RETRY_PENDING";
}

export interface BulkDistributionJobDetails extends BulkDistributionJob {
  estimatedCompletion: string;
  progressPercentage: number;
  totalEstimatedPayout?: number;
  totalEstimatedQuantity?: number;
  timeline: BulkJobTimelineEvent[];
  failedRecordPreview: FailedBulkRecord[];
}

export interface BulkJobListMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface BulkJobListResponse {
  items: BulkDistributionJob[];
  meta: BulkJobListMeta;
}

export interface BulkJobListParams {
  search?: string;
  page?: number;
  limit?: number;
  organizationId?: string;
  programId?: string;
  status?: BulkJobStatus | "ALL";
  scopeOrganizationId?: string | null;
}

export interface BulkDistributionFormValues {
  organizationId: string;
  programId: string;
  method: DistributionMethod;
  segment: BeneficiarySegment;
  state?: string;
  beneficiaryCount: number;
  amount?: number | undefined;
  quantity?: number | undefined;
  scheduledDate: string;
  mockUploadFileName?: string;
}

export type BulkDistributionPayload = BulkDistributionFormValues;
