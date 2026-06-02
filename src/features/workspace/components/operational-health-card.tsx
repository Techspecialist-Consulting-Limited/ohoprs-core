import { AlertTriangle, CheckCircle2, Siren } from "lucide-react";

import type { OperationalHealthItem } from "@/types/workspace";

const statusMap = {
  GOOD: { icon: CheckCircle2, className: "text-success", label: "Good" },
  WARNING: { icon: AlertTriangle, className: "text-warning", label: "Warning" },
  CRITICAL: { icon: Siren, className: "text-danger", label: "Critical" },
} as const;

export function OperationalHealthCard({ items }: { items: OperationalHealthItem[] }) {
  return (
    <div className="rounded-[28px] border border-border bg-surface p-6 shadow-sm">
      <div>
        <p className="text-sm font-semibold text-foreground">Operational health</p>
        <p className="mt-1 text-sm text-muted">Current operational readiness and risk signals for this organization.</p>
      </div>
      <div className="mt-5 space-y-3">
        {items.map((item) => {
          const status = statusMap[item.status];
          const Icon = status.icon;

          return (
            <div key={item.label} className="rounded-2xl bg-surface-muted px-4 py-3">
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <Icon size={18} className={status.className} />
                  <p className="text-sm font-medium text-foreground">{item.label}</p>
                </div>
                <span className={`text-xs font-semibold uppercase tracking-[0.18em] ${status.className}`}>
                  {status.label}
                </span>
              </div>
              <p className="mt-2 text-sm text-muted">{item.description}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
