"use client";

import { Bar, BarChart, CartesianGrid, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis, Cell } from "recharts";

import type { NotificationDashboardData } from "@/types/notification";

const pieColors = ["#39B04A", "#161616", "#7BC97A", "#D7E6DA"];

export function NotificationActivityChart({ data }: { data: NotificationDashboardData }) {
  return (
    <section className="grid gap-4 xl:grid-cols-[1.2fr_0.8fr]">
      <div className="rounded-[28px] border border-border bg-surface p-6 shadow-sm">
        <p className="text-lg font-semibold text-foreground">Notifications sent per day</p>
        <p className="mt-1 text-sm text-muted">Outbound notification volume across recent days.</p>
        <div className="mt-5 h-[20rem]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data.activityChart}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
              <XAxis dataKey="label" stroke="var(--color-muted)" />
              <YAxis stroke="var(--color-muted)" />
              <Tooltip formatter={(value) => Number(value ?? 0).toLocaleString()} />
              <Bar dataKey="value" fill="var(--color-accent)" radius={[10, 10, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="rounded-[28px] border border-border bg-surface p-6 shadow-sm">
        <p className="text-lg font-semibold text-foreground">Delivery breakdown</p>
        <p className="mt-1 text-sm text-muted">Compact delivery quality snapshot.</p>
        <div className="mt-5 h-[20rem]">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie data={data.deliveryBreakdown} dataKey="value" nameKey="label" innerRadius={55} outerRadius={90}>
                {data.deliveryBreakdown.map((entry, index) => (
                  <Cell key={entry.label} fill={pieColors[index % pieColors.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(value) => Number(value ?? 0).toLocaleString()} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    </section>
  );
}
