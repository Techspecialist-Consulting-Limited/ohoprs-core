"use client";

import { formatDateTime } from "@/lib/formatters";
import type { AuditLogDetails } from "@/types/audit";
import { AuditModuleBadge } from "@/features/audit/components/audit-module-badge";
import { AuditResultBadge } from "@/features/audit/components/audit-result-badge";

export function AuditEventSummary({
  item,
  readOnly,
}: {
  item: AuditLogDetails;
  readOnly?: boolean;
}) {
  return (
    <section className="rounded-[32px] border border-border bg-surface p-6 shadow-sm">
      <div className="flex flex-col gap-5 xl:flex-row xl:items-start xl:justify-between">
        <div>
          <div className="flex flex-wrap items-center gap-3">
            
            <AuditModuleBadge module={item.module} />
            <AuditResultBadge result={item.result} />
          </div>
          <h1 className="mt-4 text-3xl font-semibold tracking-tight text-foreground">{item.action}</h1>
          <p className="mt-2 text-sm leading-6 text-muted">{item.description}</p>
        </div>
        <div className="grid gap-3 sm:grid-cols-2 xl:w-[28rem]">
          <SummaryCell label="Timestamp" value={formatDateTime(item.timestamp)} />
          <SummaryCell label="User" value={item.userName} />
          <SummaryCell label="Organization" value={item.organizationName ?? "National"} />
          <SummaryCell label="Resource" value={item.resourceName ?? "N/A"} />
        </div>
      </div>
    </section>
  );
}

function SummaryCell({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-3xl border border-border bg-surface-muted px-4 py-4">
      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-soft">{label}</p>
      <p className="mt-2 text-sm font-medium text-foreground">{value}</p>
    </div>
  );
}
