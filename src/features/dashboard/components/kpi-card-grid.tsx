import {
  Building2,
  CircleDollarSign,
  Clock3,
  FolderKanban,
  HandCoins,
  Users,
} from "lucide-react";

import { formatCompactNumber, formatCurrency, formatNumber } from "@/lib/formatters";
import type { DashboardKpis } from "@/types/dashboard";
import { KpiCard } from "@/features/dashboard/components/kpi-card";

export function KpiCardGrid({ kpis }: { kpis: DashboardKpis }) {
  return (
    <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
      <KpiCard icon={Building2} label="Total Organizations" value={formatNumber(kpis.totalOrganizations)} />
      <KpiCard icon={FolderKanban} label="Total Interventions" value={formatNumber(kpis.totalPrograms)} />
      <KpiCard icon={Users} label="Total Beneficiaries" value={formatNumber(kpis.totalBeneficiaries)} />
      <KpiCard icon={CircleDollarSign} label="Total Distributed" value={formatCurrency(kpis.totalDistributed)} />
      <KpiCard icon={Clock3} label="Pending Distributions" value={formatCurrency(kpis.pendingDistributions)} />
      <KpiCard icon={HandCoins} label="Active Interventions" value={formatCompactNumber(kpis.activePrograms)} />
    </section>
  );
}
