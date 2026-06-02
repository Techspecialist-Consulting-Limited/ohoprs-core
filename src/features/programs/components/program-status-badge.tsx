import type { ProgramStatus } from "@/types/program";
import { cn } from "@/lib/utils";

const statusMap: Record<ProgramStatus, string> = {
  DRAFT: "border-border bg-surface-muted text-muted",
  ACTIVE: "border-success/20 bg-success/10 text-success",
  PAUSED: "border-warning/20 bg-warning/10 text-warning",
  COMPLETED: "border-accent/20 bg-accent/10 text-accent",
  SUSPENDED: "border-danger/20 bg-danger/10 text-danger",
};

export function ProgramStatusBadge({ status }: { status: ProgramStatus }) {
  return (
    <span className={cn("inline-flex rounded-full border px-2.5 py-1 text-xs font-semibold", statusMap[status])}>
      {status}
    </span>
  );
}
