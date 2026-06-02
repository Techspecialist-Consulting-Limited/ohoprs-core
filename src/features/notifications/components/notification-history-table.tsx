"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";

import { formatDateTime, formatNumber } from "@/lib/formatters";
import type { NotificationHistory, NotificationHistoryListResponse } from "@/types/notification";
import { NotificationChannelBadge } from "@/features/notifications/components/notification-channel-badge";
import { NotificationStatusBadge } from "@/features/notifications/components/notification-status-badge";

export function NotificationHistoryTable({
  items,
  meta,
  onPageChange,
}: {
  items: NotificationHistory[];
  meta: NotificationHistoryListResponse["meta"];
  onPageChange: (page: number) => void;
}) {
  return (
    <div className="overflow-hidden rounded-[28px] border border-border bg-surface shadow-sm">
      <div className="overflow-x-auto">
        <table className="min-w-full">
          <thead className="border-b border-border bg-surface-muted text-left text-xs font-semibold uppercase tracking-[0.16em] text-muted-soft">
            <tr>
              {["Date", "Channel", "Type", "Recipient", "Status", "Trigger Source"].map((label) => (
                <th key={label} className="px-5 py-4">{label}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {items.map((item) => (
              <tr key={item.id} className="border-b border-border last:border-b-0">
                <td className="px-5 py-4 text-sm text-muted">{formatDateTime(item.sentAt)}</td>
                <td className="px-5 py-4"><NotificationChannelBadge channel={item.channel} /></td>
                <td className="px-5 py-4 text-sm text-foreground">{item.type.replaceAll("_", " ")}</td>
                <td className="px-5 py-4 text-sm text-muted">{item.recipient}</td>
                <td className="px-5 py-4"><NotificationStatusBadge status={item.status} /></td>
                <td className="px-5 py-4 text-sm text-muted">{item.triggerSource}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="flex flex-col gap-4 border-t border-border px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-muted">
          Showing page {meta.page} of {meta.totalPages} ({formatNumber(meta.total)} records)
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
