"use client";

import { CheckCircle2, CircleDashed, Clock3, XCircle } from "lucide-react";

import { formatDateTime, formatRelativeTime } from "@/lib/formatters";
import type { BulkJobTimelineEvent } from "@/types/bulk-distribution";

function iconFor(status: BulkJobTimelineEvent["status"]) {
  if (status === "COMPLETED") return CheckCircle2;
  if (status === "FAILED") return XCircle;
  if (status === "CURRENT") return CircleDashed;
  return Clock3;
}

export function BulkJobTimeline({ items }: { items: BulkJobTimelineEvent[] }) {
  return (
    <section className="rounded-[28px] border border-border bg-surface p-6 shadow-sm">
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-soft">Timeline</p>
      <h2 className="mt-2 text-xl font-semibold text-foreground">Job events</h2>
      <div className="mt-5 space-y-4">
        {items.map((item, index) => {
          const Icon = iconFor(item.status);

          return (
            <div key={item.id} className="flex gap-4">
              <div className="flex w-8 flex-col items-center">
                <div className="flex h-8 w-8 items-center justify-center rounded-full border border-border bg-surface-muted text-muted">
                  <Icon size={16} />
                </div>
                {index < items.length - 1 ? <div className="mt-2 h-full w-px bg-border" /> : null}
              </div>
              <div className="flex-1 rounded-3xl border border-border bg-surface-muted px-4 py-4">
                <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <p className="text-sm font-semibold text-foreground">{item.label}</p>
                    <p className="mt-1 text-sm text-muted">{item.description}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-foreground" title={formatDateTime(item.timestamp)}>
                      {formatRelativeTime(item.timestamp)}
                    </p>
                    <p className="mt-1 text-xs text-muted-soft">{item.actor}</p>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
