"use client";

import type { Distribution, DistributionStatus } from "@/types/distribution";

export function DistributionStatusDialog({
  item,
  nextStatus,
  onClose,
  onConfirm,
  isSaving,
}: {
  item: Distribution;
  nextStatus: DistributionStatus;
  onClose: () => void;
  onConfirm: () => void;
  isSaving: boolean;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#161616]/45 px-4">
      <div className="w-full max-w-lg rounded-[28px] border border-border bg-surface-elevated p-6 shadow-[0_24px_80px_rgba(12,16,20,0.2)]">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-soft">Confirm status change</p>
        <h2 className="mt-3 text-2xl font-semibold text-foreground">{item.name}</h2>
        <div className="mt-5 space-y-3 rounded-3xl border border-border bg-surface-muted p-4 text-sm text-muted">
          <p><span className="font-semibold text-foreground">Current status:</span> {item.status.replaceAll("_", " ")}</p>
          <p><span className="font-semibold text-foreground">New status:</span> {nextStatus.replaceAll("_", " ")}</p>
          <p>This update changes the mock delivery lifecycle and will be reflected immediately in the detail view and distribution list.</p>
        </div>
        <div className="mt-6 flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-11 items-center rounded-2xl border border-border px-4 text-sm font-medium text-foreground"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isSaving}
            className="inline-flex h-11 items-center rounded-2xl bg-accent px-4 text-sm font-semibold text-accent-foreground disabled:opacity-60"
          >
            {isSaving ? "Updating..." : "Confirm"}
          </button>
        </div>
      </div>
    </div>
  );
}
