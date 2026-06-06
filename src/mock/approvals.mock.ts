import { distributionsData } from "@/mock/distributions.mock";
import type { DistributionApprovalDetails } from "@/types/approval";

export const approvalDetailsData: DistributionApprovalDetails[] = distributionsData.map((distribution) => ({
  distributionId: distribution.id,
  approvalStatus: distribution.approvalStatus,
  finalApprovalStatus: distribution.finalApprovalStatus,
  executionStatus: distribution.executionStatus,
  validationSummary: distribution.validationSummary,
  approvalSteps: distribution.distributionApprovalSteps,
  approvalHistory: distribution.approvalHistory,
  rejectionReason: distribution.rejectionReason,
  isHighRisk: distribution.isHighRisk,
}));
