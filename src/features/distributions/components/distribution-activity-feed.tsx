"use client";

import { Activity } from "lucide-react";

import { formatDateTime, formatRelativeTime } from "@/lib/formatters";
import type { DistributionActivityItem } from "@/types/distribution";

export function DistributionActivityFeed({ items }: { items: DistributionActivityItem[] }) {
  return (
    <section className="rounded-[28px] border border-border bg-surface p-6 shadow-sm">
      <div className="mb-5">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-soft">Activity</p>
        <h2 className="mt-2 text-xl font-semibold text-foreground">Recent activities</h2>
      </div>
      <div className="space-y-4">
        {items.map((item) => (
          <div key={item.id} className="flex gap-3 rounded-3xl border border-border bg-surface-muted px-4 py-4">
            <div className="mt-0.5 flex h-9 w-9 items-center justify-center rounded-full bg-accent/10 text-accent">
              <Activity size={18} />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-foreground">{item.action}</p>
              <p className="mt-1 text-sm text-muted">{item.actor}</p>
            </div>
            <p className="text-right text-xs text-muted-soft" title={formatDateTime(item.timestamp)}>
              {formatRelativeTime(item.timestamp)}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
