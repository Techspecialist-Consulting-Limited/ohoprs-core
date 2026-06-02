import { formatCurrency, formatNumber } from "@/lib/formatters";
import type { WorkspaceProgramPreview } from "@/types/workspace";

export function ProgramSummaryPreview({ items }: { items: WorkspaceProgramPreview[] }) {
  return (
    <div className="rounded-[28px] border border-border bg-surface p-6 shadow-sm">
      <div>
        <p className="text-sm font-semibold text-foreground">Program operations</p>
        <p className="mt-1 text-sm text-muted">Active organization programs and current delivery footprint.</p>
      </div>
      <div className="mt-5 grid gap-4 md:grid-cols-2">
        {items.map((item) => (
          <div key={item.id} className="rounded-2xl border border-border bg-surface-muted p-4">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm font-semibold text-foreground">{item.name}</p>
                <p className="mt-1 text-xs text-muted">
                  {item.benefitType} • {item.status}
                </p>
              </div>
            </div>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <Stat label="Beneficiaries" value={formatNumber(item.beneficiaryCount)} />
              <Stat label="Distributed" value={formatCurrency(item.totalDistributed)} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-soft">{label}</p>
      <p className="mt-2 text-sm font-medium text-foreground">{value}</p>
    </div>
  );
}
