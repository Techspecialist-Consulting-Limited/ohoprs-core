"use client";

import Link from "next/link";
import { Eye, RefreshCcw, RotateCcw, SendHorizontal } from "lucide-react";

import { RowActionPopover } from "@/components/ui/row-action-popover";
import { formatCurrency, formatDateTime } from "@/lib/formatters";
import type { PaymentRecord } from "@/types/payment";
import { PaymentStatusBadge } from "@/features/payments/components/payment-status-badge";

export function PaymentTable({
  items,
  onProcess,
  onRetry,
  onReverse,
  canProcess,
  canRetry,
  canReverse,
}: {
  items: PaymentRecord[];
  onProcess: (item: PaymentRecord) => void;
  onRetry: (item: PaymentRecord) => void;
  onReverse: (item: PaymentRecord) => void;
  canProcess: (item: PaymentRecord) => boolean;
  canRetry: (item: PaymentRecord) => boolean;
  canReverse: (item: PaymentRecord) => boolean;
}) {
  return (
    <div className="overflow-hidden rounded-[28px] border border-border bg-surface shadow-sm">
      <div className="overflow-x-auto">
        <table className="min-w-full">
          <thead className="border-b border-border bg-surface-muted">
            <tr className="text-left text-xs font-semibold uppercase tracking-[0.16em] text-muted-soft">
              {["Reference", "Distribution", "Intervention", "Beneficiary", "Amount", "Method", "Status", "Processed By", "Processed Date", "Actions"].map((label) => (
                <th key={label} className="px-5 py-4">{label}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {items.map((item) => (
              <tr key={item.id} className="border-b border-border last:border-b-0">
                <td className="px-5 py-4 text-sm font-semibold text-foreground">{item.reference}</td>
                <td className="px-5 py-4 text-sm text-foreground">{item.distributionName}</td>
                <td className="px-5 py-4 text-sm text-muted">{item.programName}</td>
                <td className="px-5 py-4">
                  <p className="text-sm font-medium text-foreground">{item.beneficiaryName}</p>
                  <p className="mt-1 text-xs text-muted">{item.beneficiaryNin}</p>
                </td>
                <td className="px-5 py-4 text-sm text-foreground">{formatCurrency(item.amount)}</td>
                <td className="px-5 py-4 text-sm text-muted">{item.method.replaceAll("_", " ")}</td>
                <td className="px-5 py-4"><PaymentStatusBadge status={item.status} /></td>
                <td className="px-5 py-4 text-sm text-muted">{item.processedBy ?? "Pending"}</td>
                <td className="px-5 py-4 text-sm text-muted">{item.processedAt ? formatDateTime(item.processedAt) : "Pending"}</td>
                <td className="px-5 py-4">
                  <RowActions
                    item={item}
                    onProcess={onProcess}
                    onRetry={onRetry}
                    onReverse={onReverse}
                    canProcess={canProcess(item)}
                    canRetry={canRetry(item)}
                    canReverse={canReverse(item)}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function RowActions({
  item,
  onProcess,
  onRetry,
  onReverse,
  canProcess,
  canRetry,
  canReverse,
}: {
  item: PaymentRecord;
  onProcess: (item: PaymentRecord) => void;
  onRetry: (item: PaymentRecord) => void;
  onReverse: (item: PaymentRecord) => void;
  canProcess: boolean;
  canRetry: boolean;
  canReverse: boolean;
}) {
  return (
    <RowActionPopover panelClassName="w-60">
      {({ close }) => (
        <>
          <Link href={`/payments/${item.id}`} className="flex items-center gap-2 rounded-xl px-3 py-2 text-sm text-foreground hover:bg-surface-muted">
            <Eye size={16} />
            View
          </Link>
          {canProcess ? (
            <button type="button" onClick={() => { onProcess(item); close(); }} className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left text-sm text-foreground hover:bg-surface-muted">
              <SendHorizontal size={16} />
              Process
            </button>
          ) : null}
          {canRetry ? (
            <button type="button" onClick={() => { onRetry(item); close(); }} className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left text-sm text-foreground hover:bg-surface-muted">
              <RefreshCcw size={16} />
              Retry
            </button>
          ) : null}
          {canReverse ? (
            <button type="button" onClick={() => { onReverse(item); close(); }} className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left text-sm text-foreground hover:bg-surface-muted">
              <RotateCcw size={16} />
              Reverse
            </button>
          ) : null}
        </>
      )}
    </RowActionPopover>
  );
}
