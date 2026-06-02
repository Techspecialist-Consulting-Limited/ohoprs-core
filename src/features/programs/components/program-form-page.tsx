"use client";

import { useQuery } from "@tanstack/react-query";

import { PermissionDeniedState } from "@/components/shared/permission-denied-state";
import { EmptyState } from "@/components/ui/empty-state";
import { LoadingState } from "@/components/ui/loading-state";
import { PageContainer } from "@/components/ui/page-container";
import { PageHeader } from "@/components/ui/page-header";
import { ProgramForm } from "@/features/programs/components/program-form";
import { programService } from "@/services/program.service";
import { useAuthStore } from "@/store/auth.store";

export function ProgramCreateModule() {
  const role = useAuthStore((state) => state.role);
  const user = useAuthStore((state) => state.user);

  if (role === "PROGRAM_OFFICER") {
    return (
      <PageContainer>
        <PermissionDeniedState
          title="Program creation denied"
          description="Program Officers cannot create programs."
        />
      </PageContainer>
    );
  }

  if (role !== "SUPER_ADMIN" && role !== "ORG_ADMIN") {
    return (
      <PageContainer>
        <PermissionDeniedState
          title="Program creation restricted"
          description="Your role does not have permission to create programs."
        />
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <PageHeader
        eyebrow="Phase 6"
        title="Create program"
        description="Create a new benefit program within the appropriate organization scope."
      />
      <ProgramForm
        mode="create"
        canChooseOrganization={role === "SUPER_ADMIN"}
        defaultOrganizationId={role === "ORG_ADMIN" ? user?.organizationId ?? undefined : undefined}
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

  if (role === "PROGRAM_OFFICER") {
    return (
      <PageContainer>
        <PermissionDeniedState
          title="Program edit denied"
          description="Program Officers cannot edit programs."
        />
      </PageContainer>
    );
  }

  if (role !== "SUPER_ADMIN" && role !== "ORG_ADMIN") {
    return (
      <PageContainer>
        <PermissionDeniedState
          title="Program edit restricted"
          description="Your role does not have permission to edit programs."
        />
      </PageContainer>
    );
  }

  if (programQuery.isLoading) {
    return (
      <PageContainer>
        <LoadingState title="Loading program for editing" lines={5} />
      </PageContainer>
    );
  }

  const program = programQuery.data?.data;

  if (!program) {
    return (
      <PageContainer>
        <EmptyState
          title="Program not found"
          description="The selected program could not be loaded for editing."
        />
      </PageContainer>
    );
  }

  if (role === "ORG_ADMIN" && user?.organizationId !== program.organizationId) {
    return (
      <PageContainer>
        <PermissionDeniedState
          title="Program edit denied"
          description="Organization Admins can only edit programs within their own organization."
        />
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <PageHeader
        eyebrow="Phase 6"
        title={`Edit ${program.name}`}
        description="Update program profile information, schedule, budget, and lifecycle status."
      />
      <ProgramForm
        mode="edit"
        programId={program.id}
        canChooseOrganization={role === "SUPER_ADMIN"}
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
