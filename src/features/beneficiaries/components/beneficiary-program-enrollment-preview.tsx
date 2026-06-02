import { formatCurrency, formatNumber } from "@/lib/formatters";
import type { BeneficiaryDetails } from "@/types/beneficiary";

export function BeneficiaryProgramEnrollmentPreview({
  benefitSummary,
  programs,
}: {
  benefitSummary: BeneficiaryDetails["benefitSummary"];
  programs: BeneficiaryDetails["programs"];
}) {
  return (
    <div className="space-y-4">
      <div className="rounded-[28px] border border-border bg-surface p-6 shadow-sm">
        <div>
          <p className="text-sm font-semibold text-foreground">Program enrollment preview</p>
          <p className="mt-1 text-sm text-muted">Current program enrollments linked to this beneficiary.</p>
        </div>
        <div className="mt-5 space-y-3">
          {programs.map((program) => (
            <div key={program.id} className="rounded-2xl bg-surface-muted px-4 py-3">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-sm font-semibold text-foreground">{program.name}</p>
                  <p className="mt-1 text-xs text-muted">
                    {program.benefitType} • {program.status}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="rounded-[28px] border border-border bg-surface p-6 shadow-sm">
        <div>
          <p className="text-sm font-semibold text-foreground">Basic benefit summary</p>
          <p className="mt-1 text-sm text-muted">Structured preview ahead of the full beneficiary 360 profile in Phase 8.</p>
        </div>
        <div className="mt-5 grid gap-4 md:grid-cols-2">
          <Stat label="Active Enrollments" value={formatNumber(benefitSummary.activeEnrollments)} />
          <Stat label="Total Cash Received" value={formatCurrency(benefitSummary.totalCashReceived)} />
          <Stat label="Non-cash Benefits Received" value={formatNumber(benefitSummary.nonCashBenefitsReceived)} />
          <Stat label="Last Distribution Status" value={benefitSummary.lastDistributionStatus} />
          <Stat label="Verification State" value={benefitSummary.verificationState} className="md:col-span-2" />
        </div>
      </div>
    </div>
  );
}

function Stat({
  className,
  label,
  value,
}: {
  className?: string;
  label: string;
  value: string;
}) {
  return (
    <div className={className}>
      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-soft">{label}</p>
      <p className="mt-2 text-sm text-foreground">{value}</p>
    </div>
  );
}
