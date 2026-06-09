import {
  Building2,
  CircleDollarSign,
  FolderKanban,
  HandCoins,
  House,
  Landmark,
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
      <KpiCard icon={role === "SUPER_ADMIN" ? Building2 : FolderKanban} label="Total Agencies" value={formatNumber(kpis.totalOrganizations)} />
      <KpiCard icon={HandCoins} label="Active Interventions" value={formatCompactNumber(kpis.activePrograms)} />
      <KpiCard icon={Users} label="Total Beneficiaries" value={formatNumber(kpis.totalBeneficiaries)} />
      <KpiCard icon={House} label="Households Impacted" value={formatCompactNumber(kpis.householdImpact)} />
      <KpiCard icon={CircleDollarSign} label="Total Cash Relief" value={formatCurrency(kpis.totalCashRelief)} />
      <KpiCard icon={Landmark} label="Distributed Relief Material" value={formatCompactNumber(kpis.equivalentNonCashRelief)} />
    </section>
  );
}
