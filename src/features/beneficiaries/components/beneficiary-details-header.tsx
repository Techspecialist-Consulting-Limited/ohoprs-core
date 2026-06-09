import Link from "next/link";
import { Eye, Pencil } from "lucide-react";

import type { BeneficiaryDetails } from "@/types/beneficiary";
import { BeneficiaryStatusBadge } from "@/features/beneficiaries/components/beneficiary-status-badge";
import { VerificationStatusBadge } from "@/features/beneficiaries/components/verification-status-badge";

export function BeneficiaryDetailsHeader({
  beneficiary,
  canEdit,
  readOnly,
}: {
  beneficiary: BeneficiaryDetails;
  canEdit: boolean;
  readOnly?: boolean;
}) {
  return (
    <div className="rounded-[32px] border border-border bg-surface p-6 shadow-sm sm:p-8">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-3xl font-semibold tracking-tight text-foreground">{beneficiary.fullName}</h1>
            <VerificationStatusBadge status={beneficiary.verificationStatus} />
            <BeneficiaryStatusBadge status={beneficiary.benefitStatus} />
        
          </div>
          <p className="mt-3 text-sm text-muted">Beneficiary details, agency benefit history, enrollment preview, and basic benefit summary.</p>
        </div>

        {canEdit ? (
          <Link
            href={`/beneficiaries/${beneficiary.id}/edit`}
            className="inline-flex h-11 items-center gap-2 rounded-2xl bg-accent px-4 text-sm font-semibold text-accent-foreground"
          >
            <Pencil size={16} />
            Edit Beneficiary
          </Link>
        ) : null}
      </div>
    </div>
  );
}
