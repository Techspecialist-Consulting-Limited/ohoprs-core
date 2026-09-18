"use client";

import { useState } from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";

import { EmptyState } from "@/components/ui/empty-state";
import { LoadingState } from "@/components/ui/loading-state";
import { PageContainer } from "@/components/ui/page-container";
import { PageHeader } from "@/components/ui/page-header";
import { Pagination } from "@/components/ui/pagination";
import { useDebouncedValue } from "@/hooks/use-debounced-value";
import { usePageQueryState } from "@/hooks/use-page-query-state";
import { formatDate } from "@/lib/formatters";
import { householdService } from "@/services/household.service";
import { HouseholdJourneyStageBadge } from "@/features/households/components/household-journey-stage-badge";

export function FieldHouseholdsModule() {
  const [search, setSearch] = useState("");
  const { page, limit, setPage, setLimit } = usePageQueryState(10);
  const debouncedSearch = useDebouncedValue(search);

  const householdsQuery = useQuery({
    queryKey: ["field-households", page, limit, debouncedSearch],
    queryFn: () => householdService.getHouseholds({ page, limit, search: debouncedSearch }),
    placeholderData: (previousData) => previousData,
  });

  if (householdsQuery.isLoading && !householdsQuery.data) {
    return (
      <PageContainer>
        <LoadingState title="Loading households" lines={5} />
      </PageContainer>
    );
  }

  if (householdsQuery.isError || !householdsQuery.data?.success) {
    return (
      <PageContainer>
        <EmptyState title="Unable to load households" description="The mock household service could not return household data." />
      </PageContainer>
    );
  }

  const response = householdsQuery.data.data;

  return (
    <PageContainer>
      <PageHeader
        title="Field Data Collection"
        description="Find a household to record periodic outcome feedback — meals per day, school attendance, income, and other progress indicators."
      />

      <div className="rounded-[28px] border border-border bg-surface p-5 shadow-sm">
        <label className="block">
          <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.16em] text-muted-soft">Search</span>
          <input
            type="text"
            value={search}
            onChange={(event) => {
              setSearch(event.target.value);
              setPage(1);
            }}
            placeholder="Search by household ID, recipient name, or address"
            className="focus-ring h-11 w-full rounded-2xl border border-border bg-surface px-4 text-sm text-foreground outline-none transition focus:border-accent"
          />
        </label>
      </div>

      {response.items.length ? (
        <div className="space-y-3">
          {response.items.map((household) => (
            <div
              key={household.id}
              className="flex flex-col gap-3 rounded-[28px] border border-border bg-surface p-5 shadow-sm sm:flex-row sm:items-center sm:justify-between"
            >
              <div>
                <div className="flex flex-wrap items-center gap-3">
                  <p className="text-sm font-semibold text-foreground">{household.unifiedHouseholdId}</p>
                  <HouseholdJourneyStageBadge stage={household.journeyStage} />
                </div>
                <p className="mt-1 text-sm text-muted">
                  {household.designatedRecipientName} — {household.address}, {household.lga}, {household.state}
                </p>
                <p className="mt-1 text-xs text-muted">
                  Last outcome feedback:{" "}
                  {household.outcomeRecords[0] ? formatDate(household.outcomeRecords[0].submittedAt) : "None recorded yet"}
                </p>
              </div>
              <div className="flex gap-3">
                <Link
                  href={`/households/${household.id}`}
                  className="inline-flex h-10 items-center justify-center rounded-2xl border border-border px-4 text-sm font-semibold text-foreground hover:bg-surface-muted"
                >
                  View Household
                </Link>
                <Link
                  href={`/field/households/${household.id}/feedback`}
                  className="inline-flex h-10 items-center justify-center rounded-2xl bg-accent px-4 text-sm font-semibold text-accent-foreground"
                >
                  Submit Feedback
                </Link>
              </div>
            </div>
          ))}

          <div className="rounded-[28px] border border-border bg-surface shadow-sm">
            <Pagination
              meta={response.meta}
              onPageChange={setPage}
              onLimitChange={setLimit}
              isFetching={householdsQuery.isFetching}
              itemLabel="households"
            />
          </div>
        </div>
      ) : (
        <EmptyState title="No households match your search" description="Try a different household ID, recipient name, or address." />
      )}
    </PageContainer>
  );
}
