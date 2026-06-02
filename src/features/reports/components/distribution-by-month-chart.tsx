"use client";

import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

import { formatCurrency } from "@/lib/formatters";
import type { ReportChartPoint } from "@/types/report";

export function DistributionByMonthChart({ data }: { data: ReportChartPoint[] }) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={data}>
        <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
        <XAxis dataKey="label" stroke="var(--color-muted)" />
        <YAxis stroke="var(--color-muted)" tickFormatter={(value) => formatCurrency(value).replace("₦", "")} />
        <Tooltip formatter={(value) => formatCurrency(Number(value ?? 0))} />
        <Bar dataKey="value" fill="var(--color-accent)" radius={[10, 10, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}
