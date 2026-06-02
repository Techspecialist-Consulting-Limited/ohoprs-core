"use client";

import {
  Activity,
  Building2,
  CircleDollarSign,
  Clock3,
  Layers3,
  ShieldCheck,
  Users,
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";

import { MetricCard } from "@/components/ui/metric-card";
import { PageContainer } from "@/components/ui/page-container";
import { PageHeader } from "@/components/ui/page-header";
import { StatusBadge } from "@/components/ui/status-badge";
import { dashboardService } from "@/services/dashboard.service";

const quickActions = [
  "Review tenant onboarding readiness",
  "Inspect distribution control checkpoints",
  "Validate service integration contracts",
];

export function DashboardOverview() {
  const dashboardQuery = useQuery({
    queryKey: ["dashboard"],
    queryFn: () => dashboardService.getDashboard(),
  });

  const response = dashboardQuery.data;
  const dashboard = response?.data;

  return (
    <PageContainer>
      <PageHeader
        eyebrow="Phase 1 foundation"
        title="Platform dashboard"
        description="Core shell, reusable UI, theme system, and mock-service architecture for a multi-tenant government benefits platform."
      />

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          label="Registered organizations"
          value={dashboard ? dashboard.organizations.toLocaleString() : "—"}
          change="Mock baseline seeded"
          icon={Building2}
        />
        <MetricCard
          label="Configured programs"
          value={dashboard ? dashboard.programs.toLocaleString() : "—"}
          change="Architecture only"
          icon={Layers3}
          tone="neutral"
        />
        <MetricCard
          label="Beneficiary capacity"
          value={dashboard ? dashboard.beneficiaries.toLocaleString() : "—"}
          change="Phase-ready dataset"
          icon={Users}
        />
        <MetricCard
          label="Distribution volume"
          value={dashboard ? dashboard.monthlyTransfers : "—"}
          change="Sandbox metric"
          icon={CircleDollarSign}
          tone="warning"
        />
      </section>

      <section className="grid gap-4 xl:grid-cols-[1.4fr_1fr]">
        <div className="rounded-[28px] border border-border bg-surface p-6 shadow-sm">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-sm font-semibold text-foreground">Activity overview</p>
              <p className="mt-1 text-sm text-muted">
                Mock indicators demonstrate how operational summaries will plug into the shell.
              </p>
            </div>
            <StatusBadge label="System healthy" tone="success" />
          </div>
          <div className="mt-8 grid grid-cols-12 items-end gap-3">
            {(dashboard?.monthlyTrend ?? [32, 46, 41, 58, 62, 70, 64]).map((value, index) => (
              <div key={index} className="col-span-1 flex flex-col items-center gap-2">
                <div
                  className="w-full rounded-t-full bg-accent/75"
                  style={{ height: `${value * 1.6}px`, minHeight: "30px" }}
                />
                <span className="text-[11px] text-muted">{index + 1}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-4">
          <div className="rounded-[28px] border border-border bg-surface p-6 shadow-sm">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-semibold text-foreground">System status</p>
                <p className="mt-1 text-sm text-muted">Platform control points for Phase 1.</p>
              </div>
              <ShieldCheck size={20} className="text-accent" />
            </div>
            <div className="mt-6 space-y-4">
              <div className="flex items-center justify-between rounded-2xl bg-surface-muted px-4 py-3">
                <span className="text-sm text-foreground">Theme persistence</span>
                <StatusBadge label="Ready" tone="success" />
              </div>
              <div className="flex items-center justify-between rounded-2xl bg-surface-muted px-4 py-3">
                <span className="text-sm text-foreground">Mock API pattern</span>
                <StatusBadge label="Ready" tone="success" />
              </div>
              <div className="flex items-center justify-between rounded-2xl bg-surface-muted px-4 py-3">
                <span className="text-sm text-foreground">Tenant context</span>
                <StatusBadge label="Placeholder" tone="warning" />
              </div>
            </div>
          </div>

          <div className="rounded-[28px] border border-border bg-surface p-6 shadow-sm">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-semibold text-foreground">Quick actions</p>
                <p className="mt-1 text-sm text-muted">Prototype shortcuts for later phases.</p>
              </div>
              <Activity size={20} className="text-accent" />
            </div>
            <div className="mt-5 space-y-3">
              {quickActions.map((action) => (
                <div
                  key={action}
                  className="rounded-2xl border border-border bg-surface-muted px-4 py-3 text-sm text-foreground"
                >
                  {action}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
        <div className="rounded-[28px] border border-border bg-surface p-6 shadow-sm">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-semibold text-foreground">Recent platform activity</p>
              <p className="mt-1 text-sm text-muted">Illustrative events from the mock service layer.</p>
            </div>
            <Clock3 size={20} className="text-accent" />
          </div>
          <div className="mt-5 space-y-4">
            {(dashboard?.recentActivity ?? []).map((item) => (
              <div key={item.id} className="flex items-start justify-between gap-4 rounded-2xl bg-surface-muted px-4 py-3">
                <div>
                  <p className="text-sm font-medium text-foreground">{item.title}</p>
                  <p className="mt-1 text-sm text-muted">{item.description}</p>
                </div>
                <span className="shrink-0 text-xs text-muted-soft">{item.time}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-[28px] border border-border bg-surface p-6 shadow-sm">
          <p className="text-sm font-semibold text-foreground">Foundation notes</p>
          <p className="mt-1 text-sm text-muted">
            This phase focuses strictly on shell architecture, visual system, data boundaries, and state wiring.
          </p>
          <ul className="mt-5 space-y-3">
            <li className="rounded-2xl border border-border bg-surface-muted px-4 py-3 text-sm text-foreground">
              src/app route structure with shared platform layout
            </li>
            <li className="rounded-2xl border border-border bg-surface-muted px-4 py-3 text-sm text-foreground">
              Reusable UI primitives for later modules
            </li>
            <li className="rounded-2xl border border-border bg-surface-muted px-4 py-3 text-sm text-foreground">
              Mock services aligned with a global API response contract
            </li>
            <li className="rounded-2xl border border-border bg-surface-muted px-4 py-3 text-sm text-foreground">
              Persisted theme store with light, dark, and system modes
            </li>
          </ul>
        </div>
      </section>
    </PageContainer>
  );
}
