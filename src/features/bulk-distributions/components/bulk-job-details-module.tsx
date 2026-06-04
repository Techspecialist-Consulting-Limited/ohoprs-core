"use client";

import Link from "next/link";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { PermissionDeniedState } from "@/components/shared/permission-denied-state";
import { EmptyState } from "@/components/ui/empty-state";
import { LoadingState } from "@/components/ui/loading-state";
import { PageContainer } from "@/components/ui/page-container";
import { formatCurrency, formatDateTime, formatNumber } from "@/lib/formatters";
import { BulkJobProgress } from "@/features/bulk-distributions/components/bulk-job-progress";
import { BulkJobStatusBadge } from "@/features/bulk-distributions/components/bulk-job-status-badge";
import { BulkJobTimeline } from "@/features/bulk-distributions/components/bulk-job-timeline";
import { FailedRecordsPreview } from "@/features/bulk-distributions/components/failed-records-preview";
import { bulkDistributionService } from "@/services/bulk-distribution.service";
import { useAuthStore } from "@/store/auth.store";

function canViewJob(role: string | null, organizationId: string, userOrganizationId: string | null | undefined) {
  if (role === "SUPER_ADMIN" || role === "AUDITOR") return true;
  return userOrganizationId === organizationId;
}

function canCancelJob(
  role: string | null,
  organizationId: string,
  userOrganizationId: string | null | undefined,
  createdByUserId: string,
  userId: string | undefined,
  status: string,
) {
  if (status !== "QUEUED" && status !== "PROCESSING") return false;
  if (role === "SUPER_ADMIN") return true;
  if (role === "ORG_ADMIN") return userOrganizationId === organizationId;
  if (role === "PROGRAM_OFFICER") return userOrganizationId === organizationId && userId === createdByUserId;
  return false;
}

export function BulkJobDetailsModule({ jobId }: { jobId: string }) {
  const role = useAuthStore((state) => state.role);
  const user = useAuthStore((state) => state.user);
  const queryClient = useQueryClient();
  const jobQuery = useQuery({
    queryKey: ["bulk-job", jobId],
    queryFn: () => bulkDistributionService.getBulkJobById(jobId),
  });

  const cancelMutation = useMutation({
    mutationFn: () => bulkDistributionService.cancelBulkJob(jobId),
    onSuccess: (response) => {
      if (!response.success) {
        toast.error(response.message);
        return;
      }
      void queryClient.invalidateQueries({ queryKey: ["bulk-jobs"] });
      void queryClient.invalidateQueries({ queryKey: ["bulk-job", jobId] });
      toast.success("Bulk job cancelled");
    },
  });

  if (jobQuery.isLoading) {
    return (
      <PageContainer>
        <LoadingState title="Loading bulk job details" lines={6} />
      </PageContainer>
    );
  }

  const job = jobQuery.data?.data;

  if (!job) {
    return (
      <PageContainer>
        <EmptyState title="Bulk job not found" description="The requested bulk job could not be loaded from the mock processing service." />
      </PageContainer>
    );
  }

  if (!canViewJob(role, job.organizationId, user?.organizationId)) {
    return (
      <PageContainer>
        <PermissionDeniedState title="Bulk job access denied" description="Your role cannot access this bulk job because it belongs to another organization." />
      </PageContainer>
    );
  }

  const canCancel = canCancelJob(role, job.organizationId, user?.organizationId, job.createdByUserId, user?.id, job.status);

  return (
    <PageContainer>
      <section className="rounded-[32px] border border-border bg-surface p-6 shadow-sm">
        <div className="flex flex-col gap-5 xl:flex-row xl:items-start xl:justify-between">
          <div>
            <div className="flex flex-wrap items-center gap-3">
              {role === "AUDITOR" ? <span className="rounded-full border border-border px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-muted">Read-only oversight view</span> : null}
              <BulkJobStatusBadge status={job.status} />
            </div>
            <h1 className="mt-4 text-3xl font-semibold tracking-tight text-foreground">{job.id}</h1>
            <p className="mt-2 text-sm text-muted">
              {job.programName} under {job.organizationName}
            </p>
            <p className="mt-1 text-sm text-muted">
              {job.segment.replaceAll("_", " ")} segment • {job.method.replaceAll("_", " ")} • scheduled {formatDateTime(job.scheduledDate)}
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link href={`/programs/${job.programId}`} className="inline-flex h-11 items-center rounded-2xl border border-border px-4 text-sm font-medium text-foreground">
              View Intervention
            </Link>
            <Link href="/beneficiaries" className="inline-flex h-11 items-center rounded-2xl border border-border px-4 text-sm font-medium text-foreground">
              View Beneficiaries
            </Link>
            {canCancel ? (
              <button
                type="button"
                disabled={cancelMutation.isPending}
                onClick={() => {
                  if (window.confirm("Cancel this bulk job?")) {
                    cancelMutation.mutate();
                  }
                }}
                className="inline-flex h-11 items-center rounded-2xl bg-accent px-4 text-sm font-semibold text-accent-foreground disabled:opacity-60"
              >
                {cancelMutation.isPending ? "Cancelling..." : "Cancel Job"}
              </button>
            ) : null}
          </div>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <SummaryCard label="Records" value={formatNumber(job.totalRecords)} />
        <SummaryCard
          label={job.amount !== undefined ? "Amount Per Beneficiary" : "Quantity Per Beneficiary"}
          value={job.amount !== undefined ? formatCurrency(job.amount) : `${formatNumber(job.quantity ?? 0)} unit(s)`}
        />
        <SummaryCard
          label={job.totalEstimatedPayout !== undefined ? "Estimated Total Payout" : "Estimated Total Quantity"}
          value={
            job.totalEstimatedPayout !== undefined
              ? formatCurrency(job.totalEstimatedPayout)
              : `${formatNumber(job.totalEstimatedQuantity ?? 0)} unit(s)`
          }
        />
        <SummaryCard label="Created By" value={job.createdBy} />
      </section>

      <BulkJobProgress job={job} />

      <section className="grid gap-4 xl:grid-cols-[1fr_1fr]">
        <BulkJobTimeline items={job.timeline} />
        <FailedRecordsPreview items={job.failedRecordPreview} />
      </section>
    </PageContainer>
  );
}

function SummaryCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[28px] border border-border bg-surface p-5 shadow-sm">
      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-soft">{label}</p>
      <p className="mt-3 text-lg font-semibold text-foreground">{value}</p>
    </div>
  );
}
