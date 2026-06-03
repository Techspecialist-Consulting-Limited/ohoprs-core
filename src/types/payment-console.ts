import type { AuditLogDetails } from "@/types/audit";
import type { AuthUser, UserRole } from "@/types/auth";
import type {
  DistributionApprovalHistoryItem,
  DistributionApprovalStatus,
  DistributionDetails,
  DistributionExecutionStatus,
} from "@/types/distribution";
import type { Beneficiary360Details, DuplicateCheckStatus, VerificationStatus } from "@/types/beneficiary";
import type { PaymentStatus } from "@/types/payment";

export type PaymentConsoleTab = "OVERVIEW" | "BENEFICIARIES" | "EXECUTION" | "AUDIT";

export type PaymentConsoleAction =
  | "SUBMIT"
  | "APPROVE"
  | "REJECT"
  | "PROCESS_SINGLE"
  | "PROCESS_SELECTED"
  | "PROCESS_ALL"
  | "RETRY_SINGLE"
  | "RETRY_SELECTED"
  | "REVERSE";

export interface PaymentConsoleReadinessKpis {
  totalBeneficiaries: number;
  eligibleBeneficiaries: number;
  pendingPayments: number;
  paidPayments: number;
  failedPayments: number;
  reversedPayments: number;
  estimatedTotalPayout: number;
}

export interface PaymentConsoleGovernanceSummary {
  approvalStatus: DistributionApprovalStatus;
  executionStatus: DistributionExecutionStatus;
  approvedBy?: string;
  approvedAt?: string;
  latestApprovalNote?: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  rejectionReason?: string;
}

export interface PaymentConsoleValidationSummary {
  verifiedBeneficiaries: number;
  pendingVerification: number;
  failedVerification: number;
  flaggedBeneficiaries: number;
  duplicateRecords: number;
  bankFailures: number;
  missingPaymentProfiles: number;
}

export interface PaymentConsoleRiskSummary {
  isHighRisk: boolean;
  reasons: string[];
}

export interface PaymentConsolePaymentRecord {
  id: string;
  beneficiaryId: string;
  beneficiaryName: string;
  beneficiaryNin: string;
  beneficiaryState: string;
  bankName: string;
  accountNumber: string;
  amount: number;
  verificationStatus: VerificationStatus;
  duplicateCheck: DuplicateCheckStatus;
  bankVerified: boolean;
  hasBvn: boolean;
  hasAccountMetadata: boolean;
  riskFlags: string[];
  paymentReference?: string;
  status: PaymentStatus;
  failureReason?: string;
  processedBy?: string;
  processedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface PaymentConsoleExecutionMetrics {
  progressPercentage: number;
  paidPayments: number;
  failedPayments: number;
  pendingPayments: number;
  processingPayments: number;
  reversedPayments: number;
}

export interface PaymentConsoleFailedPaymentPreview {
  id: string;
  beneficiaryName: string;
  reason: string;
  status: PaymentStatus;
}

export interface PaymentConsoleTimelineItem {
  id: string;
  label: string;
  description: string;
  timestamp: string;
  actor: string;
  tone: "success" | "warning" | "danger" | "neutral";
}

export interface PaymentConsoleAuditPreviewItem {
  id: string;
  timestamp: string;
  actor: string;
  role: string;
  action: string;
  result: string;
  description: string;
}

export interface PaymentConsoleData {
  distribution: DistributionDetails;
  readiness: PaymentConsoleReadinessKpis;
  governance: PaymentConsoleGovernanceSummary;
  validation: PaymentConsoleValidationSummary;
  risk: PaymentConsoleRiskSummary;
  payments: PaymentConsolePaymentRecord[];
  execution: PaymentConsoleExecutionMetrics;
  failedPreview: PaymentConsoleFailedPaymentPreview[];
  executionTimeline: PaymentConsoleTimelineItem[];
  approvalHistory: DistributionApprovalHistoryItem[];
  auditPreview: PaymentConsoleAuditPreviewItem[];
  isCashDistribution: boolean;
}

export interface PaymentConsoleFilters {
  search: string;
  state: string | "ALL";
  verificationStatus: VerificationStatus | "ALL";
  paymentStatus: PaymentStatus | "ALL";
  showOnlyFailed: boolean;
}

export interface PaymentConsoleScope {
  role: UserRole;
  user: AuthUser | null;
}

export interface PaymentConsoleStoreItem {
  distributionId: string;
  beneficiaryIds: string[];
  payments: PaymentConsolePaymentRecord[];
  executionTimeline: PaymentConsoleTimelineItem[];
}

export interface PaymentConsoleExportResult {
  filename: string;
  content: string;
}

export interface PaymentConsoleDialogState {
  action: PaymentConsoleAction;
  paymentIds?: string[];
  title: string;
  description: string;
  confirmLabel: string;
  requiresReason?: boolean;
}

export interface PaymentConsoleMutationResult {
  console: PaymentConsoleData | null;
  updatedPayments?: PaymentConsolePaymentRecord[];
}

export interface PaymentConsoleSeedScenario {
  distributionId: string;
  beneficiaryIds?: string[];
  statuses?: PaymentStatus[];
}

export interface PaymentConsolePaymentSeedContext {
  distribution: DistributionDetails;
  beneficiaries: Beneficiary360Details[];
}

export interface PaymentConsoleAuditSeed {
  distributionId: string;
  entries: AuditLogDetails[];
}
