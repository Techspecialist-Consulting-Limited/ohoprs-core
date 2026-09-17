"use client";

import Link from "next/link";
import { ChevronLeft, ChevronRight, SquareArrowOutUpRight } from "lucide-react";

import { cn } from "@/lib/utils";
import { formatNumber } from "@/lib/formatters";
import type { Household, HouseholdListMeta } from "@/types/household";
import { HouseholdJourneyStageBadge } from "@/features/households/components/household-journey-stage-badge";

export function HouseholdTable({
  items,
  meta,
  onPageChange,
}: {
  items: Household[];
  meta: HouseholdListMeta;
  onPageChange: (page: number) => void;
}) {
  const pageNumbers = Array.from({ length: meta.totalPages }, (_, index) => index + 1);

  return (
    <div className="overflow-hidden rounded-[28px] border border-border bg-surface shadow-sm">
      <div className="overflow-x-auto">
        <table className="min-w-full">
          <thead className="border-b border-border bg-surface-muted">
            <tr className="text-left text-xs font-semibold uppercase tracking-[0.16em] text-muted-soft">
              {["Unified Household ID", "Designated Recipient", "Journey Stage", "State", "LGA", "Agency", "Members", "Actions"].map((label) => (
                <th key={label} className="px-5 py-4">{label}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {items.map((item) => {
              const activeMembers = item.members.filter((member) => member.status === "ACTIVE").length;

              return (
                <tr key={item.id} className="border-b border-border last:border-b-0">
                  <td className="px-5 py-4">
                    <Link
                      href={`/households/${item.id}`}
                      className="group inline-flex items-center gap-2 rounded-xl text-sm font-semibold text-foreground underline decoration-transparent decoration-2 underline-offset-4 transition hover:text-accent hover:decoration-accent focus-visible:outline-none focus-visible:text-accent focus-visible:decoration-accent"
                    >
                      <span>{item.unifiedHouseholdId}</span>
                      <SquareArrowOutUpRight size={14} className="opacity-60 transition group-hover:opacity-100" />
                    </Link>
                  </td>
                  <td className="px-5 py-4 text-sm text-foreground">{item.designatedRecipientName || "Unassigned"}</td>
                  <td className="px-5 py-4"><HouseholdJourneyStageBadge stage={item.journeyStage} /></td>
                  <td className="px-5 py-4 text-sm text-muted">{item.state}</td>
                  <td className="px-5 py-4 text-sm text-muted">{item.lga}</td>
                  <td className="px-5 py-4 text-sm text-muted">{item.organizationName}</td>
                  <td className="px-5 py-4 text-sm text-muted">
                    {activeMembers} active / {item.members.length} total
                  </td>
                  <td className="px-5 py-4">
                    <Link
                      href={`/households/${item.id}`}
                      className="inline-flex h-9 items-center justify-center rounded-xl border border-border px-3 text-xs font-semibold text-foreground hover:bg-surface-muted"
                    >
                      View
                    </Link>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="flex flex-col gap-4 border-t border-border px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-muted">
          Showing page {meta.page} of {meta.totalPages} ({formatNumber(meta.total)} households)
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
