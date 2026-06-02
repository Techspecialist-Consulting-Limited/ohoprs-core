import { benefitTypes, programStatuses } from "@/features/programs/schemas/program.schema";
import type { BenefitType, ProgramStatus } from "@/types/program";
import type { Organization } from "@/types/organization";

interface FiltersValue {
  search: string;
  organizationId: string | "ALL";
  benefitType: BenefitType | "ALL";
  status: ProgramStatus | "ALL";
}

export function ProgramFilters({
  organizations,
  onChange,
  showOrganizationFilter,
  value,
}: {
  organizations: Organization[];
  onChange: (value: FiltersValue) => void;
  showOrganizationFilter: boolean;
  value: FiltersValue;
}) {
  return (
    <div className={`grid gap-3 rounded-[28px] border border-border bg-surface p-4 shadow-sm ${showOrganizationFilter ? "lg:grid-cols-[1.4fr_1fr_1fr_1fr]" : "lg:grid-cols-[1.8fr_1fr_1fr]"}`}>
      <label className="flex h-11 items-center rounded-2xl border border-border bg-background px-3">
        <input
          value={value.search}
          onChange={(event) => onChange({ ...value, search: event.target.value })}
          placeholder="Search programs by name, organization, or benefit type"
          className="w-full bg-transparent text-sm text-foreground outline-none placeholder:text-muted-soft"
        />
      </label>

      {showOrganizationFilter ? (
        <label className="flex h-11 items-center rounded-2xl border border-border bg-background px-3">
          <select
            value={value.organizationId}
            onChange={(event) => onChange({ ...value, organizationId: event.target.value })}
            className="w-full bg-transparent text-sm text-foreground outline-none"
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

      <label className="flex h-11 items-center rounded-2xl border border-border bg-background px-3">
        <select
          value={value.benefitType}
          onChange={(event) => onChange({ ...value, benefitType: event.target.value as BenefitType | "ALL" })}
          className="w-full bg-transparent text-sm text-foreground outline-none"
        >
          <option value="ALL">All benefit types</option>
          {benefitTypes.map((benefitType) => (
            <option key={benefitType} value={benefitType}>
              {benefitType.replaceAll("_", " ")}
            </option>
          ))}
        </select>
      </label>

      <label className="flex h-11 items-center rounded-2xl border border-border bg-background px-3">
        <select
          value={value.status}
          onChange={(event) => onChange({ ...value, status: event.target.value as ProgramStatus | "ALL" })}
          className="w-full bg-transparent text-sm text-foreground outline-none"
        >
          <option value="ALL">All statuses</option>
          {programStatuses.map((status) => (
            <option key={status} value={status}>
              {status}
            </option>
          ))}
        </select>
      </label>
    </div>
  );
}
