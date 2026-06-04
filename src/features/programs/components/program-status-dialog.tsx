import { programStatuses } from "@/features/programs/schemas/program.schema";
import type { Program, ProgramStatus } from "@/types/program";

export function ProgramStatusDialog({
  nextStatus,
  onClose,
  onConfirm,
  onStatusChange,
  program,
}: {
  nextStatus: ProgramStatus;
  onClose: () => void;
  onConfirm: () => void;
  onStatusChange: (status: ProgramStatus) => void;
  program: Program;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
      <button type="button" className="absolute inset-0 bg-[#161616]/55" onClick={onClose} />
      <div className="relative z-10 w-full max-w-lg rounded-[32px] border border-border bg-surface p-6 shadow-2xl">
        <h2 className="text-2xl font-semibold text-foreground">Change intervention status</h2>
        <p className="mt-2 text-sm text-muted">
          Confirm the status update for <span className="font-semibold text-foreground">{program.name}</span>.
        </p>
        <div className="mt-6 space-y-4 rounded-2xl bg-surface-muted p-4">
          <div className="flex items-center justify-between gap-4">
            <span className="text-sm text-muted">Current status</span>
            <span className="text-sm font-semibold text-foreground">{program.status}</span>
          </div>
          <label className="block">
            <span className="mb-2 block text-sm font-medium text-foreground">New status</span>
            <select
              value={nextStatus}
              onChange={(event) => onStatusChange(event.target.value as ProgramStatus)}
              className="focus-ring h-12 w-full rounded-2xl border border-border bg-background px-4 text-sm text-foreground"
            >
              {programStatuses.map((status) => (
                <option key={status} value={status}>{status}</option>
              ))}
            </select>
          </label>
        </div>
        <p className="mt-4 text-sm text-warning">
          This change affects how the intervention appears across workspaces, dashboards, and future operational modules.
        </p>
        <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-end">
          <button type="button" onClick={onClose} className="inline-flex h-12 items-center justify-center rounded-2xl border border-border px-5 text-sm font-semibold text-foreground">
            Cancel
          </button>
          <button type="button" onClick={onConfirm} className="inline-flex h-12 items-center justify-center rounded-2xl bg-accent px-5 text-sm font-semibold text-accent-foreground">
            Confirm Status Change
          </button>
        </div>
      </div>
    </div>
  );
}
