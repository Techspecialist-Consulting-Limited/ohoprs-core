"use client";

import type { IntegrationSetting } from "@/types/settings";

export function IntegrationCards({ items }: { items: IntegrationSetting[] }) {
  return (
    <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
      {items.map((item) => (
        <div key={item.id} className="rounded-[28px] border border-border bg-surface p-5 shadow-sm">
          <p className="text-lg font-semibold text-foreground">{item.name}</p>
          <p className="mt-2 text-sm text-muted">{item.description}</p>
          <div className="mt-4 flex items-center justify-between">
            <span className="rounded-full border border-border px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-muted">
              {item.category}
            </span>
            <span className="rounded-full border border-border px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-muted">
              {item.status.replaceAll("_", " ")}
            </span>
          </div>
        </div>
      ))}
    </section>
  );
}
