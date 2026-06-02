"use client";

import { cn } from "@/lib/utils";
import type { PaymentStatus } from "@/types/payment";

const styles: Record<PaymentStatus, string> = {
  PENDING: "border-border bg-surface-muted text-muted",
  PROCESSING: "border-info/30 bg-info/10 text-info",
  PAID: "border-success/30 bg-success/10 text-success",
  FAILED: "border-danger/30 bg-danger/10 text-danger",
  REVERSED: "border-warning/30 bg-warning/10 text-warning",
  RETRY_PENDING: "border-warning/30 bg-warning/10 text-warning",
};

export function PaymentStatusBadge({ status }: { status: PaymentStatus }) {
  return (
    <span
      className={cn(
        "inline-flex rounded-full border px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em]",
        styles[status],
      )}
    >
      {status.replaceAll("_", " ")}
    </span>
  );
}
