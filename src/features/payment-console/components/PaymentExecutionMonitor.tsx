"use client";

import { StatusBadge } from "@/components/ui/status-badge";
import { formatNumber } from "@/lib/formatters";
import type { PaymentConsoleExecutionMetrics } from "@/types/payment-console";

export function PaymentExecutionMonitor({ data }: { data: PaymentConsoleExecutionMetrics }) {
  return (
    <div className="rounded-[28px] border border-border bg-surface p-6 shadow-sm">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <p className="text-sm font-semibold text-foreground">Payment progress monitor</p>
          <p className="mt-1 text-sm text-muted">Track how far the current payment batch has progressed and where attention is still required.</p>
        </div>
        <StatusBadge label={`${data.progressPercentage}% complete`} tone={data.progressPercentage >= 100 ? "success" : "warning"} />
      </div>
      <div className="mt-5 h-3 overflow-hidden rounded-full bg-surface-muted">
        <div className="h-full rounded-full bg-accent" style={{ width: `${data.progressPercentage}%` }} />
      </div>
      <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-5">
        <Stat label="Paid" value={formatNumber(data.paidPayments)} />
        <Stat label="Failed" value={formatNumber(data.failedPayments)} />
        <Stat label="Pending" value={formatNumber(data.pendingPayments)} />
        <Stat label="Processing" value={formatNumber(data.processingPayments)} />
        <Stat label="Reversed" value={formatNumber(data.reversedPayments)} />
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl bg-surface-muted p-4">
      <p className="text-xs uppercase tracking-[0.16em] text-muted-soft">{label}</p>
      <p className="mt-2 text-2xl font-semibold text-foreground">{value}</p>
    </div>
  );
}
