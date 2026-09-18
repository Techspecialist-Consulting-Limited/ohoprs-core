"use client";

import Link from "next/link";
import { Pencil, SquareArrowOutUpRight } from "lucide-react";

import { Pagination } from "@/components/ui/pagination";
import { RowActionPopover } from "@/components/ui/row-action-popover";
import { formatCurrency, formatDate, formatNumber } from "@/lib/formatters";
import { getRoleLabel } from "@/lib/role-labels";
import type { Distribution, DistributionListMeta } from "@/types/distribution";
import { DistributionMethodBadge } from "@/features/distributions/components/distribution-method-badge";
import { DistributionStatusBadge } from "@/features/distributions/components/distribution-status-badge";

function displayValue(item: Distribution) {
  if (item.amount !== undefined) {
    return formatCurrency(item.amount);
  }

  return `${formatNumber(item.quantity ?? 0)} packages`;
}

export function DistributionTable({
  items,
  meta,
  onPageChange,
  onLimitChange,
  isFetching,
  onStatusAction,
  onPaymentAction,
  canManage,
  canEditItem,
  canOpenApprovalReview,
  canInitiatePayment,
}: {
  items: Distribution[];
  meta: DistributionListMeta;
  onPageChange: (page: number) => void;
  onLimitChange?: (limit: number) => void;
  isFetching?: boolean;
  onStatusAction: (item: Distribution) => void;
  onPaymentAction: (item: Distribution) => void;
  canManage: boolean;
  canEditItem: (item: Distribution) => boolean;
  canOpenApprovalReview: (item: Distribution) => boolean;
  canInitiatePayment: (item: Distribution) => boolean;
}) {
  return (
    <div className="overflow-hidden rounded-[28px] border border-border bg-surface shadow-sm">
      <div className="overflow-x-auto">
        <table className="min-w-full">
          <thead className="border-b border-border bg-surface-muted">
            <tr className="text-left text-xs font-semibold uppercase tracking-[0.16em] text-muted-soft">
              {["Tranche / Batch", "Intervention", "Agency", "Benefit Type", "Approval", "Beneficiaries", "Amount / Quantity", "Status", "Created By", "Created Date", "Actions"].map((label) => (
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
                    <p className="mt-1 text-xs text-muted">{item.phaseType === "TRANCHE" ? "Cash distribution" : "Non-cash distribution"}</p>
                  </div>
                </td>
                <td className="px-5 py-4 text-sm text-foreground">{item.programName}</td>
                <td className="px-5 py-4 text-sm text-muted">{item.organizationName}</td>
                <td className="px-5 py-4"><DistributionMethodBadge method={item.method} /></td>
                <td className="px-5 py-4 text-sm text-foreground">
                  <ApprovalProgressCell item={item} />
                </td>
                <td className="px-5 py-4 text-sm text-foreground">{formatNumber(item.beneficiaryCount)}</td>
                <td className="px-5 py-4 text-sm text-foreground">{displayValue(item)}</td>
                <td className="px-5 py-4"><DistributionStatusBadge status={item.status} /></td>
                <td className="px-5 py-4 text-sm text-muted">{item.createdBy}</td>
                <td className="px-5 py-4 text-sm text-muted">{formatDate(item.createdAt)}</td>
                <td className="px-5 py-4">
                  <RowActionMenu
                    item={item}
                    onStatusAction={onStatusAction}
                    onPaymentAction={onPaymentAction}
                    canManage={canManage}
                    canEditItem={canEditItem(item)}
                    canOpenApprovalReview={canOpenApprovalReview(item)}
                    canInitiatePayment={canInitiatePayment(item)}
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
        itemLabel="distributions"
      />
    </div>
  );
}

function ApprovalProgressCell({ item }: { item: Distribution }) {
  const completed = item.distributionApprovalSteps.filter((step) => step.status === "APPROVED").length;
  const total = item.distributionApprovalSteps.length;
  const currentStep = item.distributionApprovalSteps.find((step) => step.status === "PENDING") ?? null;

  return (
    <div>
      <p className="font-medium text-foreground">{`${completed}/${total}`}</p>
      <p className="mt-1 text-xs text-muted">
        {item.approvalStatus === "REJECTED"
          ? "Rejected"
          : item.finalApprovalStatus === "REJECTED"
            ? "Final approval rejected"
            : item.approvalStatus === "APPROVED" && item.finalApprovalStatus === "PENDING"
              ? "Awaiting final approval"
              : item.finalApprovalStatus === "APPROVED"
                ? "Final approval completed"
          : currentStep
            ? `${getRoleLabel(currentStep.role)} approval`
            : total > 0
              ? "Fully approved"
              : "No approval steps"}
      </p>
    </div>
  );
}

function RowActionMenu({
  item,
  onStatusAction,
  onPaymentAction,
  canManage,
  canEditItem,
  canOpenApprovalReview,
  canInitiatePayment,
}: {
  item: Distribution;
  onStatusAction: (item: Distribution) => void;
  onPaymentAction: (item: Distribution) => void;
  canManage: boolean;
  canEditItem: boolean;
  canOpenApprovalReview: boolean;
  canInitiatePayment: boolean;
}) {
  return (
    <RowActionPopover>
      {({ close }) => (
        <>
          <Link href={`/distributions/${item.id}`} className="flex items-center gap-2 rounded-xl px-3 py-2 text-sm text-foreground hover:bg-surface-muted">
            <SquareArrowOutUpRight size={16} />
            View Details
          </Link>
          {canOpenApprovalReview ? (
            <Link href={`/distributions/${item.id}/approval`} className="flex items-center gap-2 rounded-xl px-3 py-2 text-sm text-foreground hover:bg-surface-muted">
              <SquareArrowOutUpRight size={16} />
              Open Approval Review
            </Link>
          ) : null}
          {canEditItem ? (
            <Link href={`/distributions/${item.id}/edit`} className="flex items-center gap-2 rounded-xl px-3 py-2 text-sm text-foreground hover:bg-surface-muted">
              <Pencil size={16} />
              Edit Distribution
            </Link>
          ) : null}
          {canInitiatePayment ? (
            <button
              type="button"
              onClick={() => {
                onPaymentAction(item);
                close();
              }}
              className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left text-sm text-foreground hover:bg-surface-muted"
            >
              <Pencil size={16} />
              Make Payment
            </button>
          ) : null}
          {canManage && canEditItem ? (
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
