"use client";

import { AlertTriangle, CircleCheckBig, Clock3, DatabaseBackup, Layers3, ServerCrash } from "lucide-react";

import { MetricCard } from "@/components/ui/metric-card";
import { formatCurrency, formatNumber } from "@/lib/formatters";
import type { DistributionReportData } from "@/types/report";

export function DistributionReportSummary({ data }: { data: DistributionReportData }) {
  return (
    <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
      <MetricCard label="Completed Distributions" value={formatNumber(data.standardMetrics.completedDistributions)} change="Standard delivery batches" icon={CircleCheckBig} />
      <MetricCard label="Failed Distributions" value={formatNumber(data.standardMetrics.failedDistributions)} change="Delivery exceptions" icon={ServerCrash} tone="warning" />
      <MetricCard label="Pending Amount" value={formatCurrency(data.standardMetrics.pendingAmount)} change="Awaiting execution" icon={Clock3} tone="warning" />
      <MetricCard label="Total Bulk Jobs" value={formatNumber(data.bulkJobMetrics.totalBulkJobs)} change="Enterprise queue volume" icon={Layers3} tone="neutral" />
      <MetricCard label="Processing Jobs" value={formatNumber(data.bulkJobMetrics.processingJobs)} change="Currently active jobs" icon={DatabaseBackup} tone="neutral" />
      <MetricCard label="Failed Records" value={formatNumber(data.bulkJobMetrics.failedRecords)} change="Bulk-processing exceptions" icon={AlertTriangle} tone="warning" />
    </section>
  );
}
