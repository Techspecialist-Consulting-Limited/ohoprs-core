"use client";

import { CheckCircle2, ShieldAlert, XCircle } from "lucide-react";

import { StatusBadge } from "@/components/ui/status-badge";
import type { PaymentConsoleGovernanceSummary } from "@/types/payment-console";

export function ApprovalGovernanceSummary({
  data,
  canApprove,
  canReject,
  onApprove,
  onReject,
}: {
  data: PaymentConsoleGovernanceSummary;
  canApprove: boolean;
  canReject: boolean;
  onApprove: () => void;
  onReject: () => void;
}) {
  return (
    <div className="rounded-[28px] border border-border bg-surface p-6 shadow-sm">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <p className="text-sm font-semibold text-foreground">Approval and governance summary</p>
          <p className="mt-1 text-sm text-muted">Review approval gate status, execution readiness, and the latest governance decision context.</p>
        </div>
        <div className="flex flex-wrap gap-3">
          {canReject ? (
            <button type="button" onClick={onReject} className="inline-flex h-11 items-center justify-center gap-2 rounded-2xl border border-danger/30 bg-danger/10 px-4 text-sm font-semibold text-danger">
              <XCircle size={16} />
              Reject
            </button>
          ) : null}
          {canApprove ? (
            <button type="button" onClick={onApprove} className="inline-flex h-11 items-center justify-center gap-2 rounded-2xl bg-accent px-4 text-sm font-semibold text-accent-foreground">
              <CheckCircle2 size={16} />
              Approve
            </button>
          ) : null}
        </div>
      </div>

      <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <Item label="Approval Status" value={data.approvalStatus.replaceAll("_", " ")} />
        <Item label="Execution Status" value={data.executionStatus.replaceAll("_", " ")} />
        <Item label="Approved By" value={data.approvedBy ?? "Pending approval"} />
        <Item label="Last Approval Note" value={data.latestApprovalNote ?? "No note available"} />
      </div>

      {data.rejectionReason ? (
        <div className="mt-5 rounded-2xl border border-warning/20 bg-warning/10 p-4">
          <div className="flex items-start gap-3">
            <ShieldAlert size={18} className="mt-0.5 text-warning" />
            <div>
              <p className="text-sm font-semibold text-foreground">Latest rejection reason</p>
              <p className="mt-1 text-sm leading-6 text-muted">{data.rejectionReason}</p>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}

function Item({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl bg-surface-muted p-4">
      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-soft">{label}</p>
      <div className="mt-3">
        <StatusBadge label={value} />
      </div>
    </div>
  );
}
