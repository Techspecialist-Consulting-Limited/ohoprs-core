import { formatCurrency, formatDateTime, formatNumber } from "@/lib/formatters";
import type { WorkspaceDistributionPreview } from "@/types/workspace";

export function DistributionSummaryPreview({ summary }: { summary: WorkspaceDistributionPreview }) {
  return (
    <div className="rounded-[28px] border border-border bg-surface p-6 shadow-sm">
      <div>
        <p className="text-sm font-semibold text-foreground">Distribution activity</p>
        <p className="mt-1 text-sm text-muted">Batch health, disbursement throughput, and recent distribution cycles.</p>
      </div>
      <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <Stat label="Total Batches" value={formatNumber(summary.totalBatches)} />
        <Stat label="Completed" value={formatNumber(summary.completedBatches)} />
        <Stat label="Pending" value={formatNumber(summary.pendingBatches)} />
        <Stat label="Failed" value={formatNumber(summary.failedBatches)} />
      </div>
      <div className="mt-6 overflow-x-auto">
        <table className="min-w-full">
          <thead>
            <tr className="text-left text-xs font-semibold uppercase tracking-[0.16em] text-muted-soft">
              <th className="pb-3">Batch</th>
              <th className="pb-3">Benefit Type</th>
              <th className="pb-3">Status</th>
              <th className="pb-3">Beneficiaries</th>
              <th className="pb-3">Amount</th>
              <th className="pb-3">Created</th>
            </tr>
          </thead>
          <tbody>
            {summary.recentBatches.map((item) => (
              <tr key={item.id} className="border-t border-border">
                <td className="py-3 text-sm font-medium text-foreground">{item.name}</td>
                <td className="py-3 text-sm text-muted">{item.benefitType}</td>
                <td className="py-3 text-sm text-muted">{item.status}</td>
                <td className="py-3 text-sm text-foreground">{formatNumber(item.beneficiaryCount)}</td>
                <td className="py-3 text-sm text-foreground">{typeof item.amount === "number" ? formatCurrency(item.amount) : "—"}</td>
                <td className="py-3 text-sm text-muted" title={formatDateTime(item.createdAt)}>
                  {new Date(item.createdAt).toLocaleDateString("en-NG", { day: "2-digit", month: "short" })}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
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
