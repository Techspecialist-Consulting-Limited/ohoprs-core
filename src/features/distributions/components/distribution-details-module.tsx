"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { ArrowRight, FileBarChart2, Pencil } from "lucide-react";

import { PermissionDeniedState } from "@/components/shared/permission-denied-state";
import { EmptyState } from "@/components/ui/empty-state";
import { LoadingState } from "@/components/ui/loading-state";
import { PageContainer } from "@/components/ui/page-container";
import { formatCurrency, formatDateTime, formatNumber } from "@/lib/formatters";
import { distributionService } from "@/services/distribution.service";
import { useAuthStore } from "@/store/auth.store";
import { DistributionActivityFeed } from "@/features/distributions/components/distribution-activity-feed";
import { DistributionBeneficiaryPreview } from "@/features/distributions/components/distribution-beneficiary-preview";
import { DistributionMethodBadge } from "@/features/distributions/components/distribution-method-badge";
import { DistributionStatistics } from "@/features/distributions/components/distribution-statistics";
import { DistributionStatusBadge } from "@/features/distributions/components/distribution-status-badge";
import { DistributionTimeline } from "@/features/distributions/components/distribution-timeline";

function canViewDistribution(role: string | null, organizationId: string, userOrganizationId: string | null | undefined) {
  if (role === "SUPER_ADMIN" || role === "AUDITOR") return true;
  return userOrganizationId === organizationId;
}

function canEditDistribution(role: string | null, organizationId: string, userOrganizationId: string | null | undefined, createdByUserId: string, userId: string | undefined) {
  if (role === "SUPER_ADMIN") return true;
  if (role === "ORG_ADMIN") return userOrganizationId === organizationId;
  if (role === "PROGRAM_OFFICER") return userOrganizationId === organizationId && userId === createdByUserId;
  return false;
}

function displayValue(amount?: number, quantity?: number) {
  return amount !== undefined ? formatCurrency(amount) : `${formatNumber(quantity ?? 0)} packages`;
}

export function DistributionDetailsModule({ id }: { id: string }) {
  const role = useAuthStore((state) => state.role);
  const user = useAuthStore((state) => state.user);
  const distributionQuery = useQuery({
    queryKey: ["distribution", id],
    queryFn: () => distributionService.getDistributionById(id),
  });

  if (distributionQuery.isLoading) {
    return (
      <PageContainer>
        <LoadingState title="Loading distribution details" lines={5} />
      </PageContainer>
    );
  }

  const distribution = distributionQuery.data?.data;

  if (!distribution) {
    return (
      <PageContainer>
        <EmptyState title="Distribution not found" description="The selected distribution batch could not be loaded from the mock service layer." />
      </PageContainer>
    );
  }

  if (!canViewDistribution(role, distribution.organizationId, user?.organizationId)) {
    return (
      <PageContainer>
        <PermissionDeniedState title="Distribution access denied" description="Your role cannot access this batch because it belongs to another organization." />
      </PageContainer>
    );
  }

  const canEdit = canEditDistribution(role, distribution.organizationId, user?.organizationId, distribution.createdByUserId, user?.id);
  const actions = [
    ...(canEdit ? [{ label: "Edit Distribution", href: `/distributions/${distribution.id}/edit`, icon: Pencil }] : []),
    { label: "Open Approval Review", href: `/distributions/${distribution.id}/approval`, icon: ArrowRight },
    { label: "Open Payments", href: `/distributions/${distribution.id}/payments`, icon: ArrowRight },
    { label: "View Intervention", href: `/programs/${distribution.programId}`, icon: ArrowRight },
    { label: "View Beneficiaries", href: "/beneficiaries", icon: ArrowRight },
    ...(role === "SUPER_ADMIN" || role === "ORG_ADMIN" || role === "AUDITOR" ? [{ label: "View Reports", href: "/reports", icon: FileBarChart2 }] : []),
    ...(role === "AUDITOR" ? [{ label: "View Audit Logs", href: "/audit-logs", icon: FileBarChart2 }] : []),
  ];

  return (
    <PageContainer>
      <section className="rounded-[32px] border border-border bg-surface p-6 shadow-sm">
        <div className="flex flex-col gap-5 xl:flex-row xl:items-start xl:justify-between">
          <div>
            <div className="flex flex-wrap items-center gap-3">
              <span className="rounded-full border border-accent/25 bg-accent/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-accent">Phase 15</span>
              {role === "AUDITOR" ? <span className="rounded-full border border-border px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-muted">Read-only oversight view</span> : null}
            </div>
            <h1 className="mt-4 text-3xl font-semibold tracking-tight text-foreground">{distribution.name}</h1>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-muted">{distribution.description}</p>
            <div className="mt-5 flex flex-wrap items-center gap-3">
              <DistributionStatusBadge status={distribution.status} />
              <DistributionMethodBadge method={distribution.method} />
              <span className="rounded-full border border-border px-3 py-1 text-sm text-muted">
                Approval: {distribution.approvalStatus.replaceAll("_", " ")}
              </span>
              <span className="rounded-full border border-border px-3 py-1 text-sm text-muted">
                Execution: {distribution.executionStatus.replaceAll("_", " ")}
              </span>
              <span className="rounded-full border border-border px-3 py-1 text-sm text-muted">{distribution.programName}</span>
              <span className="rounded-full border border-border px-3 py-1 text-sm text-muted">{distribution.organizationName}</span>
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 xl:w-[28rem]">
            <SummaryCell label="Beneficiaries" value={formatNumber(distribution.beneficiaryCount)} />
            <SummaryCell label="Amount / Quantity" value={displayValue(distribution.amount, distribution.quantity)} />
            <SummaryCell label="Scheduled" value={formatDateTime(distribution.scheduledDate)} />
            <SummaryCell label="Created By" value={distribution.createdBy} />
          </div>
        </div>
      </section>

      <DistributionStatistics statistics={distribution.statistics} />

      <section className="grid gap-4 xl:grid-cols-[1.15fr_0.85fr]">
        <section className="rounded-[28px] border border-border bg-surface p-6 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-soft">Workflow context</p>
          <h2 className="mt-2 text-xl font-semibold text-foreground">Intervention and organization summary</h2>
          <div className="mt-5 grid gap-4 md:grid-cols-2">
            <ContextCard
              title="Intervention"
              subtitle={distribution.programName}
              meta={`${distribution.benefitType.replaceAll("_", " ")} benefit`}
              href={`/programs/${distribution.programId}`}
            />
            <ContextCard
              title="Organization"
              subtitle={distribution.organizationName}
              meta={distribution.organizationType.replaceAll("_", " ")}
              href={`/organizations/${distribution.organizationId}`}
            />
          </div>
        </section>

        <section className="rounded-[28px] border border-border bg-surface p-6 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-soft">Quick actions</p>
          <h2 className="mt-2 text-xl font-semibold text-foreground">Next steps</h2>
          <div className="mt-5 space-y-3">
            {actions.map((action) => {
              const Icon = action.icon;
              return (
                <Link key={action.label} href={action.href} className="flex items-center justify-between rounded-3xl border border-border bg-surface-muted px-4 py-4 text-sm font-medium text-foreground">
                  <span>{action.label}</span>
                  <Icon size={16} />
                </Link>
              );
            })}
          </div>
        </section>
      </section>

      <section className="grid gap-4 xl:grid-cols-[1.1fr_0.9fr]">
        <DistributionBeneficiaryPreview recipients={distribution.recipients} />
        <DistributionActivityFeed items={distribution.recentActivities} />
      </section>

      <section className="rounded-[28px] border border-border bg-surface p-6 shadow-sm">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-soft">Approval history</p>
        <h2 className="mt-2 text-xl font-semibold text-foreground">Governance trail</h2>
        <div className="mt-5 space-y-4">
          {distribution.approvalHistory.map((entry) => (
            <div key={entry.id} className="flex gap-4">
              <div className="mt-1 h-3 w-3 rounded-full bg-accent" />
              <div>
                <p className="text-sm font-semibold text-foreground">{entry.label}</p>
                <p className="mt-1 text-sm text-muted">{entry.note ?? "Workflow event recorded."}</p>
                <p className="mt-2 text-xs text-muted-soft">{formatDateTime(entry.timestamp)} • {entry.actor}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <DistributionTimeline items={distribution.timeline} />
    </PageContainer>
  );
}

function SummaryCell({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-3xl border border-border bg-surface-muted px-4 py-4">
      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-soft">{label}</p>
      <p className="mt-2 text-base font-semibold text-foreground">{value}</p>
    </div>
  );
}

function ContextCard({
  title,
  subtitle,
  meta,
  href,
}: {
  title: string;
  subtitle: string;
  meta: string;
  href: string;
}) {
  return (
    <Link href={href} className="rounded-3xl border border-border bg-surface-muted px-4 py-4">
      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-soft">{title}</p>
      <p className="mt-2 text-base font-semibold text-foreground">{subtitle}</p>
      <p className="mt-1 text-sm text-muted">{meta}</p>
    </Link>
  );
}
