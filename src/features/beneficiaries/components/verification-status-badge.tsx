import type { VerificationStatus } from "@/types/beneficiary";
import { cn } from "@/lib/utils";

const statusMap: Record<VerificationStatus, string> = {
  VERIFIED: "border-success/20 bg-success/10 text-success",
  PENDING: "border-warning/20 bg-warning/10 text-warning",
  FAILED: "border-danger/20 bg-danger/10 text-danger",
  FLAGGED: "border-border-strong bg-surface-muted text-foreground",
};

export function VerificationStatusBadge({ status }: { status: VerificationStatus }) {
  return (
    <span className={cn("inline-flex rounded-full border px-2.5 py-1 text-xs font-semibold", statusMap[status])}>
      {status}
    </span>
  );
}
