import { formatDateTime, formatRelativeTime } from "@/lib/formatters";
import type { BeneficiaryAuditItem } from "@/types/beneficiary";

export function BeneficiaryAuditPreview({ items }: { items: BeneficiaryAuditItem[] }) {
  return (
    <div className="rounded-[28px] border border-border bg-surface p-6 shadow-sm">
      <div>
        <p className="text-sm font-semibold text-foreground">Audit trail preview</p>
        <p className="mt-1 text-sm text-muted">Latest beneficiary-related actions across verification, interventions, and distributions.</p>
      </div>
      <div className="mt-5 space-y-3">
        {items.slice(0, 5).map((item) => (
          <div key={item.id} className="rounded-2xl bg-surface-muted px-4 py-3">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm text-foreground">
                  <span className="font-semibold">{item.actor}</span> {item.action}
                </p>
                <p className="mt-1 text-xs text-muted-soft">{item.module}</p>
              </div>
              <span className="shrink-0 text-xs text-muted-soft" title={formatDateTime(item.timestamp)}>
                {formatRelativeTime(item.timestamp)}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
