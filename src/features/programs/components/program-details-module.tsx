"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";

import { PermissionDeniedState } from "@/components/shared/permission-denied-state";
import { EmptyState } from "@/components/ui/empty-state";
import { LoadingState } from "@/components/ui/loading-state";
import { PageContainer } from "@/components/ui/page-container";
import { ProgramActivityFeed } from "@/features/programs/components/program-activity-feed";
import { ProgramBeneficiaryPreview } from "@/features/programs/components/program-beneficiary-preview";
import { ProgramDetailsHeader } from "@/features/programs/components/program-details-header";
import { ProgramDistributionPreview } from "@/features/programs/components/program-distribution-preview";
import { ProgramKpiCards } from "@/features/programs/components/program-kpi-cards";
import { ProgramStatusBadge } from "@/features/programs/components/program-status-badge";
import { programService } from "@/services/program.service";
import { useAuthStore } from "@/store/auth.store";

export function ProgramDetailsModule({ id }: { id: string }) {
  const role = useAuthStore((state) => state.role);
  const user = useAuthStore((state) => state.user);

  const programQuery = useQuery({
    queryKey: ["program", id],
    queryFn: () => programService.getProgramById(id),
  });

  if (programQuery.isLoading) {
    return (
      <PageContainer>
        <LoadingState title="Loading program details" lines={5} />
      </PageContainer>
    );
  }

  const program = programQuery.data?.data;

  if (programQuery.isError || !program) {
    return (
      <PageContainer>
        <EmptyState
          title="Intervention not found"
          description="The requested program could not be loaded from the mock service layer."
        />
      </PageContainer>
    );
  }

  if (!programService.canAccessProgram(program, role, user?.organizationId, user?.id)) {
    return (
      <PageContainer>
        <PermissionDeniedState
          title="Intervention access denied"
          description="Your role cannot access this intervention because it is outside your scope or not assigned to you for approval."
        />
      </PageContainer>
    );
  }

  const canEdit = role === "SUPER_ADMIN";
  const isAssignedApprover = Boolean(
    user?.id && program.approvalSteps?.some((step) => step.assigneeUserId === user.id),
  );
  const isApprovalRole =
    role === "SYSTEM_ACCOUNTANT" ||
    role === "DIRECTOR";

  return (
    <PageContainer>
      <ProgramDetailsHeader canEdit={canEdit} program={program} readOnly={role === "AUDITOR"} />
      <ProgramKpiCards program={program} />
      <section className="grid gap-4 xl:grid-cols-[1.05fr_0.95fr]">
        <div className="rounded-[28px] border border-border bg-surface p-6 shadow-sm">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-sm font-semibold text-foreground">Intervention profile</p>
              <p className="mt-1 text-sm text-muted">Core intervention profile, lifecycle window, value posture, and governance setup.</p>
            </div>
            <ProgramStatusBadge status={program.status} />
          </div>
          <div className="mt-5 grid gap-4 md:grid-cols-2">
            <Info label="Start Date" value={program.startDate} />
            <Info label="End Date" value={program.endDate} />
            <Info label="Benefit Type" value={program.benefitType.replaceAll("_", " ")} />
            <Info
              label={program.amount !== null && program.amount !== undefined ? "Amount" : "Budget"}
              value={(program.amount ?? program.budget ?? 0).toLocaleString("en-NG")}
            />
          </div>
        </div>

        <div className="rounded-[28px] border border-border bg-surface p-6 shadow-sm">
          <p className="text-sm font-semibold text-foreground">Organization summary</p>
          <div className="mt-5 space-y-3">
            <Info label="Organization" value={program.organizationName} />
            <Info label="Type" value={program.organizationType.replaceAll("_", " ")} />
            <Info label="Status" value={program.organizationStatus.replaceAll("_", " ")} />
            <div className="pt-2">
              <div className="flex flex-wrap gap-3">
                <Link
                  href={`/organizations/${program.organizationId}?from=${encodeURIComponent(`/programs/${program.id}`)}`}
                  className="text-sm font-medium text-accent hover:underline"
                >
                  View agency details
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-4 xl:grid-cols-[1fr_1fr]">
        <ProgramBeneficiaryPreview />
        <ProgramDistributionPreview summary={program.distributionSummary} />
      </section>

      <section className="grid gap-4 xl:grid-cols-[1fr_0.9fr]">
        <ProgramActivityFeed items={program.recentActivities} />
        <div className="rounded-[28px] border border-border bg-surface p-6 shadow-sm">
          <p className="text-sm font-semibold text-foreground">Quick actions</p>
          <div className="mt-5 space-y-3">
            {isAssignedApprover ? (
              <Link href={`/programs/${program.id}/approval`} className="block rounded-2xl border border-accent/20 bg-accent/10 px-4 py-3 text-sm font-medium text-foreground">
                Open Approval Review
              </Link>
            ) : null}
            {!isApprovalRole ? (
              <>
                <Link href="/beneficiaries" className="block rounded-2xl border border-border bg-surface-muted px-4 py-3 text-sm font-medium text-foreground">
                  View Beneficiaries
                </Link>
                <Link href="/distributions" className="block rounded-2xl border border-border bg-surface-muted px-4 py-3 text-sm font-medium text-foreground">
                  Open Distributions
                </Link>
                <Link href="/reports" className="block rounded-2xl border border-border bg-surface-muted px-4 py-3 text-sm font-medium text-foreground">
                  View Reports
                </Link>
              </>
            ) : null}
            {canEdit ? (
              <Link href={`/programs/${program.id}/edit`} className="block rounded-2xl border border-accent/20 bg-accent/10 px-4 py-3 text-sm font-medium text-foreground">
                Edit Intervention
              </Link>
            ) : null}
          </div>
        </div>
      </section>
    </PageContainer>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-soft">{label}</p>
      <p className="mt-2 text-sm text-foreground">{value}</p>
    </div>
  );
}
