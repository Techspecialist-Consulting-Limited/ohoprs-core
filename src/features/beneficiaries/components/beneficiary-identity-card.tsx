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
        <Info label="Date of Birth" value={beneficiary.dateOfBirth} />
        <Info label="NIN" value={maskValue(beneficiary.nin)} />
        <Info label="BVN" value={beneficiary.bvn ? maskValue(beneficiary.bvn) : "Not provided"} />
        <Info label="Phone" value={beneficiary.phone} />
        <Info label="Email" value={beneficiary.email || "Not provided"} />
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
