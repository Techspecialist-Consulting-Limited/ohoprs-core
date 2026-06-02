"use client";

import { useQuery } from "@tanstack/react-query";
import { AlertTriangle } from "lucide-react";

import { EmptyState } from "@/components/ui/empty-state";
import { LoadingState } from "@/components/ui/loading-state";
import { PageContainer } from "@/components/ui/page-container";
import { DashboardHeader } from "@/features/dashboard/components/dashboard-header";
import { DistributionOverviewChart } from "@/features/dashboard/components/distribution-overview-chart";
import { BeneficiaryGrowthChart } from "@/features/dashboard/components/beneficiary-growth-chart";
import { BenefitTypeBreakdown } from "@/features/dashboard/components/benefit-type-breakdown";
import { KpiCardGrid } from "@/features/dashboard/components/kpi-card-grid";
import { QuickActions } from "@/features/dashboard/components/quick-actions";
import { RecentActivityFeed } from "@/features/dashboard/components/recent-activity-feed";
import { SystemStatusCard } from "@/features/dashboard/components/system-status-card";
import { dashboardService } from "@/services/dashboard.service";
import { useAuthStore } from "@/store/auth.store";

export function DashboardOverview() {
  const currentTenant = useAuthStore((state) => state.currentTenant);
  const role = useAuthStore((state) => state.role);

  const dashboardQuery = useQuery({
    queryKey: ["dashboard", role, currentTenant?.tenantId],
    enabled: Boolean(role),
    queryFn: () => dashboardService.getDashboardByRole(role!, currentTenant),
  });

  if (dashboardQuery.isLoading) {
    return (
      <PageContainer>
        <LoadingState title="Loading executive dashboard" lines={5} />
        <div className="grid gap-4 lg:grid-cols-2">
          <LoadingState title="Loading charts" lines={6} />
          <LoadingState title="Loading operational summaries" lines={6} />
        </div>
      </PageContainer>
    );
  }

  if (dashboardQuery.isError || !dashboardQuery.data?.success) {
    return (
      <PageContainer>
        <div className="rounded-[28px] border border-danger/20 bg-danger/10 p-6">
          <div className="flex items-start gap-3">
            <AlertTriangle size={20} className="mt-0.5 text-danger" />
            <div>
              <p className="text-base font-semibold text-foreground">Dashboard unavailable</p>
              <p className="mt-1 text-sm text-muted">
                The executive dashboard could not be loaded from the mock service layer.
              </p>
            </div>
          </div>
        </div>
      </PageContainer>
    );
  }

  const dashboard = dashboardQuery.data.data;

  if (!dashboard) {
    return (
      <PageContainer>
        <EmptyState
          title="No dashboard data available"
          description="The dashboard service returned an empty response for the current role."
        />
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <DashboardHeader dashboard={dashboard} role={role!} />
      <KpiCardGrid kpis={dashboard.kpis} />
      <section className="grid gap-4 xl:grid-cols-[1.4fr_1fr]">
        <DistributionOverviewChart data={dashboard.distributionOverview} />
        <SystemStatusCard items={dashboard.systemStatus} />
      </section>
      <section className="grid gap-4 xl:grid-cols-[1.15fr_0.85fr]">
        <BeneficiaryGrowthChart data={dashboard.beneficiaryGrowth} />
        <QuickActions actions={dashboard.quickActions} role={role!} />
      </section>
      <section className="grid gap-4 xl:grid-cols-[0.95fr_1.05fr]">
        <BenefitTypeBreakdown data={dashboard.benefitTypeBreakdown} />
        <RecentActivityFeed data={dashboard.recentActivities} />
      </section>
    </PageContainer>
  );
}
