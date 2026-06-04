"use client";

import Link from "next/link";
import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { PermissionDeniedState } from "@/components/shared/permission-denied-state";
import { EmptyState } from "@/components/ui/empty-state";
import { LoadingState } from "@/components/ui/loading-state";
import { PageContainer } from "@/components/ui/page-container";
import { PageHeader } from "@/components/ui/page-header";
import { useDebouncedValue } from "@/hooks/use-debounced-value";
import { OrganizationFilters } from "@/features/organizations/components/organization-filters";
import { OrganizationStatusDialog } from "@/features/organizations/components/organization-status-dialog";
import { OrganizationTable } from "@/features/organizations/components/organization-table";
import { organizationService } from "@/services/organization.service";
import { useAuthStore } from "@/store/auth.store";
import type { Organization, OrganizationStatus } from "@/types/organization";

export function OrganizationsModule() {
  const currentTenant = useAuthStore((state) => state.currentTenant);
  const role = useAuthStore((state) => state.role);
  const user = useAuthStore((state) => state.user);
  const queryClient = useQueryClient();
  const [filters, setFilters] = useState<{
    search: string;
    status: OrganizationStatus | "ALL";
    type: import("@/types/organization").OrganizationType | "ALL";
  }>({
    search: "",
    status: "ALL",
    type: "ALL",
  });
  const [page, setPage] = useState(1);
  const [statusTarget, setStatusTarget] = useState<Organization | null>(null);
  const [nextStatus, setNextStatus] = useState<OrganizationStatus>("ACTIVE");
  const debouncedSearch = useDebouncedValue(filters.search);

  const scopeOrganizationId =
    role === "ORG_ADMIN" ? currentTenant?.id === "tenant-org-001" ? user?.organizationId ?? "org_001" : user?.organizationId : null;

  const organizationQuery = useQuery({
    queryKey: ["organizations", page, { ...filters, search: debouncedSearch }, role, scopeOrganizationId],
    queryFn: () =>
      organizationService.getOrganizations({
        page,
        limit: 10,
        search: debouncedSearch,
        status: filters.status,
        type: filters.type,
        scopeOrganizationId,
      }),
    placeholderData: (previousData) => previousData,
  });

  const statusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: OrganizationStatus }) =>
      organizationService.updateOrganizationStatus(id, status),
    onSuccess: (response) => {
      if (!response.success) {
        toast.error(response.message);
        return;
      }

      toast.success(response.message);
      setStatusTarget(null);
      queryClient.invalidateQueries({ queryKey: ["organizations"] });
      queryClient.invalidateQueries({ queryKey: ["organization", response.data?.id] });
    },
  });

  if (role === "PROGRAM_OFFICER") {
    return (
      <PageContainer>
        <PermissionDeniedState
          title="Organizations access denied"
          description="Program Officers can work with intervention and beneficiary operations, but cannot access organization management."
        />
      </PageContainer>
    );
  }

  if (organizationQuery.isLoading && !organizationQuery.data) {
    return (
      <PageContainer>
        <LoadingState title="Loading organizations" lines={5} />
      </PageContainer>
    );
  }

  if (organizationQuery.isError || !organizationQuery.data?.success) {
    return (
      <PageContainer>
        <EmptyState
          title="Unable to load organizations"
          description="The mock organization service could not return organization data."
        />
      </PageContainer>
    );
  }

  const response = organizationQuery.data.data;
  const items = response.items;
  const canCreate = role === "SUPER_ADMIN";

  return (
    <PageContainer>
      <PageHeader
        title="Organization management"
        description="Create, review, and administer participating organizations across the multi-tenant platform."
      />

      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="max-w-2xl text-sm text-muted">
          {role === "ORG_ADMIN"
            ? "You are viewing your organization scope only."
            : "Review participating ministries, agencies, and delivery partners from the central control layer."}
        </div>
        {canCreate ? (
          <Link
            href="/organizations/new"
            className="inline-flex h-11 items-center justify-center rounded-2xl bg-accent px-4 text-sm font-semibold text-accent-foreground"
          >
            Create Organization
          </Link>
        ) : null}
      </div>

      <OrganizationFilters
        value={filters}
        onChange={(next) => {
          setFilters(next);
          setPage(1);
        }}
      />

      {items.length ? (
        <OrganizationTable
          items={items}
          meta={response.meta}
          onPageChange={setPage}
          onStatusAction={(organization) => {
            setStatusTarget(organization);
            setNextStatus(organization.status);
          }}
          role={role!}
        />
      ) : (
        <EmptyState
          title="No organizations match your filters"
          description="Adjust the search or filter values to find organizations in the mock dataset."
        />
      )}

      {statusTarget ? (
        <OrganizationStatusDialog
          organization={statusTarget}
          nextStatus={nextStatus}
          onStatusChange={setNextStatus}
          onClose={() => setStatusTarget(null)}
          onConfirm={() => statusMutation.mutate({ id: statusTarget.id, status: nextStatus })}
        />
      ) : null}
    </PageContainer>
  );
}
