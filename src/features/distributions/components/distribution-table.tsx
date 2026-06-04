"use client";

import Link from "next/link";
import { ChevronLeft, ChevronRight, Pencil, SquareArrowOutUpRight } from "lucide-react";

import { RowActionPopover } from "@/components/ui/row-action-popover";
import { formatCurrency, formatDate, formatNumber } from "@/lib/formatters";
import { cn } from "@/lib/utils";
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
  onStatusAction,
  canManage,
  canEditItem,
}: {
  items: Distribution[];
  meta: DistributionListMeta;
  onPageChange: (page: number) => void;
  onStatusAction: (item: Distribution) => void;
  canManage: boolean;
  canEditItem: (item: Distribution) => boolean;
}) {
  const pageNumbers = Array.from({ length: meta.totalPages }, (_, index) => index + 1);

  return (
    <div className="overflow-hidden rounded-[28px] border border-border bg-surface shadow-sm">
      <div className="overflow-x-auto">
        <table className="min-w-full">
          <thead className="border-b border-border bg-surface-muted">
            <tr className="text-left text-xs font-semibold uppercase tracking-[0.16em] text-muted-soft">
              {["Distribution Name", "Intervention", "Organization", "Benefit Type", "Beneficiaries", "Amount / Quantity", "Status", "Created By", "Created Date", "Actions"].map((label) => (
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
                    <p className="mt-1 text-xs text-muted">{item.method.replaceAll("_", " ")}</p>
                  </div>
                </td>
                <td className="px-5 py-4 text-sm text-foreground">{item.programName}</td>
                <td className="px-5 py-4 text-sm text-muted">{item.organizationName}</td>
                <td className="px-5 py-4"><DistributionMethodBadge method={item.method} /></td>
                <td className="px-5 py-4 text-sm text-foreground">{formatNumber(item.beneficiaryCount)}</td>
                <td className="px-5 py-4 text-sm text-foreground">{displayValue(item)}</td>
                <td className="px-5 py-4"><DistributionStatusBadge status={item.status} /></td>
                <td className="px-5 py-4 text-sm text-muted">{item.createdBy}</td>
                <td className="px-5 py-4 text-sm text-muted">{formatDate(item.createdAt)}</td>
                <td className="px-5 py-4">
                  <RowActionMenu
                    item={item}
                    onStatusAction={onStatusAction}
                    canManage={canManage}
                    canEditItem={canEditItem(item)}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex flex-col gap-4 border-t border-border px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-muted">
          Showing page {meta.page} of {meta.totalPages} ({formatNumber(meta.total)} distributions)
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
                page === meta.page ? "border-accent bg-accent text-accent-foreground" : "border-border bg-surface text-foreground",
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
  item,
  onStatusAction,
  canManage,
  canEditItem,
}: {
  item: Distribution;
  onStatusAction: (item: Distribution) => void;
  canManage: boolean;
  canEditItem: boolean;
}) {
  return (
    <RowActionPopover>
      {({ close }) => (
        <>
          <Link href={`/distributions/${item.id}`} className="flex items-center gap-2 rounded-xl px-3 py-2 text-sm text-foreground hover:bg-surface-muted">
            <SquareArrowOutUpRight size={16} />
            View Details
          </Link>
          {canEditItem ? (
            <Link href={`/distributions/${item.id}/edit`} className="flex items-center gap-2 rounded-xl px-3 py-2 text-sm text-foreground hover:bg-surface-muted">
              <Pencil size={16} />
              Edit Distribution
            </Link>
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
