import { BadgeCheck, Building2 } from "lucide-react";

import type { DashboardResponse } from "@/types/dashboard";

export function DashboardHeader({
  dashboard,
  userName,
}: {
  dashboard: DashboardResponse;
  userName: string;
}) {
  return (
    <div className="flex flex-col gap-5 rounded-[32px] border border-border bg-surface p-6 shadow-sm sm:p-8">
      <div className="flex flex-wrap items-center gap-3">
        <span className="inline-flex items-center gap-2 rounded-full border border-accent/20 bg-accent/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.22em] text-accent">
          <BadgeCheck size={14} />
          Executive dashboard
        </span>
        <span className="inline-flex items-center gap-2 rounded-full border border-border bg-surface-muted px-3 py-1 text-xs font-semibold text-muted">
          <Building2 size={14} />
          {userName}
        </span>
      </div>
      <div>
        <div>
          <h1 className="text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">{dashboard.title}</h1>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-muted sm:text-base">{dashboard.subtitle}</p>
        </div>
      </div>
    </div>
  );
}
