"use client";

import { distributionsData } from "@/mock/distributions.mock";
import { organizationsData } from "@/mock/organizations.mock";
import { programsData } from "@/mock/programs.mock";
import type { ReportFiltersState } from "@/types/report";

function phaseLabel(phaseType: string, phaseNumber: number) {
  return `${phaseType === "TRANCHE" ? "Tranche" : "Batch"} ${phaseNumber}`;
}

export function MapFilters({
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

  const selectedProgramId = value.programId && value.programId !== "ALL" ? value.programId : null;
  const phaseOptions = selectedProgramId
    ? distributionsData
        .filter((item) => item.programId === selectedProgramId)
        .map((item) => ({ phaseNumber: item.phaseNumber, label: phaseLabel(item.phaseType, item.phaseNumber) }))
        .filter((item, index, all) => all.findIndex((option) => option.phaseNumber === item.phaseNumber) === index)
        .sort((left, right) => left.phaseNumber - right.phaseNumber)
    : [];

  return (
    <section className="rounded-[28px] border border-border bg-surface p-5 shadow-sm">
      <div className="grid gap-4 md:grid-cols-3">
        {showOrganizationFilter ? (
          <label className="block">
            <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.16em] text-muted-soft">Agency</span>
            <select
              value={value.organizationId ?? "ALL"}
              onChange={(event) =>
                onChange({ ...value, organizationId: event.target.value, programId: "ALL", phaseNumber: "ALL" })
              }
              className="h-11 w-full rounded-2xl border border-border bg-surface px-4 text-sm text-foreground outline-none transition focus:border-accent"
            >
              <option value="ALL">All agencies</option>
              {organizationsData.map((organization) => (
                <option key={organization.id} value={organization.id}>
                  {organization.name}
                </option>
              ))}
            </select>
          </label>
        ) : null}

        <label className="block">
          <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.16em] text-muted-soft">Intervention</span>
          <select
            value={value.programId ?? "ALL"}
            onChange={(event) => onChange({ ...value, programId: event.target.value, phaseNumber: "ALL" })}
            className="h-11 w-full rounded-2xl border border-border bg-surface px-4 text-sm text-foreground outline-none transition focus:border-accent"
          >
            <option value="ALL">All interventions</option>
            {availablePrograms.map((program) => (
              <option key={program.id} value={program.id}>
                {program.name}
              </option>
            ))}
          </select>
        </label>

        <label className="block">
          <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.16em] text-muted-soft">Tranche</span>
          <select
            value={value.phaseNumber ?? "ALL"}
            onChange={(event) =>
              onChange({ ...value, phaseNumber: event.target.value === "ALL" ? "ALL" : Number(event.target.value) })
            }
            disabled={!selectedProgramId}
            className="h-11 w-full rounded-2xl border border-border bg-surface px-4 text-sm text-foreground outline-none transition focus:border-accent disabled:cursor-not-allowed disabled:opacity-60"
          >
            <option value="ALL">All tranches</option>
            {phaseOptions.map((option) => (
              <option key={option.phaseNumber} value={option.phaseNumber}>
                {option.label}
              </option>
            ))}
          </select>
          {selectedProgramId && phaseOptions.length === 0 ? (
            <span className="mt-2 block text-xs text-muted">No tranche records yet for this intervention.</span>
          ) : null}
        </label>
      </div>
    </section>
  );
}
