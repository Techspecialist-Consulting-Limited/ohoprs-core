"use client";

import { AlertTriangle, Building2, CircleDollarSign, Clock3, FolderKanban, HandCoins, House, Landmark, Users, Wallet } from "lucide-react";

import { MetricCard } from "@/components/ui/metric-card";
import { formatCompactNumber, formatCurrency, formatNumber } from "@/lib/formatters";
import type { ReportKpis } from "@/types/report";

export function ReportKpiGrid({
  kpis,
}: {
  kpis: ReportKpis;
}) {
  const cards = [
    {
      label: "Total Agencies",
      value: formatNumber(kpis.totalOrganizations),
      change: "Agencies in scope",
      icon: Building2,
      tone: "neutral" as const,
    },
    {
      label: "Active Interventions",
      value: formatCompactNumber(kpis.activePrograms),
      change: "Currently active programs",
      icon: HandCoins,
      tone: "neutral" as const,
    },
    {
      label: "Total Beneficiaries",
      value: formatNumber(kpis.totalBeneficiaries),
      change: "Beneficiary reach",
      icon: Users,
      tone: "neutral" as const,
    },
    {
      label: "Households Impacted",
      value: formatCompactNumber(kpis.householdImpact),
      change: "Household coverage",
      icon: House,
      tone: "neutral" as const,
    },
    {
      label: "Total Cash Relief",
      value: formatCurrency(kpis.totalCashRelief),
      change: "Cash value distributed",
      icon: CircleDollarSign,
    },
    {
      label: "Distributed Relief Material",
      value: formatCompactNumber(kpis.equivalentNonCashRelief),
      change: "Non-cash relief volume",
      icon: Landmark,
    },
    {
      label: "Completed Distributions",
      value: formatNumber(kpis.completedDistributions),
      change: "Successful delivery batches",
      icon: Wallet,
    },
    {
      label: "Failed Distributions",
      value: formatNumber(kpis.failedDistributions),
      change: "Requires remediation",
      icon: AlertTriangle,
      tone: "warning" as const,
    },
    {
      label: "Total Interventions",
      value: formatNumber(kpis.totalPrograms),
      change: "Interventions in scope",
      icon: FolderKanban,
      tone: "neutral" as const,
    },
    {
      label: "Pending Amount",
      value: formatCurrency(kpis.pendingAmount),
      change: "Awaiting execution",
      icon: Clock3,
      tone: "warning" as const,
    },
  ].filter(Boolean) as Array<{
    label: string;
    value: string;
    change: string;
    icon: typeof CircleDollarSign;
    tone?: "neutral" | "success" | "warning";
  }>;

  return (
    <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
      {cards.map((card) => (
        <MetricCard
          key={card.label}
          label={card.label}
          value={card.value}
          change={card.change}
          icon={card.icon}
          tone={card.tone}
        />
      ))}
    </section>
  );
}
