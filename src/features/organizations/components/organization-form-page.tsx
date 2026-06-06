"use client";

import { useQuery } from "@tanstack/react-query";

import { PermissionDeniedState } from "@/components/shared/permission-denied-state";
import { EmptyState } from "@/components/ui/empty-state";
import { LoadingState } from "@/components/ui/loading-state";
import { PageContainer } from "@/components/ui/page-container";
import { PageHeader } from "@/components/ui/page-header";
import { OrganizationForm } from "@/features/organizations/components/organization-form";
import { organizationService } from "@/services/organization.service";
import { useAuthStore } from "@/store/auth.store";

export function OrganizationCreateModule() {
  const role = useAuthStore((state) => state.role);

  if (role === "PROGRAM_OFFICER") {
    return (
      <PageContainer>
        <PermissionDeniedState
          title="Agency creation denied"
          description="Program Officers cannot create agencies."
        />
      </PageContainer>
    );
  }

  if (role !== "SUPER_ADMIN") {
    return (
      <PageContainer>
        <PermissionDeniedState
          title="Agency creation restricted"
          description="Only Super Admin can create agency records."
        />
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <PageHeader
        title="Create agency"
        description="Register a new ministry, agency, partner, or donor in the multi-tenant platform."
      />
      <OrganizationForm mode="create" />
    </PageContainer>
  );
}

export function OrganizationEditModule({ id }: { id: string }) {
  const role = useAuthStore((state) => state.role);
  const organizationQuery = useQuery({
    queryKey: ["organization", id],
    queryFn: () => organizationService.getOrganizationById(id),
  });

  if (role === "PROGRAM_OFFICER") {
    return (
      <PageContainer>
        <PermissionDeniedState
          title="Agency edit denied"
          description="Program Officers cannot edit agency records."
        />
      </PageContainer>
    );
  }

  if (role !== "SUPER_ADMIN") {
    return (
      <PageContainer>
        <PermissionDeniedState
          title="Agency edit restricted"
          description="Only Super Admin can edit agency records."
        />
      </PageContainer>
    );
  }

  if (organizationQuery.isLoading) {
    return (
      <PageContainer>
        <LoadingState title="Loading agency for editing" lines={5} />
      </PageContainer>
    );
  }

  const organization = organizationQuery.data?.data;

  if (!organization) {
    return (
      <PageContainer>
        <EmptyState
          title="Agency not found"
          description="The selected agency could not be loaded for editing."
        />
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <PageHeader
        title={`Edit ${organization.name}`}
        description="Update agency profile information, status, and operational contact details."
      />
      <OrganizationForm
        mode="edit"
        organizationId={organization.id}
        initialValues={{
          name: organization.name,
          shortName: organization.shortName,
          type: organization.type,
          description: organization.description,
          contactEmail: organization.contactEmail,
          contactPhone: organization.contactPhone,
          website: organization.website,
          address: organization.address,
          state: organization.state,
          status: organization.status,
        }}
      />
    </PageContainer>
  );
}
