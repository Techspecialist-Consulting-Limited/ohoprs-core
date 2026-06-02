"use client";

import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";

import { formatDateTime, formatNumber } from "@/lib/formatters";
import type { AuditLog, AuditLogListMeta } from "@/types/audit";
import { AuditModuleBadge } from "@/features/audit/components/audit-module-badge";
import { AuditResultBadge } from "@/features/audit/components/audit-result-badge";

export function AuditLogTable({
  items,
  meta,
  onPageChange,
}: {
  items: AuditLog[];
  meta: AuditLogListMeta;
  onPageChange: (page: number) => void;
}) {
  return (
    <div className="overflow-hidden rounded-[28px] border border-border bg-surface shadow-sm">
      <div className="overflow-x-auto">
        <table className="min-w-full">
          <thead className="border-b border-border bg-surface-muted text-left text-xs font-semibold uppercase tracking-[0.16em] text-muted-soft">
            <tr>
              {["Timestamp", "User", "Role", "Organization", "Module", "Action", "Resource", "Result", "IP Address", "Actions"].map((label) => (
                <th key={label} className="px-5 py-4">{label}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {items.map((item) => (
              <tr key={item.id} className="border-b border-border last:border-b-0">
                <td className="px-5 py-4 text-sm text-muted">{formatDateTime(item.timestamp)}</td>
                <td className="px-5 py-4">
                  <div>
                    <p className="text-sm font-medium text-foreground">{item.userName}</p>
                    <p className="mt-1 text-xs text-muted">{item.userEmail ?? "No email"}</p>
                  </div>
                </td>
                <td className="px-5 py-4 text-sm text-muted">{item.role.replaceAll("_", " ")}</td>
                <td className="px-5 py-4 text-sm text-muted">{item.organizationName ?? "National"}</td>
                <td className="px-5 py-4"><AuditModuleBadge module={item.module} /></td>
                <td className="px-5 py-4 text-sm text-foreground">{item.action}</td>
                <td className="px-5 py-4 text-sm text-muted">{item.resourceName ?? "N/A"}</td>
                <td className="px-5 py-4"><AuditResultBadge result={item.result} /></td>
                <td className="px-5 py-4 text-sm text-muted">{item.ipAddress}</td>
                <td className="px-5 py-4">
                  <Link href={`/audit-logs/${item.id}`} className="inline-flex h-10 items-center rounded-2xl border border-border px-4 text-sm font-medium text-foreground">
                    View Details
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="flex flex-col gap-4 border-t border-border px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-muted">
          Showing page {meta.page} of {meta.totalPages} ({formatNumber(meta.total)} audit events)
        </p>
        <div className="flex items-center gap-2">
          <button
            type="button"
            disabled={meta.page === 1}
            onClick={() => onPageChange(meta.page - 1)}
            className="inline-flex h-10 items-center gap-2 rounded-2xl border border-border px-3 text-sm text-foreground disabled:opacity-50"
          >
            <ChevronLeft size={16} />
            Previous
          </button>
          <button
            type="button"
            disabled={meta.page === meta.totalPages}
            onClick={() => onPageChange(meta.page + 1)}
            className="inline-flex h-10 items-center gap-2 rounded-2xl border border-border px-3 text-sm text-foreground disabled:opacity-50"
          >
            Next
            <ChevronRight size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}
