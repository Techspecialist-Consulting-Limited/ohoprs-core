"use client";

import Link from "next/link";

import type { NotificationTemplate } from "@/types/notification";
import { NotificationChannelBadge } from "@/features/notifications/components/notification-channel-badge";

export function NotificationTemplateCard({ item }: { item: NotificationTemplate }) {
  return (
    <Link href={`/notifications/templates/${item.id}`} className="rounded-[28px] border border-border bg-surface p-5 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-lg font-semibold text-foreground">{item.name}</p>
          <p className="mt-1 text-sm text-muted">
            {item.scope === "GLOBAL" ? "Global template" : item.organizationName ?? "Organization template"}
          </p>
        </div>
        <NotificationChannelBadge channel={item.channel} />
      </div>
      <p className="mt-3 text-sm text-muted">{item.type.replaceAll("_", " ")}</p>
      <p className="mt-3 line-clamp-3 text-sm text-muted">{item.content}</p>
      <div className="mt-4 inline-flex rounded-full border border-border px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-muted">
        {item.isActive ? "Active" : "Inactive"}
      </div>
    </Link>
  );
}
