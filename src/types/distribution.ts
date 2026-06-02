import type { BenefitType } from "@/types/program";

export type DistributionMethod =
  | "BANK_TRANSFER"
  | "MOBILE_MONEY"
  | "CASH"
  | "FOOD_PACKAGE"
  | "MEDICAL_SUPPORT"
  | "EDUCATION_SUPPORT"
  | "AGRICULTURE_SUPPORT";

export type DistributionStatus =
  | "DRAFT"
  | "SCHEDULED"
  | "PROCESSING"
  | "COMPLETED"
  | "FAILED"
  | "CANCELLED";

export type DeliveryStatus = "DELIVERED" | "PENDING" | "FAILED" | "REVERSED";

export interface Distribution {
  id: string;
  organizationId: string;
  organizationName: string;
  programId: string;
  programName: string;
  name: string;
  benefitType: BenefitType;
  method: DistributionMethod;
  description: string;
  beneficiaryCount: number;
  amount?: number;
  quantity?: number;
  status: DistributionStatus;
  scheduledDate: string;
  createdByUserId: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface DistributionRecipientPreview {
  id: string;
  beneficiaryId: string;
  fullName: string;
  nin: string;
  state: string;
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
  name: string;
  organizationId: string;
  programId: string;
  method: DistributionMethod;
  description: string;
  beneficiaryCount: number;
  amount?: number | undefined;
  quantity?: number | undefined;
  scheduledDate: string;
  status: DistributionStatus;
}

export type DistributionPayload = DistributionFormValues;
