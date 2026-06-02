import type { BenefitStatus } from "@/types/beneficiary";
import { cn } from "@/lib/utils";

const statusMap: Record<BenefitStatus, string> = {
  ACTIVE: "border-success/20 bg-success/10 text-success",
  PAUSED: "border-warning/20 bg-warning/10 text-warning",
  EXITED: "border-border bg-surface-muted text-muted",
  SUSPENDED: "border-danger/20 bg-danger/10 text-danger",
};

export function BeneficiaryStatusBadge({ status }: { status: BenefitStatus }) {
  return (
    <span className={cn("inline-flex rounded-full border px-2.5 py-1 text-xs font-semibold", statusMap[status])}>
      {status}
    </span>
  );
}
