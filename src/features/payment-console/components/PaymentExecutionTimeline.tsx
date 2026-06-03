"use client";

import type { PaymentConsoleTimelineItem } from "@/types/payment-console";

export function PaymentExecutionTimeline({ items, title = "Execution timeline" }: { items: PaymentConsoleTimelineItem[]; title?: string }) {
  return (
    <div className="rounded-[28px] border border-border bg-surface p-6 shadow-sm">
      <p className="text-sm font-semibold text-foreground">{title}</p>
      <p className="mt-1 text-sm text-muted">Chronological view of execution, reversal, and governance events affecting this distribution.</p>
      <div className="mt-6 space-y-5">
        {items.map((item) => (
          <div key={item.id} className="flex gap-4">
            <div className="flex w-8 flex-col items-center">
              <span className={`mt-1 h-3 w-3 rounded-full ${toneClass(item.tone)}`} />
              <div className="mt-2 h-full w-px bg-border" />
            </div>
            <div className="min-w-0 flex-1 rounded-3xl bg-surface-muted px-4 py-4">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <p className="text-sm font-semibold text-foreground">{item.label}</p>
                  <p className="mt-1 text-sm text-muted">{item.description}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-foreground">{new Date(item.timestamp).toLocaleString()}</p>
                  <p className="mt-1 text-xs text-muted-soft">{item.actor}</p>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function toneClass(tone: PaymentConsoleTimelineItem["tone"]) {
  if (tone === "success") return "bg-success";
  if (tone === "warning") return "bg-warning";
  if (tone === "danger") return "bg-danger";
  return "bg-muted";
}
