import { organizationStatuses, organizationTypes } from "@/features/organizations/schemas/organization.schema";
import type { OrganizationStatus, OrganizationType } from "@/types/organization";

interface FiltersValue {
  search: string;
  status: OrganizationStatus | "ALL";
  type: OrganizationType | "ALL";
}

export function OrganizationFilters({
  onChange,
  value,
}: {
  onChange: (value: FiltersValue) => void;
  value: FiltersValue;
}) {
  return (
    <div className="grid gap-3 rounded-[28px] border border-border bg-surface p-4 shadow-sm lg:grid-cols-[1.5fr_1fr_1fr]">
      <label className="flex h-11 items-center rounded-2xl border border-border bg-background px-3">
        <input
          value={value.search}
          onChange={(event) => onChange({ ...value, search: event.target.value })}
          placeholder="Search organizations by name, short name, or state"
          className="w-full bg-transparent text-sm text-foreground outline-none placeholder:text-muted-soft"
        />
      </label>

      <label className="flex h-11 items-center rounded-2xl border border-border bg-background px-3">
        <select
          value={value.status}
          onChange={(event) => onChange({ ...value, status: event.target.value as OrganizationStatus | "ALL" })}
          className="w-full bg-transparent text-sm text-foreground outline-none"
        >
          <option value="ALL">All statuses</option>
          {organizationStatuses.map((status) => (
            <option key={status} value={status}>
              {status.replaceAll("_", " ")}
            </option>
          ))}
        </select>
      </label>

      <label className="flex h-11 items-center rounded-2xl border border-border bg-background px-3">
        <select
          value={value.type}
          onChange={(event) => onChange({ ...value, type: event.target.value as OrganizationType | "ALL" })}
          className="w-full bg-transparent text-sm text-foreground outline-none"
        >
          <option value="ALL">All types</option>
          {organizationTypes.map((type) => (
            <option key={type} value={type}>
              {type.replaceAll("_", " ")}
            </option>
          ))}
        </select>
      </label>
    </div>
  );
}
