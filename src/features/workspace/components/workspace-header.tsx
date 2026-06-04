import { Building2, Eye, ShieldCheck } from "lucide-react";

import type { OrganizationWorkspaceResponse } from "@/types/workspace";
import type { UserRole } from "@/types/auth";

const roleLabels: Record<UserRole, string> = {
  SUPER_ADMIN: "Super Admin",
  ORG_ADMIN: "Organization Admin",
  PROGRAM_OFFICER: "Program Officer",
  AUDITOR: "Auditor",
};

export function WorkspaceHeader({
  role,
  workspace,
}: {
  role: UserRole;
  workspace: OrganizationWorkspaceResponse;
}) {
  return (
    <div className="flex flex-col gap-5 rounded-[32px] border border-border bg-surface p-6 shadow-sm sm:p-8">
      <div className="flex flex-wrap items-center gap-3">
        <span className="inline-flex items-center gap-2 rounded-full border border-accent/20 bg-accent/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.22em] text-accent">
          <Building2 size={14} />
          Organization workspace
        </span>
        <span className="inline-flex items-center gap-2 rounded-full border border-border bg-surface-muted px-3 py-1 text-xs font-semibold text-muted">
          <ShieldCheck size={14} />
          {roleLabels[role]}
        </span>
        {role === "AUDITOR" ? (
          <span className="inline-flex items-center gap-2 rounded-full border border-warning/20 bg-warning/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-warning">
            <Eye size={14} />
            Read-only oversight view
          </span>
        ) : null}
      </div>
      <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
            {workspace.organization.shortName} Operational Overview
          </h1>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-muted sm:text-base">
            Organization-level command center for intervention operations, beneficiary coverage, distribution activity, and operational health.
          </p>
        </div>
        <div className="rounded-3xl border border-border bg-surface-muted px-4 py-3">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-soft">Workspace scope</p>
          <p className="mt-2 text-sm font-semibold text-foreground">
            {workspace.organization.name}
          </p>
        </div>
      </div>
    </div>
  );
}
