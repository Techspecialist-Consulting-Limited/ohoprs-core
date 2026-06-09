import type { Beneficiary360Details } from "@/types/beneficiary";

function maskValue(value: string) {
  if (value.length <= 5) {
    return value;
  }

  return `${value.slice(0, 3)}******${value.slice(-2)}`;
}

export function BeneficiaryIdentityCard({ beneficiary }: { beneficiary: Beneficiary360Details }) {
  return (
    <div className="rounded-[28px] border border-border bg-surface p-6 shadow-sm">
      <p className="text-sm font-semibold text-foreground">Personal information</p>
      <div className="mt-5 grid gap-4 md:grid-cols-2">
        <Info label="First Name" value={beneficiary.firstName} />
        <Info label="Last Name" value={beneficiary.lastName} />
        <Info label="Middle Name" value={beneficiary.middleName || "Not provided"} />
        <Info label="Gender" value={beneficiary.gender} />
        <Info label="Occupation" value={beneficiary.occupation} />
        <Info label="Marital Status" value={beneficiary.maritalStatus} />
        <Info label="Disability" value={beneficiary.hasDisability ? "Yes" : "No"} />
        {beneficiary.hasDisability ? (
          <Info label="Type of Disability" value={beneficiary.disabilityType || "Not provided"} />
        ) : null}
        <Info label="Date of Birth" value={beneficiary.dateOfBirth} />
        <Info label="Household Dependents" value={String(beneficiary.householdDependents)} />
        <Info label="Number of Children" value={String(beneficiary.numberOfChildren)} />
        <Info label="Number of Wives" value={String(beneficiary.numberOfWives)} />
        <Info label="NIN" value={maskValue(beneficiary.nin)} />
        <Info label="BVN" value={beneficiary.bvn ? maskValue(beneficiary.bvn) : "Not provided"} />
        <Info label="Phone" value={beneficiary.phone} />
        <Info label="Email" value={beneficiary.email || "Not provided"} />
        <Info label="State" value={beneficiary.state} />
        <Info label="LGA" value={beneficiary.lga} />
        <Info label="Address" value={beneficiary.address} />
      </div>
    </div>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-soft">{label}</p>
      <p className="mt-2 text-sm text-foreground">{value}</p>
    </div>
  );
}
