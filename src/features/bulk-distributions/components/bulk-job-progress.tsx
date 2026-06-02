"use client";

import { MetricCard } from "@/components/ui/metric-card";
import { formatNumber } from "@/lib/formatters";
import type { BulkDistributionJobDetails } from "@/types/bulk-distribution";

export function BulkJobProgress({ job }: { job: BulkDistributionJobDetails }) {
  return (
    <section className="space-y-4">
      <div className="rounded-[28px] border border-border bg-surface p-6 shadow-sm">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-soft">Processing progress</p>
            <h2 className="mt-2 text-xl font-semibold text-foreground">Enterprise batch monitoring</h2>
            <p className="mt-1 text-sm text-muted">Simulated job progress across processing, success, failure, and pending records.</p>
          </div>
          <div className="text-right">
            <p className="text-2xl font-semibold text-foreground">{job.progressPercentage}%</p>
            <p className="text-xs text-muted-soft">{job.estimatedCompletion}</p>
          </div>
        </div>
        <div className="mt-5 h-4 overflow-hidden rounded-full bg-surface-muted">
          <div className="h-full rounded-full bg-accent transition-all" style={{ width: `${job.progressPercentage}%` }} />
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        <MetricCard label="Total Records" value={formatNumber(job.totalRecords)} change="Batch target size" tone="neutral" />
        <MetricCard label="Processed" value={formatNumber(job.processedRecords)} change="Processed by engine" />
        <MetricCard label="Successful" value={formatNumber(job.successfulRecords)} change="Completed records" />
        <MetricCard label="Failed" value={formatNumber(job.failedRecords)} change="Exceptions captured" tone="warning" />
        <MetricCard label="Pending" value={formatNumber(job.pendingRecords)} change="Awaiting processing" tone="neutral" />
        <MetricCard label="Current Status" value={job.status.replaceAll("_", " ")} change="Lifecycle state" tone="neutral" />
      </div>
    </section>
  );
}
