import { formatCurrency, formatNumber } from "@/lib/formatters";
import type { ProgramDetails } from "@/types/program";

export function ProgramDistributionPreview({ summary }: { summary: ProgramDetails["distributionSummary"] }) {
  return (
    <div className="rounded-[28px] border border-border bg-surface p-6 shadow-sm">
      <div>
        <p className="text-sm font-semibold text-foreground">Distribution summary preview</p>
        <p className="mt-1 text-sm text-muted">Current payout batch health and delivery throughput.</p>
      </div>
      <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-5">
        <Stat label="Batches" value={formatNumber(summary.totalBatches)} />
        <Stat label="Completed" value={formatNumber(summary.completedBatches)} />
        <Stat label="Pending" value={formatNumber(summary.pendingBatches)} />
        <Stat label="Failed" value={formatNumber(summary.failedBatches)} />
        <Stat label="Distributed" value={formatCurrency(summary.totalDistributed)} />
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl bg-surface-muted px-4 py-3">
      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-soft">{label}</p>
      <p className="mt-2 text-lg font-semibold text-foreground">{value}</p>
    </div>
  );
}
