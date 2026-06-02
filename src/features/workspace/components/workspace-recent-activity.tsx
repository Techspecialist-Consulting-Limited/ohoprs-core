import { ClipboardList, HandCoins, ShieldCheck, Users } from "lucide-react";

import { formatDateTime, formatRelativeTime } from "@/lib/formatters";
import type { WorkspaceActivity } from "@/types/workspace";

const typeIcons = {
  PROGRAM: ClipboardList,
  BENEFICIARY: Users,
  DISTRIBUTION: HandCoins,
  AUDIT: ShieldCheck,
} as const;

export function WorkspaceRecentActivity({ items }: { items: WorkspaceActivity[] }) {
  return (
    <div className="rounded-[28px] border border-border bg-surface p-6 shadow-sm">
      <div>
        <p className="text-sm font-semibold text-foreground">Recent activity</p>
        <p className="mt-1 text-sm text-muted">Latest organization-level actions across programs, beneficiaries, and distributions.</p>
      </div>
      <div className="mt-5 space-y-3">
        {items.map((item) => {
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
              <span className="shrink-0 text-xs text-muted-soft" title={formatDateTime(item.timestamp)}>
                {formatRelativeTime(item.timestamp)}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
