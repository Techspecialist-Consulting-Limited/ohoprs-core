import type { Beneficiary360Details } from "@/types/beneficiary";
import { cn } from "@/lib/utils";

const riskTone = {
  LOW: "text-success",
  MEDIUM: "text-warning",
  HIGH: "text-danger",
} as const;

export function VerificationRiskSummary({ beneficiary }: { beneficiary: Beneficiary360Details }) {
  return (
    <div className="rounded-[28px] border border-border bg-surface p-6 shadow-sm">
      <div>
        <p className="text-sm font-semibold text-foreground">Verification and risk summary</p>
        <p className="mt-1 text-sm text-muted">Identity status, duplicate screening, and flagged risk indicators.</p>
      </div>
      <div className="mt-5 grid gap-4 md:grid-cols-2">
        <Info label="Identity Verified" value={beneficiary.verificationSummary.identityVerified ? "Yes" : "No"} />
        <Info label="Bank Verified" value={beneficiary.verificationSummary.bankVerified ? "Yes" : "No"} />
        <Info label="Duplicate Check" value={beneficiary.verificationSummary.duplicateCheck} />
        <Info label="Risk Level" value={beneficiary.riskSummary.riskLevel} tone={riskTone[beneficiary.riskSummary.riskLevel]} />
      </div>
      <div className="mt-6 space-y-3">
        {beneficiary.riskSummary.flags.map((flag) => (
          <div key={flag.id} className="rounded-2xl border border-border bg-surface-muted px-4 py-3">
            <div className="flex items-center justify-between gap-4">
              <p className="text-sm font-semibold text-foreground">{flag.label}</p>
              <span className={cn("text-xs font-semibold uppercase tracking-[0.16em]", riskTone[flag.severity])}>
                {flag.severity}
              </span>
            </div>
            <p className="mt-2 text-sm text-muted">{flag.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function Info({
  label,
  tone,
  value,
}: {
  label: string;
  tone?: string;
  value: string;
}) {
  return (
    <div className="rounded-2xl bg-surface-muted px-4 py-3">
      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-soft">{label}</p>
      <p className={cn("mt-2 text-sm font-medium text-foreground", tone)}>{value}</p>
    </div>
  );
}
