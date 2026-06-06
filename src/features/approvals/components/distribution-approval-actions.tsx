"use client";

import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { getRoleLabel } from "@/lib/role-labels";
import { approvalService } from "@/services/approval.service";
import type { AuthUser } from "@/types/auth";
import type { DistributionDetails } from "@/types/distribution";

export function DistributionApprovalActions({
  distribution,
  user,
  canSubmit,
  canApprove,
  canReject,
  canFinalApprove,
  canFinalReject,
}: {
  distribution: DistributionDetails;
  user: AuthUser;
  canSubmit: boolean;
  canApprove: boolean;
  canReject: boolean;
  canFinalApprove: boolean;
  canFinalReject: boolean;
}) {
  const queryClient = useQueryClient();
  const [action, setAction] = useState<"APPROVE" | "REJECT" | "FINAL_APPROVE" | "FINAL_REJECT" | null>(null);
  const [reason, setReason] = useState("");
  const currentPendingStep = distribution.distributionApprovalSteps.find((step) => step.status === "PENDING") ?? null;

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

  const finalApproveMutation = useMutation({
    mutationFn: () => approvalService.approveDistributionFinalReview(distribution.id, user),
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

  const finalRejectMutation = useMutation({
    mutationFn: () => approvalService.rejectDistributionFinalReview(distribution.id, reason, user),
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
      {currentPendingStep ? (
        <p className="mt-2 text-sm leading-6 text-muted">
          Current step: <span className="font-semibold text-foreground">{getRoleLabel(currentPendingStep.role)}</span>
          {" "}assigned to <span className="font-semibold text-foreground">{currentPendingStep.assigneeName}</span>.
        </p>
      ) : canFinalApprove || canFinalReject ? (
        <p className="mt-2 text-sm leading-6 text-muted">
          Agency approval is complete. Final super admin approval is now required before agency payment can begin.
        </p>
      ) : (
        <p className="mt-2 text-sm leading-6 text-muted">This agency approval workflow has no pending step.</p>
      )}

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

        {canFinalApprove ? (
          <button
            type="button"
            onClick={() => setAction("FINAL_APPROVE")}
            className="inline-flex h-11 items-center justify-center rounded-2xl border border-info/30 bg-info/10 px-5 text-sm font-semibold text-info"
          >
            Final Approve
          </button>
        ) : null}

        {canFinalReject ? (
          <button
            type="button"
            onClick={() => setAction("FINAL_REJECT")}
            className="inline-flex h-11 items-center justify-center rounded-2xl border border-danger/30 bg-danger/10 px-5 text-sm font-semibold text-danger"
          >
            Final Reject
          </button>
        ) : null}

        {!canSubmit && !canApprove && !canReject && !canFinalApprove && !canFinalReject ? (
          <p className="text-sm leading-6 text-muted">Read-only review. Your role cannot modify this approval workflow.</p>
        ) : null}
      </div>

      {action ? (
        <div className="mt-6 rounded-[24px] border border-border bg-surface-muted p-5">
          <h3 className="text-lg font-semibold text-foreground">
            {action === "APPROVE"
              ? "Approve distribution"
              : action === "REJECT"
                ? "Reject distribution"
                : action === "FINAL_APPROVE"
                  ? "Final approve distribution"
                  : "Final reject distribution"}
          </h3>
          <p className="mt-2 text-sm leading-6 text-muted">
            {action === "APPROVE"
              ? `Are you sure you want to approve ${distribution.name}?`
              : action === "FINAL_APPROVE"
                ? `Confirm final super admin approval for ${distribution.name}.`
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

          {action === "REJECT" || action === "FINAL_REJECT" ? (
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
                disabled={approveMutation.isPending}
                className="inline-flex h-11 items-center justify-center rounded-2xl bg-accent px-5 text-sm font-semibold text-accent-foreground"
              >
                {approveMutation.isPending ? "Approving..." : "Confirm approval"}
              </button>
            ) : action === "FINAL_APPROVE" ? (
              <button
                type="button"
                onClick={() => finalApproveMutation.mutate()}
                disabled={finalApproveMutation.isPending}
                className="inline-flex h-11 items-center justify-center rounded-2xl bg-accent px-5 text-sm font-semibold text-accent-foreground"
              >
                {finalApproveMutation.isPending ? "Approving..." : "Confirm final approval"}
              </button>
            ) : action === "FINAL_REJECT" ? (
              <button
                type="button"
                onClick={() => finalRejectMutation.mutate()}
                disabled={finalRejectMutation.isPending}
                className="inline-flex h-11 items-center justify-center rounded-2xl bg-danger px-5 text-sm font-semibold text-white"
              >
                {finalRejectMutation.isPending ? "Rejecting..." : "Confirm final rejection"}
              </button>
            ) : (
              <button
                type="button"
                onClick={() => rejectMutation.mutate()}
                disabled={rejectMutation.isPending}
                className="inline-flex h-11 items-center justify-center rounded-2xl bg-danger px-5 text-sm font-semibold text-white"
              >
                {rejectMutation.isPending ? "Rejecting..." : "Confirm rejection"}
              </button>
            )}
          </div>
        </div>
      ) : null}
    </section>
  );
}
