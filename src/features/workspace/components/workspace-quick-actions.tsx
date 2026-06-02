import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

import type { WorkspaceQuickAction } from "@/types/workspace";

export function WorkspaceQuickActions({ actions }: { actions: WorkspaceQuickAction[] }) {
  return (
    <div className="rounded-[28px] border border-border bg-surface p-6 shadow-sm">
      <div>
        <p className="text-sm font-semibold text-foreground">Quick actions</p>
        <p className="mt-1 text-sm text-muted">Role-aware shortcuts into related operational areas.</p>
      </div>
      <div className="mt-5 space-y-3">
        {actions.map((action) => (
          <Link
            key={action.id}
            href={action.href}
            className="flex items-center justify-between rounded-2xl border border-border bg-surface-muted px-4 py-3 text-sm text-foreground transition hover:border-border-strong"
          >
            <span className="font-medium">{action.label}</span>
            <ArrowUpRight size={16} className="text-muted" />
          </Link>
        ))}
      </div>
    </div>
  );
}
