"use client";

import { useQuery } from "@tanstack/react-query";

import { PermissionDeniedState } from "@/components/shared/permission-denied-state";
import { EmptyState } from "@/components/ui/empty-state";
import { LoadingState } from "@/components/ui/loading-state";
import { PageContainer } from "@/components/ui/page-container";
import { PageHeader } from "@/components/ui/page-header";
import { DistributionForm } from "@/features/distributions/components/distribution-form";
import { distributionService } from "@/services/distribution.service";
import { useAuthStore } from "@/store/auth.store";

function canEditDistribution(role: string | null, organizationId: string, userOrganizationId: string | null | undefined, createdByUserId: string, userId: string | undefined) {
  if (role === "SUPER_ADMIN") return true;
  if (role === "ORG_ADMIN") return userOrganizationId === organizationId;
  if (role === "PROGRAM_OFFICER") return userOrganizationId === organizationId && userId === createdByUserId;
  return false;
}

export function DistributionCreateModule() {
  const role = useAuthStore((state) => state.role);
  const user = useAuthStore((state) => state.user);

  if (role === "AUDITOR") {
    return (
      <PageContainer>
        <PermissionDeniedState title="Distribution creation denied" description="Auditors have read-only access to distribution workflows." />
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <PageHeader eyebrow="Phase 9" title="Create distribution" description="Create a prototype batch showing how benefits move from program to beneficiary delivery." />
      <DistributionForm mode="create" canChooseOrganization={role === "SUPER_ADMIN"} defaultOrganizationId={role === "SUPER_ADMIN" ? undefined : user?.organizationId ?? undefined} />
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

  if (role === "AUDITOR") {
    return (
      <PageContainer>
        <PermissionDeniedState title="Distribution edit denied" description="Auditors can inspect batches but cannot edit them." />
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

  if (!canEditDistribution(role, distribution.organizationId, user?.organizationId, distribution.createdByUserId, user?.id)) {
    return (
      <PageContainer>
        <PermissionDeniedState title="Distribution edit denied" description="You do not have permission to edit this distribution batch." />
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <PageHeader eyebrow="Phase 9" title={`Edit ${distribution.name}`} description="Update distribution setup, method, scheduling, and prototype execution status." />
      <DistributionForm
        mode="edit"
        distributionId={distribution.id}
        canChooseOrganization={role === "SUPER_ADMIN"}
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
