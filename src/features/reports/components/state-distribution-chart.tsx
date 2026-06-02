"use client";

import { ResponsiveContainer, Tooltip, XAxis, YAxis, AreaChart, Area, CartesianGrid } from "recharts";

import { formatCurrency } from "@/lib/formatters";
import type { ReportChartPoint } from "@/types/report";

export function StateDistributionChart({
  data,
  currency = false,
}: {
  data: ReportChartPoint[];
  currency?: boolean;
}) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <AreaChart data={data}>
        <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
        <XAxis dataKey="label" stroke="var(--color-muted)" />
        <YAxis stroke="var(--color-muted)" tickFormatter={(value) => (currency ? formatCurrency(value).replace("₦", "") : value)} />
        <Tooltip formatter={(value) => (currency ? formatCurrency(Number(value ?? 0)) : Number(value ?? 0).toLocaleString())} />
        <Area type="monotone" dataKey="value" stroke="var(--color-accent)" fill="rgba(57,176,74,0.22)" strokeWidth={2} />
      </AreaChart>
    </ResponsiveContainer>
  );
}
