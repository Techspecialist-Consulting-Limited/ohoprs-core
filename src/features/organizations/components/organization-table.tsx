"use client";

import Link from "next/link";
import { Pencil, SquareArrowOutUpRight } from "lucide-react";

import { Pagination } from "@/components/ui/pagination";
import { RowActionPopover } from "@/components/ui/row-action-popover";
import { formatCurrency, formatDate, formatDateTime, formatNumber } from "@/lib/formatters";
import type { Organization, OrganizationListMeta } from "@/types/organization";
import type { UserRole } from "@/types/auth";
import { OrganizationStatusBadge } from "@/features/organizations/components/organization-status-badge";

export function OrganizationTable({
  items,
  meta,
  onPageChange,
  onLimitChange,
  isFetching,
  onStatusAction,
  role,
}: {
  items: Organization[];
  meta: OrganizationListMeta;
  onPageChange: (page: number) => void;
  onLimitChange?: (limit: number) => void;
  isFetching?: boolean;
  onStatusAction: (organization: Organization) => void;
  role: UserRole;
}) {
  const canManage = role === "SUPER_ADMIN";

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
                  {formatDate(item.createdAt)}
                </td>
                <td className="px-5 py-4">
                  <RowActionMenu canManage={canManage} item={item} onStatusAction={onStatusAction} />
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
        itemLabel="agencies"
      />
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
