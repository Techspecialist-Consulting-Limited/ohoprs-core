import { SYSTEM_BENEFICIARY_SUMMARY } from "@/constants/system-metrics";
import { formatNumber } from "@/lib/formatters";

export function ProgramBeneficiaryPreview() {
  return (
    <div className="rounded-[28px] border border-border bg-surface p-6 shadow-sm">
      <div>
        <p className="text-sm font-semibold text-foreground">Beneficiary coverage preview</p>
        <p className="mt-1 text-sm text-muted">Current verification posture and record quality indicators.</p>
      </div>
      <div className="mt-5 grid gap-4 md:grid-cols-2">
        <Stat label="Total" value={formatNumber(SYSTEM_BENEFICIARY_SUMMARY.total)} />
        <Stat label="Verified" value={formatNumber(SYSTEM_BENEFICIARY_SUMMARY.verified)} />
        <Stat label="Pending Verification" value={formatNumber(SYSTEM_BENEFICIARY_SUMMARY.pendingVerification)} />
        <Stat label="Flagged" value={formatNumber(SYSTEM_BENEFICIARY_SUMMARY.flagged)} />
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
