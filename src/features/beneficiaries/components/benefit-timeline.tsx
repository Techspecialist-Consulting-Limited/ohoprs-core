import { formatCurrency, formatDateTime, formatRelativeTime } from "@/lib/formatters";
import type { BenefitTimelineItem } from "@/types/beneficiary";
import { cn } from "@/lib/utils";

const statusStyles = {
  COMPLETED: "border-success/20 bg-success/10 text-success",
  PENDING: "border-warning/20 bg-warning/10 text-warning",
  FAILED: "border-danger/20 bg-danger/10 text-danger",
  REVERSED: "border-border-strong bg-surface-muted text-foreground",
} as const;

export function BenefitTimeline({ items }: { items: BenefitTimelineItem[] }) {
  return (
    <div className="rounded-[28px] border border-border bg-surface p-6 shadow-sm">
      <div>
        <p className="text-sm font-semibold text-foreground">Benefit timeline</p>
        <p className="mt-1 text-sm text-muted">Chronological trace of benefits processed for this beneficiary.</p>
      </div>
      <div className="mt-5 space-y-4">
        {items.map((item) => (
          <div key={item.id} className="rounded-2xl border border-border bg-surface-muted p-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <p className="text-sm font-semibold text-foreground">{item.programName}</p>
                <p className="mt-1 text-sm text-muted">
                  {item.benefitType} • {item.amount ? formatCurrency(item.amount) : item.item}
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <span className={cn("inline-flex rounded-full border px-2.5 py-1 text-xs font-semibold", statusStyles[item.status])}>
                  {item.status}
                </span>
                <span className="text-xs text-muted-soft" title={formatDateTime(item.date)}>
                  {formatRelativeTime(item.date)}
                </span>
              </div>
            </div>
            <div className="mt-3 grid gap-3 md:grid-cols-3">
              <Info label="Reference ID" value={item.referenceId} />
              <Info label="Processed By" value={item.processedBy} />
              <Info label="Benefit Date" value={formatDateTime(item.date)} />
            </div>
            {item.statusReason ? (
              <p className="mt-3 text-sm text-muted">{item.statusReason}</p>
            ) : null}
          </div>
        ))}
      </div>
    </div>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-soft">{label}</p>
      <p className="mt-2 text-sm text-foreground">{value}</p>
    </div>
  );
}
