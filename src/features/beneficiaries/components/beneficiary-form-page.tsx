"use client";

import { useQuery } from "@tanstack/react-query";

import { PermissionDeniedState } from "@/components/shared/permission-denied-state";
import { EmptyState } from "@/components/ui/empty-state";
import { LoadingState } from "@/components/ui/loading-state";
import { PageContainer } from "@/components/ui/page-container";
import { PageHeader } from "@/components/ui/page-header";
import { beneficiaryService } from "@/services/beneficiary.service";
import { useAuthStore } from "@/store/auth.store";
import { BeneficiaryForm } from "@/features/beneficiaries/components/beneficiary-form";

export function BeneficiaryCreateModule() {
  const role = useAuthStore((state) => state.role);
  const user = useAuthStore((state) => state.user);

  if (role === "AUDITOR") {
    return (
      <PageContainer>
        <PermissionDeniedState
          title="Beneficiary creation denied"
          description="Auditors cannot create beneficiary records."
        />
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <PageHeader
        eyebrow="Phase 7"
        title="Create beneficiary"
        description="Register a beneficiary record within the correct organization and program scope."
      />
      <BeneficiaryForm
        mode="create"
        canChooseOrganization={role === "SUPER_ADMIN"}
        defaultOrganizationId={role !== "SUPER_ADMIN" ? user?.organizationId ?? undefined : undefined}
      />
    </PageContainer>
  );
}

export function BeneficiaryEditModule({ id }: { id: string }) {
  const role = useAuthStore((state) => state.role);
  const user = useAuthStore((state) => state.user);
  const beneficiaryQuery = useQuery({
    queryKey: ["beneficiary", id],
    queryFn: () => beneficiaryService.getBeneficiaryById(id),
  });

  if (role === "AUDITOR") {
    return (
      <PageContainer>
        <PermissionDeniedState
          title="Beneficiary edit denied"
          description="Auditors cannot edit beneficiary records."
        />
      </PageContainer>
    );
  }

  if (beneficiaryQuery.isLoading) {
    return (
      <PageContainer>
        <LoadingState title="Loading beneficiary for editing" lines={5} />
      </PageContainer>
    );
  }

  const beneficiary = beneficiaryQuery.data?.data;

  if (!beneficiary) {
    return (
      <PageContainer>
        <EmptyState
          title="Beneficiary not found"
          description="The selected beneficiary could not be loaded for editing."
        />
      </PageContainer>
    );
  }

  if ((role === "ORG_ADMIN" || role === "PROGRAM_OFFICER") && user?.organizationId !== beneficiary.organizationId) {
    return (
      <PageContainer>
        <PermissionDeniedState
          title="Beneficiary edit denied"
          description="You can only edit beneficiaries within your own organization."
        />
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <PageHeader
        eyebrow="Phase 7"
        title={`Edit ${beneficiary.fullName}`}
        description="Update beneficiary contact, location, verification, and benefit status information."
      />
      <BeneficiaryForm
        mode="edit"
        beneficiaryId={beneficiary.id}
        canChooseOrganization={role === "SUPER_ADMIN"}
        defaultOrganizationId={beneficiary.organizationId}
        isProgramOfficerEditing={role === "PROGRAM_OFFICER"}
        initialValues={{
          firstName: beneficiary.firstName,
          lastName: beneficiary.lastName,
          middleName: beneficiary.middleName,
          nin: beneficiary.nin,
          bvn: beneficiary.bvn,
          phone: beneficiary.phone,
          email: beneficiary.email,
          gender: beneficiary.gender,
          dateOfBirth: beneficiary.dateOfBirth,
          state: beneficiary.state,
          lga: beneficiary.lga,
          address: beneficiary.address,
          organizationId: beneficiary.organizationId,
          programIds: beneficiary.programIds,
          verificationStatus: beneficiary.verificationStatus,
          benefitStatus: beneficiary.benefitStatus,
        }}
      />
    </PageContainer>
  );
}
