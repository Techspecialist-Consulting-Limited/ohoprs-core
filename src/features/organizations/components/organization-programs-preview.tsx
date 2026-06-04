import { formatNumber } from "@/lib/formatters";
import type { OrganizationProgramPreview } from "@/types/organization";

export function OrganizationProgramsPreview({ items }: { items: OrganizationProgramPreview[] }) {
  return (
    <div className="rounded-[28px] border border-border bg-surface p-6 shadow-sm">
      <div>
        <p className="text-sm font-semibold text-foreground">Programs preview</p>
        <p className="mt-1 text-sm text-muted">Selected program records linked to this organization.</p>
      </div>
      <div className="mt-5 space-y-3">
        {items.length ? (
          items.map((item) => (
            <div key={item.id} className="rounded-2xl bg-surface-muted px-4 py-3">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold text-foreground">{item.name}</p>
                  <p className="mt-1 text-xs text-muted">
                    {item.benefitType} • {item.status}
                  </p>
                </div>
                <span className="text-sm text-foreground">{formatNumber(item.beneficiaryCount)} beneficiaries</span>
              </div>
            </div>
          ))
        ) : (
          <div className="rounded-2xl border border-dashed border-border-strong px-4 py-8 text-center text-sm text-muted">
            Program management will be available here.
          </div>
        )}
      </div>
    </div>
  );
}
