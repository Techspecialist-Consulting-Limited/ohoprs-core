"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";

import { formatNumber } from "@/lib/formatters";
import { cn } from "@/lib/utils";

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

const PAGE_SIZE_OPTIONS = [10, 25, 50];

function getPageItems(page: number, totalPages: number): Array<number | "ellipsis"> {
  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, index) => index + 1);
  }

  const keep = new Set<number>([1, 2, totalPages - 1, totalPages, page - 1, page, page + 1]);
  const sorted = Array.from(keep)
    .filter((item) => item >= 1 && item <= totalPages)
    .sort((a, b) => a - b);

  const items: Array<number | "ellipsis"> = [];
  sorted.forEach((item, index) => {
    if (index > 0 && item - sorted[index - 1] > 1) {
      items.push("ellipsis");
    }
    items.push(item);
  });

  return items;
}

export function Pagination({
  meta,
  onPageChange,
  onLimitChange,
  isFetching = false,
  itemLabel = "results",
}: {
  meta: PaginationMeta;
  onPageChange: (page: number) => void;
  onLimitChange?: (limit: number) => void;
  isFetching?: boolean;
  itemLabel?: string;
}) {
  const { page, limit, total, totalPages } = meta;
  const rangeStart = total === 0 ? 0 : (page - 1) * limit + 1;
  const rangeEnd = Math.min(total, page * limit);
  const pageItems = getPageItems(page, totalPages);

  return (
    <nav
      aria-label="Pagination"
      className="flex flex-col gap-4 border-t border-border px-5 py-4 sm:flex-row sm:items-center sm:justify-between"
    >
      <div className="flex flex-col gap-3 text-sm text-muted sm:flex-row sm:items-center sm:gap-4">
        <p>
          {total === 0
            ? `No ${itemLabel}`
            : `Showing ${formatNumber(rangeStart)}-${formatNumber(rangeEnd)} of ${formatNumber(total)} ${itemLabel}`}
        </p>
        {onLimitChange ? (
          <label className="flex items-center gap-2">
            <span className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-soft">Per page</span>
            <select
              value={limit}
              onChange={(event) => onLimitChange(Number(event.target.value))}
              className="focus-ring h-9 rounded-xl border border-border bg-surface px-2 text-sm text-foreground outline-none"
            >
              {PAGE_SIZE_OPTIONS.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </label>
        ) : null}
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          aria-label="Previous page"
          disabled={page <= 1 || isFetching}
          onClick={() => onPageChange(page - 1)}
          className="focus-ring inline-flex h-10 items-center gap-1.5 rounded-2xl border border-border px-3 text-sm text-foreground transition disabled:cursor-not-allowed disabled:opacity-50"
        >
          <ChevronLeft size={16} />
          <span className="hidden sm:inline">Previous</span>
        </button>

        {pageItems.map((item, index) =>
          item === "ellipsis" ? (
            <span key={`ellipsis-${index}`} aria-hidden="true" className="px-1 text-sm text-muted-soft">
              &hellip;
            </span>
          ) : (
            <button
              key={item}
              type="button"
              aria-current={item === page ? "page" : undefined}
              aria-label={`Page ${item}`}
              disabled={isFetching}
              onClick={() => onPageChange(item)}
              className={cn(
                "focus-ring inline-flex h-10 w-10 items-center justify-center rounded-2xl border text-sm font-medium transition disabled:cursor-not-allowed",
                item === page
                  ? "border-accent bg-accent text-accent-foreground"
                  : "border-border bg-surface text-foreground hover:bg-surface-muted",
              )}
            >
              {item}
            </button>
          ),
        )}

        <button
          type="button"
          aria-label="Next page"
          disabled={page >= totalPages || isFetching}
          onClick={() => onPageChange(page + 1)}
          className="focus-ring inline-flex h-10 items-center gap-1.5 rounded-2xl border border-border px-3 text-sm text-foreground transition disabled:cursor-not-allowed disabled:opacity-50"
        >
          <span className="hidden sm:inline">Next</span>
          <ChevronRight size={16} />
        </button>
      </div>
    </nav>
  );
}
