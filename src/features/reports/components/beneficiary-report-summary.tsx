"use client";

import { AlertTriangle, BadgeCheck, MapPinned, Users } from "lucide-react";

import { MetricCard } from "@/components/ui/metric-card";
import { formatNumber } from "@/lib/formatters";
import type { BeneficiaryReportData } from "@/types/report";

export function BeneficiaryReportSummary({ data }: { data: BeneficiaryReportData }) {
  return (
    <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
      <MetricCard label="Verified Records" value={formatNumber(data.demographicSummary.verifiedRecords)} change="Verification quality" icon={BadgeCheck} />
      <MetricCard label="Flagged Records" value={formatNumber(data.demographicSummary.flaggedRecords)} change="Requires review" icon={AlertTriangle} tone="warning" />
      <MetricCard label="Active Beneficiaries" value={formatNumber(data.demographicSummary.activeBeneficiaries)} change="Operationally active" icon={Users} tone="neutral" />
      <MetricCard label="States Covered" value={formatNumber(data.demographicSummary.statesCovered)} change="Geographic coverage" icon={MapPinned} tone="neutral" />
    </section>
  );
}
