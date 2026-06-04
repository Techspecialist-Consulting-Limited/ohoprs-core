"use client";

import { useMemo, useState } from "react";

import { formatCurrency, formatNumber } from "@/lib/formatters";
import type { OrganizationReportRow } from "@/types/report";

type SortKey = "organizationName" | "programCount" | "beneficiaryCount" | "totalDistributed" | "completionRate";

export function OrganizationReportTable({ rows }: { rows: OrganizationReportRow[] }) {
  const [sortKey, setSortKey] = useState<SortKey>("totalDistributed");
  const [direction, setDirection] = useState<"asc" | "desc">("desc");

  const sortedRows = useMemo(() => {
    return [...rows].sort((a, b) => {
      const aValue = a[sortKey];
      const bValue = b[sortKey];
      if (aValue < bValue) return direction === "asc" ? -1 : 1;
      if (aValue > bValue) return direction === "asc" ? 1 : -1;
      return 0;
    });
  }, [direction, rows, sortKey]);

  function handleSort(nextKey: SortKey) {
    if (nextKey === sortKey) {
      setDirection((current) => (current === "asc" ? "desc" : "asc"));
      return;
    }
    setSortKey(nextKey);
    setDirection("desc");
  }

  return (
    <section className="overflow-hidden rounded-[28px] border border-border bg-surface shadow-sm">
      <div className="overflow-x-auto">
        <table className="min-w-full">
          <thead className="border-b border-border bg-surface-muted text-left text-xs font-semibold uppercase tracking-[0.16em] text-muted-soft">
            <tr>
              <th className="px-5 py-4">Organization</th>
              <SortableHeader label="Interventions" active={sortKey === "programCount"} onClick={() => handleSort("programCount")} />
              <SortableHeader label="Beneficiaries" active={sortKey === "beneficiaryCount"} onClick={() => handleSort("beneficiaryCount")} />
              <SortableHeader label="Total Distributed" active={sortKey === "totalDistributed"} onClick={() => handleSort("totalDistributed")} />
              <SortableHeader label="Completion Rate" active={sortKey === "completionRate"} onClick={() => handleSort("completionRate")} />
            </tr>
          </thead>
          <tbody>
            {sortedRows.map((row) => (
              <tr key={row.organizationId} className="border-b border-border last:border-b-0">
                <td className="px-5 py-4 text-sm font-medium text-foreground">{row.organizationName}</td>
                <td className="px-5 py-4 text-sm text-muted">{formatNumber(row.programCount)}</td>
                <td className="px-5 py-4 text-sm text-muted">{formatNumber(row.beneficiaryCount)}</td>
                <td className="px-5 py-4 text-sm text-foreground">{formatCurrency(row.totalDistributed)}</td>
                <td className="px-5 py-4 text-sm text-foreground">{row.completionRate}%</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

function SortableHeader({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <th className="px-5 py-4">
      <button type="button" onClick={onClick} className={`text-left ${active ? "text-foreground" : "text-muted-soft"}`}>
        {label}
      </button>
    </th>
  );
}
