export type BenefitType =
  | "CASH"
  | "FOOD"
  | "MEDICAL"
  | "EDUCATION"
  | "AGRICULTURE"
  | "HOUSING"
  | "EMERGENCY_RELIEF"
  | "OTHER";

export type ProgramStatus =
  | "IN_PROGRESS"
  | "COMPLETED"
  | "REJECTED"
  | "APPROVED"
  | "ACTIVE"
  | "SUSPENDED";

export type SystemApprovalRole =
  | "ORGANIZATION_MANAGER"
  | "STORE_MANAGER"
  | "DISTRIBUTION_MANAGER"
  | "ACCOUNTANT"
  | "DIRECTOR";

export type AgencyApprovalRole =
  | "ORGANIZATION_MANAGER"
  | "STORE_MANAGER"
  | "DISTRIBUTION_MANAGER"
  | "ACCOUNTANT"
  | "DIRECTOR";

export interface ProgramDuration {
  days: number;
  weeks: number;
  months: number;
  years: number;
}

export interface ProgramFundingSource {
  id: string;
  name: string;
  createdByUserId: string | null;
  isCustom: boolean;
}

export interface ProgramApprovalStep {
  id: string;
  order: number;
  role: SystemApprovalRole;
  assigneeUserId: string;
  assigneeName: string;
  assigneeEmail: string;
  status: "PENDING" | "APPROVED" | "REJECTED";
  approvedAt: string | null;
  rejectionReason?: string | null;
}

export interface DistributionApprovalTemplateStep {
  id: string;
  order: number;
  role: AgencyApprovalRole;
  assigneeUserId: string;
  assigneeName: string;
  assigneeEmail: string;
}

export interface ProgramApprovalHistoryItem {
  id: string;
  actor: string;
  actorRole: string;
  action: "APPROVED" | "REJECTED";
  reason?: string | null;
  stepOrder: number;
  timestamp: string;
}

export interface Program {
  id: string;
  organizationId: string;
  organizationName: string;
  name: string;
  benefitType: BenefitType;
  description: string;
  status: ProgramStatus;
  startDate: string;
  endDate: string;
  duration?: ProgramDuration;
  beneficiaryCount: number;
  recipientCount?: number;
  amountPerRecipient?: number | null;
  regions?: string[];
  states?: string[];
  amount?: number | null;
  budget: number | null;
  numberOfTrenches?: number | null;
  batch?: number | null;
  fundingSources?: ProgramFundingSource[];
  approvalSteps?: ProgramApprovalStep[];
  distributionApprovalSteps?: DistributionApprovalTemplateStep[];
  rejectionReason?: string | null;
  approvalHistory?: ProgramApprovalHistoryItem[];
  createdByUserId?: string | null;
  totalDistributed: number;
  createdAt: string;
  updatedAt: string;
}

export interface ProgramDetails extends Program {
  organizationType: string;
  organizationStatus: string;
  beneficiarySummary: {
    total: number;
    verified: number;
    pendingVerification: number;
    flagged: number;
  };
  distributionSummary: {
    totalBatches: number;
    completedBatches: number;
    pendingBatches: number;
    failedBatches: number;
    totalDistributed: number;
  };
  recentActivities: {
    id: string;
    actor: string;
    action: string;
    timestamp: string;
  }[];
}

export interface ProgramListMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface ProgramListResponse {
  items: Program[];
  meta: ProgramListMeta;
}

export interface ProgramListParams {
  page?: number;
  limit?: number;
  search?: string;
  organizationId?: string | "ALL";
  benefitType?: BenefitType | "ALL";
  status?: ProgramStatus | "ALL";
  scopeOrganizationId?: string | null;
  assignedApproverUserId?: string | null;
  onlyFullyApprovedForAgencyScope?: boolean;
}

export interface ProgramPayload {
  organizationId: string;
  name: string;
  benefitType: BenefitType;
  description: string;
  startDate: string;
  endDate: string;
  duration: ProgramDuration;
  recipientCount: number;
  amountPerRecipient: number | null;
  regions: string[];
  states: string[];
  amount: number | null;
  budget: number | null;
  numberOfTrenches: number | null;
  batch: number | null;
  fundingSources: ProgramFundingSource[];
  approvalSteps: ProgramApprovalStep[];
  distributionApprovalSteps: DistributionApprovalTemplateStep[];
  status: ProgramStatus;
  createdByUserId?: string | null;
}
