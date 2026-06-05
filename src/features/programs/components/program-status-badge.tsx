import type { ProgramStatus } from "@/types/program";
import { cn } from "@/lib/utils";

const statusMap: Record<ProgramStatus, string> = {
  IN_PROGRESS: "border-border bg-surface-muted text-muted",
  COMPLETED: "border-accent/20 bg-accent/10 text-accent",
  REJECTED: "border-danger/20 bg-danger/10 text-danger",
  APPROVED: "border-success/20 bg-success/10 text-success",
  ACTIVE: "border-success/20 bg-success/10 text-success",
  SUSPENDED: "border-danger/20 bg-danger/10 text-danger",
};

export function ProgramStatusBadge({ status }: { status: ProgramStatus }) {
  return (
    <span className={cn("inline-flex rounded-full border px-2.5 py-1 text-xs font-semibold", statusMap[status])}>
      {status.replaceAll("_", " ")}
    </span>
  );
}
