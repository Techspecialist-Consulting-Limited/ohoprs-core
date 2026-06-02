"use client";

import { useMemo, useState } from "react";

import { formatCurrency, formatNumber } from "@/lib/formatters";
import type { ProgramReportRow } from "@/types/report";

type SortKey = "programName" | "enrolledBeneficiaries" | "totalDistributed" | "successRate";

export function ProgramReportTable({ rows }: { rows: ProgramReportRow[] }) {
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
    if (sortKey === nextKey) {
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
              <th className="px-5 py-4">Program</th>
              <th className="px-5 py-4">Organization</th>
              <th className="px-5 py-4">Benefit Type</th>
              <SortableHeader label="Enrolled Beneficiaries" active={sortKey === "enrolledBeneficiaries"} onClick={() => handleSort("enrolledBeneficiaries")} />
              <SortableHeader label="Total Distributed" active={sortKey === "totalDistributed"} onClick={() => handleSort("totalDistributed")} />
              <SortableHeader label="Success Rate" active={sortKey === "successRate"} onClick={() => handleSort("successRate")} />
            </tr>
          </thead>
          <tbody>
            {sortedRows.map((row) => (
              <tr key={row.programId} className="border-b border-border last:border-b-0">
                <td className="px-5 py-4 text-sm font-medium text-foreground">{row.programName}</td>
                <td className="px-5 py-4 text-sm text-muted">{row.organizationName}</td>
                <td className="px-5 py-4 text-sm text-muted">{row.benefitType}</td>
                <td className="px-5 py-4 text-sm text-muted">{formatNumber(row.enrolledBeneficiaries)}</td>
                <td className="px-5 py-4 text-sm text-foreground">{formatCurrency(row.totalDistributed)}</td>
                <td className="px-5 py-4 text-sm text-foreground">{row.successRate}%</td>
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
