"use client";

import Link from "next/link";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";

import { EmptyState } from "@/components/ui/empty-state";
import { LoadingState } from "@/components/ui/loading-state";
import { PageContainer } from "@/components/ui/page-container";
import { PageHeader } from "@/components/ui/page-header";
import { organizationsData } from "@/mock/organizations.mock";
import { BulkDistributionForm } from "@/features/bulk-distributions/components/bulk-distribution-form";
import { BulkJobStatusBadge } from "@/features/bulk-distributions/components/bulk-job-status-badge";
import { BulkJobSummary } from "@/features/bulk-distributions/components/bulk-job-summary";
import { bulkDistributionService } from "@/services/bulk-distribution.service";
import { useAuthStore } from "@/store/auth.store";
import { formatCurrency, formatDateTime, formatNumber } from "@/lib/formatters";

export function BulkDistributionsModule() {
  const role = useAuthStore((state) => state.role);
  const user = useAuthStore((state) => state.user);
  const [search, setSearch] = useState("");
  const [organizationId, setOrganizationId] = useState("ALL");
  const [status, setStatus] = useState("ALL");
  const [page, setPage] = useState(1);

  const showOrganizationFilter = role === "SUPER_ADMIN" || role === "AUDITOR";
  const scopeOrganizationId = role === "ORG_ADMIN" || role === "PROGRAM_OFFICER" ? user?.organizationId ?? null : null;

  const jobsQuery = useQuery({
    queryKey: ["bulk-jobs", search, organizationId, status, page, scopeOrganizationId],
    queryFn: () =>
      bulkDistributionService.getBulkJobs({
        search,
        page,
        limit: 10,
        organizationId,
        status: status as import("@/types/bulk-distribution").BulkJobStatus | "ALL",
        scopeOrganizationId,
      }),
  });

  if (jobsQuery.isLoading) {
    return (
      <PageContainer>
        <LoadingState title="Loading bulk processing console" lines={6} />
      </PageContainer>
    );
  }

  const items = jobsQuery.data?.data.items ?? [];
  const meta = jobsQuery.data?.data.meta;

  return (
    <PageContainer>
      <PageHeader
        eyebrow="Phase 10"
        title="Bulk distribution engine"
        description="Enterprise-scale batch processing console for mock delivery jobs spanning tens of thousands to millions of beneficiary records."
      />

      <BulkJobSummary items={items} />

      <section className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
        {role !== "AUDITOR" ? (
          <BulkDistributionForm
            canChooseOrganization={role === "SUPER_ADMIN"}
            defaultOrganizationId={role === "SUPER_ADMIN" ? undefined : user?.organizationId ?? undefined}
          />
        ) : (
          <div className="rounded-[28px] border border-border bg-surface p-6 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-soft">Read-only console</p>
            <h2 className="mt-2 text-xl font-semibold text-foreground">Bulk job creation restricted</h2>
            <p className="mt-2 text-sm text-muted">Auditors can inspect job progress, failed records, and job timelines, but cannot create or cancel bulk jobs.</p>
          </div>
        )}

        <section className="space-y-4">
          <div className="rounded-[28px] border border-border bg-surface p-5 shadow-sm">
            <div className="grid gap-4 md:grid-cols-3">
              <label className="block">
                <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.16em] text-muted-soft">Search</span>
                <input
                  value={search}
                  onChange={(event) => {
                    setSearch(event.target.value);
                    setPage(1);
                  }}
                  placeholder="Search jobs"
                  className="h-11 w-full rounded-2xl border border-border bg-surface px-4 text-sm text-foreground outline-none transition focus:border-accent"
                />
              </label>

              {showOrganizationFilter ? (
                <label className="block">
                  <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.16em] text-muted-soft">Organization</span>
                  <select
                    value={organizationId}
                    onChange={(event) => {
                      setOrganizationId(event.target.value);
                      setPage(1);
                    }}
                    className="h-11 w-full rounded-2xl border border-border bg-surface px-4 text-sm text-foreground outline-none transition focus:border-accent"
                  >
                    <option value="ALL">All organizations</option>
                    {organizationsData.map((organization) => (
                      <option key={organization.id} value={organization.id}>
                        {organization.name}
                      </option>
                    ))}
                  </select>
                </label>
              ) : null}

              <label className="block">
                <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.16em] text-muted-soft">Status</span>
                <select
                  value={status}
                  onChange={(event) => {
                    setStatus(event.target.value);
                    setPage(1);
                  }}
                  className="h-11 w-full rounded-2xl border border-border bg-surface px-4 text-sm text-foreground outline-none transition focus:border-accent"
                >
                  {["ALL", "QUEUED", "PROCESSING", "COMPLETED", "PARTIALLY_FAILED", "FAILED", "CANCELLED"].map((option) => (
                    <option key={option} value={option}>
                      {option === "ALL" ? "All statuses" : option.replaceAll("_", " ")}
                    </option>
                  ))}
                </select>
              </label>
            </div>
          </div>

          {!meta || items.length === 0 ? (
            <EmptyState title="No bulk jobs found" description="Create a new bulk distribution job or adjust the current console filters." />
          ) : (
            <div className="overflow-hidden rounded-[28px] border border-border bg-surface shadow-sm">
              <div className="overflow-x-auto">
                <table className="min-w-full">
                  <thead className="border-b border-border bg-surface-muted">
                    <tr className="text-left text-xs font-semibold uppercase tracking-[0.16em] text-muted-soft">
                      {["Job", "Program", "Organization", "Records", "Per Beneficiary", "Status", "Updated", ""].map((label) => (
                        <th key={label} className="px-5 py-4">{label}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {items.map((item) => (
                      <tr key={item.id} className="border-b border-border last:border-b-0">
                        <td className="px-5 py-4">
                          <div>
                            <p className="text-sm font-semibold text-foreground">{item.id}</p>
                            <p className="mt-1 text-xs text-muted">{item.segment.replaceAll("_", " ")}</p>
                          </div>
                        </td>
                        <td className="px-5 py-4 text-sm text-foreground">{item.programName}</td>
                        <td className="px-5 py-4 text-sm text-muted">{item.organizationName}</td>
                        <td className="px-5 py-4 text-sm text-foreground">{formatNumber(item.totalRecords)}</td>
                        <td className="px-5 py-4 text-sm text-foreground">
                          {item.amount !== undefined ? formatCurrency(item.amount) : `${formatNumber(item.quantity ?? 0)} unit(s)`}
                        </td>
                        <td className="px-5 py-4"><BulkJobStatusBadge status={item.status} /></td>
                        <td className="px-5 py-4 text-sm text-muted">{formatDateTime(item.updatedAt)}</td>
                        <td className="px-5 py-4 text-right">
                          <Link href={`/distributions/bulk/${item.id}`} className="inline-flex h-10 items-center rounded-2xl border border-border px-4 text-sm font-medium text-foreground">
                            Open
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="flex items-center justify-between border-t border-border px-5 py-4">
                <p className="text-sm text-muted">
                  Showing page {meta.page} of {meta.totalPages} ({formatNumber(meta.total)} jobs)
                </p>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    disabled={meta.page === 1}
                    onClick={() => setPage((current) => current - 1)}
                    className="inline-flex h-10 items-center rounded-2xl border border-border px-3 text-sm text-foreground disabled:opacity-50"
                  >
                    Previous
                  </button>
                  <button
                    type="button"
                    disabled={meta.page === meta.totalPages}
                    onClick={() => setPage((current) => current + 1)}
                    className="inline-flex h-10 items-center rounded-2xl border border-border px-3 text-sm text-foreground disabled:opacity-50"
                  >
                    Next
                  </button>
                </div>
              </div>
            </div>
          )}
        </section>
      </section>
    </PageContainer>
  );
}
