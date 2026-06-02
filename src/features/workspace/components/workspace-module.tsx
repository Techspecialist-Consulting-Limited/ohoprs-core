"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";

import { PermissionDeniedState } from "@/components/shared/permission-denied-state";
import { EmptyState } from "@/components/ui/empty-state";
import { LoadingState } from "@/components/ui/loading-state";
import { PageContainer } from "@/components/ui/page-container";
import { workspaceService } from "@/services/workspace.service";
import { useAuthStore } from "@/store/auth.store";
import { BeneficiarySummaryPreview } from "@/features/workspace/components/beneficiary-summary-preview";
import { DistributionSummaryPreview } from "@/features/workspace/components/distribution-summary-preview";
import { OperationalHealthCard } from "@/features/workspace/components/operational-health-card";
import { OrganizationSummaryCard } from "@/features/workspace/components/organization-summary-card";
import { ProgramSummaryPreview } from "@/features/workspace/components/program-summary-preview";
import { WorkspaceHeader } from "@/features/workspace/components/workspace-header";
import { WorkspaceKpiGrid } from "@/features/workspace/components/workspace-kpi-grid";
import { WorkspaceQuickActions } from "@/features/workspace/components/workspace-quick-actions";
import { WorkspaceRecentActivity } from "@/features/workspace/components/workspace-recent-activity";
import { sampleWorkspaceLinks } from "@/mock/workspace.mock";

export function CurrentWorkspaceModule() {
  const currentTenant = useAuthStore((state) => state.currentTenant);
  const role = useAuthStore((state) => state.role);
  const user = useAuthStore((state) => state.user);

  const workspaceQuery = useQuery({
    queryKey: ["workspace", "current", role, currentTenant?.tenantId, user?.organizationId],
    enabled: Boolean(role),
    queryFn: () =>
      workspaceService.getCurrentWorkspace({
        currentTenant,
        role: role!,
        user,
      }),
  });

  if (workspaceQuery.isLoading) {
    return (
      <PageContainer>
        <LoadingState title="Loading organization workspace" lines={5} />
      </PageContainer>
    );
  }

  const response = workspaceQuery.data;
  const workspace = response?.data;

  if (!response?.success || !workspace) {
    return (
      <PageContainer>
        <EmptyState
          title="No organization workspace is currently selected."
          description="Choose a sample organization workspace to continue your demo."
        />
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {sampleWorkspaceLinks.map((item) => (
            <Link
              key={item.id}
              href={`/organizations/${item.id}/workspace`}
              className="rounded-[28px] border border-border bg-surface p-5 shadow-sm transition hover:border-border-strong"
            >
              <p className="text-sm font-semibold text-foreground">{item.label}</p>
              <p className="mt-2 text-sm text-muted">Open organization workspace</p>
            </Link>
          ))}
        </div>
      </PageContainer>
    );
  }

  return <WorkspaceContent workspace={workspace} />;
}

export function OrganizationWorkspaceModule({ organizationId }: { organizationId: string }) {
  const role = useAuthStore((state) => state.role);
  const user = useAuthStore((state) => state.user);

  const workspaceQuery = useQuery({
    queryKey: ["workspace", organizationId, role],
    enabled: Boolean(role),
    queryFn: () => workspaceService.getWorkspaceByOrganizationId(organizationId, role!, user),
  });

  if (workspaceQuery.isLoading) {
    return (
      <PageContainer>
        <LoadingState title="Loading organization workspace" lines={5} />
      </PageContainer>
    );
  }

  if (!workspaceQuery.data?.success || !workspaceQuery.data.data) {
    return (
      <PageContainer>
        <PermissionDeniedState
          title="Organization workspace unavailable"
          description={workspaceQuery.data?.message ?? "You do not have permission to access this organization workspace."}
        />
      </PageContainer>
    );
  }

  return <WorkspaceContent workspace={workspaceQuery.data.data} />;
}

function WorkspaceContent({
  workspace,
}: {
  workspace: NonNullable<Awaited<ReturnType<typeof workspaceService.getWorkspaceByOrganizationId>>["data"]>;
}) {
  return (
    <PageContainer>
      <WorkspaceHeader role={workspace.role} workspace={workspace} />
      <WorkspaceKpiGrid kpis={workspace.kpis} />
      <section className="grid gap-4 xl:grid-cols-[1.15fr_0.85fr]">
        <OrganizationSummaryCard organization={workspace.organization} />
        <WorkspaceQuickActions actions={workspace.quickActions} />
      </section>
      <section className="grid gap-4 xl:grid-cols-[1.05fr_0.95fr]">
        <ProgramSummaryPreview items={workspace.programs} />
        <OperationalHealthCard items={workspace.operationalHealth} />
      </section>
      <section className="grid gap-4 xl:grid-cols-[0.95fr_1.05fr]">
        <BeneficiarySummaryPreview summary={workspace.beneficiarySummary} />
        <DistributionSummaryPreview summary={workspace.distributionSummary} />
      </section>
      <WorkspaceRecentActivity items={workspace.recentActivities} />
    </PageContainer>
  );
}
