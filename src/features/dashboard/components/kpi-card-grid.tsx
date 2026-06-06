import {
  Building2,
  CircleDollarSign,
  Clock3,
  FolderKanban,
  HandCoins,
  House,
  Users,
} from "lucide-react";

import { formatCompactNumber, formatCurrency, formatNumber } from "@/lib/formatters";
import type { UserRole } from "@/types/auth";
import type { DashboardKpis } from "@/types/dashboard";
import { KpiCard } from "@/features/dashboard/components/kpi-card";

type KpiCardGridProps = {
  kpis: DashboardKpis;
  role: UserRole;
};

export function KpiCardGrid({ kpis, role }: KpiCardGridProps) {
  return (
    <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
      {role === "SUPER_ADMIN" ? (
        <KpiCard icon={Building2} label="Total Organizations" value={formatNumber(kpis.totalOrganizations)} />
      ) : null}
      <KpiCard icon={FolderKanban} label="Total Interventions" value={formatNumber(kpis.totalPrograms)} />
      <KpiCard icon={Users} label="Total Beneficiaries" value={formatNumber(kpis.totalBeneficiaries)} />
      <KpiCard icon={House} label="Beneficiary Household Impact" value={`${formatCompactNumber(kpis.householdImpact)}+`} />
      <KpiCard icon={CircleDollarSign} label="Total Distributed" value={formatCurrency(kpis.totalDistributed)} />
      <KpiCard icon={Clock3} label="Pending Distributions" value={formatCurrency(kpis.pendingDistributions)} />
      <KpiCard icon={HandCoins} label="Active Interventions" value={formatCompactNumber(kpis.activePrograms)} />
    </section>
  );
}
