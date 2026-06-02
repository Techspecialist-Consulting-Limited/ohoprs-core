"use client";

import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { formatNumber } from "@/lib/formatters";
import type { ChartPoint } from "@/types/dashboard";

export function BeneficiaryGrowthChart({ data }: { data: ChartPoint[] }) {
  const tooltipFormatter = (value: unknown) => {
    const normalized = Array.isArray(value) ? value[0] : value;
    const amount = typeof normalized === "number" ? normalized : Number(normalized ?? 0);
    return [formatNumber(amount), "Beneficiaries"] as [string, string];
  };

  return (
    <div className="rounded-[28px] border border-border bg-surface p-6 shadow-sm">
      <div>
        <p className="text-sm font-semibold text-foreground">Beneficiary growth</p>
        <p className="mt-1 text-sm text-muted">Cumulative beneficiary reach over the last 12 months.</p>
      </div>
      <div className="mt-6 h-80">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data}>
            <CartesianGrid vertical={false} stroke="rgba(128,138,147,0.14)" />
            <XAxis dataKey="label" axisLine={false} tickLine={false} tick={{ fill: "currentColor", fontSize: 12 }} />
            <YAxis hide />
            <Tooltip
              formatter={tooltipFormatter}
              contentStyle={{ borderRadius: "16px", border: "1px solid #dde3e8" }}
            />
            <Line type="monotone" dataKey="value" stroke="#39B04A" strokeWidth={3} dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
