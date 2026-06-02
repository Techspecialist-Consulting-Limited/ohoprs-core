import { formatCurrency, formatNumber } from "@/lib/formatters";
import type { DistributionValidationSummary } from "@/types/distribution";

export function BeneficiaryValidationSummary({
  summary,
  isHighRisk,
}: {
  summary: DistributionValidationSummary;
  isHighRisk: boolean;
}) {
  const cards = [
    { label: "Verified beneficiaries", value: formatNumber(summary.verifiedBeneficiaries) },
    { label: "Pending verification", value: formatNumber(summary.pendingVerification) },
    { label: "Failed verification", value: formatNumber(summary.failedVerification) },
    { label: "Duplicate records", value: formatNumber(summary.duplicateRecords) },
    { label: "Flagged beneficiaries", value: formatNumber(summary.flaggedBeneficiaries) },
    { label: "Eligible beneficiaries", value: formatNumber(summary.eligibleBeneficiaries) },
    { label: "Estimated total payout", value: formatCurrency(summary.estimatedTotalAmount) },
  ];

  return (
    <section className="rounded-[28px] border border-border bg-surface p-6 shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-accent">Validation summary</p>
          <h2 className="mt-2 text-xl font-semibold tracking-tight text-foreground">Beneficiary readiness</h2>
        </div>
        {isHighRisk ? (
          <span className="rounded-full border border-danger/30 bg-danger/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-danger">
            High Risk
          </span>
        ) : null}
      </div>

      <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {cards.map((card) => (
          <div key={card.label} className="rounded-2xl border border-border bg-surface-muted px-4 py-4">
            <p className="text-xs uppercase tracking-[0.14em] text-muted-soft">{card.label}</p>
            <p className="mt-2 text-xl font-semibold text-foreground">{card.value}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
