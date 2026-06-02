import { CircleDollarSign, ClipboardList, ShieldCheck, Users } from "lucide-react";

import { formatCurrency, formatNumber } from "@/lib/formatters";
import type { ProgramDetails } from "@/types/program";

export function ProgramKpiCards({ program }: { program: ProgramDetails }) {
  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
      <Card icon={Users} label="Beneficiaries" value={formatNumber(program.beneficiaryCount)} />
      <Card icon={ClipboardList} label="Target Beneficiaries" value={formatNumber(program.targetBeneficiaries)} />
      <Card icon={CircleDollarSign} label="Budget" value={formatCurrency(program.budget)} />
      <Card icon={ShieldCheck} label="Total Distributed" value={formatCurrency(program.totalDistributed)} />
    </div>
  );
}

function Card({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof Users;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-[28px] border border-border bg-surface p-5 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm text-muted">{label}</p>
          <p className="mt-3 text-3xl font-semibold tracking-tight text-foreground">{value}</p>
        </div>
        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-accent/10 text-accent">
          <Icon size={20} />
        </div>
      </div>
    </div>
  );
}
