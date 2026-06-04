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
          title="Organization creation denied"
          description="Program Officers cannot create organizations."
        />
      </PageContainer>
    );
  }

  if (role !== "SUPER_ADMIN") {
    return (
      <PageContainer>
        <PermissionDeniedState
          title="Organization creation restricted"
          description="Only Super Admin can create organization records."
        />
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <PageHeader
        title="Create organization"
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
          title="Organization edit denied"
          description="Program Officers cannot edit organization records."
        />
      </PageContainer>
    );
  }

  if (role !== "SUPER_ADMIN") {
    return (
      <PageContainer>
        <PermissionDeniedState
          title="Organization edit restricted"
          description="Only Super Admin can edit organization records."
        />
      </PageContainer>
    );
  }

  if (organizationQuery.isLoading) {
    return (
      <PageContainer>
        <LoadingState title="Loading organization for editing" lines={5} />
      </PageContainer>
    );
  }

  const organization = organizationQuery.data?.data;

  if (!organization) {
    return (
      <PageContainer>
        <EmptyState
          title="Organization not found"
          description="The selected organization could not be loaded for editing."
        />
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <PageHeader
        title={`Edit ${organization.name}`}
        description="Update organization profile information, status, and operational contact details."
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
