"use client";

import type { BenefitType } from "@/types/program";
import type { DistributionStatus } from "@/types/distribution";

interface DistributionFiltersState {
  search: string;
  organizationId: string;
  programId: string;
  status: DistributionStatus | "ALL";
  benefitType: BenefitType | "ALL";
}

export function DistributionFilters({
  value,
  onChange,
  organizations,
  programs,
  showOrganizationFilter,
}: {
  value: DistributionFiltersState;
  onChange: (next: DistributionFiltersState) => void;
  organizations: { id: string; name: string }[];
  programs: { id: string; name: string }[];
  showOrganizationFilter: boolean;
}) {
  return (
    <section className="rounded-[28px] border border-border bg-surface p-5 shadow-sm">
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
        <label className="block">
          <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.16em] text-muted-soft">Search</span>
          <input
            value={value.search}
            onChange={(event) => onChange({ ...value, search: event.target.value })}
            placeholder="Search distributions"
            className="h-11 w-full rounded-2xl border border-border bg-surface px-4 text-sm text-foreground outline-none transition focus:border-accent"
          />
        </label>

        {showOrganizationFilter ? (
          <label className="block">
            <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.16em] text-muted-soft">Organization</span>
            <select
              value={value.organizationId}
              onChange={(event) => onChange({ ...value, organizationId: event.target.value })}
              className="h-11 w-full rounded-2xl border border-border bg-surface px-4 text-sm text-foreground outline-none transition focus:border-accent"
            >
              <option value="ALL">All organizations</option>
              {organizations.map((organization) => (
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
            value={value.programId}
            onChange={(event) => onChange({ ...value, programId: event.target.value })}
            className="h-11 w-full rounded-2xl border border-border bg-surface px-4 text-sm text-foreground outline-none transition focus:border-accent"
          >
            <option value="ALL">All programs</option>
            {programs.map((program) => (
              <option key={program.id} value={program.id}>
                {program.name}
              </option>
            ))}
          </select>
        </label>

        <label className="block">
          <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.16em] text-muted-soft">Status</span>
          <select
            value={value.status}
            onChange={(event) => onChange({ ...value, status: event.target.value as DistributionStatus | "ALL" })}
            className="h-11 w-full rounded-2xl border border-border bg-surface px-4 text-sm text-foreground outline-none transition focus:border-accent"
          >
            {["ALL", "DRAFT", "SCHEDULED", "PROCESSING", "COMPLETED", "FAILED", "CANCELLED"].map((status) => (
              <option key={status} value={status}>
                {status === "ALL" ? "All statuses" : status.replaceAll("_", " ")}
              </option>
            ))}
          </select>
        </label>

        <label className="block">
          <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.16em] text-muted-soft">Benefit Type</span>
          <select
            value={value.benefitType}
            onChange={(event) => onChange({ ...value, benefitType: event.target.value as BenefitType | "ALL" })}
            className="h-11 w-full rounded-2xl border border-border bg-surface px-4 text-sm text-foreground outline-none transition focus:border-accent"
          >
            {["ALL", "CASH", "FOOD", "MEDICAL", "EDUCATION", "AGRICULTURE", "HOUSING", "EMERGENCY_RELIEF", "OTHER"].map((type) => (
              <option key={type} value={type}>
                {type === "ALL" ? "All benefit types" : type.replaceAll("_", " ")}
              </option>
            ))}
          </select>
        </label>
      </div>
    </section>
  );
}
