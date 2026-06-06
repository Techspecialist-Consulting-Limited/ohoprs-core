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
import {
  canEditDistributionRecord,
  canInitiateDistributionPayment,
  canOpenDistributionApprovalReview,
} from "@/features/distributions/lib/distribution-permissions";
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
  const [paymentTarget, setPaymentTarget] = useState<Distribution | null>(null);
  const [paymentSuccessTarget, setPaymentSuccessTarget] = useState<Distribution | null>(null);
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

  const paymentMutation = useMutation<Distribution | null, Error, Distribution>({
    mutationFn: async (item: Distribution) =>
      distributionService.initiateDistributionPayment(item.id, user?.name ?? "Agency Accountant"),
    onSuccess: (response) => {
      if (!response) {
        toast.error("Unable to start payment for this distribution.");
        return;
      }
      void queryClient.invalidateQueries({ queryKey: ["distributions"] });
      void queryClient.invalidateQueries({ queryKey: ["distribution", response.id] });
      setPaymentTarget(null);
      setPaymentSuccessTarget(response);
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

  function canOpenApprovalAction(item: Distribution) {
    return canOpenDistributionApprovalReview(role, item, user?.organizationId, user?.id);
  }

  function canPayItem(item: Distribution) {
    return canInitiateDistributionPayment(role, item, user?.organizationId);
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
          onPaymentAction={(item) => setPaymentTarget(item)}
          canManage={canChangeStatus}
          canEditItem={canEditItem}
          canOpenApprovalReview={canOpenApprovalAction}
          canInitiatePayment={canPayItem}
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

      {paymentTarget ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-xl rounded-[28px] border border-border bg-surface p-6 shadow-xl">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-soft">Batch payment</p>
            <h2 className="mt-2 text-2xl font-semibold text-foreground">Proceed with payment</h2>
            <p className="mt-2 text-sm text-muted">
              Confirm the batch details before starting payment for this distribution.
            </p>
            <div className="mt-5 grid gap-4 md:grid-cols-2">
              <SummaryCard label="Intervention" value={paymentTarget.programName} />
              <SummaryCard label="Trench / Batch" value={paymentTarget.name} />
              <SummaryCard label="Beneficiaries" value={paymentTarget.beneficiaryCount.toLocaleString()} />
              <SummaryCard label="Amount" value={paymentTarget.amount ? `₦${Intl.NumberFormat("en-NG").format(paymentTarget.amount)}` : `${paymentTarget.quantity?.toLocaleString() ?? 0} packages`} />
            </div>
            <div className="mt-6 flex flex-wrap justify-end gap-3">
              <button
                type="button"
                onClick={() => setPaymentTarget(null)}
                className="inline-flex h-11 items-center justify-center rounded-2xl border border-border px-5 text-sm font-semibold text-foreground"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => paymentMutation.mutate(paymentTarget)}
                disabled={paymentMutation.isPending}
                className="inline-flex h-11 items-center justify-center rounded-2xl bg-accent px-5 text-sm font-semibold text-accent-foreground"
              >
                {paymentMutation.isPending ? "Starting payment..." : "Proceed with Payment"}
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {paymentSuccessTarget ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-xl rounded-[28px] border border-success/20 bg-surface p-6 shadow-xl">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-success">Payment successful</p>
            <h2 className="mt-2 text-2xl font-semibold text-foreground">Batch payment started successfully</h2>
            <p className="mt-2 text-sm text-muted">
              {paymentSuccessTarget.name} has been sent for batch processing and the distribution status is now processing.
            </p>
            <div className="mt-5 grid gap-4 md:grid-cols-2">
              <SummaryCard label="Intervention" value={paymentSuccessTarget.programName} />
              <SummaryCard label="Trench / Batch" value={paymentSuccessTarget.name} />
              <SummaryCard label="Beneficiaries" value={paymentSuccessTarget.beneficiaryCount.toLocaleString()} />
              <SummaryCard label="Status" value={paymentSuccessTarget.status.replaceAll("_", " ")} />
            </div>
            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setPaymentSuccessTarget(null)}
                className="inline-flex h-11 items-center justify-center rounded-2xl border border-border px-5 text-sm font-semibold text-foreground"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </PageContainer>
  );
}

function SummaryCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-3xl border border-border bg-surface-muted px-4 py-4">
      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-soft">{label}</p>
      <p className="mt-2 text-sm font-semibold text-foreground">{value}</p>
    </div>
  );
}
