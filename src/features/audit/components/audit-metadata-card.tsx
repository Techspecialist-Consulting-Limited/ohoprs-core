"use client";

import type { AuditLogDetails } from "@/types/audit";

function renderValue(value: unknown) {
  if (value === null || value === undefined) {
    return <span className="text-muted">N/A</span>;
  }

  if (typeof value === "object") {
    return (
      <pre className="overflow-x-auto rounded-2xl bg-[#0f1112] p-3 text-xs text-white/90">
        {JSON.stringify(value, null, 2)}
      </pre>
    );
  }

  return <span className="text-foreground">{String(value)}</span>;
}

export function AuditMetadataCard({ item }: { item: AuditLogDetails }) {
  return (
    <section className="rounded-[28px] border border-border bg-surface p-6 shadow-sm">
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-soft">Metadata</p>
      <h2 className="mt-2 text-xl font-semibold text-foreground">Action metadata</h2>
      <div className="mt-5 space-y-4">
        {Object.entries(item.metadata).map(([key, value]) => (
          <div key={key} className="rounded-3xl border border-border bg-surface-muted px-4 py-4">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-soft">{key}</p>
            <div className="mt-2 text-sm">{renderValue(value)}</div>
          </div>
        ))}
      </div>
    </section>
  );
}
