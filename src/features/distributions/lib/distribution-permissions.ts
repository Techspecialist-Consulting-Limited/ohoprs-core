import type {
  Distribution,
  DistributionApprovalStatus,
  DistributionExecutionStatus,
} from "@/types/distribution";

export function isDistributionEditLocked(
  approvalStatus: DistributionApprovalStatus,
  executionStatus: DistributionExecutionStatus,
) {
  if (approvalStatus === "APPROVED") {
    return true;
  }

  return executionStatus !== "NOT_STARTED";
}

export function canEditDistributionRecord(
  role: string | null,
  distribution: Pick<
    Distribution,
    "organizationId" | "createdByUserId" | "approvalStatus" | "executionStatus"
  >,
  userOrganizationId: string | null | undefined,
  userId: string | undefined,
) {
  if (isDistributionEditLocked(distribution.approvalStatus, distribution.executionStatus)) {
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
