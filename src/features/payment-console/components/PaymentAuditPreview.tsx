"use client";

import Link from "next/link";

import { StatusBadge } from "@/components/ui/status-badge";
import type { PaymentConsoleAuditPreviewItem } from "@/types/payment-console";

export function PaymentAuditPreview({ items, distributionId }: { items: PaymentConsoleAuditPreviewItem[]; distributionId: string }) {
  return (
    <div className="rounded-[28px] border border-border bg-surface p-6 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-semibold text-foreground">Payment audit preview</p>
          <p className="mt-1 text-sm text-muted">Latest audit events captured for governance, payment execution, and operator actions.</p>
        </div>
        <Link href={`/audit-logs?distributionId=${distributionId}`} className="text-sm font-semibold text-accent hover:underline">
          Open full audit logs
        </Link>
      </div>
      <div className="mt-5 space-y-3">
        {items.map((item) => (
          <div key={item.id} className="rounded-2xl bg-surface-muted p-4">
            <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
              <div>
                <p className="text-sm font-semibold text-foreground">{item.description}</p>
                <p className="mt-1 text-xs uppercase tracking-[0.14em] text-muted-soft">
                  {item.actor} • {item.role.replaceAll("_", " ")} • {item.action}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <StatusBadge label={item.result} tone={item.result === "SUCCESS" ? "success" : "warning"} />
                <span className="text-xs text-muted">{new Date(item.timestamp).toLocaleString()}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
