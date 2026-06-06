"use client";

import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { approvalService } from "@/services/approval.service";
import type { AuthUser } from "@/types/auth";
import type { DistributionDetails } from "@/types/distribution";

export function DistributionApprovalActions({
  distribution,
  user,
  canSubmit,
  canApprove,
  canReject,
}: {
  distribution: DistributionDetails;
  user: AuthUser;
  canSubmit: boolean;
  canApprove: boolean;
  canReject: boolean;
}) {
  const queryClient = useQueryClient();
  const [action, setAction] = useState<"APPROVE" | "REJECT" | null>(null);
  const [reason, setReason] = useState("");

  const refresh = () => {
    queryClient.invalidateQueries({ queryKey: ["distribution", distribution.id] });
    queryClient.invalidateQueries({ queryKey: ["distribution-approval", distribution.id] });
    queryClient.invalidateQueries({ queryKey: ["audit-logs"] });
  };

  const approveMutation = useMutation({
    mutationFn: () => approvalService.approveDistribution(distribution.id, user),
    onSuccess: (response) => {
      if (!response.success) {
        toast.error(response.message);
        return;
      }
      toast.success(response.message);
      setAction(null);
      refresh();
    },
  });

  const rejectMutation = useMutation({
    mutationFn: () => approvalService.rejectDistribution(distribution.id, reason, user),
    onSuccess: (response) => {
      if (!response.success) {
        toast.error(response.message);
        return;
      }
      toast.success(response.message);
      setReason("");
      setAction(null);
      refresh();
    },
  });

  return (
    <section className="rounded-[28px] border border-border bg-surface p-6 shadow-sm">
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-accent">Agency approval actions</p>
      <h2 className="mt-2 text-xl font-semibold tracking-tight text-foreground">Decision controls</h2>

      <div className="mt-6 flex flex-wrap gap-3">
        {canApprove ? (
          <button
            type="button"
            onClick={() => setAction("APPROVE")}
            className="inline-flex h-11 items-center justify-center rounded-2xl border border-success/30 bg-success/10 px-5 text-sm font-semibold text-success"
          >
            Approve
          </button>
        ) : null}

        {canReject ? (
          <button
            type="button"
            onClick={() => setAction("REJECT")}
            className="inline-flex h-11 items-center justify-center rounded-2xl border border-danger/30 bg-danger/10 px-5 text-sm font-semibold text-danger"
          >
            Reject
          </button>
        ) : null}

        {!canSubmit && !canApprove && !canReject ? (
          <p className="text-sm leading-6 text-muted">Read-only review. Your role cannot modify this approval workflow.</p>
        ) : null}
      </div>

      {action ? (
        <div className="mt-6 rounded-[24px] border border-border bg-surface-muted p-5">
          <h3 className="text-lg font-semibold text-foreground">
            {action === "APPROVE" ? "Approve distribution" : "Reject distribution"}
          </h3>
          <p className="mt-2 text-sm leading-6 text-muted">
            {action === "APPROVE"
              ? `Are you sure you want to approve ${distribution.name}?`
              : `Provide a rejection reason for ${distribution.name}.`}
          </p>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <div className="rounded-2xl border border-border bg-surface px-4 py-3">
              <p className="text-xs uppercase tracking-[0.14em] text-muted-soft">Beneficiaries</p>
              <p className="mt-2 text-sm font-semibold text-foreground">{distribution.beneficiaryCount.toLocaleString()}</p>
            </div>
            <div className="rounded-2xl border border-border bg-surface px-4 py-3">
              <p className="text-xs uppercase tracking-[0.14em] text-muted-soft">Estimated payout</p>
              <p className="mt-2 text-sm font-semibold text-foreground">
                ₦{Intl.NumberFormat("en-NG", { notation: "compact", maximumFractionDigits: 1 }).format(distribution.validationSummary.estimatedTotalAmount)}
              </p>
            </div>
          </div>

          {action === "REJECT" ? (
            <div className="mt-4">
              <label htmlFor="rejection-reason" className="text-sm font-medium text-foreground">Reason</label>
              <textarea
                id="rejection-reason"
                value={reason}
                onChange={(event) => setReason(event.target.value)}
                className="mt-2 min-h-28 w-full rounded-2xl border border-border bg-surface px-4 py-3 text-sm text-foreground outline-none ring-0 placeholder:text-muted"
                placeholder="Explain why this distribution should be rejected."
              />
            </div>
          ) : null}

          <div className="mt-5 flex flex-wrap gap-3">
            <button
              type="button"
              onClick={() => setAction(null)}
              className="inline-flex h-11 items-center justify-center rounded-2xl border border-border px-5 text-sm font-semibold text-foreground"
            >
              Cancel
            </button>
            {action === "APPROVE" ? (
              <button
                type="button"
                onClick={() => approveMutation.mutate()}
                className="inline-flex h-11 items-center justify-center rounded-2xl bg-accent px-5 text-sm font-semibold text-accent-foreground"
              >
                Confirm approval
              </button>
            ) : (
              <button
                type="button"
                onClick={() => rejectMutation.mutate()}
                className="inline-flex h-11 items-center justify-center rounded-2xl bg-danger px-5 text-sm font-semibold text-white"
              >
                Confirm rejection
              </button>
            )}
          </div>
        </div>
      ) : null}
    </section>
  );
}
