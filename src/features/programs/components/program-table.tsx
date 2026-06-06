"use client";

import Link from "next/link";
import { ChevronLeft, ChevronRight, Pencil, SquareArrowOutUpRight } from "lucide-react";

import { RowActionPopover } from "@/components/ui/row-action-popover";
import { formatCurrency, formatNumber } from "@/lib/formatters";
import { cn } from "@/lib/utils";
import type { Program, ProgramListMeta } from "@/types/program";
import type { UserRole } from "@/types/auth";
import { BenefitTypeBadge } from "@/features/programs/components/benefit-type-badge";
import { ProgramStatusBadge } from "@/features/programs/components/program-status-badge";

export function ProgramTable({
  items,
  meta,
  onPageChange,
  onStatusAction,
  role,
  canChangeStatus,
  approvalUserId,
}: {
  items: Program[];
  meta: ProgramListMeta;
  onPageChange: (page: number) => void;
  onStatusAction: (program: Program) => void;
  role: UserRole;
  canChangeStatus: boolean;
  approvalUserId?: string | null;
}) {
  const canEdit = role === "SUPER_ADMIN";
  const pageNumbers = Array.from({ length: meta.totalPages }, (_, index) => index + 1);

  return (
    <div className="overflow-hidden rounded-[28px] border border-border bg-surface shadow-sm">
      <div className="overflow-x-auto">
        <table className="min-w-full">
          <thead className="border-b border-border bg-surface-muted">
            <tr className="text-left text-xs font-semibold uppercase tracking-[0.16em] text-muted-soft">
              {["Intervention Name", "Organization", "Benefit Type", "Status", "Number of Trenches/Batch", "Total Distributed", "Start Date", "End Date", "Actions"].map((label) => (
                <th key={label} className="px-5 py-4">{label}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {items.map((item) => (
              <tr key={item.id} className="border-b border-border last:border-b-0">
                <td className="px-5 py-4">
                  <div>
                    <p className="text-sm font-semibold text-foreground">{item.name}</p>
                    <p className="mt-1 text-xs text-muted">
                      {item.amount !== null && item.amount !== undefined
                        ? `${formatCurrency(item.amount)} amount`
                        : `${formatCurrency(item.budget ?? 0)} budget`}
                    </p>
                    {approvalUserId ? <ApprovalAssignmentHint item={item} approvalUserId={approvalUserId} /> : null}
                  </div>
                </td>
                <td className="px-5 py-4 text-sm text-muted">{item.organizationName}</td>
                <td className="px-5 py-4"><BenefitTypeBadge benefitType={item.benefitType} /></td>
                <td className="px-5 py-4"><ProgramStatusBadge status={item.status} /></td>
                <td className="px-5 py-4 text-sm text-foreground">
                  {item.benefitType === "CASH"
                    ? formatNumber(item.numberOfTrenches ?? 0)
                    : formatNumber(item.batch ?? 0)}
                </td>
                <td className="px-5 py-4 text-sm text-foreground">{formatCurrency(item.totalDistributed)}</td>
                <td className="px-5 py-4 text-sm text-muted">{item.startDate}</td>
                <td className="px-5 py-4 text-sm text-muted">{item.endDate}</td>
                <td className="px-5 py-4">
                  <RowActionMenu
                    canEdit={canEdit}
                    canChangeStatus={canChangeStatus}
                    item={item}
                    onStatusAction={onStatusAction}
                    approvalUserId={approvalUserId}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex flex-col gap-4 border-t border-border px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-muted">
          Showing page {meta.page} of {meta.totalPages} ({formatNumber(meta.total)} interventions)
        </p>
        <div className="flex items-center gap-2">
          <button
            type="button"
            disabled={meta.page === 1}
            onClick={() => onPageChange(meta.page - 1)}
            className="inline-flex h-10 items-center gap-2 rounded-2xl border border-border px-3 text-sm text-foreground disabled:cursor-not-allowed disabled:opacity-50"
          >
            <ChevronLeft size={16} />
            Previous
          </button>
          {pageNumbers.map((page) => (
            <button
              key={page}
              type="button"
              onClick={() => onPageChange(page)}
              className={cn(
                "inline-flex h-10 w-10 items-center justify-center rounded-2xl border text-sm font-medium",
                page === meta.page
                  ? "border-accent bg-accent text-accent-foreground"
                  : "border-border bg-surface text-foreground",
              )}
            >
              {page}
            </button>
          ))}
          <button
            type="button"
            disabled={meta.page === meta.totalPages}
            onClick={() => onPageChange(meta.page + 1)}
            className="inline-flex h-10 items-center gap-2 rounded-2xl border border-border px-3 text-sm text-foreground disabled:cursor-not-allowed disabled:opacity-50"
          >
            Next
            <ChevronRight size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}

function RowActionMenu({
  canEdit,
  canChangeStatus,
  item,
  onStatusAction,
  approvalUserId,
}: {
  canEdit: boolean;
  canChangeStatus: boolean;
  item: Program;
  onStatusAction: (program: Program) => void;
  approvalUserId?: string | null;
}) {
  const assignedStep = approvalUserId
    ? item.approvalSteps?.find((step) => step.assigneeUserId === approvalUserId) ?? null
    : null;

  return (
    <RowActionPopover>
      {({ close }) => (
        <>
          <Link
            href={`/programs/${item.id}`}
            className="flex items-center gap-2 rounded-xl px-3 py-2 text-sm text-foreground hover:bg-surface-muted"
          >
            <SquareArrowOutUpRight size={16} />
            View Details
          </Link>
          {assignedStep ? (
            <Link
              href={`/programs/${item.id}/approval`}
              className="flex items-center gap-2 rounded-xl px-3 py-2 text-sm text-foreground hover:bg-surface-muted"
            >
              <SquareArrowOutUpRight size={16} />
              Open Approval Review
            </Link>
          ) : null}
          {canEdit ? (
            <Link
              href={`/programs/${item.id}/edit`}
              className="flex items-center gap-2 rounded-xl px-3 py-2 text-sm text-foreground hover:bg-surface-muted"
            >
              <Pencil size={16} />
              Edit Intervention
            </Link>
          ) : null}
          {canChangeStatus ? (
            <button
              type="button"
              onClick={() => {
                onStatusAction(item);
                close();
              }}
              className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left text-sm text-foreground hover:bg-surface-muted"
            >
              <Pencil size={16} />
              Change Status
            </button>
          ) : null}
        </>
      )}
    </RowActionPopover>
  );
}

function ApprovalAssignmentHint({
  item,
  approvalUserId,
}: {
  item: Program;
  approvalUserId: string;
}) {
  const assignedStep = item.approvalSteps?.find((step) => step.assigneeUserId === approvalUserId) ?? null;

  if (!assignedStep) {
    return null;
  }

  const currentPendingStep = item.approvalSteps?.find((step) => step.status === "PENDING") ?? null;
  const isActionable = currentPendingStep?.id === assignedStep.id;

  return (
    <p className={cn("mt-1 text-xs", isActionable ? "text-accent" : "text-muted")}>
      {isActionable
        ? `Awaiting your approval at Step ${assignedStep.order}`
        : `Assigned to you at Step ${assignedStep.order}`}
    </p>
  );
}
