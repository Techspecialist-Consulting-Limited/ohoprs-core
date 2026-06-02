import { type LucideIcon, TrendingUp } from "lucide-react";

import { StatusBadge } from "@/components/ui/status-badge";

export function MetricCard({
  change,
  icon: Icon = TrendingUp,
  label,
  tone = "success",
  value,
}: {
  change: string;
  icon?: LucideIcon;
  label: string;
  tone?: "neutral" | "success" | "warning";
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
      <div className="mt-4">
        <StatusBadge label={change} tone={tone} />
      </div>
    </div>
  );
}
