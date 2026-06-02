"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";

import { PermissionDeniedState } from "@/components/shared/permission-denied-state";
import { EmptyState } from "@/components/ui/empty-state";
import { LoadingState } from "@/components/ui/loading-state";
import { PageContainer } from "@/components/ui/page-container";
import { beneficiaryService } from "@/services/beneficiary.service";
import { useAuthStore } from "@/store/auth.store";
import { BeneficiaryDetailsHeader } from "@/features/beneficiaries/components/beneficiary-details-header";
import { BeneficiaryProgramEnrollmentPreview } from "@/features/beneficiaries/components/beneficiary-program-enrollment-preview";

function canAccessBeneficiary(role: string | null, organizationId: string, userOrganizationId: string | null | undefined) {
  if (role === "SUPER_ADMIN" || role === "AUDITOR") {
    return true;
  }

  return userOrganizationId === organizationId;
}

export function BeneficiaryDetailsModule({ id }: { id: string }) {
  const role = useAuthStore((state) => state.role);
  const user = useAuthStore((state) => state.user);

  const beneficiaryQuery = useQuery({
    queryKey: ["beneficiary", id],
    queryFn: () => beneficiaryService.getBeneficiaryById(id),
  });

  if (beneficiaryQuery.isLoading) {
    return (
      <PageContainer>
        <LoadingState title="Loading beneficiary details" lines={5} />
      </PageContainer>
    );
  }

  const beneficiary = beneficiaryQuery.data?.data;

  if (beneficiaryQuery.isError || !beneficiary) {
    return (
      <PageContainer>
        <EmptyState
          title="Beneficiary not found"
          description="The requested beneficiary could not be loaded from the mock service layer."
        />
      </PageContainer>
    );
  }

  if (!canAccessBeneficiary(role, beneficiary.organizationId, user?.organizationId)) {
    return (
      <PageContainer>
        <PermissionDeniedState
          title="Beneficiary access denied"
          description="Your role cannot access this beneficiary because the record belongs to another organization."
        />
      </PageContainer>
    );
  }

  const canEdit = role === "SUPER_ADMIN" || role === "ORG_ADMIN" || role === "PROGRAM_OFFICER";

  return (
    <PageContainer>
      <BeneficiaryDetailsHeader beneficiary={beneficiary} canEdit={canEdit} readOnly={role === "AUDITOR"} />

      <section className="grid gap-4 xl:grid-cols-[1.05fr_0.95fr]">
        <div className="rounded-[28px] border border-border bg-surface p-6 shadow-sm">
          <p className="text-sm font-semibold text-foreground">Personal information</p>
          <div className="mt-5 grid gap-4 md:grid-cols-2">
            <Info label="First Name" value={beneficiary.firstName} />
            <Info label="Last Name" value={beneficiary.lastName} />
            <Info label="Middle Name" value={beneficiary.middleName || "Not provided"} />
            <Info label="Gender" value={beneficiary.gender} />
            <Info label="Date of Birth" value={beneficiary.dateOfBirth} />
            <Info label="NIN" value={beneficiary.nin} />
            <Info label="BVN" value={beneficiary.bvn || "Not provided"} />
          </div>
        </div>

        <div className="rounded-[28px] border border-border bg-surface p-6 shadow-sm">
          <p className="text-sm font-semibold text-foreground">Contact and organization</p>
          <div className="mt-5 grid gap-4 md:grid-cols-2">
            <Info label="Phone" value={beneficiary.phone} />
            <Info label="Email" value={beneficiary.email || "Not provided"} />
            <Info label="State" value={beneficiary.state} />
            <Info label="LGA" value={beneficiary.lga} />
            <Info label="Address" value={beneficiary.address} className="md:col-span-2" />
            <Info label="Organization" value={beneficiary.organizationName} className="md:col-span-2" />
          </div>
          <div className="mt-5 flex flex-wrap gap-3">
            <Link href={`/organizations/${beneficiary.organizationId}`} className="text-sm font-medium text-accent hover:underline">
              View Organization
            </Link>
            <Link href={`/organizations/${beneficiary.organizationId}/workspace`} className="text-sm font-medium text-accent hover:underline">
              Open Workspace
            </Link>
          </div>
        </div>
      </section>

      <section className="grid gap-4 xl:grid-cols-[0.9fr_1.1fr]">
        <div className="rounded-[28px] border border-border bg-surface p-6 shadow-sm">
          <p className="text-sm font-semibold text-foreground">Verification summary</p>
          <div className="mt-5 grid gap-4 md:grid-cols-2">
            <Info label="Status" value={beneficiary.verificationSummary.status} />
            <Info label="NIN Verified" value={beneficiary.verificationSummary.ninVerified ? "Yes" : "No"} />
            <Info label="BVN Verified" value={beneficiary.verificationSummary.bvnVerified ? "Yes" : "No"} />
            <Info label="Last Checked" value={new Date(beneficiary.verificationSummary.lastCheckedAt).toLocaleString("en-NG")} />
          </div>
        </div>

        <BeneficiaryProgramEnrollmentPreview
          benefitSummary={beneficiary.benefitSummary}
          programs={beneficiary.programs}
        />
      </section>
    </PageContainer>
  );
}

function Info({
  className,
  label,
  value,
}: {
  className?: string;
  label: string;
  value: string;
}) {
  return (
    <div className={className}>
      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-soft">{label}</p>
      <p className="mt-2 text-sm text-foreground">{value}</p>
    </div>
  );
}
