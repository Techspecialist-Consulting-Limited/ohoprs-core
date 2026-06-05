"use client";

import { useQuery } from "@tanstack/react-query";

import { PermissionDeniedState } from "@/components/shared/permission-denied-state";
import { EmptyState } from "@/components/ui/empty-state";
import { LoadingState } from "@/components/ui/loading-state";
import { PageContainer } from "@/components/ui/page-container";
import { OrganizationActivityFeed } from "@/features/organizations/components/organization-activity-feed";
import { OrganizationAdminUsersPreview } from "@/features/organizations/components/organization-admin-users-preview";
import { OrganizationDetailsHeader } from "@/features/organizations/components/organization-details-header";
import { OrganizationKpiCards } from "@/features/organizations/components/organization-kpi-cards";
import { OrganizationProgramsPreview } from "@/features/organizations/components/organization-programs-preview";
import { organizationService } from "@/services/organization.service";
import { useAuthStore } from "@/store/auth.store";

export function OrganizationDetailsModule({ id }: { id: string }) {
  const role = useAuthStore((state) => state.role);
  const user = useAuthStore((state) => state.user);
  const organizationQuery = useQuery({
    queryKey: ["organization", id],
    queryFn: () => organizationService.getOrganizationById(id),
  });

  if (role === "PROGRAM_OFFICER") {
    return (
      <PageContainer>
        <PermissionDeniedState
          title="Organization details unavailable"
          description="Program Officers do not have permission to access organization profiles."
        />
      </PageContainer>
    );
  }

  if (organizationQuery.isLoading) {
    return (
      <PageContainer>
        <LoadingState title="Loading organization profile" lines={5} />
      </PageContainer>
    );
  }

  const organization = organizationQuery.data?.data;

  if (organizationQuery.isError || !organization) {
    return (
      <PageContainer>
        <EmptyState
          title="Organization not found"
          description="The requested organization could not be loaded from the mock service layer."
        />
      </PageContainer>
    );
  }

  if (role === "ORG_ADMIN" && user?.organizationId && user.organizationId !== organization.id) {
    return (
      <PageContainer>
        <PermissionDeniedState
          title="Restricted organization scope"
          description="Organization Admins can only view their own organization profile."
        />
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <OrganizationDetailsHeader canEdit={role === "SUPER_ADMIN"} organization={organization} />
      <OrganizationKpiCards organization={organization} />
      <section className="grid gap-4 xl:grid-cols-[1.15fr_0.85fr]">
        <div className="rounded-[28px] border border-border bg-surface p-6 shadow-sm">
          <p className="text-sm font-semibold text-foreground">Organization profile</p>
          <div className="mt-5 grid gap-4 md:grid-cols-2">
            <Info label="Short Name" value={organization.shortName} />
            <Info label="Type" value={organization.type.replaceAll("_", " ")} />
            <Info label="Contact Email" value={organization.contactEmail} />
            <Info label="Contact Phone" value={organization.contactPhone} />
            <Info label="Website" value={organization.website || "Not provided"} />
            <Info label="State" value={organization.state} />
            <Info label="Address" value={organization.address} className="md:col-span-2" />
          </div>
        </div>
        <OrganizationAdminUsersPreview items={organization.adminUsersPreview} />
      </section>
      <section className="grid gap-4 xl:grid-cols-[1.1fr_0.9fr]">
        <OrganizationProgramsPreview items={organization.programsPreview} />
        <OrganizationActivityFeed items={organization.recentActivities} />
      </section>
    </PageContainer>
  );
}

function Info({
  className,
  label,
  value,
}: {
  className?: string;
  label: string;
  value: string;
}) {
  return (
    <div className={className}>
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-soft">{label}</p>
      <p className="mt-2 text-sm text-foreground">{value}</p>
    </div>
  );
}
