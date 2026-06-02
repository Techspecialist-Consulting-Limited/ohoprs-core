import { AlertTriangle, BadgeCheck, Banknote, CalendarClock, Layers3, Package } from "lucide-react";

import { formatCurrency, formatDate, formatNumber } from "@/lib/formatters";
import type { Beneficiary360Details } from "@/types/beneficiary";

export function BeneficiaryBenefitKpis({ beneficiary }: { beneficiary: Beneficiary360Details }) {
  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
      <Card icon={Banknote} label="Total Cash Received" value={formatCurrency(beneficiary.benefit360Summary.totalCashReceived)} />
      <Card icon={Package} label="Total Non-Cash Benefits" value={formatNumber(beneficiary.benefit360Summary.totalNonCashBenefits)} />
      <Card icon={Layers3} label="Programs Enrolled" value={formatNumber(beneficiary.benefit360Summary.programsEnrolled)} />
      <Card icon={CalendarClock} label="Last Benefit Date" value={formatDate(beneficiary.benefit360Summary.lastBenefitDate)} />
      <Card icon={BadgeCheck} label="Verification Status" value={beneficiary.verificationStatus} />
      <Card icon={AlertTriangle} label="Risk Flags" value={formatNumber(beneficiary.benefit360Summary.riskFlags)} />
    </div>
  );
}

function Card({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof Banknote;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-[28px] border border-border bg-surface p-5 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm text-muted">{label}</p>
          <p className="mt-3 text-xl font-semibold tracking-tight text-foreground">{value}</p>
        </div>
        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-accent/10 text-accent">
          <Icon size={20} />
        </div>
      </div>
    </div>
  );
}
