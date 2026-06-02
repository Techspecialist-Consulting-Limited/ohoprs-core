"use client";

import { Clock3, Gauge, TriangleAlert, Users, Wallet } from "lucide-react";

import { MetricCard } from "@/components/ui/metric-card";
import { formatCurrency, formatDateTime, formatNumber } from "@/lib/formatters";
import type { DistributionStatistics as DistributionStatisticsType } from "@/types/distribution";

export function DistributionStatistics({ statistics }: { statistics: DistributionStatisticsType }) {
  return (
    <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
      <MetricCard label="Beneficiaries" value={formatNumber(statistics.beneficiaries)} change="Batch coverage" icon={Users} tone="neutral" />
      <MetricCard label="Amount Distributed" value={formatCurrency(statistics.amountDistributed)} change="Cash-equivalent view" icon={Wallet} />
      <MetricCard label="Success Rate" value={`${statistics.successRate}%`} change="Delivered successfully" icon={Gauge} />
      <MetricCard label="Failed Deliveries" value={formatNumber(statistics.failedDeliveries)} change="Exceptions captured" icon={TriangleAlert} tone="warning" />
      <MetricCard label="Completion Rate" value={`${statistics.completionRate}%`} change="Workflow progress" icon={Gauge} />
      <MetricCard label="Last Updated" value={formatDateTime(statistics.lastUpdated)} change="Operational refresh" icon={Clock3} tone="neutral" />
    </section>
  );
}
