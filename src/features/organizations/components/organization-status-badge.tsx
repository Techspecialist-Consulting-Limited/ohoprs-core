import type { OrganizationStatus } from "@/types/organization";
import { cn } from "@/lib/utils";

const statusMap: Record<OrganizationStatus, string> = {
  ACTIVE: "border-success/20 bg-success/10 text-success",
  INACTIVE: "border-border bg-surface-muted text-muted",
  SUSPENDED: "border-danger/20 bg-danger/10 text-danger",
  PENDING_REVIEW: "border-warning/20 bg-warning/10 text-warning",
};

export function OrganizationStatusBadge({ status }: { status: OrganizationStatus }) {
  return (
    <span className={cn("inline-flex rounded-full border px-2.5 py-1 text-xs font-semibold", statusMap[status])}>
      {status.replaceAll("_", " ")}
    </span>
  );
}
