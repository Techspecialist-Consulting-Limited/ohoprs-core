"use client";

import Link from "next/link";
import { ChevronLeft, ChevronRight, Lock, Pencil, SquareArrowOutUpRight } from "lucide-react";

import { RowActionPopover } from "@/components/ui/row-action-popover";
import { cn } from "@/lib/utils";
import { formatDateTime, formatNumber } from "@/lib/formatters";
import type { Beneficiary, BeneficiaryListMeta } from "@/types/beneficiary";
import { BeneficiaryStatusBadge } from "@/features/beneficiaries/components/beneficiary-status-badge";
import { VerificationStatusBadge } from "@/features/beneficiaries/components/verification-status-badge";

export function BeneficiaryTable({
  items,
  meta,
  onPageChange,
  canEdit,
}: {
  items: Beneficiary[];
  meta: BeneficiaryListMeta;
  onPageChange: (page: number) => void;
  canEdit: boolean;
}) {
  const pageNumbers = Array.from({ length: meta.totalPages }, (_, index) => index + 1);

  return (
    <div className="overflow-hidden rounded-[28px] border border-border bg-surface shadow-sm">
      <div className="overflow-x-auto">
        <table className="min-w-full">
          <thead className="border-b border-border bg-surface-muted">
            <tr className="text-left text-xs font-semibold uppercase tracking-[0.16em] text-muted-soft">
              {["Full Name", "NIN", "Phone", "Gender", "State", "LGA", "Organization", "Interventions", "Verification Status", "Benefit Status", "Created Date", "Actions"].map((label) => (
                <th key={label} className="px-5 py-4">{label}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {items.map((item) => (
              <tr key={item.id} className="border-b border-border last:border-b-0">
                <td className="px-5 py-4">
                  <div>
                    <p className="text-sm font-semibold text-foreground">{item.fullName}</p>
                    <p className="mt-1 text-xs text-muted">{item.email || "No email provided"}</p>
                  </div>
                </td>
                <td className="px-5 py-4 text-sm text-foreground">{item.nin}</td>
                <td className="px-5 py-4 text-sm text-muted">{item.phone}</td>
                <td className="px-5 py-4 text-sm text-muted">{item.gender}</td>
                <td className="px-5 py-4 text-sm text-muted">{item.state}</td>
                <td className="px-5 py-4 text-sm text-muted">{item.lga}</td>
                <td className="px-5 py-4 text-sm text-muted">{item.organizationName}</td>
                <td className="px-5 py-4">
                  <ProgramChips names={item.programs.map((program) => program.name)} />
                </td>
                <td className="px-5 py-4"><VerificationStatusBadge status={item.verificationStatus} /></td>
                <td className="px-5 py-4"><BeneficiaryStatusBadge status={item.benefitStatus} /></td>
                <td className="px-5 py-4 text-sm text-muted" title={formatDateTime(item.createdAt)}>
                  {new Date(item.createdAt).toLocaleDateString("en-NG", { day: "2-digit", month: "short", year: "numeric" })}
                </td>
                <td className="px-5 py-4">
                  <RowActionMenu canEdit={canEdit} item={item} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex flex-col gap-4 border-t border-border px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-muted">
          Showing page {meta.page} of {meta.totalPages} ({formatNumber(meta.total)} beneficiaries)
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

function ProgramChips({ names }: { names: string[] }) {
  const visible = names.slice(0, 2);
  const remaining = names.length - visible.length;

  return (
    <div className="flex max-w-56 flex-wrap gap-2">
      {visible.map((name) => (
        <span key={name} className="inline-flex rounded-full border border-border bg-surface-muted px-2.5 py-1 text-xs font-medium text-foreground">
          {name}
        </span>
      ))}
      {remaining > 0 ? (
        <span className="inline-flex rounded-full border border-border bg-surface-muted px-2.5 py-1 text-xs font-medium text-muted">
          +{remaining} more
        </span>
      ) : null}
    </div>
  );
}

function RowActionMenu({
  canEdit,
  item,
}: {
  canEdit: boolean;
  item: Beneficiary;
}) {
  return (
    <RowActionPopover>
      {() => (
        <>
          <Link
            href={`/beneficiaries/${item.id}`}
            className="flex items-center gap-2 rounded-xl px-3 py-2 text-sm text-foreground hover:bg-surface-muted"
          >
            <SquareArrowOutUpRight size={16} />
            View Details
          </Link>
          {canEdit ? (
            <Link
              href={`/beneficiaries/${item.id}/edit`}
              className="flex items-center gap-2 rounded-xl px-3 py-2 text-sm text-foreground hover:bg-surface-muted"
            >
              <Pencil size={16} />
              Edit Beneficiary
            </Link>
          ) : (
            <div className="rounded-xl px-3 py-2 text-sm text-muted">
              <div className="flex items-center gap-2">
                <Lock size={16} />
                Edit Beneficiary
              </div>
              <p className="mt-1 text-xs text-muted-soft">Your role has read-only access to beneficiary records.</p>
            </div>
          )}
        </>
      )}
    </RowActionPopover>
  );
}
