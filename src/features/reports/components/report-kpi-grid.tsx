"use client";

import { AlertTriangle, CircleDollarSign, Clock3, FolderKanban, Users, Wallet } from "lucide-react";

import { MetricCard } from "@/components/ui/metric-card";
import { formatCurrency, formatNumber } from "@/lib/formatters";
import type { ReportKpis } from "@/types/report";

export function ReportKpiGrid({
  kpis,
  hideFinancials = false,
}: {
  kpis: ReportKpis;
  hideFinancials?: boolean;
}) {
  const cards = [
    !hideFinancials
      ? {
          label: "Total Distributed",
          value: formatCurrency(kpis.totalDistributed),
          change: "Distributed value",
          icon: CircleDollarSign,
        }
      : null,
    {
      label: "Total Beneficiaries",
      value: formatNumber(kpis.totalBeneficiaries),
      change: "Beneficiary reach",
      icon: Users,
      tone: "neutral" as const,
    },
    {
      label: "Total Interventions",
      value: formatNumber(kpis.totalPrograms),
      change: "Interventions in scope",
      icon: FolderKanban,
      tone: "neutral" as const,
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
    !hideFinancials
      ? {
          label: "Pending Amount",
          value: formatCurrency(kpis.pendingAmount),
          change: "Awaiting execution",
          icon: Clock3,
          tone: "warning" as const,
        }
      : null,
  ].filter(Boolean) as Array<{
    label: string;
    value: string;
    change: string;
    icon: typeof CircleDollarSign;
    tone?: "neutral" | "success" | "warning";
  }>;

  return (
    <section className={`grid gap-4 ${cards.length === 4 ? "md:grid-cols-2 xl:grid-cols-4" : "md:grid-cols-2 xl:grid-cols-3"}`}>
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
