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
    <div className="rounded-[28px] border border-border bg-surface p-6 shadow-sm">
      <div>
        <p className="text-sm font-semibold text-foreground">Programs by benefit type</p>
        <p className="mt-1 text-sm text-muted">Portfolio composition across the active benefit mix.</p>
      </div>
      <div className="mt-4 grid gap-6 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
        <div className="h-64">
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
        <div className="space-y-3">
          {data.map((item, index) => (
            <div key={item.label} className="flex items-center justify-between rounded-2xl bg-surface-muted px-4 py-3">
              <div className="flex items-center gap-3">
                <span className="h-3 w-3 rounded-full" style={{ backgroundColor: colors[index % colors.length] }} />
                <span className="text-sm font-medium text-foreground">{item.label}</span>
              </div>
              <span className="text-sm text-muted">{item.value}%</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
