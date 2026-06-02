import { formatDateTime } from "@/lib/formatters";
import { cn } from "@/lib/utils";
import type { PaymentTimelineEvent } from "@/types/payment";

export function PaymentTimeline({ items }: { items: PaymentTimelineEvent[] }) {
  return (
    <section className="rounded-[28px] border border-border bg-surface p-6 shadow-sm">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-accent">Lifecycle</p>
          <h2 className="mt-2 text-xl font-semibold tracking-tight text-foreground">Payment timeline</h2>
        </div>
      </div>

      <div className="mt-6 space-y-4">
        {items.map((item) => (
          <div key={item.id} className="flex gap-4">
            <div className="flex flex-col items-center">
              <span
                className={cn(
                  "mt-1 h-3.5 w-3.5 rounded-full",
                  item.status === "COMPLETED"
                    ? "bg-success"
                    : item.status === "FAILED"
                      ? "bg-danger"
                      : item.status === "CURRENT"
                        ? "bg-accent"
                        : "bg-border-strong",
                )}
              />
              <span className="mt-2 h-full w-px bg-border" />
            </div>
            <div className="pb-5">
              <div className="flex flex-wrap items-center gap-3">
                <h3 className="text-sm font-semibold text-foreground">{item.label}</h3>
                <span className="rounded-full border border-border px-2.5 py-1 text-[11px] uppercase tracking-[0.14em] text-muted">
                  {item.status}
                </span>
              </div>
              <p className="mt-2 text-sm leading-6 text-muted">{item.description}</p>
              <p className="mt-2 text-xs text-muted-soft" title={formatDateTime(item.timestamp)}>
                {formatDateTime(item.timestamp)} • {item.actor}
              </p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
