"use client";

import { formatCurrency, formatDateTime, formatNumber } from "@/lib/formatters";
import type { BulkDistributionFormValues } from "@/types/bulk-distribution";
import type { BenefitType } from "@/types/program";

export function BulkReviewSummary({
  values,
  organizationName,
  programName,
  benefitType,
}: {
  values: BulkDistributionFormValues;
  organizationName?: string;
  programName?: string;
  benefitType?: BenefitType;
}) {
  const totalEstimatedPayout =
    values.amount !== undefined ? values.amount * Math.max(values.beneficiaryCount || 0, 0) : undefined;
  const totalEstimatedQuantity =
    values.quantity !== undefined ? values.quantity * Math.max(values.beneficiaryCount || 0, 0) : undefined;

  return (
    <section className="rounded-[28px] border border-border bg-surface p-6 shadow-sm">
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-soft">Review summary</p>
      <h2 className="mt-2 text-xl font-semibold text-foreground">Approval-style job review</h2>
      <div className="mt-5 grid gap-4 md:grid-cols-2">
        <SummaryRow label="Organization" value={organizationName ?? "Select organization"} />
        <SummaryRow label="Program" value={programName ?? "Select program"} />
        <SummaryRow label="Benefit Type" value={benefitType?.replaceAll("_", " ") ?? "Derived from program"} />
        <SummaryRow label="Method" value={values.method.replaceAll("_", " ")} />
        <SummaryRow label="Segment" value={values.segment.replaceAll("_", " ")} />
        <SummaryRow label="Estimated Beneficiaries" value={formatNumber(values.beneficiaryCount || 0)} />
        {values.amount !== undefined ? (
          <>
            <SummaryRow label="Amount Per Beneficiary" value={formatCurrency(values.amount)} />
            <SummaryRow label="Estimated Total Payout" value={formatCurrency(totalEstimatedPayout ?? 0)} />
          </>
        ) : null}
        {values.quantity !== undefined ? (
          <>
            <SummaryRow label="Quantity Per Beneficiary" value={`${formatNumber(values.quantity)} unit(s)`} />
            <SummaryRow label="Estimated Total Quantity" value={`${formatNumber(totalEstimatedQuantity ?? 0)} unit(s)`} />
          </>
        ) : null}
        <SummaryRow
          label="Scheduled Date"
          value={values.scheduledDate ? formatDateTime(values.scheduledDate) : "Choose schedule"}
        />
      </div>
    </section>
  );
}

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-3xl border border-border bg-surface-muted px-4 py-4">
      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-soft">{label}</p>
      <p className="mt-2 text-sm font-medium text-foreground">{value}</p>
    </div>
  );
}
