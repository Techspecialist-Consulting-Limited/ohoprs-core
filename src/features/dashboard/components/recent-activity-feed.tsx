import { ClipboardList, HandCoins, Landmark, ShieldCheck, Users } from "lucide-react";

import { formatDateTime, formatRelativeTime } from "@/lib/formatters";
import type { RecentActivity } from "@/types/dashboard";

const typeIcons = {
  ORGANIZATION: Landmark,
  PROGRAM: ClipboardList,
  BENEFICIARY: Users,
  DISTRIBUTION: HandCoins,
  AUDIT: ShieldCheck,
} as const;

export function RecentActivityFeed({ data }: { data: RecentActivity[] }) {
  return (
    <div className="rounded-[28px] border border-border bg-surface p-6 shadow-sm">
      <div>
        <p className="text-sm font-semibold text-foreground">Recent activity</p>
        <p className="mt-1 text-sm text-muted">Operational activity feed for executive and oversight visibility.</p>
      </div>
      <div className="mt-5 space-y-4">
        {data.length ? (
          data.map((item) => {
            const Icon = typeIcons[item.type];

            return (
              <div key={item.id} className="flex items-start gap-4 rounded-2xl bg-surface-muted px-4 py-3">
                <div className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-accent/10 text-accent">
                  <Icon size={18} />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm text-foreground">
                    <span className="font-semibold">{item.actor}</span> {item.action}{" "}
                    <span className="font-semibold">{item.target}</span>
                  </p>
                </div>
                <span title={formatDateTime(item.timestamp)} className="shrink-0 text-xs text-muted-soft">
                  {formatRelativeTime(item.timestamp)}
                </span>
              </div>
            );
          })
        ) : (
          <div className="rounded-2xl border border-dashed border-border-strong px-4 py-8 text-center text-sm text-muted">
            No recent activities available.
          </div>
        )}
      </div>
    </div>
  );
}
