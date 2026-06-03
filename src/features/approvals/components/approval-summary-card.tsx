import { formatCurrency, formatDateTime, formatNumber } from "@/lib/formatters";
import type { DistributionDetails } from "@/types/distribution";

export function ApprovalSummaryCard({ distribution }: { distribution: DistributionDetails }) {
  const displayValue =
    distribution.amount !== undefined
      ? formatCurrency(distribution.amount)
      : `${formatNumber(distribution.quantity ?? 0)} units`;

  return (
    <section className="rounded-[28px] border border-border bg-surface p-6 shadow-sm">
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-accent">Distribution summary</p>
      <div className="mt-5 grid gap-4 md:grid-cols-2">
        <SummaryCell label="Distribution name" value={distribution.name} />
        <SummaryCell label="Intervention" value={distribution.programName} />
        <SummaryCell label="Organization" value={distribution.organizationName} />
        <SummaryCell label="Method" value={distribution.method.replaceAll("_", " ")} />
        <SummaryCell label="Beneficiary count" value={formatNumber(distribution.beneficiaryCount)} />
        <SummaryCell label="Amount / Quantity" value={displayValue} />
        <SummaryCell label="Created by" value={distribution.createdBy} />
        <SummaryCell label="Created date" value={formatDateTime(distribution.createdAt)} />
      </div>
    </section>
  );
}

function SummaryCell({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-border bg-surface-muted px-4 py-3">
      <p className="text-xs uppercase tracking-[0.14em] text-muted-soft">{label}</p>
      <p className="mt-2 text-sm font-medium text-foreground">{value}</p>
    </div>
  );
}
