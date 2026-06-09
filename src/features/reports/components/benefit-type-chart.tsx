"use client";

import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";

import type { ReportChartPoint } from "@/types/report";

const colors = ["#39B04A", "#7BC97A", "#161616", "#94A3B8", "#D1E7D4"];

export function BenefitTypeChart({ data }: { data: ReportChartPoint[] }) {
  return (
    <div className="flex h-full flex-col">
      <div className="min-h-0 flex-1">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie data={data} dataKey="value" nameKey="label" innerRadius={64} outerRadius={96} paddingAngle={2}>
              {data.map((entry, index) => (
                <Cell key={entry.label} fill={colors[index % colors.length]} />
              ))}
            </Pie>
            <Tooltip />
          </PieChart>
        </ResponsiveContainer>
      </div>
      <div className="mt-4 grid gap-2 sm:grid-cols-2">
        {data.map((entry, index) => (
          <div key={entry.label} className="flex items-center justify-between gap-3 rounded-2xl border border-border bg-surface-muted px-3 py-2">
            <div className="flex items-center gap-2">
              <span className="h-3 w-3 rounded-full" style={{ backgroundColor: colors[index % colors.length] }} />
              <span className="text-sm text-foreground">{entry.label}</span>
            </div>
            <span className="text-sm font-medium text-muted">{entry.value.toLocaleString()}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
