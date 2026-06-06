"use client";

import { useQuery } from "@tanstack/react-query";
import Link from "next/link";

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
      <Breadcrumbs current="Create" />
      <PageHeader title="Create benefit distribution" description="Create a distribution batch by selecting an intervention, states, and beneficiaries in sequence." />
      <DistributionForm mode="create" defaultOrganizationId={user?.organizationId ?? undefined} />
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
      <Breadcrumbs current="Edit" />
      <PageHeader title={`Edit ${distribution.name}`} description="Update the selected intervention tranche or batch, coverage states, and beneficiary selection." />
      <DistributionForm
        mode="edit"
        distributionId={distribution.id}
        defaultOrganizationId={distribution.organizationId}
        initialValues={{
          programId: distribution.programId,
          phaseNumber: distribution.phaseNumber,
          states: distribution.states,
          beneficiaryIds: distribution.selectedBeneficiaryIds,
        }}
      />
    </PageContainer>
  );
}

function Breadcrumbs({ current }: { current: string }) {
  return (
    <div className="mb-4 flex items-center gap-2 text-sm text-muted">
      <Link href="/dashboard" className="hover:text-foreground">Dashboard</Link>
      <span>/</span>
      <Link href="/distributions" className="hover:text-foreground">Benefit distributions</Link>
      <span>/</span>
      <span className="text-foreground">{current}</span>
    </div>
  );
}
