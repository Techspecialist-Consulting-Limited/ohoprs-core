import type { HouseholdMemberStatus } from "@/types/household";
import { cn } from "@/lib/utils";

const statusMap: Record<HouseholdMemberStatus, string> = {
  ACTIVE: "border-success/20 bg-success/10 text-success",
  DECEASED: "border-border bg-surface-muted text-muted",
  DEPARTED: "border-warning/20 bg-warning/10 text-warning",
};

export function HouseholdMemberStatusBadge({ status }: { status: HouseholdMemberStatus }) {
  return (
    <span className={cn("inline-flex rounded-full border px-2.5 py-1 text-xs font-semibold", statusMap[status])}>
      {status}
    </span>
  );
}
