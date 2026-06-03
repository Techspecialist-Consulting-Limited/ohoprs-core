"use client";

import { PaymentStatusBadge } from "@/features/payments/components/payment-status-badge";
import type { PaymentConsoleFailedPaymentPreview } from "@/types/payment-console";

export function FailedPaymentsPreview({ items }: { items: PaymentConsoleFailedPaymentPreview[] }) {
  return (
    <div className="rounded-[28px] border border-border bg-surface p-6 shadow-sm">
      <p className="text-sm font-semibold text-foreground">Failed payment preview</p>
      <p className="mt-1 text-sm text-muted">A focused preview of the most recent exceptions that need retry or remediation.</p>
      <div className="mt-5 space-y-3">
        {items.length ? items.map((item) => (
          <div key={item.id} className="rounded-2xl bg-surface-muted p-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-sm font-semibold text-foreground">{item.beneficiaryName}</p>
                <p className="mt-1 text-sm text-muted">{item.reason}</p>
              </div>
              <PaymentStatusBadge status={item.status} />
            </div>
          </div>
        )) : (
          <p className="text-sm text-muted">No failed payments in the current distribution scope.</p>
        )}
      </div>
    </div>
  );
}
