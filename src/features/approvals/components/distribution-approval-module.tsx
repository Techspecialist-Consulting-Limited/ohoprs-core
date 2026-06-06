"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";

import { PermissionDeniedState } from "@/components/shared/permission-denied-state";
import { LoadingState } from "@/components/ui/loading-state";
import { PageContainer } from "@/components/ui/page-container";
import { PageHeader } from "@/components/ui/page-header";
import { getRoleLabel } from "@/lib/role-labels";
import { approvalService } from "@/services/approval.service";
import { distributionService } from "@/services/distribution.service";
import { useAuthStore } from "@/store/auth.store";
import { ApprovalHistoryTimeline } from "@/features/approvals/components/approval-history-timeline";
import { ApprovalSummaryCard } from "@/features/approvals/components/approval-summary-card";
import { BeneficiaryValidationSummary } from "@/features/approvals/components/beneficiary-validation-summary";
import { DistributionApprovalActions } from "@/features/approvals/components/distribution-approval-actions";

function canView(role: string | null, organizationId: string, userOrganizationId?: string | null) {
  if (role === "SUPER_ADMIN" || role === "AUDITOR") return true;
  return organizationId === userOrganizationId;
}

export function DistributionApprovalModule({ id }: { id: string }) {
  const user = useAuthStore((state) => state.user);
  const role = useAuthStore((state) => state.role);

  const distributionQuery = useQuery({
    queryKey: ["distribution", id],
    queryFn: () => distributionService.getDistributionById(id),
  });

  const approvalQuery = useQuery({
    queryKey: ["distribution-approval", id],
    queryFn: async () => {
      const response = await approvalService.getApprovalByDistributionId(id);
      return response.data;
    },
  });

  if (distributionQuery.isLoading || approvalQuery.isLoading) {
    return <LoadingState title="Loading approval workflow" lines={5} />;
  }

  const distribution = distributionQuery.data?.data;
  const approval = approvalQuery.data;

  if (!distribution || !approval) {
    return <PermissionDeniedState title="Approval record unavailable" description="This approval record could not be found in the current prototype store." />;
  }

  if (!canView(role, distribution.organizationId, user?.organizationId)) {
    return <PermissionDeniedState description="Your role cannot review approval workflows outside your agency scope." />;
  }

  const currentPendingStep = approval.approvalSteps.find((step) => step.status === "PENDING") ?? null;
  const canSubmit = false;
  const canApprove =
    approval.approvalStatus !== "APPROVED" &&
    approval.approvalStatus !== "REJECTED" &&
    currentPendingStep?.assigneeUserId === user?.id;

  const canReject = canApprove;
  const canFinalApprove =
    role === "SUPER_ADMIN" &&
    approval.approvalStatus === "APPROVED" &&
    approval.finalApprovalStatus === "PENDING";
  const canFinalReject = canFinalApprove;

  return (
    <PageContainer>
      <PageHeader
        eyebrow="Approval workflow"
        title={distribution.name}
        description="Review distribution readiness, verify validation counts, and enforce separation of duties before payment execution."
      />

      <div className="flex flex-wrap gap-3">
        <StatusPill label="Approval status" value={approval.approvalStatus} />
        <StatusPill label="Final approval" value={approval.finalApprovalStatus} />
        <StatusPill label="Execution status" value={approval.executionStatus} />
        {role === "AUDITOR" ? <StatusPill label="Mode" value="Read-only oversight view" tone="warning" /> : null}
        <Link href={`/distributions/${id}/payments`} className="inline-flex h-10 items-center rounded-2xl border border-border px-4 text-sm font-medium text-foreground">
          Open payment screen
        </Link>
      </div>

      <ApprovalSummaryCard distribution={distribution} />
      <BeneficiaryValidationSummary summary={approval.validationSummary} isHighRisk={approval.isHighRisk} />
      <section className="rounded-[28px] border border-border bg-surface p-6 shadow-sm">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-soft">Current agency approval</p>
        <div className="mt-4 grid gap-4 md:grid-cols-3">
          <InfoCard label="Progress" value={`${approval.approvalSteps.filter((step) => step.status === "APPROVED").length}/${approval.approvalSteps.length}`} />
          <InfoCard
            label="Current Step"
            value={currentPendingStep ? `Step ${currentPendingStep.order}` : approval.approvalStatus === "APPROVED" ? "Completed" : "Rejected"}
          />
          <InfoCard
            label="Assigned Approver"
            value={currentPendingStep ? `${currentPendingStep.assigneeName} (${getRoleLabel(currentPendingStep.role)})` : "No pending approver"}
          />
          <InfoCard label="Final Approval" value={approval.finalApprovalStatus.replaceAll("_", " ")} />
        </div>
      </section>
      <section className="rounded-[28px] border border-border bg-surface p-6 shadow-sm">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-soft">Agency approval steps</p>
        <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {approval.approvalSteps.map((step) => (
            <div key={step.id} className="rounded-3xl border border-border bg-surface-muted px-4 py-4">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-soft">Step {step.order}</p>
              <p className="mt-2 text-base font-semibold text-foreground">{getRoleLabel(step.role)}</p>
              <p className="mt-1 text-sm text-muted">{step.assigneeName}</p>
              <p className="mt-2 text-sm text-foreground">
                {step.status === "APPROVED"
                  ? `Approved ${step.approvedAt ? new Date(step.approvedAt).toLocaleString() : ""}`
                  : step.status === "REJECTED"
                    ? `Rejected${step.rejectionReason ? `: ${step.rejectionReason}` : ""}`
                    : "Pending approval"}
              </p>
            </div>
          ))}
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
        {user ? (
          <DistributionApprovalActions
            distribution={distribution}
            user={user}
            canSubmit={canSubmit}
            canApprove={canApprove}
            canReject={canReject}
            canFinalApprove={canFinalApprove}
            canFinalReject={canFinalReject}
          />
        ) : null}
        <ApprovalHistoryTimeline items={approval.approvalHistory} />
      </section>
    </PageContainer>
  );
}

function InfoCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-3xl border border-border bg-surface-muted px-4 py-4">
      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-soft">{label}</p>
      <p className="mt-2 text-sm font-semibold text-foreground">{value}</p>
    </div>
  );
}

function StatusPill({
  label,
  value,
  tone = "default",
}: {
  label: string;
  value: string;
  tone?: "default" | "warning";
}) {
  return (
    <div className={`rounded-full border px-4 py-2 text-xs font-semibold uppercase tracking-[0.16em] ${tone === "warning" ? "border-warning/30 bg-warning/10 text-warning" : "border-border bg-surface text-muted"}`}>
      {label}: <span className="text-foreground">{value.replaceAll("_", " ")}</span>
    </div>
  );
}
