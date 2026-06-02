"use client";

import { organizationsData } from "@/mock/organizations.mock";
import type { AuditFiltersState, AuditModule, AuditResult } from "@/types/audit";

const presets = [
  { value: "LAST_30_DAYS", label: "Last 30 days" },
  { value: "LAST_90_DAYS", label: "Last 90 days" },
  { value: "YEAR_TO_DATE", label: "Year to date" },
  { value: "LAST_12_MONTHS", label: "Last 12 months" },
  { value: "CUSTOM", label: "Custom range" },
] as const;

export function AuditFilters({
  value,
  onChange,
  showOrganizationFilter,
}: {
  value: AuditFiltersState;
  onChange: (value: AuditFiltersState) => void;
  showOrganizationFilter: boolean;
}) {
  return (
    <section className="rounded-[28px] border border-border bg-surface p-5 shadow-sm">
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-6">
        <label className="block">
          <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.16em] text-muted-soft">Search</span>
          <input
            value={value.search ?? ""}
            onChange={(event) => onChange({ ...value, search: event.target.value, page: 1 })}
            placeholder="Search descriptions or resources"
            className="h-11 w-full rounded-2xl border border-border bg-surface px-4 text-sm text-foreground outline-none transition focus:border-accent"
          />
        </label>

        <label className="block">
          <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.16em] text-muted-soft">Date range</span>
          <select
            value={value.datePreset}
            onChange={(event) => onChange({ ...value, datePreset: event.target.value as AuditFiltersState["datePreset"], page: 1 })}
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
                onChange={(event) => onChange({ ...value, startDate: event.target.value, page: 1 })}
                className="h-11 w-full rounded-2xl border border-border bg-surface px-4 text-sm text-foreground outline-none transition focus:border-accent"
              />
            </label>
            <label className="block">
              <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.16em] text-muted-soft">End date</span>
              <input
                type="date"
                value={value.endDate ?? ""}
                onChange={(event) => onChange({ ...value, endDate: event.target.value, page: 1 })}
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
              onChange={(event) => onChange({ ...value, organizationId: event.target.value, page: 1 })}
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
          <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.16em] text-muted-soft">Module</span>
          <select
            value={value.module ?? "ALL"}
            onChange={(event) => onChange({ ...value, module: event.target.value as AuditModule | "ALL", page: 1 })}
            className="h-11 w-full rounded-2xl border border-border bg-surface px-4 text-sm text-foreground outline-none transition focus:border-accent"
          >
            {["ALL", "AUTH", "ORGANIZATION", "PROGRAM", "BENEFICIARY", "DISTRIBUTION", "BULK_DISTRIBUTION", "REPORTS", "SETTINGS"].map((module) => (
              <option key={module} value={module}>
                {module === "ALL" ? "All modules" : module.replaceAll("_", " ")}
              </option>
            ))}
          </select>
        </label>

        <label className="block">
          <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.16em] text-muted-soft">User Filter</span>
          <input
            value={value.userQuery ?? ""}
            onChange={(event) => onChange({ ...value, userQuery: event.target.value, page: 1 })}
            placeholder="Name, role, or email"
            className="h-11 w-full rounded-2xl border border-border bg-surface px-4 text-sm text-foreground outline-none transition focus:border-accent"
          />
        </label>

        <label className="block">
          <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.16em] text-muted-soft">Result</span>
          <select
            value={value.result ?? "ALL"}
            onChange={(event) => onChange({ ...value, result: event.target.value as AuditResult | "ALL", page: 1 })}
            className="h-11 w-full rounded-2xl border border-border bg-surface px-4 text-sm text-foreground outline-none transition focus:border-accent"
          >
            {["ALL", "SUCCESS", "FAILED", "WARNING"].map((result) => (
              <option key={result} value={result}>
                {result === "ALL" ? "All results" : result}
              </option>
            ))}
          </select>
        </label>
      </div>
    </section>
  );
}
