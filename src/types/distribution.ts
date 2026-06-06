import type { AgencyApprovalRole, BenefitType } from "@/types/program";

export type DistributionMethod =
  | "BANK_TRANSFER"
  | "MOBILE_MONEY"
  | "CASH"
  | "FOOD_PACKAGE"
  | "MEDICAL_SUPPORT"
  | "EDUCATION_SUPPORT"
  | "AGRICULTURE_SUPPORT";

export type DistributionPhaseType = "TRENCH" | "BATCH";

export type DistributionStatus =
  | "DRAFT"
  | "SCHEDULED"
  | "PROCESSING"
  | "COMPLETED"
  | "FAILED"
  | "CANCELLED";

export type DistributionApprovalStatus =
  | "DRAFT"
  | "SUBMITTED"
  | "APPROVED"
  | "REJECTED";

export type DistributionFinalApprovalStatus = "PENDING" | "APPROVED" | "REJECTED";

export type DistributionExecutionStatus =
  | "NOT_STARTED"
  | "PROCESSING"
  | "PARTIALLY_PROCESSED"
  | "COMPLETED"
  | "FAILED"
  | "REVERSED";

export type DeliveryStatus = "DELIVERED" | "PENDING" | "FAILED" | "REVERSED";

export interface Distribution {
  id: string;
  organizationId: string;
  organizationName: string;
  programId: string;
  programName: string;
  name: string;
  phaseType: DistributionPhaseType;
  phaseNumber: number;
  states: string[];
  selectedBeneficiaryIds: string[];
  benefitType: BenefitType;
  method: DistributionMethod;
  description: string;
  beneficiaryCount: number;
  amount?: number;
  quantity?: number;
  status: DistributionStatus;
  approvalStatus: DistributionApprovalStatus;
  finalApprovalStatus: DistributionFinalApprovalStatus;
  executionStatus: DistributionExecutionStatus;
  distributionApprovalSteps: DistributionApprovalStep[];
  scheduledDate: string;
  createdByUserId: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  finalApprovedAt?: string | null;
  finalApprovedBy?: string | null;
  paymentInitiatedAt?: string | null;
  paymentInitiatedBy?: string | null;
}

export interface DistributionRecipientPreview {
  id: string;
  beneficiaryId: string;
  fullName: string;
  nin: string;
  state: string;
  lga?: string;
  address?: string;
  bankName?: string;
  accountNumber?: string;
  deliveryStatus: DeliveryStatus;
}

export interface DistributionTimelineItem {
  id: string;
  label: string;
  description: string;
  status: DistributionStatus;
  timestamp: string;
  actor: string;
}

export interface DistributionActivityItem {
  id: string;
  actor: string;
  action: string;
  timestamp: string;
}

export interface DistributionApprovalHistoryItem {
  id: string;
  label: string;
  actor: string;
  timestamp: string;
  note?: string;
}

export interface DistributionApprovalStep {
  id: string;
  order: number;
  role: AgencyApprovalRole;
  assigneeUserId: string;
  assigneeName: string;
  assigneeEmail: string;
  status: "PENDING" | "APPROVED" | "REJECTED";
  approvedAt: string | null;
  rejectionReason?: string;
}

export interface DistributionValidationSummary {
  verifiedBeneficiaries: number;
  pendingVerification: number;
  failedVerification: number;
  duplicateRecords: number;
  flaggedBeneficiaries: number;
  eligibleBeneficiaries: number;
  estimatedTotalAmount: number;
}

export interface DistributionStatistics {
  beneficiaries: number;
  amountDistributed: number;
  successRate: number;
  failedDeliveries: number;
  completionRate: number;
  lastUpdated: string;
}

export interface DistributionDetails extends Distribution {
  programStatus: string;
  organizationType: string;
  organizationStatus: string;
  recipients: DistributionRecipientPreview[];
  statistics: DistributionStatistics;
  timeline: DistributionTimelineItem[];
  recentActivities: DistributionActivityItem[];
  approvalHistory: DistributionApprovalHistoryItem[];
  validationSummary: DistributionValidationSummary;
  isHighRisk: boolean;
  rejectionReason?: string;
}

export interface DistributionListMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface DistributionListResponse {
  items: Distribution[];
  meta: DistributionListMeta;
}

export interface DistributionListParams {
  search?: string;
  page?: number;
  limit?: number;
  organizationId?: string;
  programId?: string;
  status?: DistributionStatus | "ALL";
  benefitType?: BenefitType | "ALL";
  scopeOrganizationId?: string | null;
}

export interface DistributionFormValues {
  programId: string;
  phaseNumber: number;
  states: string[];
  beneficiaryIds: string[];
}

export type DistributionPayload = DistributionFormValues;
