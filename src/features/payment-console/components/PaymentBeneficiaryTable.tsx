"use client";

import { AlertTriangle, RotateCcw, Undo2 } from "lucide-react";

import { PaymentStatusBadge } from "@/features/payments/components/payment-status-badge";
import { cn } from "@/lib/utils";
import type { PaymentConsolePaymentRecord } from "@/types/payment-console";

export function PaymentBeneficiaryTable({
  items,
  selectedIds,
  selectable,
  onToggle,
  onProcess,
  onRetry,
  onReverse,
  canProcessItem,
  canRetryItem,
  canReverseItem,
}: {
  items: PaymentConsolePaymentRecord[];
  selectedIds: string[];
  selectable: boolean;
  onToggle: (paymentId: string) => void;
  onProcess: (paymentId: string) => void;
  onRetry: (paymentId: string) => void;
  onReverse: (paymentId: string) => void;
  canProcessItem: (item: PaymentConsolePaymentRecord) => boolean;
  canRetryItem: (item: PaymentConsolePaymentRecord) => boolean;
  canReverseItem: (item: PaymentConsolePaymentRecord) => boolean;
}) {
  return (
    <div className="overflow-hidden rounded-[28px] border border-border bg-surface shadow-sm">
      <div className="overflow-x-auto">
        <table className="min-w-full">
          <thead className="border-b border-border bg-surface-muted">
            <tr className="text-left text-xs font-semibold uppercase tracking-[0.16em] text-muted-soft">
              <th className="px-4 py-4">Select</th>
              <th className="px-4 py-4">Beneficiary</th>
              <th className="px-4 py-4">State</th>
              <th className="px-4 py-4">Bank / Account</th>
              <th className="px-4 py-4">Amount</th>
              <th className="px-4 py-4">Verification</th>
              <th className="px-4 py-4">Status</th>
              <th className="px-4 py-4">Reference</th>
              <th className="px-4 py-4">Actions</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item) => {
              const selected = selectedIds.includes(item.id);
              return (
                <tr key={item.id} className={cn("border-b border-border align-top", selected && "bg-accent/6")}>
                  <td className="px-4 py-4">
                    <input type="checkbox" checked={selected} disabled={!selectable} onChange={() => onToggle(item.id)} />
                  </td>
                  <td className="px-4 py-4">
                    <p className="text-sm font-semibold text-foreground">{item.beneficiaryName}</p>
                    <p className="mt-1 text-xs text-muted">{item.beneficiaryNin}</p>
                    {item.riskFlags.length ? (
                      <div className="mt-2 flex items-center gap-2 text-xs text-warning">
                        <AlertTriangle size={14} />
                        {item.riskFlags.slice(0, 2).join(", ").replaceAll("_", " ")}
                      </div>
                    ) : null}
                  </td>
                  <td className="px-4 py-4 text-sm text-muted">{item.beneficiaryState}</td>
                  <td className="px-4 py-4">
                    <p className="text-sm font-medium text-foreground">{item.bankName}</p>
                    <p className="mt-1 text-xs text-muted">{item.accountNumber}</p>
                  </td>
                  <td className="px-4 py-4 text-sm font-semibold text-foreground">N{item.amount.toLocaleString()}</td>
                  <td className="px-4 py-4">
                    <p className="text-sm font-medium text-foreground">{item.verificationStatus.replaceAll("_", " ")}</p>
                    <p className="mt-1 text-xs text-muted">
                      {item.bankVerified ? "Bank verified" : "Bank issue"} / {item.hasBvn ? "BVN present" : "BVN missing"}
                    </p>
                  </td>
                  <td className="px-4 py-4"><PaymentStatusBadge status={item.status} /></td>
                  <td className="px-4 py-4">
                    <p className="text-sm text-foreground">{item.paymentReference ?? "Pending generation"}</p>
                    {item.failureReason ? <p className="mt-1 text-xs text-danger">{item.failureReason}</p> : null}
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex flex-col gap-2">
                      {canProcessItem(item) ? (
                        <button type="button" onClick={() => onProcess(item.id)} className="rounded-xl bg-accent px-3 py-2 text-left text-xs font-semibold text-accent-foreground">
                          Process Payment
                        </button>
                      ) : null}
                      {canRetryItem(item) ? (
                        <button type="button" onClick={() => onRetry(item.id)} className="inline-flex items-center gap-2 rounded-xl border border-border px-3 py-2 text-left text-xs font-semibold text-foreground">
                          <RotateCcw size={14} />
                          Retry Payment
                        </button>
                      ) : null}
                      {canReverseItem(item) ? (
                        <button type="button" onClick={() => onReverse(item.id)} className="inline-flex items-center gap-2 rounded-xl border border-warning/20 bg-warning/10 px-3 py-2 text-left text-xs font-semibold text-warning">
                          <Undo2 size={14} />
                          Reverse Payment
                        </button>
                      ) : null}
                      {!canProcessItem(item) && !canRetryItem(item) && !canReverseItem(item) ? (
                        <span className="text-xs text-muted-soft">No direct actions</span>
                      ) : null}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
