"use client";

import { CheckCircle2 } from "lucide-react";

import { formatDateTime, formatRelativeTime } from "@/lib/formatters";
import type { AuditTimelineItem } from "@/types/audit";

export function AuditTimeline({ items }: { items: AuditTimelineItem[] }) {
  return (
    <section className="rounded-[28px] border border-border bg-surface p-6 shadow-sm">
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-soft">Timeline</p>
      <h2 className="mt-2 text-xl font-semibold text-foreground">Audit record lifecycle</h2>
      <div className="mt-5 space-y-4">
        {items.map((item, index) => (
          <div key={item.id} className="flex gap-4">
            <div className="flex w-8 flex-col items-center">
              <div className="flex h-8 w-8 items-center justify-center rounded-full border border-border bg-surface-muted text-muted">
                <CheckCircle2 size={16} />
              </div>
              {index < items.length - 1 ? <div className="mt-2 h-full w-px bg-border" /> : null}
            </div>
            <div className="flex-1 rounded-3xl border border-border bg-surface-muted px-4 py-4">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                <p className="text-sm font-medium text-foreground">{item.label}</p>
                <p className="text-right text-sm text-muted" title={formatDateTime(item.timestamp)}>
                  {formatRelativeTime(item.timestamp)}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
