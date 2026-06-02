import { BadgeCheck, CircleDollarSign, FolderKanban, Users } from "lucide-react";

import { formatCurrency, formatNumber } from "@/lib/formatters";
import type { OrganizationDetails } from "@/types/organization";
import { OrganizationStatusBadge } from "@/features/organizations/components/organization-status-badge";

export function OrganizationKpiCards({ organization }: { organization: OrganizationDetails }) {
  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
      <Card icon={FolderKanban} label="Programs" value={formatNumber(organization.programCount)} />
      <Card icon={Users} label="Beneficiaries" value={formatNumber(organization.beneficiaryCount)} />
      <Card icon={CircleDollarSign} label="Total Distributed" value={formatCurrency(organization.totalDistributed)} />
      <div className="rounded-[28px] border border-border bg-surface p-5 shadow-sm">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-sm text-muted">Status</p>
            <div className="mt-4">
              <OrganizationStatusBadge status={organization.status} />
            </div>
          </div>
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-accent/10 text-accent">
            <BadgeCheck size={20} />
          </div>
        </div>
      </div>
    </div>
  );
}

function Card({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof FolderKanban;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-[28px] border border-border bg-surface p-5 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm text-muted">{label}</p>
          <p className="mt-3 text-3xl font-semibold tracking-tight text-foreground">{value}</p>
        </div>
        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-accent/10 text-accent">
          <Icon size={20} />
        </div>
      </div>
    </div>
  );
}
