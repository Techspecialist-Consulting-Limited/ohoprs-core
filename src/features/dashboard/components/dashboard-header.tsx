import { BadgeCheck, Building2 } from "lucide-react";

import type { DashboardResponse } from "@/types/dashboard";
import type { UserRole } from "@/types/auth";

const roleLabels: Record<UserRole, string> = {
  SUPER_ADMIN: "Super Admin",
  ORG_ADMIN: "Organization Admin",
  PROGRAM_OFFICER: "Program Officer",
  AUDITOR: "Auditor",
};

export function DashboardHeader({
  dashboard,
  role,
}: {
  dashboard: DashboardResponse;
  role: UserRole;
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
          {roleLabels[role]}
        </span>
      </div>
      <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">{dashboard.title}</h1>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-muted sm:text-base">{dashboard.subtitle}</p>
        </div>
        <div className="rounded-3xl border border-border bg-surface-muted px-4 py-3">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-soft">Scope</p>
          <p className="mt-2 text-sm font-semibold text-foreground">
            {dashboard.scope === "NATIONAL" ? "National command view" : "Organization command view"}
          </p>
        </div>
      </div>
    </div>
  );
}
