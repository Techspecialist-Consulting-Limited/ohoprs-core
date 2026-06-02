import { formatDateTime } from "@/lib/formatters";
import type { DistributionApprovalHistoryItem } from "@/types/distribution";

export function ApprovalHistoryTimeline({ items }: { items: DistributionApprovalHistoryItem[] }) {
  return (
    <section className="rounded-[28px] border border-border bg-surface p-6 shadow-sm">
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-accent">Governance trail</p>
      <h2 className="mt-2 text-xl font-semibold tracking-tight text-foreground">Approval history</h2>

      <div className="mt-6 space-y-4">
        {items.map((item) => (
          <div key={item.id} className="flex gap-4">
            <div className="mt-1 h-3 w-3 rounded-full bg-accent" />
            <div>
              <p className="text-sm font-semibold text-foreground">{item.label}</p>
              <p className="mt-1 text-sm text-muted">{item.note ?? "Workflow event recorded."}</p>
              <p className="mt-2 text-xs text-muted-soft">{formatDateTime(item.timestamp)} • {item.actor}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
