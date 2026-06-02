"use client";

import Link from "next/link";

import type { RelatedAuditRecord } from "@/types/audit";

function hrefFor(record: RelatedAuditRecord) {
  if (record.type === "ORGANIZATION") return `/organizations/${record.id}`;
  if (record.type === "PROGRAM") return `/programs/${record.id}`;
  if (record.type === "BENEFICIARY") return `/beneficiaries/${record.id}`;
  if (record.type === "DISTRIBUTION") return `/distributions/${record.id}`;
  if (record.type === "BULK_DISTRIBUTION") return `/distributions/bulk/${record.id}`;
  return null;
}

export function RelatedRecordsCard({ items }: { items: RelatedAuditRecord[] }) {
  return (
    <section className="rounded-[28px] border border-border bg-surface p-6 shadow-sm">
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-soft">Related records</p>
      <h2 className="mt-2 text-xl font-semibold text-foreground">Linked platform records</h2>
      <div className="mt-5 space-y-3">
        {items.map((item) => {
          const href = hrefFor(item);
          return href ? (
            <Link key={`${item.type}-${item.id}`} href={href} className="block rounded-3xl border border-border bg-surface-muted px-4 py-4">
              <p className="text-sm font-medium text-foreground">{item.name}</p>
              <p className="mt-1 text-xs text-muted-soft">{item.type.replaceAll("_", " ")}</p>
            </Link>
          ) : (
            <div key={`${item.type}-${item.id}`} className="rounded-3xl border border-border bg-surface-muted px-4 py-4">
              <p className="text-sm font-medium text-foreground">{item.name}</p>
              <p className="mt-1 text-xs text-muted-soft">{item.type.replaceAll("_", " ")}</p>
            </div>
          );
        })}
      </div>
    </section>
  );
}
