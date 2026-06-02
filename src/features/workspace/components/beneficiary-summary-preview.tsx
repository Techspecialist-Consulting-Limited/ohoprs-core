import { formatNumber } from "@/lib/formatters";
import type { WorkspaceBeneficiaryPreview } from "@/types/workspace";

export function BeneficiarySummaryPreview({ summary }: { summary: WorkspaceBeneficiaryPreview }) {
  const maxCount = Math.max(...summary.topStates.map((item) => item.count), 1);

  return (
    <div className="rounded-[28px] border border-border bg-surface p-6 shadow-sm">
      <div>
        <p className="text-sm font-semibold text-foreground">Beneficiary coverage</p>
        <p className="mt-1 text-sm text-muted">Current coverage, verification pressure, and geographic concentration.</p>
      </div>
      <div className="mt-5 grid gap-4 md:grid-cols-2">
        <Stat label="Total Beneficiaries" value={formatNumber(summary.totalBeneficiaries)} />
        <Stat label="Active Beneficiaries" value={formatNumber(summary.activeBeneficiaries)} />
        <Stat label="Pending Verification" value={formatNumber(summary.pendingVerification)} />
        <Stat label="Flagged Records" value={formatNumber(summary.flaggedRecords)} />
      </div>
      <div className="mt-6">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-soft">Top states</p>
        <div className="mt-4 space-y-3">
          {summary.topStates.map((item, index) => (
            <div key={item.state}>
              <div className="mb-1 flex items-center justify-between gap-3 text-sm">
                <span className="font-medium text-foreground">
                  {index + 1}. {item.state}
                </span>
                <span className="text-muted">{formatNumber(item.count)}</span>
              </div>
              <div className="h-2 rounded-full bg-surface-muted">
                <div
                  className="h-2 rounded-full bg-accent"
                  style={{ width: `${(item.count / maxCount) * 100}%` }}
                />
              </div>
            </div>
          ))}
        </div>
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
