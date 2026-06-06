"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Plus } from "lucide-react";
import { toast } from "sonner";

import { EmptyState } from "@/components/ui/empty-state";
import { LoadingState } from "@/components/ui/loading-state";
import { PageContainer } from "@/components/ui/page-container";
import { PageHeader } from "@/components/ui/page-header";
import { useDebouncedValue } from "@/hooks/use-debounced-value";
import { hasPermission } from "@/lib/rbac";
import { canEditDistributionRecord } from "@/features/distributions/lib/distribution-permissions";
import { organizationsData } from "@/mock/organizations.mock";
import { DistributionFilters } from "@/features/distributions/components/distribution-filters";
import { DistributionStatusDialog } from "@/features/distributions/components/distribution-status-dialog";
import { DistributionTable } from "@/features/distributions/components/distribution-table";
import { distributionService } from "@/services/distribution.service";
import { programService } from "@/services/program.service";
import { useAuthStore } from "@/store/auth.store";
import type { Distribution, DistributionStatus } from "@/types/distribution";

export function DistributionsModule() {
  const role = useAuthStore((state) => state.role);
  const user = useAuthStore((state) => state.user);
  const queryClient = useQueryClient();
  const [filters, setFilters] = useState({
    search: "",
    organizationId: "ALL",
    programId: "ALL",
    status: "ALL" as DistributionStatus | "ALL",
    benefitType: "ALL" as import("@/types/program").BenefitType | "ALL",
    page: 1,
  });
  const [statusTarget, setStatusTarget] = useState<Distribution | null>(null);
  const [nextStatus, setNextStatus] = useState<DistributionStatus>("COMPLETED");
  const debouncedSearch = useDebouncedValue(filters.search);

  const scopeOrganizationId = role === "ORG_ADMIN" || role === "PROGRAM_OFFICER" ? user?.organizationId ?? null : null;

  const distributionsQuery = useQuery({
    queryKey: ["distributions", { ...filters, search: debouncedSearch }, scopeOrganizationId],
    queryFn: () =>
      distributionService.getDistributions({
        ...filters,
        search: debouncedSearch,
        limit: 10,
        scopeOrganizationId,
      }),
    placeholderData: (previousData) => previousData,
  });

  const statusMutation = useMutation({
    mutationFn: (payload: { id: string; status: DistributionStatus }) =>
      distributionService.updateDistributionStatus(payload.id, payload.status),
    onSuccess: (response) => {
      if (!response.success) {
        toast.error(response.message);
        return;
      }
      void queryClient.invalidateQueries({ queryKey: ["distributions"] });
      if (statusTarget) {
        void queryClient.invalidateQueries({ queryKey: ["distribution", statusTarget.id] });
      }
      toast.success("Distribution status updated");
      setStatusTarget(null);
    },
  });

  const showOrganizationFilter = role === "SUPER_ADMIN" || role === "AUDITOR";
  const availablePrograms = useMemo(() => {
    if (showOrganizationFilter && filters.organizationId !== "ALL") {
      return programService.getProgramOptions({
        organizationId: filters.organizationId,
        eligibleForDistribution: true,
      });
    }

    if (scopeOrganizationId) {
      return programService.getProgramOptions({
        organizationId: scopeOrganizationId,
        eligibleForDistribution: true,
      });
    }

    return programService.getProgramOptions({
      eligibleForDistribution: true,
    });
  }, [filters.organizationId, scopeOrganizationId, showOrganizationFilter]);

  const canChangeStatus = role ? hasPermission(role, "change_distribution_status") : false;
  const canCreate = role ? hasPermission(role, "create_distribution") : false;

  function canEditItem(item: Distribution) {
    if (!role || !hasPermission(role, "edit_distribution")) {
      return false;
    }

    return canEditDistributionRecord(role, item, user?.organizationId, user?.id);
  }

  if (distributionsQuery.isLoading && !distributionsQuery.data) {
    return (
      <PageContainer>
        <LoadingState title="Loading distributions" lines={6} />
      </PageContainer>
    );
  }

  const distributions = distributionsQuery.data?.data.items ?? [];
  const meta = distributionsQuery.data?.data.meta;

  return (
    <PageContainer>
      <PageHeader
        title="Distribution management"
        description="Manage delivery batches that connect interventions, beneficiaries, and accountable benefit execution."
      />

      {canCreate ? (
        <div className="flex justify-end">
          <Link href="/distributions/new" className="inline-flex h-11 items-center gap-2 rounded-2xl bg-accent px-4 text-sm font-semibold text-accent-foreground">
            <Plus size={16} />
            Create benefit distribution
          </Link>
        </div>
      ) : null}

      <DistributionFilters
        value={filters}
        onChange={(next) => setFilters({ ...next, page: 1 })}
        organizations={organizationsData.map((organization) => ({ id: organization.id, name: organization.name }))}
        programs={availablePrograms.map((program) => ({ id: program.id, name: program.name }))}
        showOrganizationFilter={showOrganizationFilter}
      />

      {!meta || distributions.length === 0 ? (
        <EmptyState title="No distributions found" description="Adjust the current filters or create a new distribution batch to populate this module." />
      ) : (
        <DistributionTable
          items={distributions}
          meta={meta}
          onPageChange={(page) => setFilters((current) => ({ ...current, page }))}
          onStatusAction={(item) => {
            setStatusTarget(item);
            setNextStatus(item.status === "COMPLETED" ? "FAILED" : "COMPLETED");
          }}
          canManage={canChangeStatus}
          canEditItem={canEditItem}
        />
      )}

      {statusTarget ? (
        <DistributionStatusDialog
          item={statusTarget}
          nextStatus={nextStatus}
          isSaving={statusMutation.isPending}
          onClose={() => setStatusTarget(null)}
          onConfirm={() => statusMutation.mutate({ id: statusTarget.id, status: nextStatus })}
        />
      ) : null}
    </PageContainer>
  );
}
