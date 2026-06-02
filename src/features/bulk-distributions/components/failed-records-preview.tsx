"use client";

import type { FailedBulkRecord } from "@/types/bulk-distribution";

export function FailedRecordsPreview({ items }: { items: FailedBulkRecord[] }) {
  return (
    <section className="rounded-[28px] border border-border bg-surface p-6 shadow-sm">
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-soft">Exceptions</p>
      <h2 className="mt-2 text-xl font-semibold text-foreground">Failed records preview</h2>
      <div className="mt-5 overflow-hidden rounded-3xl border border-border">
        <table className="min-w-full">
          <thead className="bg-surface-muted text-left text-xs font-semibold uppercase tracking-[0.16em] text-muted-soft">
            <tr>
              {["Beneficiary", "Beneficiary ID", "Reason", "Status"].map((label) => (
                <th key={label} className="px-4 py-3">{label}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {items.map((item) => (
              <tr key={item.id} className="border-t border-border text-sm text-foreground">
                <td className="px-4 py-3">{item.beneficiaryName}</td>
                <td className="px-4 py-3 text-muted">{item.beneficiaryId}</td>
                <td className="px-4 py-3 text-muted">{item.reason}</td>
                <td className="px-4 py-3">
                  <span className="rounded-full border border-border px-3 py-1 text-xs font-medium text-muted">
                    {item.status.replaceAll("_", " ")}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
