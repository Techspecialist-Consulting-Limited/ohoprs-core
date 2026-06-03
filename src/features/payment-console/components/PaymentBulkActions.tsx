"use client";

import { Play, RotateCcw } from "lucide-react";

export function PaymentBulkActions({
  selectedCount,
  failedSelectedCount,
  canProcessSelected,
  canRetrySelected,
  helperText,
  onProcessSelected,
  onRetrySelected,
}: {
  selectedCount: number;
  failedSelectedCount: number;
  canProcessSelected: boolean;
  canRetrySelected: boolean;
  helperText?: string;
  onProcessSelected: () => void;
  onRetrySelected: () => void;
}) {
  return (
    <div className="rounded-[24px] border border-border bg-surface p-4 shadow-sm">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <p className="text-sm font-semibold text-foreground">Bulk payment actions</p>
          <p className="mt-1 text-sm text-muted">
            {selectedCount ? `${selectedCount} beneficiary rows selected.` : "Select one or more rows to enable bulk actions."}
          </p>
          {helperText ? <p className="mt-2 text-xs text-muted-soft">{helperText}</p> : null}
        </div>
        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            disabled={!canProcessSelected}
            onClick={onProcessSelected}
            className="inline-flex h-11 items-center justify-center gap-2 rounded-2xl bg-accent px-4 text-sm font-semibold text-accent-foreground disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Play size={16} />
            Process Selected
          </button>
          <button
            type="button"
            disabled={!canRetrySelected}
            onClick={onRetrySelected}
            className="inline-flex h-11 items-center justify-center gap-2 rounded-2xl border border-border px-4 text-sm font-semibold text-foreground disabled:cursor-not-allowed disabled:opacity-50"
          >
            <RotateCcw size={16} />
            Retry Failed ({failedSelectedCount})
          </button>
        </div>
      </div>
    </div>
  );
}
