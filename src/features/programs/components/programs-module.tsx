"use client";

import Link from "next/link";
import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { EmptyState } from "@/components/ui/empty-state";
import { LoadingState } from "@/components/ui/loading-state";
import { PageContainer } from "@/components/ui/page-container";
import { PageHeader } from "@/components/ui/page-header";
import { organizationsData } from "@/mock/organizations.mock";
import { ProgramFilters } from "@/features/programs/components/program-filters";
import { ProgramStatusDialog } from "@/features/programs/components/program-status-dialog";
import { ProgramTable } from "@/features/programs/components/program-table";
import { programService } from "@/services/program.service";
import { useAuthStore } from "@/store/auth.store";
import type { BenefitType, Program, ProgramStatus } from "@/types/program";

export function ProgramsModule() {
  const currentTenant = useAuthStore((state) => state.currentTenant);
  const role = useAuthStore((state) => state.role);
  const user = useAuthStore((state) => state.user);
  const queryClient = useQueryClient();
  const [filters, setFilters] = useState<{
    search: string;
    organizationId: string | "ALL";
    benefitType: BenefitType | "ALL";
    status: ProgramStatus | "ALL";
  }>({
    search: "",
    organizationId: "ALL",
    benefitType: "ALL",
    status: "ALL",
  });
  const [page, setPage] = useState(1);
  const [statusTarget, setStatusTarget] = useState<Program | null>(null);
  const [nextStatus, setNextStatus] = useState<ProgramStatus>("DRAFT");

  const scopeOrganizationId =
    role === "ORG_ADMIN" || role === "PROGRAM_OFFICER"
      ? user?.organizationId ?? organizationsData.find((organization) => organization.shortName === currentTenant?.shortCode)?.id ?? null
      : null;

  const showOrganizationFilter = role === "SUPER_ADMIN" || role === "AUDITOR";
  const canCreate = role === "SUPER_ADMIN" || role === "ORG_ADMIN";

  const programsQuery = useQuery({
    queryKey: ["programs", page, filters, role, scopeOrganizationId],
    queryFn: () =>
      programService.getPrograms({
        page,
        limit: 10,
        search: filters.search,
        organizationId: filters.organizationId,
        benefitType: filters.benefitType,
        status: filters.status,
        scopeOrganizationId,
      }),
  });

  const statusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: ProgramStatus }) => programService.updateProgramStatus(id, status),
    onSuccess: (response) => {
      if (!response.success) {
        toast.error(response.message);
        return;
      }

      toast.success(response.message);
      setStatusTarget(null);
      queryClient.invalidateQueries({ queryKey: ["programs"] });
      queryClient.invalidateQueries({ queryKey: ["program", response.data?.id] });
    },
  });

  if (programsQuery.isLoading) {
    return (
      <PageContainer>
        <LoadingState title="Loading programs" lines={5} />
      </PageContainer>
    );
  }

  if (programsQuery.isError || !programsQuery.data?.success) {
    return (
      <PageContainer>
        <EmptyState
          title="Unable to load programs"
          description="The mock program service could not return program data."
        />
      </PageContainer>
    );
  }

  const response = programsQuery.data.data;

  return (
    <PageContainer>
      <PageHeader
        eyebrow="Phase 6"
        title="Program management"
        description="Create, review, and manage benefit programs across organizations with role-aware access and enterprise operational visibility."
      />

      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="max-w-2xl text-sm text-muted">
          {showOrganizationFilter
            ? "Review programs across organizations or narrow the view by organization, benefit type, and status."
            : "You are viewing programs scoped to your organization."
          }
        </div>
        {canCreate ? (
          <Link
            href="/programs/new"
            className="inline-flex h-11 items-center justify-center rounded-2xl bg-accent px-4 text-sm font-semibold text-accent-foreground"
          >
            Create Program
          </Link>
        ) : null}
      </div>

      <ProgramFilters
        organizations={organizationsData}
        showOrganizationFilter={showOrganizationFilter}
        value={filters}
        onChange={(next) => {
          setFilters(next);
          setPage(1);
        }}
      />

      {response.items.length ? (
        <ProgramTable
          items={response.items}
          meta={response.meta}
          onPageChange={setPage}
          onStatusAction={(program) => {
            setStatusTarget(program);
            setNextStatus(program.status);
          }}
          role={role!}
        />
      ) : (
        <EmptyState
          title="No programs match your filters"
          description="Adjust the filters or create a new program to populate this module."
        />
      )}

      {statusTarget ? (
        <ProgramStatusDialog
          program={statusTarget}
          nextStatus={nextStatus}
          onStatusChange={setNextStatus}
          onClose={() => setStatusTarget(null)}
          onConfirm={() => statusMutation.mutate({ id: statusTarget.id, status: nextStatus })}
        />
      ) : null}
    </PageContainer>
  );
}
