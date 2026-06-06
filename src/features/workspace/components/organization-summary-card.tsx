import type { WorkspaceOrganizationSummary } from "@/types/workspace";
import { OrganizationStatusBadge } from "@/features/organizations/components/organization-status-badge";

export function OrganizationSummaryCard({ organization }: { organization: WorkspaceOrganizationSummary }) {
  return (
    <div className="rounded-[28px] border border-border bg-surface p-6 shadow-sm">
      <div>
        <p className="text-sm font-semibold text-foreground">Organization summary</p>
        <p className="mt-1 text-sm text-muted">Core identity and operational contact profile for the current workspace.</p>
      </div>
      <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <Info label="Organization Name" value={organization.name} />
        <Info label="Acronym" value={organization.shortName} />
        <Info label="Type" value={organization.type.replaceAll("_", " ")} />
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-soft">Status</p>
          <div className="mt-2">
            <OrganizationStatusBadge status={organization.status as never} />
          </div>
        </div>
        <Info label="State" value={organization.state} />
        <Info label="Contact Email" value={organization.contactEmail} />
        <Info label="Contact Phone" value={organization.contactPhone} />
        <Info label="Address" value={organization.address} />
      </div>
    </div>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-soft">{label}</p>
      <p className="mt-2 text-sm text-foreground">{value}</p>
    </div>
  );
}
