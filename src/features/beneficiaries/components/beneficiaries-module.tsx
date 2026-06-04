"use client";

import Link from "next/link";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";

import { EmptyState } from "@/components/ui/empty-state";
import { LoadingState } from "@/components/ui/loading-state";
import { PageContainer } from "@/components/ui/page-container";
import { PageHeader } from "@/components/ui/page-header";
import { hasPermission } from "@/lib/rbac";
import { organizationsData } from "@/mock/organizations.mock";
import { programsData } from "@/mock/programs.mock";
import { beneficiaryService } from "@/services/beneficiary.service";
import { useAuthStore } from "@/store/auth.store";
import type { BenefitStatus, VerificationStatus } from "@/types/beneficiary";
import { BeneficiaryFilters } from "@/features/beneficiaries/components/beneficiary-filters";
import { BeneficiaryTable } from "@/features/beneficiaries/components/beneficiary-table";

export function BeneficiariesModule() {
  const currentTenant = useAuthStore((state) => state.currentTenant);
  const role = useAuthStore((state) => state.role);
  const user = useAuthStore((state) => state.user);
  const [filters, setFilters] = useState<{
    search: string;
    organizationId: string | "ALL";
    programId: string | "ALL";
    state: string | "ALL";
    verificationStatus: VerificationStatus | "ALL";
    benefitStatus: BenefitStatus | "ALL";
  }>({
    search: "",
    organizationId: "ALL",
    programId: "ALL",
    state: "ALL",
    verificationStatus: "ALL",
    benefitStatus: "ALL",
  });
  const [page, setPage] = useState(1);

  const scopeOrganizationId =
    role === "ORG_ADMIN" || role === "PROGRAM_OFFICER"
      ? user?.organizationId ?? organizationsData.find((organization) => organization.shortName === currentTenant?.shortCode)?.id ?? null
      : null;

  const showOrganizationFilter = role === "SUPER_ADMIN" || role === "AUDITOR";
  const canCreate = role ? hasPermission(role, "create_beneficiaries") : false;
  const canUpload = role ? hasPermission(role, "upload_beneficiaries") : false;
  const canEdit = role ? hasPermission(role, "edit_beneficiaries") : false;
  const scopedPrograms = showOrganizationFilter
    ? programsData
    : programsData.filter((program) => program.organizationId === scopeOrganizationId);

  const beneficiaryQuery = useQuery({
    queryKey: ["beneficiaries", page, filters, role, scopeOrganizationId],
    queryFn: () =>
      beneficiaryService.getBeneficiaries({
        page,
        limit: 10,
        search: filters.search,
        organizationId: filters.organizationId,
        programId: filters.programId,
        state: filters.state,
        verificationStatus: filters.verificationStatus,
        benefitStatus: filters.benefitStatus,
        scopeOrganizationId,
      }),
  });

  if (beneficiaryQuery.isLoading) {
    return (
      <PageContainer>
        <LoadingState title="Loading beneficiaries" lines={5} />
      </PageContainer>
    );
  }

  if (beneficiaryQuery.isError || !beneficiaryQuery.data?.success) {
    return (
      <PageContainer>
        <EmptyState
          title="Unable to load beneficiaries"
          description="The mock beneficiary service could not return beneficiary data."
        />
      </PageContainer>
    );
  }

  const response = beneficiaryQuery.data.data;
  const states = Array.from(new Set(beneficiaryQuery.data.data.items.map((item) => item.state))).sort();

  return (
    <PageContainer>
      <PageHeader
        eyebrow="Phase 7"
        title="Beneficiary management"
        description="Manage beneficiary records, enrollment previews, verification state, and upload preparation across organization scopes."
      />

      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="max-w-2xl text-sm text-muted">
          {showOrganizationFilter
            ? "Review beneficiaries across organizations, programs, and verification states."
            : "You are viewing beneficiaries scoped to your organization."
          }
        </div>
        {canCreate || canUpload ? (
          <div className="flex flex-wrap gap-3">
            {canUpload ? (
              <Link
                href="/beneficiaries/upload"
                className="inline-flex h-11 items-center justify-center rounded-2xl border border-border px-4 text-sm font-semibold text-foreground"
              >
                Upload Beneficiaries
              </Link>
            ) : null}
            {canCreate ? (
              <Link
                href="/beneficiaries/new"
                className="inline-flex h-11 items-center justify-center rounded-2xl bg-accent px-4 text-sm font-semibold text-accent-foreground"
              >
                Create Beneficiary
              </Link>
            ) : null}
          </div>
        ) : null}
      </div>

      <BeneficiaryFilters
        organizations={organizationsData}
        programs={scopedPrograms}
        showOrganizationFilter={showOrganizationFilter}
        states={states}
        value={filters}
        onChange={(next) => {
          setFilters(next);
          setPage(1);
        }}
      />

      {response.items.length ? (
        <BeneficiaryTable
          items={response.items}
          meta={response.meta}
          onPageChange={setPage}
          canEdit={canEdit}
        />
      ) : (
        <EmptyState
          title="No beneficiaries match your filters"
          description="Adjust the filters or create a beneficiary to populate this module."
        />
      )}
    </PageContainer>
  );
}
