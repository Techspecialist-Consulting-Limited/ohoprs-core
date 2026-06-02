import type {
  BenefitStatus,
  VerificationStatus,
} from "@/types/beneficiary";
import type { Organization } from "@/types/organization";
import type { Program } from "@/types/program";

const verificationOptions: Array<VerificationStatus> = ["VERIFIED", "PENDING", "FAILED", "FLAGGED"];
const benefitOptions: Array<BenefitStatus> = ["ACTIVE", "PAUSED", "EXITED", "SUSPENDED"];

interface FiltersValue {
  search: string;
  organizationId: string | "ALL";
  programId: string | "ALL";
  state: string | "ALL";
  verificationStatus: VerificationStatus | "ALL";
  benefitStatus: BenefitStatus | "ALL";
}

export function BeneficiaryFilters({
  organizations,
  programs,
  showOrganizationFilter,
  states,
  value,
  onChange,
}: {
  organizations: Organization[];
  programs: Program[];
  showOrganizationFilter: boolean;
  states: string[];
  value: FiltersValue;
  onChange: (value: FiltersValue) => void;
}) {
  return (
    <div className={`grid gap-3 rounded-[28px] border border-border bg-surface p-4 shadow-sm ${showOrganizationFilter ? "lg:grid-cols-[1.5fr_1fr_1fr_1fr_1fr_1fr]" : "lg:grid-cols-[1.7fr_1fr_1fr_1fr_1fr]"}`}>
      <label className="flex h-11 items-center rounded-2xl border border-border bg-background px-3">
        <input
          value={value.search}
          onChange={(event) => onChange({ ...value, search: event.target.value })}
          placeholder="Search by name, NIN, phone, or organization"
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
          value={value.programId}
          onChange={(event) => onChange({ ...value, programId: event.target.value })}
          className="w-full bg-transparent text-sm text-foreground outline-none"
        >
          <option value="ALL">All programs</option>
          {programs.map((program) => (
            <option key={program.id} value={program.id}>
              {program.name}
            </option>
          ))}
        </select>
      </label>

      <label className="flex h-11 items-center rounded-2xl border border-border bg-background px-3">
        <select
          value={value.state}
          onChange={(event) => onChange({ ...value, state: event.target.value })}
          className="w-full bg-transparent text-sm text-foreground outline-none"
        >
          <option value="ALL">All states</option>
          {states.map((state) => (
            <option key={state} value={state}>
              {state}
            </option>
          ))}
        </select>
      </label>

      <label className="flex h-11 items-center rounded-2xl border border-border bg-background px-3">
        <select
          value={value.verificationStatus}
          onChange={(event) => onChange({ ...value, verificationStatus: event.target.value as VerificationStatus | "ALL" })}
          className="w-full bg-transparent text-sm text-foreground outline-none"
        >
          <option value="ALL">All verification</option>
          {verificationOptions.map((status) => (
            <option key={status} value={status}>
              {status}
            </option>
          ))}
        </select>
      </label>

      <label className="flex h-11 items-center rounded-2xl border border-border bg-background px-3">
        <select
          value={value.benefitStatus}
          onChange={(event) => onChange({ ...value, benefitStatus: event.target.value as BenefitStatus | "ALL" })}
          className="w-full bg-transparent text-sm text-foreground outline-none"
        >
          <option value="ALL">All benefit status</option>
          {benefitOptions.map((status) => (
            <option key={status} value={status}>
              {status}
            </option>
          ))}
        </select>
      </label>
    </div>
  );
}
