import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

import { hasPermission } from "@/lib/rbac";
import { cn } from "@/lib/utils";
import type { QuickAction } from "@/types/dashboard";
import type { UserRole } from "@/types/auth";

export function QuickActions({
  actions,
  role,
}: {
  actions: QuickAction[];
  role: UserRole;
}) {
  const visibleActions = actions.filter((action) => !action.permission || hasPermission(role, action.permission));

  return (
    <div className="rounded-[28px] border border-border bg-surface p-6 shadow-sm">
      <div>
        <p className="text-sm font-semibold text-foreground">Quick actions</p>
        <p className="mt-1 text-sm text-muted">Priority actions for the current role and operating scope.</p>
      </div>
      <div className="mt-5 space-y-3">
        {visibleActions.map((action) => (
          <Link
            key={action.id}
            href={action.href}
            className={cn(
              "flex items-center justify-between rounded-2xl border px-4 py-3 text-sm transition",
              action.variant === "primary"
                ? "border-accent/20 bg-accent/10 text-foreground hover:bg-accent/14"
                : "border-border bg-surface-muted text-foreground hover:border-border-strong",
            )}
          >
            <span className="font-medium">{action.label}</span>
            <ArrowUpRight size={16} className="text-muted" />
          </Link>
        ))}
      </div>
    </div>
  );
}
