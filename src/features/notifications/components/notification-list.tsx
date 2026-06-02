"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { formatDateTime, formatRelativeTime } from "@/lib/formatters";
import { notificationService } from "@/services/notification.service";
import type { NotificationItem } from "@/types/notification";

export function NotificationList({ items }: { items: NotificationItem[] }) {
  const queryClient = useQueryClient();
  const mutation = useMutation({
    mutationFn: (id: string) => notificationService.markAsRead(id),
    onSuccess: (response) => {
      if (!response.success) {
        toast.error(response.message);
        return;
      }
      void queryClient.invalidateQueries({ queryKey: ["notifications-dashboard"] });
      toast.success("Notification marked as read");
    },
  });

  return (
    <section className="rounded-[28px] border border-border bg-surface p-6 shadow-sm">
      <p className="text-lg font-semibold text-foreground">Recent notifications</p>
      <p className="mt-1 text-sm text-muted">Internal communication events and admin-facing platform updates.</p>
      <div className="mt-5 space-y-4">
        {items.map((item) => (
          <div key={item.id} className="rounded-3xl border border-border bg-surface-muted px-4 py-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <div className="flex items-center gap-3">
                  <p className="text-sm font-semibold text-foreground">{item.title}</p>
                  {!item.isRead ? (
                    <span className="rounded-full border border-accent/25 bg-accent/10 px-2 py-0.5 text-[11px] font-semibold uppercase tracking-[0.16em] text-accent">
                      Unread
                    </span>
                  ) : null}
                </div>
                <p className="mt-2 text-sm text-muted">{item.description}</p>
              </div>
              <div className="text-right">
                <p className="text-sm text-muted" title={formatDateTime(item.createdAt)}>
                  {formatRelativeTime(item.createdAt)}
                </p>
                {!item.isRead ? (
                  <button
                    type="button"
                    onClick={() => mutation.mutate(item.id)}
                    className="mt-3 inline-flex h-9 items-center rounded-2xl border border-border px-3 text-sm font-medium text-foreground"
                  >
                    Mark as Read
                  </button>
                ) : null}
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
