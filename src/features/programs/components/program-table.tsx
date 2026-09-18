"use client";

import Link from "next/link";
import { Pencil, SquareArrowOutUpRight } from "lucide-react";

import { Pagination } from "@/components/ui/pagination";
import { RowActionPopover } from "@/components/ui/row-action-popover";
import { formatCurrency, formatNumber } from "@/lib/formatters";
import { cn } from "@/lib/utils";
import type { Program, ProgramListMeta } from "@/types/program";
import type { UserRole } from "@/types/auth";
import { BenefitTypeBadge } from "@/features/programs/components/benefit-type-badge";
import { ProgramStatusBadge } from "@/features/programs/components/program-status-badge";

function getInterventionApprovalSummary(item: Program) {
  const approvalSteps = item.approvalSteps ?? [];
  const total = approvalSteps.length;
  const completed = approvalSteps.filter((step) => step.status === "APPROVED").length;
  const rejectedStep = approvalSteps.find((step) => step.status === "REJECTED") ?? null;
  const currentStep = approvalSteps.find((step) => step.status === "PENDING") ?? null;

  return {
    total,
    completed,
    rejectedStep,
    currentStep,
  };
}

export function ProgramTable({
  items,
  meta,
  onPageChange,
  onLimitChange,
  isFetching,
  onStatusAction,
  role,
  canChangeStatus,
  approvalUserId,
}: {
  items: Program[];
  meta: ProgramListMeta;
  onPageChange: (page: number) => void;
  onLimitChange?: (limit: number) => void;
  isFetching?: boolean;
  onStatusAction: (program: Program) => void;
  role: UserRole;
  canChangeStatus: boolean;
  approvalUserId?: string | null;
}) {
  const canEditIntervention = role === "SUPER_ADMIN";
  const canManageDistributionApproval = role === "ORG_ADMIN";

  return (
    <div className="overflow-hidden rounded-[28px] border border-border bg-surface shadow-sm">
      <div className="overflow-x-auto">
        <table className="min-w-full">
          <thead className="border-b border-border bg-surface-muted">
            <tr className="text-left text-xs font-semibold uppercase tracking-[0.16em] text-muted-soft">
              {["Intervention Name", "Agency", "Benefit Type", "Status", "Intervention Approval", "Distribution Approval", "Number of Tranches/Batch", "Total Distributed", "Start Date", "End Date", "Actions"].map((label) => (
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
                  <InterventionApprovalStatus item={item} />
                </td>
                <td className="px-5 py-4 text-sm text-foreground">
                  <div>
                    <p className="font-medium">
                      {item.distributionApprovalSteps?.length
                        ? `${formatNumber(item.distributionApprovalSteps.length)} steps configured`
                        : "No approval steps"}
                    </p>
                    <p className="mt-1 text-xs text-muted">
                      {item.distributionApprovalSteps?.[0]?.role
                        ? `${item.distributionApprovalSteps[0].role.replaceAll("_", " ")} approval starts first`
                        : "Required before creating distribution"}
                    </p>
                  </div>
                </td>
                <td className="px-5 py-4 text-sm text-foreground">
                  {item.benefitType === "CASH"
                    ? formatNumber(item.numberOfTranches ?? 0)
                    : formatNumber(item.batch ?? 0)}
                </td>
                <td className="px-5 py-4 text-sm text-foreground">{formatCurrency(item.totalDistributed)}</td>
                <td className="px-5 py-4 text-sm text-muted">{item.startDate}</td>
                <td className="px-5 py-4 text-sm text-muted">{item.endDate}</td>
                <td className="px-5 py-4">
                  <RowActionMenu
                    canEditIntervention={canEditIntervention}
                    canManageDistributionApproval={canManageDistributionApproval}
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

      <Pagination
        meta={meta}
        onPageChange={onPageChange}
        onLimitChange={onLimitChange}
        isFetching={isFetching}
        itemLabel="interventions"
      />
    </div>
  );
}

function InterventionApprovalStatus({ item }: { item: Program }) {
  const { completed, total, rejectedStep, currentStep } = getInterventionApprovalSummary(item);

  if (!total) {
    return (
      <div>
        <p className="font-medium">No approval steps</p>
        <p className="mt-1 text-xs text-muted">System approval is not configured.</p>
      </div>
    );
  }

  return (
    <div>
      <p className="font-medium">
        {completed}/{total}
      </p>
      <p className="mt-1 text-xs text-muted">
        {rejectedStep
          ? `Rejected at ${rejectedStep.role.replaceAll("_", " ")}`
          : currentStep
            ? `Awaiting ${currentStep.role.replaceAll("_", " ")}`
            : "Fully approved"}
      </p>
    </div>
  );
}

function RowActionMenu({
  canEditIntervention,
  canManageDistributionApproval,
  canChangeStatus,
  item,
  onStatusAction,
  approvalUserId,
}: {
  canEditIntervention: boolean;
  canManageDistributionApproval: boolean;
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
          {canManageDistributionApproval ? (
            <Link
              href={`/programs/${item.id}/distribution-approval`}
              className="flex items-center gap-2 rounded-xl px-3 py-2 text-sm text-foreground hover:bg-surface-muted"
            >
              <Pencil size={16} />
              Add Approval Steps
            </Link>
          ) : null}
          {canEditIntervention ? (
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
