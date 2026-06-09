"use client";

import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";

import type { ReportChartPoint } from "@/types/report";

const colors = ["#39B04A", "#7BC97A", "#161616", "#94A3B8", "#D1E7D4"];

export function BenefitTypeChart({ data }: { data: ReportChartPoint[] }) {
  return (
    <div className="flex h-full flex-col lg:flex-row lg:items-center lg:gap-6">
      <div className="order-2 mt-4 lg:order-1 lg:mt-0 lg:flex-1">
        <div className="grid justify-start gap-2 sm:grid-cols-2 lg:grid-cols-1">
          {data.map((entry, index) => (
            <div
              key={entry.label}
              className="inline-flex w-fit min-w-[180px] max-w-full items-center justify-between gap-3 rounded-2xl border border-border bg-surface-muted px-3 py-2"
            >
              <div className="flex items-center gap-2">
                <span className="h-3 w-3 rounded-full" style={{ backgroundColor: colors[index % colors.length] }} />
                <span className="text-sm text-foreground">{entry.label}</span>
              </div>
              <span className="text-sm font-medium text-muted">{entry.value.toLocaleString()}</span>
            </div>
          ))}
        </div>
      </div>
      <div className="order-1 h-[220px] w-full lg:order-2 lg:h-[240px] lg:w-[260px] lg:flex-none">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart margin={{ top: 12, right: 12, bottom: 12, left: 12 }}>
            <Pie
              data={data}
              dataKey="value"
              nameKey="label"
              cx="50%"
              cy="50%"
              innerRadius={52}
              outerRadius={78}
              paddingAngle={2}
            >
              {data.map((entry, index) => (
                <Cell key={entry.label} fill={colors[index % colors.length]} />
              ))}
            </Pie>
            <Tooltip />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
