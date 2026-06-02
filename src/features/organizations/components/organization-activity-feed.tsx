import { formatDateTime, formatRelativeTime } from "@/lib/formatters";
import type { OrganizationRecentActivity } from "@/types/organization";

export function OrganizationActivityFeed({ items }: { items: OrganizationRecentActivity[] }) {
  return (
    <div className="rounded-[28px] border border-border bg-surface p-6 shadow-sm">
      <div>
        <p className="text-sm font-semibold text-foreground">Recent activity</p>
        <p className="mt-1 text-sm text-muted">Latest organization-level administrative activity.</p>
      </div>
      <div className="mt-5 space-y-3">
        {items.length ? (
          items.map((item) => (
            <div key={item.id} className="rounded-2xl bg-surface-muted px-4 py-3">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-sm text-foreground">
                    <span className="font-semibold">{item.actor}</span> {item.action}
                  </p>
                </div>
                <span className="shrink-0 text-xs text-muted-soft" title={formatDateTime(item.timestamp)}>
                  {formatRelativeTime(item.timestamp)}
                </span>
              </div>
            </div>
          ))
        ) : (
          <div className="rounded-2xl border border-dashed border-border-strong px-4 py-8 text-center text-sm text-muted">
            No recent activities available.
          </div>
        )}
      </div>
    </div>
  );
}
