"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";

import { EmptyState } from "@/components/ui/empty-state";
import { LoadingState } from "@/components/ui/loading-state";
import { PageContainer } from "@/components/ui/page-container";
import { PageHeader } from "@/components/ui/page-header";
import { useDebouncedValue } from "@/hooks/use-debounced-value";
import { usePageQueryState } from "@/hooks/use-page-query-state";
import { nigeriaStates } from "@/constants/nigeria-regions";
import { householdService } from "@/services/household.service";
import type { JourneyStage } from "@/types/household";
import { HouseholdTable } from "@/features/households/components/household-table";
import { journeyStageLabels } from "@/features/households/components/household-journey-stage-badge";

const journeyStageOptions: JourneyStage[] = ["SOCIAL_REGISTER", "BENEFICIARY_REGISTER", "GRADUATED", "TRANSITIONED"];

export function HouseholdsModule() {
  const [search, setSearch] = useState("");
  const [state, setState] = useState<string>("ALL");
  const [journeyStage, setJourneyStage] = useState<JourneyStage | "ALL">("ALL");
  const { page, limit, setPage, setLimit } = usePageQueryState(10);
  const debouncedSearch = useDebouncedValue(search);

  const householdsQuery = useQuery({
    queryKey: ["households", page, limit, { search: debouncedSearch, state, journeyStage }],
    queryFn: () =>
      householdService.getHouseholds({
        page,
        limit,
        search: debouncedSearch,
        state,
        journeyStage,
      }),
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
        <EmptyState
          title="Unable to load households"
          description="The mock household service could not return household data."
        />
      </PageContainer>
    );
  }

  const response = householdsQuery.data.data;

  return (
    <PageContainer>
      <PageHeader
        title="Household management"
        description="Track each household as the primary unit of measurement — its members, designated recipient, and composition changes over time."
      />

      <section className="grid gap-4 rounded-[28px] border border-border bg-surface p-5 shadow-sm md:grid-cols-3">
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
        <label className="block">
          <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.16em] text-muted-soft">State</span>
          <select
            value={state}
            onChange={(event) => {
              setState(event.target.value);
              setPage(1);
            }}
            className="h-11 w-full rounded-2xl border border-border bg-surface px-4 text-sm text-foreground outline-none transition focus:border-accent"
          >
            <option value="ALL">All states</option>
            {nigeriaStates.map((item) => (
              <option key={item} value={item}>{item}</option>
            ))}
          </select>
        </label>
        <label className="block">
          <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.16em] text-muted-soft">Journey Stage</span>
          <select
            value={journeyStage}
            onChange={(event) => {
              setJourneyStage(event.target.value as JourneyStage | "ALL");
              setPage(1);
            }}
            className="h-11 w-full rounded-2xl border border-border bg-surface px-4 text-sm text-foreground outline-none transition focus:border-accent"
          >
            <option value="ALL">All stages</option>
            {journeyStageOptions.map((stage) => (
              <option key={stage} value={stage}>{journeyStageLabels[stage]}</option>
            ))}
          </select>
        </label>
      </section>

      {response.items.length ? (
        <HouseholdTable
          items={response.items}
          meta={response.meta}
          onPageChange={setPage}
          onLimitChange={setLimit}
          isFetching={householdsQuery.isFetching}
        />
      ) : (
        <EmptyState
          title="No households match your filters"
          description="Adjust the filters to find the household you're looking for."
        />
      )}
    </PageContainer>
  );
}
