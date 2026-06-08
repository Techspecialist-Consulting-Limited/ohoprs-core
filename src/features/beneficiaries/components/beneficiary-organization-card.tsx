import Link from "next/link";

import type { Beneficiary360Details } from "@/types/beneficiary";

export function BeneficiaryOrganizationCard({ beneficiary }: { beneficiary: Beneficiary360Details }) {
  return (
    <div className="rounded-[28px] border border-border bg-surface p-6 shadow-sm">
      <p className="text-sm font-semibold text-foreground">Agency usage and enrollment</p>
      <div className="mt-5 grid gap-4 md:grid-cols-2">
        <Info label="Agency Benefited From" value={beneficiary.organizationName} />
        <Info label="State" value={beneficiary.state} />
        <Info label="State of Origin" value={beneficiary.stateOfOrigin} />
        <Info label="LGA" value={beneficiary.lga} />
        <Info label="Address" value={beneficiary.address} />
      </div>
      <div className="mt-5">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-soft">Intervention enrollments</p>
        <div className="mt-3 flex flex-wrap gap-2">
          {beneficiary.programs.map((program) => (
            <span key={program.id} className="inline-flex rounded-full border border-border bg-surface-muted px-3 py-1 text-xs font-medium text-foreground">
              {program.name}
            </span>
          ))}
        </div>
      </div>
      <div className="mt-5 flex flex-wrap gap-3">
        <Link href={`/organizations/${beneficiary.organizationId}`} className="text-sm font-medium text-accent hover:underline">
          View Agency
        </Link>
        <Link href={`/organizations/${beneficiary.organizationId}/workspace`} className="text-sm font-medium text-accent hover:underline">
          Open Agency Workspace
        </Link>
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
