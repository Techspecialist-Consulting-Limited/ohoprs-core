"use client";

import type { ReactNode } from "react";

export function ReportChartCard({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children: ReactNode;
}) {
  return (
    <section className="rounded-[28px] border border-border bg-surface p-6 shadow-sm">
      <p className="text-lg font-semibold text-foreground">{title}</p>
      <p className="mt-1 text-sm text-muted">{description}</p>
      <div className="mt-5 h-[20rem]">{children}</div>
    </section>
  );
}
