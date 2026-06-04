"use client";

import { PermissionDeniedState } from "@/components/shared/permission-denied-state";
import { PageContainer } from "@/components/ui/page-container";
import { PageHeader } from "@/components/ui/page-header";
import { hasPermission } from "@/lib/rbac";
import { useAuthStore } from "@/store/auth.store";
import { BeneficiaryImportPreview } from "@/features/beneficiaries/components/beneficiary-import-preview";
import { BeneficiaryUploadCard } from "@/features/beneficiaries/components/beneficiary-upload-card";

export function BeneficiaryUploadModule() {
  const role = useAuthStore((state) => state.role);

  if (!role || !hasPermission(role, "upload_beneficiaries")) {
    return (
      <PageContainer>
        <PermissionDeniedState
          title="Beneficiary upload denied"
          description="Your role cannot upload beneficiary records."
        />
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <PageHeader
        title="Upload beneficiaries"
        description="Prepare bulk beneficiary imports with template download, import rules, and preview-only review."
      />
      <BeneficiaryUploadCard />
      <BeneficiaryImportPreview />
    </PageContainer>
  );
}
