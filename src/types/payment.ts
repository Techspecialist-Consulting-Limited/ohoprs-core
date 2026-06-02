import type { DistributionExecutionStatus } from "@/types/distribution";

export type PaymentStatus =
  | "PENDING"
  | "PROCESSING"
  | "PAID"
  | "FAILED"
  | "REVERSED"
  | "RETRY_PENDING";

export type PaymentMethod =
  | "BANK_TRANSFER"
  | "MOBILE_MONEY"
  | "CASH";

export type PaymentTimelineEventStatus =
  | "COMPLETED"
  | "CURRENT"
  | "PENDING"
  | "FAILED";

export interface PaymentTimelineEvent {
  id: string;
  label: string;
  description: string;
  timestamp: string;
  actor: string;
  status: PaymentTimelineEventStatus;
}

export interface PaymentRecord {
  id: string;
  reference: string;
  distributionId: string;
  distributionName: string;
  programId: string;
  programName: string;
  organizationId: string;
  organizationName: string;
  beneficiaryId: string;
  beneficiaryName: string;
  beneficiaryNin: string;
  bankName: string;
  accountNumber: string;
  amount: number;
  method: PaymentMethod;
  status: PaymentStatus;
  processedByUserId?: string;
  processedBy?: string;
  processedAt?: string;
  createdAt: string;
  updatedAt: string;
  failureReason?: string;
}

export interface PaymentDetails extends PaymentRecord {
  beneficiaryPhone?: string;
  beneficiaryState: string;
  timeline: PaymentTimelineEvent[];
  approvedBy?: string;
  approvedAt?: string;
  createdBy: string;
}

export interface DistributionPaymentReadiness {
  distributionId: string;
  eligibleBeneficiaries: number;
  flaggedBeneficiaries: number;
  pendingPayments: number;
  paidPayments: number;
  failedPayments: number;
  estimatedTotalPayout: number;
}

export interface PaymentListParams {
  search?: string;
  page?: number;
  limit?: number;
  organizationId?: string;
  distributionId?: string;
  scopeOrganizationId?: string | null;
}

export interface PaymentListMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface PaymentListResponse {
  items: PaymentRecord[];
  meta: PaymentListMeta;
}

export interface PaymentActionResult {
  payment: PaymentDetails | null;
  distributionExecutionStatus?: DistributionExecutionStatus;
}

export interface BulkPaymentProcessResult {
  distributionId: string;
  createdPayments: number;
  paidCount: number;
  failedCount: number;
  executionStatus: DistributionExecutionStatus;
}
