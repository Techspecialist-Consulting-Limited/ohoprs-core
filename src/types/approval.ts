import type {
  DistributionApprovalHistoryItem,
  DistributionApprovalStep,
  DistributionApprovalStatus,
  DistributionFinalApprovalStatus,
  DistributionExecutionStatus,
  DistributionValidationSummary,
} from "@/types/distribution";

export interface DistributionApprovalDetails {
  distributionId: string;
  approvalStatus: DistributionApprovalStatus;
  finalApprovalStatus: DistributionFinalApprovalStatus;
  executionStatus: DistributionExecutionStatus;
  validationSummary: DistributionValidationSummary;
  approvalSteps: DistributionApprovalStep[];
  approvalHistory: DistributionApprovalHistoryItem[];
  rejectionReason?: string;
  isHighRisk: boolean;
}

export interface ApprovalDecisionPayload {
  action: "APPROVE" | "REJECT";
  reason?: string;
}
