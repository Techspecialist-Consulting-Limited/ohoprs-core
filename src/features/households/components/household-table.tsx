"use client";

import Link from "next/link";
import { SquareArrowOutUpRight } from "lucide-react";

import { Pagination } from "@/components/ui/pagination";
import type { Household, HouseholdListMeta } from "@/types/household";
import { HouseholdJourneyStageBadge } from "@/features/households/components/household-journey-stage-badge";

export function HouseholdTable({
  items,
  meta,
  onPageChange,
  onLimitChange,
  isFetching,
}: {
  items: Household[];
  meta: HouseholdListMeta;
  onPageChange: (page: number) => void;
  onLimitChange?: (limit: number) => void;
  isFetching?: boolean;
}) {
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

      <Pagination
        meta={meta}
        onPageChange={onPageChange}
        onLimitChange={onLimitChange}
        isFetching={isFetching}
        itemLabel="households"
      />
    </div>
  );
}
