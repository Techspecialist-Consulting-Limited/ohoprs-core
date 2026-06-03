"use client";

import type { PaymentConsoleDialogState } from "@/types/payment-console";

export function PaymentActionDialogs({
  dialog,
  reason,
  isSubmitting,
  onReasonChange,
  onClose,
  onConfirm,
}: {
  dialog: PaymentConsoleDialogState | null;
  reason: string;
  isSubmitting: boolean;
  onReasonChange: (value: string) => void;
  onClose: () => void;
  onConfirm: () => void;
}) {
  if (!dialog) {
    return null;
  }

  const confirmDisabled = isSubmitting || (dialog.requiresReason ? !reason.trim() : false);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#161616]/45 px-4">
      <div className="w-full max-w-lg rounded-[28px] border border-border bg-surface p-6 shadow-2xl">
        <h2 className="text-xl font-semibold tracking-tight text-foreground">{dialog.title}</h2>
        <p className="mt-3 text-sm leading-6 text-muted">{dialog.description}</p>

        {dialog.requiresReason ? (
          <div className="mt-5">
            <label className="mb-2 block text-sm font-medium text-foreground" htmlFor="payment-console-reason">
              Reason
            </label>
            <textarea
              id="payment-console-reason"
              value={reason}
              onChange={(event) => onReasonChange(event.target.value)}
              className="focus-ring min-h-28 w-full rounded-2xl border border-border bg-background px-4 py-3 text-sm text-foreground"
              placeholder="Enter the reason for this action"
            />
          </div>
        ) : null}

        <div className="mt-6 flex gap-3">
          <button type="button" onClick={onClose} className="inline-flex h-11 items-center justify-center rounded-2xl border border-border px-5 text-sm font-semibold text-foreground">
            Cancel
          </button>
          <button
            type="button"
            disabled={confirmDisabled}
            onClick={onConfirm}
            className="inline-flex h-11 items-center justify-center rounded-2xl bg-accent px-5 text-sm font-semibold text-accent-foreground disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSubmitting ? "Saving..." : dialog.confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
