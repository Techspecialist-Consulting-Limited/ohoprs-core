"use client";

import { Download, Play, Send } from "lucide-react";

import { StatusBadge } from "@/components/ui/status-badge";
import { DistributionMethodBadge } from "@/features/distributions/components/distribution-method-badge";
import type { UserRole } from "@/types/auth";
import type { DistributionDetails } from "@/types/distribution";

function approvalTone(status: DistributionDetails["approvalStatus"]) {
  if (status === "APPROVED") return "success";
  if (status === "REJECTED") return "warning";
  return "neutral";
}

export function PaymentConsoleHeader({
  distribution,
  role,
  canSubmit,
  canProcessAll,
  canExport,
  onSubmit,
  onProcessAll,
  onExport,
}: {
  distribution: DistributionDetails;
  role: UserRole;
  canSubmit: boolean;
  canProcessAll: boolean;
  canExport: boolean;
  onSubmit: () => void;
  onProcessAll: () => void;
  onExport: () => void;
}) {
  return (
    <div className="rounded-[28px] border border-border bg-surface p-6 shadow-sm">
      <div className="flex flex-col gap-5 xl:flex-row xl:items-start xl:justify-between">
        <div className="min-w-0">
          <h1 className="mt-3 text-3xl font-semibold tracking-tight text-foreground">{distribution.name}</h1>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-muted">
            Payment batch review and execution console for {distribution.programName}. Review approval governance,
            beneficiary payment readiness, payment execution progress, and audit traceability in one screen.
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            <StatusBadge label={distribution.approvalStatus.replaceAll("_", " ")} tone={approvalTone(distribution.approvalStatus)} />
            <StatusBadge label={distribution.executionStatus.replaceAll("_", " ")} tone={distribution.executionStatus === "COMPLETED" ? "success" : distribution.executionStatus === "FAILED" ? "warning" : "neutral"} />
            <DistributionMethodBadge method={distribution.method} />
            <StatusBadge label={role.replaceAll("_", " ")} />
          </div>
        </div>

        <div className="flex flex-wrap gap-3 xl:justify-end">
          {canExport ? (
            <button
              type="button"
              onClick={onExport}
              className="inline-flex h-11 items-center justify-center gap-2 rounded-2xl border border-border px-4 text-sm font-semibold text-foreground"
            >
              <Download size={16} />
              Export CSV
            </button>
          ) : null}
          {canSubmit ? (
            <button
              type="button"
              onClick={onSubmit}
              className="inline-flex h-11 items-center justify-center gap-2 rounded-2xl border border-border px-4 text-sm font-semibold text-foreground"
            >
              <Send size={16} />
              Submit For Approval
            </button>
          ) : null}
          {canProcessAll ? (
            <button
              type="button"
              onClick={onProcessAll}
              className="inline-flex h-11 items-center justify-center gap-2 rounded-2xl bg-accent px-4 text-sm font-semibold text-accent-foreground"
            >
              <Play size={16} />
              Process All Payments
            </button>
          ) : null}
        </div>
      </div>

      <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <InfoItem label="Organization" value={distribution.organizationName} />
        <InfoItem label="Created By" value={distribution.createdBy} />
        <InfoItem label="Beneficiaries" value={distribution.beneficiaryCount.toLocaleString()} />
        <InfoItem label="Estimated Value" value={distribution.amount ? `N${distribution.amount.toLocaleString()}` : `${distribution.quantity?.toLocaleString() ?? 0} items`} />
      </div>
    </div>
  );
}

function InfoItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl bg-surface-muted px-4 py-3">
      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-soft">{label}</p>
      <p className="mt-2 text-sm font-semibold text-foreground">{value}</p>
    </div>
  );
}
