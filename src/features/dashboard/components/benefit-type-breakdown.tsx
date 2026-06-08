"use client";

import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";

import type { ChartPoint } from "@/types/dashboard";

const colors = ["#39B04A", "#8BD398", "#D6EFD9", "#161616"];

export function BenefitTypeBreakdown({ data }: { data: ChartPoint[] }) {
  const tooltipFormatter = (value: unknown) => {
    const normalized = Array.isArray(value) ? value[0] : value;
    const amount = typeof normalized === "number" ? normalized : Number(normalized ?? 0);
    return [`${amount}%`, "Share"] as [string, string];
  };

  return (
    <div className="min-w-0 rounded-[28px] border border-border bg-surface p-6 shadow-sm">
      <div>
        <p className="text-sm font-semibold text-foreground">Intervention type distribution</p>
        <p className="mt-1 text-sm text-muted">Portfolio composition across the active benefit mix.</p>
      </div>
      <div className="mt-4 flex min-w-0 flex-col gap-6 xl:flex-row xl:items-center">
        <div className="h-64 min-w-0 flex-1">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                dataKey="value"
                nameKey="label"
                innerRadius={56}
                outerRadius={86}
                paddingAngle={3}
              >
                {data.map((item, index) => (
                  <Cell key={item.label} fill={colors[index % colors.length]} />
                ))}
              </Pie>
              <Tooltip formatter={tooltipFormatter} contentStyle={{ borderRadius: "16px", border: "1px solid #dde3e8" }} />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div className="min-w-0 flex-1 space-y-3">
          {data.map((item, index) => (
            <div key={item.label} className="flex min-w-0 items-center justify-between gap-3 rounded-2xl bg-surface-muted px-4 py-3">
              <div className="flex min-w-0 items-center gap-3">
                <span className="h-3 w-3 rounded-full" style={{ backgroundColor: colors[index % colors.length] }} />
                <span className="truncate text-sm font-medium text-foreground">{item.label}</span>
              </div>
              <span className="shrink-0 text-sm text-muted">{item.value}%</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
