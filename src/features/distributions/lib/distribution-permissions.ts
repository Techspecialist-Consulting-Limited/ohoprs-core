import type {
  Distribution,
  DistributionApprovalStatus,
  DistributionFinalApprovalStatus,
  DistributionExecutionStatus,
} from "@/types/distribution";

export function isDistributionEditLocked(
  approvalStatus: DistributionApprovalStatus,
  executionStatus: DistributionExecutionStatus,
  distributionApprovalSteps?: Array<{ status: "PENDING" | "APPROVED" | "REJECTED" }>,
) {
  if (approvalStatus === "APPROVED") {
    return true;
  }

  if (distributionApprovalSteps?.some((step) => step.status === "APPROVED" || step.status === "REJECTED")) {
    return true;
  }

  return executionStatus !== "NOT_STARTED";
}

export function isAwaitingFinalDistributionApproval(
  approvalStatus: DistributionApprovalStatus,
  finalApprovalStatus: DistributionFinalApprovalStatus,
) {
  return approvalStatus === "APPROVED" && finalApprovalStatus === "PENDING";
}

export function getCurrentDistributionApprovalStep(
  distribution: Pick<Distribution, "distributionApprovalSteps">,
) {
  return distribution.distributionApprovalSteps.find((step) => step.status === "PENDING") ?? null;
}

export function canOpenDistributionApprovalReview(
  role: string | null,
  distribution: Pick<Distribution, "organizationId" | "approvalStatus" | "finalApprovalStatus" | "distributionApprovalSteps">,
  userOrganizationId: string | null | undefined,
  userId: string | undefined,
) {
  if (!role) {
    return false;
  }

  if (role === "SUPER_ADMIN") {
    return isAwaitingFinalDistributionApproval(distribution.approvalStatus, distribution.finalApprovalStatus);
  }

  const currentStep = getCurrentDistributionApprovalStep(distribution);
  return userOrganizationId === distribution.organizationId && currentStep?.assigneeUserId === userId;
}

export function canInitiateDistributionPayment(
  role: string | null,
  distribution: Pick<Distribution, "organizationId" | "approvalStatus" | "finalApprovalStatus" | "executionStatus">,
  userOrganizationId: string | null | undefined,
) {
  return (
    role === "AGENCY_ACCOUNTANT" &&
    userOrganizationId === distribution.organizationId &&
    distribution.approvalStatus === "APPROVED" &&
    distribution.finalApprovalStatus === "APPROVED" &&
    distribution.executionStatus === "NOT_STARTED"
  );
}

export function canEditDistributionRecord(
  role: string | null,
  distribution: Pick<
    Distribution,
    "organizationId" | "createdByUserId" | "approvalStatus" | "executionStatus" | "distributionApprovalSteps"
  >,
  userOrganizationId: string | null | undefined,
  userId: string | undefined,
) {
  if (isDistributionEditLocked(distribution.approvalStatus, distribution.executionStatus, distribution.distributionApprovalSteps)) {
    return false;
  }

  if (role === "ORG_ADMIN") {
    return userOrganizationId === distribution.organizationId;
  }

  if (role === "PROGRAM_OFFICER") {
    return userOrganizationId === distribution.organizationId && userId === distribution.createdByUserId;
  }

  return false;
}
