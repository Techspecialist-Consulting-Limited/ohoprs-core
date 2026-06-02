import type { ProgramStatus } from "@/types/program";

export type VerificationStatus = "VERIFIED" | "PENDING" | "FAILED" | "FLAGGED";
export type BenefitStatus = "ACTIVE" | "PAUSED" | "EXITED" | "SUSPENDED";
export type BeneficiaryGender = "MALE" | "FEMALE" | "OTHER";

export interface BeneficiaryProgramEnrollment {
  id: string;
  name: string;
  benefitType: string;
  status: ProgramStatus;
}

export interface Beneficiary {
  id: string;
  organizationId: string;
  organizationName: string;
  firstName: string;
  lastName: string;
  middleName?: string;
  fullName: string;
  nin: string;
  bvn?: string;
  phone: string;
  email?: string;
  gender: BeneficiaryGender;
  dateOfBirth: string;
  state: string;
  lga: string;
  address: string;
  programIds: string[];
  programs: BeneficiaryProgramEnrollment[];
  verificationStatus: VerificationStatus;
  benefitStatus: BenefitStatus;
  createdAt: string;
  updatedAt: string;
}

export interface BeneficiaryDetails extends Beneficiary {
  verificationSummary: {
    status: VerificationStatus;
    ninVerified: boolean;
    bvnVerified: boolean;
    lastCheckedAt: string;
  };
  benefitSummary: {
    activeEnrollments: number;
    totalCashReceived: number;
    nonCashBenefitsReceived: number;
    lastDistributionStatus: string;
    verificationState: VerificationStatus;
  };
}

export interface BeneficiaryListMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface BeneficiaryListResponse {
  items: Beneficiary[];
  meta: BeneficiaryListMeta;
}

export interface BeneficiaryListParams {
  page?: number;
  limit?: number;
  search?: string;
  organizationId?: string | "ALL";
  programId?: string | "ALL";
  state?: string | "ALL";
  verificationStatus?: VerificationStatus | "ALL";
  benefitStatus?: BenefitStatus | "ALL";
  scopeOrganizationId?: string | null;
}

export interface BeneficiaryPayload {
  firstName: string;
  lastName: string;
  middleName?: string;
  nin: string;
  bvn?: string;
  phone: string;
  email?: string;
  gender: BeneficiaryGender;
  dateOfBirth: string;
  state: string;
  lga: string;
  address: string;
  organizationId: string;
  programIds: string[];
  verificationStatus: VerificationStatus;
  benefitStatus: BenefitStatus;
}
