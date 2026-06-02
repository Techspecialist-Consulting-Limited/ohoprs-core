import { formatCurrency, formatDateTime, formatNumber } from "@/lib/formatters";
import type { ProgramBenefitBreakdownItem } from "@/types/beneficiary";

export function ProgramBenefitBreakdown({ items }: { items: ProgramBenefitBreakdownItem[] }) {
  return (
    <div className="rounded-[28px] border border-border bg-surface p-6 shadow-sm">
      <div>
        <p className="text-sm font-semibold text-foreground">Program-by-program benefit breakdown</p>
        <p className="mt-1 text-sm text-muted">Everything this beneficiary has received across enrolled programs.</p>
      </div>
      <div className="mt-5 space-y-4">
        {items.map((item) => (
          <div key={item.programId} className="rounded-2xl border border-border bg-surface-muted p-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <p className="text-base font-semibold text-foreground">{item.programName}</p>
                <p className="mt-1 text-sm text-muted">
                  {item.benefitType} • {item.organizationName}
                </p>
              </div>
              <span className="inline-flex rounded-full border border-border bg-surface px-3 py-1 text-xs font-semibold text-muted">
                {item.status}
              </span>
            </div>
            <div className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              <Stat
                label="Total Received"
                value={typeof item.totalCashReceived === "number" ? formatCurrency(item.totalCashReceived) : `${formatNumber(item.nonCashBenefitCount ?? 0)} non-cash benefits`}
              />
              <Stat label="Benefit Count" value={formatNumber(item.benefitCount)} />
              <Stat label="Last Benefit Date" value={formatDateTime(item.lastBenefitDate)} />
              <Stat label="Benefit Description" value={item.benefitDescription || "Cash disbursement"} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-soft">{label}</p>
      <p className="mt-2 text-sm text-foreground">{value}</p>
    </div>
  );
}
