"use client";

import { organizationsData } from "@/mock/organizations.mock";
import { programsData } from "@/mock/programs.mock";
import type { ReportDatePreset, ReportFiltersState } from "@/types/report";

const presets: { value: ReportDatePreset; label: string }[] = [
  { value: "LAST_30_DAYS", label: "Last 30 days" },
  { value: "LAST_90_DAYS", label: "Last 90 days" },
  { value: "YEAR_TO_DATE", label: "Year to date" },
  { value: "LAST_12_MONTHS", label: "Last 12 months" },
  { value: "CUSTOM", label: "Custom range" },
];

export function ReportFilters({
  value,
  onChange,
  showOrganizationFilter,
  allowedOrganizationId,
}: {
  value: ReportFiltersState;
  onChange: (value: ReportFiltersState) => void;
  showOrganizationFilter: boolean;
  allowedOrganizationId?: string | null;
}) {
  const availablePrograms = (showOrganizationFilter && value.organizationId && value.organizationId !== "ALL"
    ? programsData.filter((item) => item.organizationId === value.organizationId)
    : allowedOrganizationId
      ? programsData.filter((item) => item.organizationId === allowedOrganizationId)
      : programsData
  ).map((item) => ({ id: item.id, name: item.name }));

  return (
    <section className="rounded-[28px] border border-border bg-surface p-5 shadow-sm">
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
        <label className="block">
          <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.16em] text-muted-soft">Date range</span>
          <select
            value={value.datePreset}
            onChange={(event) => onChange({ ...value, datePreset: event.target.value as ReportDatePreset })}
            className="h-11 w-full rounded-2xl border border-border bg-surface px-4 text-sm text-foreground outline-none transition focus:border-accent"
          >
            {presets.map((preset) => (
              <option key={preset.value} value={preset.value}>
                {preset.label}
              </option>
            ))}
          </select>
        </label>

        {value.datePreset === "CUSTOM" ? (
          <>
            <label className="block">
              <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.16em] text-muted-soft">Start date</span>
              <input
                type="date"
                value={value.startDate ?? ""}
                onChange={(event) => onChange({ ...value, startDate: event.target.value })}
                className="h-11 w-full rounded-2xl border border-border bg-surface px-4 text-sm text-foreground outline-none transition focus:border-accent"
              />
            </label>
            <label className="block">
              <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.16em] text-muted-soft">End date</span>
              <input
                type="date"
                value={value.endDate ?? ""}
                onChange={(event) => onChange({ ...value, endDate: event.target.value })}
                className="h-11 w-full rounded-2xl border border-border bg-surface px-4 text-sm text-foreground outline-none transition focus:border-accent"
              />
            </label>
          </>
        ) : null}

        {showOrganizationFilter ? (
          <label className="block">
            <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.16em] text-muted-soft">Organization</span>
            <select
              value={value.organizationId ?? "ALL"}
              onChange={(event) => onChange({ ...value, organizationId: event.target.value, programId: "ALL" })}
              className="h-11 w-full rounded-2xl border border-border bg-surface px-4 text-sm text-foreground outline-none transition focus:border-accent"
            >
              <option value="ALL">All organizations</option>
              {organizationsData.map((organization) => (
                <option key={organization.id} value={organization.id}>
                  {organization.name}
                </option>
              ))}
            </select>
          </label>
        ) : null}

        <label className="block">
          <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.16em] text-muted-soft">Program</span>
          <select
            value={value.programId ?? "ALL"}
            onChange={(event) => onChange({ ...value, programId: event.target.value })}
            className="h-11 w-full rounded-2xl border border-border bg-surface px-4 text-sm text-foreground outline-none transition focus:border-accent"
          >
            <option value="ALL">All programs</option>
            {availablePrograms.map((program) => (
              <option key={program.id} value={program.id}>
                {program.name}
              </option>
            ))}
          </select>
        </label>

        <label className="block">
          <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.16em] text-muted-soft">Benefit Type</span>
          <select
            value={value.benefitType ?? "ALL"}
            onChange={(event) => onChange({ ...value, benefitType: event.target.value as ReportFiltersState["benefitType"] })}
            className="h-11 w-full rounded-2xl border border-border bg-surface px-4 text-sm text-foreground outline-none transition focus:border-accent"
          >
            {["ALL", "CASH", "FOOD", "MEDICAL", "EDUCATION", "AGRICULTURE", "HOUSING", "EMERGENCY_RELIEF", "OTHER"].map((type) => (
              <option key={type} value={type}>
                {type === "ALL" ? "All benefit types" : type.replaceAll("_", " ")}
              </option>
            ))}
          </select>
        </label>

        <label className="block">
          <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.16em] text-muted-soft">State</span>
          <select
            value={value.state ?? "ALL"}
            onChange={(event) => onChange({ ...value, state: event.target.value })}
            className="h-11 w-full rounded-2xl border border-border bg-surface px-4 text-sm text-foreground outline-none transition focus:border-accent"
          >
            {["ALL", "FCT", "Lagos", "Kano", "Kaduna", "Borno", "Osun", "Benue", "Rivers", "Bauchi"].map((state) => (
              <option key={state} value={state}>
                {state === "ALL" ? "All states" : state}
              </option>
            ))}
          </select>
        </label>
      </div>
    </section>
  );
}
