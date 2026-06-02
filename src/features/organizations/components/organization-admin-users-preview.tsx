import type { OrganizationAdminPreview } from "@/types/organization";

export function OrganizationAdminUsersPreview({ items }: { items: OrganizationAdminPreview[] }) {
  return (
    <div className="rounded-[28px] border border-border bg-surface p-6 shadow-sm">
      <div>
        <p className="text-sm font-semibold text-foreground">Admin users preview</p>
        <p className="mt-1 text-sm text-muted">Initial user roster linked to the organization.</p>
      </div>
      <div className="mt-5 space-y-3">
        {items.map((item) => (
          <div key={item.id} className="rounded-2xl bg-surface-muted px-4 py-3">
            <p className="text-sm font-semibold text-foreground">{item.name}</p>
            <p className="mt-1 text-sm text-muted">{item.role}</p>
            <p className="mt-1 text-xs text-muted-soft">{item.email}</p>
          </div>
        ))}
      </div>
      <p className="mt-4 text-xs text-muted-soft">Full user management will be implemented in a later phase.</p>
    </div>
  );
}
