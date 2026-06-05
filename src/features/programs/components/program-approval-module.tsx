"use client";

import { useState } from "react";
import Link from "next/link";
import { useMutation, useQuery } from "@tanstack/react-query";
import { toast } from "sonner";

import { PermissionDeniedState } from "@/components/shared/permission-denied-state";
import { EmptyState } from "@/components/ui/empty-state";
import { LoadingState } from "@/components/ui/loading-state";
import { PageContainer } from "@/components/ui/page-container";
import { ProgramActivityFeed } from "@/features/programs/components/program-activity-feed";
import { ProgramDetailsHeader } from "@/features/programs/components/program-details-header";
import { ProgramStatusBadge } from "@/features/programs/components/program-status-badge";
import { programService } from "@/services/program.service";
import { useAuthStore } from "@/store/auth.store";
import { SYSTEM_BENEFICIARY_TOTAL } from "@/constants/system-metrics";
import { formatCurrency, formatNumber } from "@/lib/formatters";

const approvalRoleLabels: Record<string, string> = {
  ORGANIZATION_MANAGER: "Organization Manager",
  STORE_MANAGER: "Store Manager",
  DISTRIBUTION_MANAGER: "Distribution Manager",
  ACCOUNTANT: "Accountant",
  DIRECTOR: "Director",
};

export function ProgramApprovalModule({ id }: { id: string }) {
  const role = useAuthStore((state) => state.role);
  const user = useAuthStore((state) => state.user);
  const [rejectionReason, setRejectionReason] = useState("");

  const programQuery = useQuery({
    queryKey: ["program", id],
    queryFn: () => programService.getProgramById(id),
  });

  const approveMutation = useMutation({
    mutationFn: () => programService.approveProgram(id, user!),
    onSuccess: (response) => {
      if (!response.success) {
        toast.error(response.message);
        return;
      }

      toast.success(response.message);
      programQuery.refetch();
    },
  });

  const rejectMutation = useMutation({
    mutationFn: () => programService.rejectProgram(id, rejectionReason, user!),
    onSuccess: (response) => {
      if (!response.success) {
        toast.error(response.message);
        return;
      }

      toast.success(response.message);
      setRejectionReason("");
      programQuery.refetch();
    },
  });

  if (programQuery.isLoading) {
    return (
      <PageContainer>
        <LoadingState title="Loading intervention approval" lines={5} />
      </PageContainer>
    );
  }

  const program = programQuery.data?.data;

  if (programQuery.isError || !program) {
    return (
      <PageContainer>
        <EmptyState
          title="Intervention not found"
          description="The requested intervention approval record could not be loaded."
        />
      </PageContainer>
    );
  }

  if (!programService.canAccessProgram(program, role, user?.organizationId, user?.id)) {
    return (
      <PageContainer>
        <PermissionDeniedState
          title="Intervention approval denied"
          description="You can only review interventions assigned to you in the approval chain."
        />
      </PageContainer>
    );
  }

  const currentPendingStep = program.approvalSteps?.find((step) => step.status === "PENDING") ?? null;
  const assignedStep = program.approvalSteps?.find((step) => step.assigneeUserId === user?.id) ?? null;
  const canAct =
    Boolean(user && assignedStep && currentPendingStep && currentPendingStep.id === assignedStep.id) &&
    role !== "SUPER_ADMIN";

  return (
    <PageContainer>
      <ProgramDetailsHeader canEdit={false} program={program} readOnly />

      <section className="grid gap-4 xl:grid-cols-[1.1fr_0.9fr]">
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-2">
          <ApprovalKpiCard label="Beneficiaries" value={formatNumber(SYSTEM_BENEFICIARY_TOTAL)} />
          <ApprovalKpiCard
            label={program.amount !== null && program.amount !== undefined ? "Amount" : "Budget"}
            value={formatCurrency(program.amount ?? program.budget ?? 0)}
          />
        </div>
        <div className="rounded-[28px] border border-border bg-surface p-6 shadow-sm">
          <p className="text-sm font-semibold text-foreground">Approval Status</p>
          <div className="mt-4 space-y-3">
            <div className="flex items-center justify-between gap-4">
              <span className="text-sm text-muted">Intervention status</span>
              <ProgramStatusBadge status={program.status} />
            </div>
            <div className="flex items-center justify-between gap-4">
              <span className="text-sm text-muted">Current approval step</span>
              <span className="text-sm font-semibold text-foreground">
                {currentPendingStep ? `Step ${currentPendingStep.order}` : "Completed"}
              </span>
            </div>
            {program.rejectionReason ? (
              <div className="rounded-2xl border border-danger/20 bg-danger/10 px-4 py-3 text-sm text-danger">
                Rejection reason: {program.rejectionReason}
              </div>
            ) : null}
          </div>
        </div>
      </section>

      <section className="grid gap-4 xl:grid-cols-[1.15fr_0.85fr]">
        <div className="rounded-[28px] border border-border bg-surface p-6 shadow-sm">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-sm font-semibold text-foreground">Approval workflow</p>
              <p className="mt-1 text-sm text-muted">
                Each step must be approved in order before the next assigned approver can act.
              </p>
            </div>
            <Link href={`/programs/${program.id}`} className="text-sm font-medium text-accent hover:underline">
              View full details
            </Link>
          </div>

          <div className="mt-5 space-y-3">
            {program.approvalSteps?.map((step) => (
              <div key={step.id} className="rounded-2xl border border-border bg-surface-muted px-4 py-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold text-foreground">
                      Step {step.order}: {approvalRoleLabels[step.role] ?? step.role}
                    </p>
                    <p className="mt-1 text-sm text-muted">
                      {step.assigneeName} • {step.assigneeEmail}
                    </p>
                  </div>
                  <span className="rounded-full border border-border bg-surface px-3 py-1 text-xs font-semibold text-foreground">
                    {step.status}
                  </span>
                </div>
                {step.rejectionReason ? (
                  <p className="mt-3 text-sm text-danger">Reason: {step.rejectionReason}</p>
                ) : null}
              </div>
            ))}
          </div>
          <div className="mt-5 border-t border-border pt-4">
            <Link
              href={`/organizations/${program.organizationId}?from=${encodeURIComponent(`/programs/${program.id}/approval`)}`}
              className="text-sm font-medium text-accent hover:underline"
            >
              View organization details
            </Link>
          </div>
        </div>

        <div className="space-y-4">
          <div className="rounded-[28px] border border-border bg-surface p-6 shadow-sm">
            <p className="text-sm font-semibold text-foreground">Approval Actions</p>
            {canAct ? (
              <>
                <p className="mt-2 text-sm text-muted">
                  You are the active approver for Step {assignedStep?.order}. Approve or reject this intervention to move the workflow forward.
                </p>
                <div className="mt-5 flex flex-col gap-3">
                  <button
                    type="button"
                    onClick={() => approveMutation.mutate()}
                    disabled={approveMutation.isPending || rejectMutation.isPending}
                    className="inline-flex h-12 items-center justify-center rounded-2xl bg-accent px-5 text-sm font-semibold text-accent-foreground disabled:opacity-60"
                  >
                    {approveMutation.isPending ? "Approving..." : "Approve Intervention"}
                  </button>
                  <label className="block">
                    <span className="mb-2 block text-sm font-medium text-foreground">Rejection reason</span>
                    <textarea
                      value={rejectionReason}
                      onChange={(event) => setRejectionReason(event.target.value)}
                      className="focus-ring min-h-28 w-full rounded-2xl border border-border bg-background px-4 py-3 text-sm text-foreground"
                      placeholder="Explain why this intervention is being rejected"
                    />
                  </label>
                  <button
                    type="button"
                    onClick={() => rejectMutation.mutate()}
                    disabled={approveMutation.isPending || rejectMutation.isPending}
                    className="inline-flex h-12 items-center justify-center rounded-2xl border border-danger/20 bg-danger/10 px-5 text-sm font-semibold text-danger disabled:opacity-60"
                  >
                    {rejectMutation.isPending ? "Rejecting..." : "Reject Intervention"}
                  </button>
                </div>
              </>
            ) : (
              <p className="mt-2 text-sm text-muted">
                {currentPendingStep
                  ? `Approval is currently awaiting Step ${currentPendingStep.order}: ${currentPendingStep.assigneeName}.`
                  : "This intervention has completed its approval workflow."}
              </p>
            )}
          </div>

          <ProgramActivityFeed items={program.recentActivities} />
        </div>
      </section>
    </PageContainer>
  );
}

function ApprovalKpiCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[28px] border border-border bg-surface p-5 shadow-sm">
      <p className="text-sm text-muted">{label}</p>
      <p className="mt-3 text-3xl font-semibold tracking-tight text-foreground">{value}</p>
    </div>
  );
}
