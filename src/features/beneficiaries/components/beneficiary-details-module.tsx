"use client";

import { useQuery } from "@tanstack/react-query";

import { PermissionDeniedState } from "@/components/shared/permission-denied-state";
import { EmptyState } from "@/components/ui/empty-state";
import { LoadingState } from "@/components/ui/loading-state";
import { PageContainer } from "@/components/ui/page-container";
import { beneficiaryService } from "@/services/beneficiary.service";
import { useAuthStore } from "@/store/auth.store";
import { BenefitTimeline } from "@/features/beneficiaries/components/benefit-timeline";
import { Beneficiary360Header } from "@/features/beneficiaries/components/beneficiary-360-header";
import { BeneficiaryAuditPreview } from "@/features/beneficiaries/components/beneficiary-audit-preview";
import { BeneficiaryBenefitKpis } from "@/features/beneficiaries/components/beneficiary-benefit-kpis";
import { BeneficiaryDocumentsPlaceholder } from "@/features/beneficiaries/components/beneficiary-documents-placeholder";
import { BeneficiaryIdentityCard } from "@/features/beneficiaries/components/beneficiary-identity-card";
import { BeneficiaryOrganizationCard } from "@/features/beneficiaries/components/beneficiary-organization-card";
import { BeneficiaryProgramEnrollmentPreview } from "@/features/beneficiaries/components/beneficiary-program-enrollment-preview";
import { ProgramBenefitBreakdown } from "@/features/beneficiaries/components/program-benefit-breakdown";
import { VerificationRiskSummary } from "@/features/beneficiaries/components/verification-risk-summary";

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
    queryFn: () => beneficiaryService.getBeneficiary360ById(id),
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

  const canEdit = role === "ORG_ADMIN" || role === "PROGRAM_OFFICER";

  return (
    <PageContainer>
      <Beneficiary360Header beneficiary={beneficiary} canEdit={canEdit} readOnly={role === "AUDITOR"} />
      <BeneficiaryBenefitKpis beneficiary={beneficiary} />
      <section className="grid gap-4 xl:grid-cols-[1fr_1fr]">
        <BeneficiaryIdentityCard beneficiary={beneficiary} />
        <BeneficiaryOrganizationCard beneficiary={beneficiary} />
      </section>
      <section className="grid gap-4 xl:grid-cols-[1.1fr_0.9fr]">
        <ProgramBenefitBreakdown items={beneficiary.programBreakdown} />
        <VerificationRiskSummary beneficiary={beneficiary} />
      </section>
      <BenefitTimeline items={beneficiary.benefitTimeline} />
      <section className="grid gap-4 xl:grid-cols-[1fr_1fr]">
        <BeneficiaryProgramEnrollmentPreview
          benefitSummary={beneficiary.benefitSummary}
          programs={beneficiary.programs}
        />
        <BeneficiaryDocumentsPlaceholder documents={beneficiary.documentSummary} />
      </section>
      <BeneficiaryAuditPreview items={beneficiary.auditPreview} />
    </PageContainer>
  );
}
