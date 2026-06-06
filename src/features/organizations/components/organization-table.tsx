"use client";

import Link from "next/link";
import { ChevronLeft, ChevronRight, Pencil, SquareArrowOutUpRight } from "lucide-react";

import { RowActionPopover } from "@/components/ui/row-action-popover";
import { formatCurrency, formatDateTime, formatNumber } from "@/lib/formatters";
import { cn } from "@/lib/utils";
import type { Organization, OrganizationListMeta } from "@/types/organization";
import type { UserRole } from "@/types/auth";
import { OrganizationStatusBadge } from "@/features/organizations/components/organization-status-badge";

export function OrganizationTable({
  items,
  meta,
  onPageChange,
  onStatusAction,
  role,
}: {
  items: Organization[];
  meta: OrganizationListMeta;
  onPageChange: (page: number) => void;
  onStatusAction: (organization: Organization) => void;
  role: UserRole;
}) {
  const canManage = role === "SUPER_ADMIN";
  const pageNumbers = Array.from({ length: meta.totalPages }, (_, index) => index + 1);

  return (
    <div className="overflow-hidden rounded-[28px] border border-border bg-surface shadow-sm">
      <div className="overflow-x-auto">
        <table className="min-w-full">
          <thead className="border-b border-border bg-surface-muted">
            <tr className="text-left text-xs font-semibold uppercase tracking-[0.16em] text-muted-soft">
              {["Agency Name", "Type", "Status", "Interventions", "Beneficiaries", "Total Distributed", "Created Date", "Actions"].map((label) => (
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
                    <p className="mt-1 text-xs text-muted">{item.shortName}</p>
                  </div>
                </td>
                <td className="px-5 py-4 text-sm text-muted">{item.type.replaceAll("_", " ")}</td>
                <td className="px-5 py-4"><OrganizationStatusBadge status={item.status} /></td>
                <td className="px-5 py-4 text-sm text-foreground">{formatNumber(item.programCount)}</td>
                <td className="px-5 py-4 text-sm text-foreground">{formatNumber(item.beneficiaryCount)}</td>
                <td className="px-5 py-4 text-sm text-foreground">{formatCurrency(item.totalDistributed)}</td>
                <td className="px-5 py-4 text-sm text-muted" title={formatDateTime(item.createdAt)}>
                  {new Date(item.createdAt).toLocaleDateString("en-NG", { day: "2-digit", month: "short", year: "numeric" })}
                </td>
                <td className="px-5 py-4">
                  <RowActionMenu canManage={canManage} item={item} onStatusAction={onStatusAction} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex flex-col gap-4 border-t border-border px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-muted">
          Showing page {meta.page} of {meta.totalPages} ({formatNumber(meta.total)} agencies)
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
  canManage,
  item,
  onStatusAction,
}: {
  canManage: boolean;
  item: Organization;
  onStatusAction: (organization: Organization) => void;
}) {
  return (
    <RowActionPopover>
      {({ close }) => (
        <>
          <Link
            href={`/organizations/${item.id}`}
            className="flex items-center gap-2 rounded-xl px-3 py-2 text-sm text-foreground hover:bg-surface-muted"
          >
            <SquareArrowOutUpRight size={16} />
            View Details
          </Link>
          {canManage ? (
            <Link
              href={`/organizations/${item.id}/edit`}
              className="flex items-center gap-2 rounded-xl px-3 py-2 text-sm text-foreground hover:bg-surface-muted"
            >
              <Pencil size={16} />
              Edit Agency
            </Link>
          ) : null}

          {canManage ? (
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
