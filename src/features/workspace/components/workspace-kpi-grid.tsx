import { CircleDollarSign, ClipboardList, Clock3, Files, HandCoins, Users } from "lucide-react";

import { formatCurrency, formatNumber } from "@/lib/formatters";
import type { WorkspaceKpis } from "@/types/workspace";
import { WorkspaceKpiCard } from "@/features/workspace/components/workspace-kpi-card";

export function WorkspaceKpiGrid({ kpis }: { kpis: WorkspaceKpis }) {
  return (
    <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
      <WorkspaceKpiCard icon={ClipboardList} label="Active Interventions" value={formatNumber(kpis.activePrograms)} />
      <WorkspaceKpiCard icon={Users} label="Total Beneficiaries" value={formatNumber(kpis.totalBeneficiaries)} />
      <WorkspaceKpiCard icon={CircleDollarSign} label="Total Distributed" value={formatCurrency(kpis.totalDistributed)} />
      <WorkspaceKpiCard icon={Clock3} label="Pending Distributions" value={formatCurrency(kpis.pendingDistributions)} />
      <WorkspaceKpiCard icon={HandCoins} label="Completed Distributions" value={formatNumber(kpis.completedDistributions)} />
      <WorkspaceKpiCard icon={Files} label="Benefit Types" value={formatNumber(kpis.benefitTypes)} />
    </section>
  );
}
