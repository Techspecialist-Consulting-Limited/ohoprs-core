"use client";

import Link from "next/link";
import { Pencil, SquareArrowOutUpRight } from "lucide-react";

import { Pagination } from "@/components/ui/pagination";
import { RowActionPopover } from "@/components/ui/row-action-popover";
import { formatDate, formatDateTime } from "@/lib/formatters";
import type { Beneficiary, BeneficiaryListMeta } from "@/types/beneficiary";
import { BeneficiaryStatusBadge } from "@/features/beneficiaries/components/beneficiary-status-badge";
import { VerificationStatusBadge } from "@/features/beneficiaries/components/verification-status-badge";

function maskNin(value: string) {
  if (value.length < 8) {
    return value;
  }

  return `${value.slice(0, 3)} ${"\u2022".repeat(3)} ${"\u2022".repeat(3)} ${value.slice(-2)}`;
}

function maskPhone(value: string) {
  if (value.length < 8) {
    return value;
  }

  return `${value.slice(0, 5)} ${"\u2022".repeat(3)} ${value.slice(-3)}`;
}

export function BeneficiaryTable({
  items,
  meta,
  onPageChange,
  onLimitChange,
  isFetching,
  canEdit,
}: {
  items: Beneficiary[];
  meta: BeneficiaryListMeta;
  onPageChange: (page: number) => void;
  onLimitChange?: (limit: number) => void;
  isFetching?: boolean;
  canEdit: boolean;
}) {
  return (
    <div className="overflow-hidden rounded-[28px] border border-border bg-surface shadow-sm">
      <div className="overflow-x-auto">
        <table className="min-w-full">
          <thead className="border-b border-border bg-surface-muted">
            <tr className="text-left text-xs font-semibold uppercase tracking-[0.16em] text-muted-soft">
              {["Full Name", "NIN", "Phone", "Gender", "State", "LGA", "Agency Benefited From", "Interventions", "Verification Status", "Benefit Status", "Created Date", "Actions"].map((label) => (
                <th key={label} className="px-5 py-4">{label}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {items.map((item) => (
              <tr key={item.id} className="border-b border-border last:border-b-0">
                <td className="px-5 py-4">
                  <div>
                    <Link
                      href={`/beneficiaries/${item.id}`}
                      className="group inline-flex items-center gap-2 rounded-xl text-sm font-semibold text-foreground underline decoration-transparent decoration-2 underline-offset-4 transition hover:text-accent hover:decoration-accent focus-visible:outline-none focus-visible:text-accent focus-visible:decoration-accent"
                    >
                      <span>{item.fullName}</span>
                      <SquareArrowOutUpRight size={14} className="opacity-60 transition group-hover:opacity-100" />
                    </Link>
                    <p className="mt-1 text-xs text-muted">{item.email || "No email provided"}</p>
                  </div>
                </td>
                <td className="px-5 py-4 text-sm text-foreground">{maskNin(item.nin)}</td>
                <td className="px-5 py-4 text-sm text-muted">{maskPhone(item.phone)}</td>
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
                  {formatDate(item.createdAt)}
                </td>
                <td className="px-5 py-4">
                  <RowActionMenu canEdit={canEdit} item={item} />
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
        itemLabel="beneficiaries"
      />
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
          ) : null}
        </>
      )}
    </RowActionPopover>
  );
}
