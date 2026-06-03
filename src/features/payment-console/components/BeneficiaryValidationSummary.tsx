"use client";

import { AlertTriangle, BadgeCheck, CircleOff, Clock3, Fingerprint, Landmark } from "lucide-react";

import { MetricCard } from "@/components/ui/metric-card";
import { formatNumber } from "@/lib/formatters";
import type { PaymentConsoleValidationSummary } from "@/types/payment-console";

export function BeneficiaryValidationSummary({ data }: { data: PaymentConsoleValidationSummary }) {
  return (
    <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
      <MetricCard icon={BadgeCheck} label="Verified" value={formatNumber(data.verifiedBeneficiaries)} change="Cleared beneficiaries" />
      <MetricCard icon={Clock3} label="Pending Verification" value={formatNumber(data.pendingVerification)} change="Awaiting checks" tone="warning" />
      <MetricCard icon={CircleOff} label="Failed Verification" value={formatNumber(data.failedVerification)} change="Blocked from payment" tone="warning" />
      <MetricCard icon={AlertTriangle} label="Flagged Beneficiaries" value={formatNumber(data.flaggedBeneficiaries)} change="Manual review required" tone="warning" />
      <MetricCard icon={Fingerprint} label="Duplicate Records" value={formatNumber(data.duplicateRecords)} change="Potential duplicate payment risk" tone="warning" />
      <MetricCard icon={Landmark} label="Bank Failures" value={formatNumber(data.bankFailures + data.missingPaymentProfiles)} change="Unresolved payment profile issues" tone="warning" />
    </section>
  );
}
