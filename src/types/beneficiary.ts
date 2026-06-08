import type { ProgramStatus } from "@/types/program";

export type VerificationStatus = "VERIFIED" | "PENDING" | "FAILED" | "FLAGGED";
export type BenefitStatus = "ACTIVE" | "PAUSED" | "EXITED" | "SUSPENDED";
export type BeneficiaryGender = "MALE" | "FEMALE";
export type MaritalStatus = "SINGLE" | "MARRIED" | "DIVORCED" | "WIDOWED";
export type BenefitTimelineStatus = "COMPLETED" | "PENDING" | "FAILED" | "REVERSED";
export type RiskLevel = "LOW" | "MEDIUM" | "HIGH";
export type DuplicateCheckStatus = "PASSED" | "REVIEW_REQUIRED" | "FAILED" | "PENDING";

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
  occupation: string;
  maritalStatus: MaritalStatus;
  householdDependents: number;
  numberOfChildren: number;
  numberOfWives: number;
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
    identityVerified: boolean;
    bankVerified: boolean;
    duplicateCheck: DuplicateCheckStatus;
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

export interface ProgramBenefitBreakdownItem {
  programId: string;
  programName: string;
  organizationId: string;
  organizationName: string;
  benefitType: string;
  totalCashReceived?: number;
  nonCashBenefitCount?: number;
  benefitDescription?: string;
  benefitCount: number;
  lastBenefitDate: string;
  status: "ACTIVE" | "PAUSED" | "EXITED" | "SUSPENDED";
}

export interface BenefitTimelineItem {
  id: string;
  date: string;
  programId: string;
  programName: string;
  benefitType: string;
  amount?: number;
  item?: string;
  status: BenefitTimelineStatus;
  referenceId: string;
  processedBy: string;
  statusReason?: string;
}

export interface BeneficiaryRiskSummary {
  riskLevel: RiskLevel;
  flags: {
    id: string;
    label: string;
    severity: "LOW" | "MEDIUM" | "HIGH";
    description: string;
  }[];
}

export interface BeneficiaryAuditItem {
  id: string;
  actor: string;
  action: string;
  timestamp: string;
  module: "BENEFICIARY" | "PROGRAM" | "DISTRIBUTION" | "VERIFICATION";
}

export interface Beneficiary360Details extends BeneficiaryDetails {
  benefit360Summary: {
    totalCashReceived: number;
    totalNonCashBenefits: number;
    programsEnrolled: number;
    lastBenefitDate: string;
    riskFlags: number;
  };
  programBreakdown: ProgramBenefitBreakdownItem[];
  benefitTimeline: BenefitTimelineItem[];
  riskSummary: BeneficiaryRiskSummary;
  documentSummary: {
    idDocument: "Available" | "Pending" | "Not Uploaded";
    bankVerification: "Available" | "Pending" | "Not Uploaded";
    enrollmentForm: "Available" | "Pending" | "Not Uploaded";
    supportingDocuments: "Available" | "Pending" | "Not Uploaded";
  };
  auditPreview: BeneficiaryAuditItem[];
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
  occupation: string;
  maritalStatus: MaritalStatus;
  householdDependents: number;
  numberOfChildren: number;
  numberOfWives: number;
  dateOfBirth: string;
  state: string;
  lga: string;
  address: string;
  organizationId: string;
  programIds: string[];
  verificationStatus: VerificationStatus;
  benefitStatus: BenefitStatus;
}
