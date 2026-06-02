import Link from "next/link";
import { Building2, Pencil } from "lucide-react";

import { formatDateTime } from "@/lib/formatters";
import type { OrganizationDetails } from "@/types/organization";
import { OrganizationStatusBadge } from "@/features/organizations/components/organization-status-badge";

export function OrganizationDetailsHeader({
  canEdit,
  organization,
}: {
  canEdit: boolean;
  organization: OrganizationDetails;
}) {
  return (
    <div className="rounded-[32px] border border-border bg-surface p-6 shadow-sm sm:p-8">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="flex gap-4">
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-accent/10 text-accent">
            <Building2 size={24} />
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="text-3xl font-semibold tracking-tight text-foreground">{organization.name}</h1>
              <OrganizationStatusBadge status={organization.status} />
            </div>
            <p className="mt-2 text-sm text-muted">{organization.description}</p>
            <p className="mt-3 text-xs text-muted-soft">
              Created {formatDateTime(organization.createdAt)} • Updated {formatDateTime(organization.updatedAt)}
            </p>
          </div>
        </div>

        {canEdit ? (
          <Link
            href={`/organizations/${organization.id}/edit`}
            className="inline-flex h-11 items-center gap-2 rounded-2xl bg-accent px-4 text-sm font-semibold text-accent-foreground"
          >
            <Pencil size={16} />
            Edit Organization
          </Link>
        ) : null}
      </div>
    </div>
  );
}
