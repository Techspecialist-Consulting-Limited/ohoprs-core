"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { formatCurrency } from "@/lib/formatters";
import type { ChartPoint } from "@/types/dashboard";

export function DistributionOverviewChart({ data }: { data: ChartPoint[] }) {
  const tooltipFormatter = (value: unknown) => {
    const normalized = Array.isArray(value) ? value[0] : value;
    const amount = typeof normalized === "number" ? normalized : Number(normalized ?? 0);
    return [formatCurrency(amount), "Distributed"] as [string, string];
  };

  return (
    <div className="rounded-[28px] border border-border bg-surface p-6 shadow-sm">
      <div>
        <p className="text-sm font-semibold text-foreground">Distribution overview</p>
        <p className="mt-1 text-sm text-muted">12-month distribution trend across the current executive scope.</p>
      </div>
      <div className="mt-6 h-80">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data}>
            <CartesianGrid vertical={false} stroke="rgba(128,138,147,0.14)" />
            <XAxis dataKey="label" axisLine={false} tickLine={false} tick={{ fill: "currentColor", fontSize: 12 }} />
            <YAxis hide />
            <Tooltip
              formatter={tooltipFormatter}
              contentStyle={{ borderRadius: "16px", border: "1px solid #dde3e8" }}
            />
            <Bar dataKey="value" fill="#39B04A" radius={[10, 10, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
