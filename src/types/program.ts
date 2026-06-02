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
  | "DRAFT"
  | "ACTIVE"
  | "PAUSED"
  | "COMPLETED"
  | "SUSPENDED";

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
  targetBeneficiaries: number;
  beneficiaryCount: number;
  budget: number;
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
}

export interface ProgramPayload {
  organizationId: string;
  name: string;
  benefitType: BenefitType;
  description: string;
  startDate: string;
  endDate: string;
  targetBeneficiaries: number;
  budget: number;
  status: ProgramStatus;
}
