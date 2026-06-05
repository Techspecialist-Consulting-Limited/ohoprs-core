import { CircleDollarSign, ShieldCheck, Users } from "lucide-react";

import { SYSTEM_BENEFICIARY_TOTAL } from "@/constants/system-metrics";
import { formatCurrency, formatNumber } from "@/lib/formatters";
import type { ProgramDetails } from "@/types/program";

export function ProgramKpiCards({ program }: { program: ProgramDetails }) {
  const valueLabel = program.amount !== null && program.amount !== undefined ? "Amount" : "Budget";
  const valueDisplay = formatCurrency(program.amount ?? program.budget ?? 0);

  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
      <Card icon={Users} label="Beneficiaries" value={formatNumber(SYSTEM_BENEFICIARY_TOTAL)} />
      <Card icon={CircleDollarSign} label={valueLabel} value={valueDisplay} />
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
