"use client";

import { Layers3, PlaySquare, ShieldAlert, Users } from "lucide-react";

import { MetricCard } from "@/components/ui/metric-card";
import { formatNumber } from "@/lib/formatters";
import type { BulkDistributionJob } from "@/types/bulk-distribution";

export function BulkJobSummary({ items }: { items: BulkDistributionJob[] }) {
  const totalJobs = items.length;
  const processingJobs = items.filter((item) => item.status === "PROCESSING" || item.status === "QUEUED").length;
  const failedJobs = items.filter((item) => item.status === "FAILED" || item.status === "PARTIALLY_FAILED").length;
  const totalRecords = items.reduce((sum, item) => sum + item.totalRecords, 0);

  return (
    <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
      <MetricCard label="Bulk Jobs" value={formatNumber(totalJobs)} change="Enterprise processing queue" icon={Layers3} tone="neutral" />
      <MetricCard label="Active Jobs" value={formatNumber(processingJobs)} change="Queued or processing" icon={PlaySquare} />
      <MetricCard label="Failed / Partial" value={formatNumber(failedJobs)} change="Needs operations review" icon={ShieldAlert} tone="warning" />
      <MetricCard label="Records In Scope" value={formatNumber(totalRecords)} change="Mock large-scale throughput" icon={Users} />
    </section>
  );
}
