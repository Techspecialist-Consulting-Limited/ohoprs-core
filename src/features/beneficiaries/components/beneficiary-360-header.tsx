import Link from "next/link";
import { Eye, ShieldCheck } from "lucide-react";

import type { Beneficiary360Details } from "@/types/beneficiary";
import { BeneficiaryStatusBadge } from "@/features/beneficiaries/components/beneficiary-status-badge";
import { VerificationStatusBadge } from "@/features/beneficiaries/components/verification-status-badge";

function maskValue(value: string) {
  if (value.length <= 5) {
    return value;
  }

  return `${value.slice(0, 3)}******${value.slice(-2)}`;
}

export function Beneficiary360Header({
  beneficiary,
  canEdit,
  readOnly,
}: {
  beneficiary: Beneficiary360Details;
  canEdit: boolean;
  readOnly?: boolean;
}) {
  return (
    <div className="rounded-[32px] border border-border bg-surface p-6 shadow-sm sm:p-8">
      <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <div className="flex flex-wrap items-center gap-3">
            <span className="inline-flex items-center gap-2 rounded-full border border-accent/20 bg-accent/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.22em] text-accent">
              <ShieldCheck size={14} />
              Beneficiary 360 Profile
            </span>
            <VerificationStatusBadge status={beneficiary.verificationStatus} />
            <BeneficiaryStatusBadge status={beneficiary.benefitStatus} />
            
          </div>
          <h1 className="mt-4 text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">{beneficiary.fullName}</h1>
          <p className="mt-2 text-sm leading-6 text-muted">
            Full benefit traceability across interventions, distributions, verification, and audit activity.
          </p>
          <div className="mt-4 flex flex-wrap gap-4 text-sm text-muted">
            <span>NIN: {maskValue(beneficiary.nin)}</span>
            <span>BVN: {beneficiary.bvn ? maskValue(beneficiary.bvn) : "Not provided"}</span>
            <span>Phone: {beneficiary.phone}</span>
          </div>
        </div>

        {canEdit ? (
          <Link
            href={`/beneficiaries/${beneficiary.id}/edit`}
            className="inline-flex h-11 items-center justify-center rounded-2xl bg-accent px-4 text-sm font-semibold text-accent-foreground"
          >
            Edit Beneficiary
          </Link>
        ) : null}
      </div>
    </div>
  );
}
