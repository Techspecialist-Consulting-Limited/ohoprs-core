"use client";

import { useQuery } from "@tanstack/react-query";

import { PermissionDeniedState } from "@/components/shared/permission-denied-state";
import { EmptyState } from "@/components/ui/empty-state";
import { LoadingState } from "@/components/ui/loading-state";
import { PageContainer } from "@/components/ui/page-container";
import { PageHeader } from "@/components/ui/page-header";
import { hasPermission } from "@/lib/rbac";
import { canEditDistributionRecord, isDistributionEditLocked } from "@/features/distributions/lib/distribution-permissions";
import { DistributionForm } from "@/features/distributions/components/distribution-form";
import { distributionService } from "@/services/distribution.service";
import { useAuthStore } from "@/store/auth.store";

export function DistributionCreateModule() {
  const role = useAuthStore((state) => state.role);
  const user = useAuthStore((state) => state.user);

  if (!role || !hasPermission(role, "create_distribution")) {
    return (
      <PageContainer>
        <PermissionDeniedState title="Distribution creation denied" description="Your role has read-only access to distribution workflows." />
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <PageHeader title="Create benefit distribution" description="Create a distribution batch showing how benefits move from program to beneficiary delivery." />
      <DistributionForm mode="create" canChooseOrganization={false} defaultOrganizationId={user?.organizationId ?? undefined} />
    </PageContainer>
  );
}

export function DistributionEditModule({ id }: { id: string }) {
  const role = useAuthStore((state) => state.role);
  const user = useAuthStore((state) => state.user);
  const distributionQuery = useQuery({
    queryKey: ["distribution", id],
    queryFn: () => distributionService.getDistributionById(id),
  });

  if (!role || !hasPermission(role, "edit_distribution")) {
    return (
      <PageContainer>
        <PermissionDeniedState title="Distribution edit denied" description="Your role can inspect batches but cannot edit them." />
      </PageContainer>
    );
  }

  if (distributionQuery.isLoading) {
    return (
      <PageContainer>
        <LoadingState title="Loading distribution for editing" lines={5} />
      </PageContainer>
    );
  }

  const distribution = distributionQuery.data?.data;

  if (!distribution) {
    return (
      <PageContainer>
        <EmptyState title="Distribution not found" description="The selected distribution could not be loaded for editing." />
      </PageContainer>
    );
  }

  if (!canEditDistributionRecord(role, distribution, user?.organizationId, user?.id)) {
    return (
      <PageContainer>
        <PermissionDeniedState
          title="Distribution edit denied"
          description={
            isDistributionEditLocked(distribution.approvalStatus, distribution.executionStatus)
              ? "Approved or in-flight distributions cannot be edited."
              : "You do not have permission to edit this distribution batch."
          }
        />
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <PageHeader title={`Edit ${distribution.name}`} description="Update distribution setup, method, scheduling, and execution status." />
      <DistributionForm
        mode="edit"
        distributionId={distribution.id}
        canChooseOrganization={false}
        defaultOrganizationId={distribution.organizationId}
        initialValues={{
          name: distribution.name,
          organizationId: distribution.organizationId,
          programId: distribution.programId,
          method: distribution.method,
          description: distribution.description,
          beneficiaryCount: distribution.beneficiaryCount,
          amount: distribution.amount,
          quantity: distribution.quantity,
          scheduledDate: distribution.scheduledDate.slice(0, 16),
          status: distribution.status,
        }}
      />
    </PageContainer>
  );
}
