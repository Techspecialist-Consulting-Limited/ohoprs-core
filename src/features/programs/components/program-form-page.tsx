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
  const user = useAuthStore((state) => state.user);

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
        eyebrow="Phase 6"
        title="Create intervention"
        description="Create a new benefit intervention within the appropriate organization scope."
      />
      <ProgramForm
        mode="create"
        canChooseOrganization={false}
        defaultOrganizationId={user?.organizationId ?? undefined}
      />
    </PageContainer>
  );
}

export function ProgramEditModule({ id }: { id: string }) {
  const role = useAuthStore((state) => state.role);
  const user = useAuthStore((state) => state.user);
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

  if (user?.organizationId !== program.organizationId) {
    return (
      <PageContainer>
        <PermissionDeniedState
          title="Intervention edit denied"
          description="Organization Admins can only edit interventions within their own organization."
        />
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <PageHeader
        eyebrow="Phase 6"
        title={`Edit ${program.name}`}
        description="Update intervention profile information, schedule, budget, and lifecycle status."
      />
      <ProgramForm
        mode="edit"
        programId={program.id}
        canChooseOrganization={false}
        defaultOrganizationId={program.organizationId}
        initialValues={{
          name: program.name,
          organizationId: program.organizationId,
          benefitType: program.benefitType,
          description: program.description,
          startDate: program.startDate,
          endDate: program.endDate,
          targetBeneficiaries: program.targetBeneficiaries,
          budget: program.budget,
          status: program.status,
        }}
      />
    </PageContainer>
  );
}
