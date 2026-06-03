"use client";

import { AlertTriangle, Banknote, CheckCircle2, Clock3, RotateCcw, Users } from "lucide-react";

import { MetricCard } from "@/components/ui/metric-card";
import { formatCurrency, formatNumber } from "@/lib/formatters";
import type { PaymentConsoleReadinessKpis } from "@/types/payment-console";

export function PaymentReadinessCards({ data }: { data: PaymentConsoleReadinessKpis }) {
  return (
    <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
      <MetricCard icon={Users} label="Total Beneficiaries" value={formatNumber(data.totalBeneficiaries)} change="Batch size" tone="neutral" />
      <MetricCard icon={CheckCircle2} label="Eligible Beneficiaries" value={formatNumber(data.eligibleBeneficiaries)} change="Ready for payment" />
      <MetricCard icon={Clock3} label="Pending Payments" value={formatNumber(data.pendingPayments)} change="Awaiting execution" tone="warning" />
      <MetricCard icon={CheckCircle2} label="Paid Payments" value={formatNumber(data.paidPayments)} change="Settled successfully" />
      <MetricCard icon={AlertTriangle} label="Failed Payments" value={formatNumber(data.failedPayments)} change="Needs follow-up" tone="warning" />
      <MetricCard icon={RotateCcw} label="Reversed Payments" value={formatNumber(data.reversedPayments)} change="Post-settlement reversals" tone="neutral" />
      <MetricCard icon={Banknote} label="Estimated Payout" value={formatCurrency(data.estimatedTotalPayout)} change="Current filtered scope" />
    </section>
  );
}
