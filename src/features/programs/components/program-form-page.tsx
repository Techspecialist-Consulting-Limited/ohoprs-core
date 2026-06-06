"use client";

import { useQuery } from "@tanstack/react-query";

import { PermissionDeniedState } from "@/components/shared/permission-denied-state";
import { EmptyState } from "@/components/ui/empty-state";
import { LoadingState } from "@/components/ui/loading-state";
import { PageContainer } from "@/components/ui/page-container";
import { PageHeader } from "@/components/ui/page-header";
import { hasPermission } from "@/lib/rbac";
import { ProgramForm } from "@/features/programs/components/program-form";
import { programService } from "@/services/program.service";
import { useAuthStore } from "@/store/auth.store";

export function ProgramCreateModule() {
  const role = useAuthStore((state) => state.role);

  if (!role || !hasPermission(role, "create_program")) {
    return (
      <PageContainer>
        <PermissionDeniedState
          title="Intervention creation restricted"
          description="Your role does not have permission to create interventions."
        />
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <PageHeader
        title="Create intervention"
        description="Create a new intervention, assign it to an organization, and configure funding and approval flow."
      />
      <ProgramForm
        mode="create"
        canChooseOrganization
      />
    </PageContainer>
  );
}

export function ProgramEditModule({ id }: { id: string }) {
  const role = useAuthStore((state) => state.role);
  const programQuery = useQuery({
    queryKey: ["program", id],
    queryFn: () => programService.getProgramById(id),
  });

  if (!role || !hasPermission(role, "edit_program")) {
    return (
      <PageContainer>
        <PermissionDeniedState
          title="Intervention edit restricted"
          description="Your role does not have permission to edit interventions."
        />
      </PageContainer>
    );
  }

  if (programQuery.isLoading) {
    return (
      <PageContainer>
        <LoadingState title="Loading intervention for editing" lines={5} />
      </PageContainer>
    );
  }

  const program = programQuery.data?.data;

  if (!program) {
    return (
      <PageContainer>
        <EmptyState
          title="Intervention not found"
          description="The selected intervention could not be loaded for editing."
        />
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <PageHeader
        title={`Edit ${program.name}`}
        description="Update intervention profile information, governance stages, funding sources, and approval flow."
      />
      <ProgramForm
        mode="edit"
        programId={program.id}
        canChooseOrganization
        defaultOrganizationId={program.organizationId}
        initialValues={{
          name: program.name,
          organizationId: program.organizationId,
          benefitType: program.benefitType,
          description: program.description,
          startDate: program.startDate,
          endDate: program.endDate,
          duration: program.duration,
          recipientCount: program.recipientCount,
          amountPerRecipient: program.amountPerRecipient,
          regions: program.regions,
          states: program.states,
          amount: program.amount,
          budget: program.budget,
          numberOfTrenches: program.numberOfTrenches,
          batch: program.batch,
          fundingSources: program.fundingSources,
          status: program.status,
          approvalSteps: program.approvalSteps,
          distributionApprovalSteps: program.distributionApprovalSteps,
          createdByUserId: program.createdByUserId,
        }}
      />
    </PageContainer>
  );
}
