"use client";

import { Pagination } from "@/components/ui/pagination";
import { formatDateTime } from "@/lib/formatters";
import type { NotificationHistory, NotificationHistoryListResponse } from "@/types/notification";
import { NotificationChannelBadge } from "@/features/notifications/components/notification-channel-badge";
import { NotificationStatusBadge } from "@/features/notifications/components/notification-status-badge";

export function NotificationHistoryTable({
  items,
  meta,
  onPageChange,
  onLimitChange,
  isFetching,
}: {
  items: NotificationHistory[];
  meta: NotificationHistoryListResponse["meta"];
  onPageChange: (page: number) => void;
  onLimitChange?: (limit: number) => void;
  isFetching?: boolean;
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
      <Pagination
        meta={meta}
        onPageChange={onPageChange}
        onLimitChange={onLimitChange}
        isFetching={isFetching}
        itemLabel="records"
      />
    </div>
  );
}
