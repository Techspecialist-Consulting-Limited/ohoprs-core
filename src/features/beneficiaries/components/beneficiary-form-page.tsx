"use client";

import { useQuery } from "@tanstack/react-query";

import { PermissionDeniedState } from "@/components/shared/permission-denied-state";
import { EmptyState } from "@/components/ui/empty-state";
import { LoadingState } from "@/components/ui/loading-state";
import { PageContainer } from "@/components/ui/page-container";
import { PageHeader } from "@/components/ui/page-header";
import { hasPermission } from "@/lib/rbac";
import { beneficiaryService } from "@/services/beneficiary.service";
import { useAuthStore } from "@/store/auth.store";
import { BeneficiaryForm } from "@/features/beneficiaries/components/beneficiary-form";

export function BeneficiaryCreateModule() {
  const role = useAuthStore((state) => state.role);

  if (!role || !hasPermission(role, "create_beneficiaries")) {
    return (
      <PageContainer>
        <PermissionDeniedState
          title="Beneficiary creation denied"
          description="Your role cannot create beneficiary records."
        />
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <PageHeader
        title="Create beneficiary"
        description="Register a beneficiary in the central system pool and tag the agency currently benefiting from the record."
      />
      <BeneficiaryForm
        mode="create"
        canChooseOrganization
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

  if (!role || !hasPermission(role, "edit_beneficiaries")) {
    return (
      <PageContainer>
        <PermissionDeniedState
          title="Beneficiary edit denied"
          description="Your role cannot edit beneficiary records."
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

  return (
    <PageContainer>
      <PageHeader
        title={`Edit ${beneficiary.fullName}`}
        description="Update a central beneficiary record and its current agency benefit context."
      />
      <BeneficiaryForm
        mode="edit"
        beneficiaryId={beneficiary.id}
        canChooseOrganization
        defaultOrganizationId={beneficiary.organizationId}
        initialValues={{
          firstName: beneficiary.firstName,
          lastName: beneficiary.lastName,
          middleName: beneficiary.middleName,
          nin: beneficiary.nin,
          bvn: beneficiary.bvn,
          phone: beneficiary.phone,
          email: beneficiary.email,
          bloodGroup: beneficiary.bloodGroup,
          genotype: beneficiary.genotype,
          gender: beneficiary.gender,
          occupation: beneficiary.occupation,
          maritalStatus: beneficiary.maritalStatus,
          householdDependents: beneficiary.householdDependents,
          numberOfChildren: beneficiary.numberOfChildren,
          numberOfWives: beneficiary.numberOfWives,
          numberOfHusbands: beneficiary.numberOfHusbands,
          dateOfBirth: beneficiary.dateOfBirth,
          state: beneficiary.state,
          stateOfOrigin: beneficiary.stateOfOrigin,
          lga: beneficiary.lga,
          address: beneficiary.address,
          hasDisability: beneficiary.hasDisability,
          disabilityType: beneficiary.disabilityType,
          organizationId: beneficiary.organizationId,
          programIds: beneficiary.programIds,
          verificationStatus: beneficiary.verificationStatus,
          benefitStatus: beneficiary.benefitStatus,
        }}
      />
    </PageContainer>
  );
}
