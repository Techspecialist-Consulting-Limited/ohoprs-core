"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";

import { EmptyState } from "@/components/ui/empty-state";
import { LoadingState } from "@/components/ui/loading-state";
import { PageContainer } from "@/components/ui/page-container";
import { ExportButtons } from "@/features/reports/components/export-buttons";
import { BeneficiaryReportSummary } from "@/features/reports/components/beneficiary-report-summary";
import { BenefitTypeChart } from "@/features/reports/components/benefit-type-chart";
import { DistributionByMonthChart } from "@/features/reports/components/distribution-by-month-chart";
import { DistributionReportSummary } from "@/features/reports/components/distribution-report-summary";
import { OrganizationReportTable } from "@/features/reports/components/organization-report-table";
import { ProgramPerformanceChart } from "@/features/reports/components/program-performance-chart";
import { ProgramReportTable } from "@/features/reports/components/program-report-table";
import { ReportChartCard } from "@/features/reports/components/report-chart-card";
import { ReportFilters } from "@/features/reports/components/report-filters";
import { ReportHeader } from "@/features/reports/components/report-header";
import { ReportKpiGrid } from "@/features/reports/components/report-kpi-grid";
import { ReportNavigationCards } from "@/features/reports/components/report-navigation-cards";
import { StateDistributionChart } from "@/features/reports/components/state-distribution-chart";
import { reportService } from "@/services/report.service";
import { useAuthStore } from "@/store/auth.store";
import type { ReportFiltersState } from "@/types/report";

function useReportFilters() {
  const role = useAuthStore((state) => state.role);
  const user = useAuthStore((state) => state.user);
  const showOrganizationFilter = role === "SUPER_ADMIN" || role === "AUDITOR";

  const [filters, setFilters] = useState<ReportFiltersState>({
    datePreset: "LAST_12_MONTHS",
    organizationId: showOrganizationFilter ? "ALL" : user?.organizationId ?? undefined,
    programId: "ALL",
    benefitType: "ALL",
    state: "ALL",
  });

  return {
    filters,
    setFilters,
    showOrganizationFilter,
    scopedOrganizationId: showOrganizationFilter ? filters.organizationId : user?.organizationId ?? undefined,
    readOnly: role === "AUDITOR",
    hideFinancials: role === "PROGRAM_OFFICER",
    role,
    user,
  };
}

export function ReportsDashboardModule() {
  const { filters, setFilters, showOrganizationFilter, scopedOrganizationId, readOnly, hideFinancials } = useReportFilters();
  const dataQuery = useQuery({
    queryKey: ["reports-dashboard", { ...filters, organizationId: scopedOrganizationId }],
    queryFn: () => reportService.getReportsDashboard({ ...filters, organizationId: scopedOrganizationId }),
  });

  if (dataQuery.isLoading) {
    return (
      <PageContainer>
        <LoadingState title="Loading reports dashboard" lines={6} />
      </PageContainer>
    );
  }

  const data = dataQuery.data?.data;
  if (!data) {
    return (
      <PageContainer>
        <EmptyState title="Reports unavailable" description="The reports dashboard could not be loaded from the mock analytics service." />
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <ReportHeader
        title="Reports & Analytics"
        description="Executive and audit-friendly reporting across distributions, beneficiaries, programs, and organizations."
        readOnly={readOnly}
      />
      <div className="flex justify-end">
        <ExportButtons reportType="summary" filters={{ ...filters, organizationId: scopedOrganizationId }} />
      </div>
      <ReportFilters
        value={{ ...filters, organizationId: scopedOrganizationId }}
        onChange={setFilters}
        showOrganizationFilter={showOrganizationFilter}
        allowedOrganizationId={showOrganizationFilter ? null : scopedOrganizationId}
      />
      <ReportKpiGrid kpis={data.kpis} hideFinancials={hideFinancials} />
      <section className="grid gap-4 xl:grid-cols-2">
        <ReportChartCard title="Distribution by Month" description="Monthly distribution volume across the selected reporting scope.">
          <DistributionByMonthChart data={data.distributionByMonth} />
        </ReportChartCard>
        <ReportChartCard title="Distribution by Benefit Type" description="Benefit mix across current filters and scope.">
          <BenefitTypeChart data={data.distributionByBenefitType} />
        </ReportChartCard>
        <ReportChartCard title="Distribution by State" description="Estimated delivered value across states.">
          <StateDistributionChart data={data.distributionByState} currency />
        </ReportChartCard>
        <ReportChartCard title="Beneficiary Coverage by State" description="Beneficiary footprint across states in the filtered view.">
          <StateDistributionChart data={data.beneficiaryCoverageByState} />
        </ReportChartCard>
        <ReportChartCard title="Program Performance" description="High-level program delivery performance score.">
          <ProgramPerformanceChart data={data.programPerformance} />
        </ReportChartCard>
        <ReportChartCard title="Distribution Status Breakdown" description="Completed, failed, and pending distribution mix.">
          <BenefitTypeChart data={data.distributionStatusBreakdown} />
        </ReportChartCard>
      </section>
      <ReportNavigationCards />
    </PageContainer>
  );
}

export function OrganizationsReportModule() {
  const { filters, setFilters, showOrganizationFilter, scopedOrganizationId, readOnly } = useReportFilters();
  const dataQuery = useQuery({
    queryKey: ["organization-report", { ...filters, organizationId: scopedOrganizationId }],
    queryFn: () => reportService.getOrganizationReport({ ...filters, organizationId: scopedOrganizationId }),
  });

  if (dataQuery.isLoading) {
    return <PageContainer><LoadingState title="Loading organization report" lines={5} /></PageContainer>;
  }

  const rows = dataQuery.data?.data ?? [];
  return (
    <PageContainer>
      <ReportHeader title="Organization Report" description="Rank organizations by scale, beneficiaries, distributed value, and completion performance." readOnly={readOnly} />
      <div className="flex justify-end">
        <ExportButtons reportType="organizations" filters={{ ...filters, organizationId: scopedOrganizationId }} />
      </div>
      <ReportFilters value={{ ...filters, organizationId: scopedOrganizationId }} onChange={setFilters} showOrganizationFilter={showOrganizationFilter} allowedOrganizationId={showOrganizationFilter ? null : scopedOrganizationId} />
      <OrganizationReportTable rows={rows} />
    </PageContainer>
  );
}

export function ProgramsReportModule() {
  const { filters, setFilters, showOrganizationFilter, scopedOrganizationId, readOnly } = useReportFilters();
  const dataQuery = useQuery({
    queryKey: ["program-report", { ...filters, organizationId: scopedOrganizationId }],
    queryFn: () => reportService.getProgramReport({ ...filters, organizationId: scopedOrganizationId }),
  });

  if (dataQuery.isLoading) {
    return <PageContainer><LoadingState title="Loading program report" lines={5} /></PageContainer>;
  }

  const rows = dataQuery.data?.data ?? [];
  return (
    <PageContainer>
      <ReportHeader title="Program Report" description="Compare programs by enrolled beneficiaries, total distributed value, and success rate." readOnly={readOnly} />
      <div className="flex justify-end">
        <ExportButtons reportType="programs" filters={{ ...filters, organizationId: scopedOrganizationId }} />
      </div>
      <ReportFilters value={{ ...filters, organizationId: scopedOrganizationId }} onChange={setFilters} showOrganizationFilter={showOrganizationFilter} allowedOrganizationId={showOrganizationFilter ? null : scopedOrganizationId} />
      <ProgramReportTable rows={rows} />
    </PageContainer>
  );
}

export function BeneficiariesReportModule() {
  const { filters, setFilters, showOrganizationFilter, scopedOrganizationId, readOnly } = useReportFilters();
  const dataQuery = useQuery({
    queryKey: ["beneficiary-report", { ...filters, organizationId: scopedOrganizationId }],
    queryFn: () => reportService.getBeneficiaryReport({ ...filters, organizationId: scopedOrganizationId }),
  });

  if (dataQuery.isLoading) {
    return <PageContainer><LoadingState title="Loading beneficiary report" lines={5} /></PageContainer>;
  }

  const data = dataQuery.data?.data;
  if (!data) {
    return <PageContainer><EmptyState title="Beneficiary report unavailable" description="The beneficiary analytics view could not be loaded." /></PageContainer>;
  }

  return (
    <PageContainer>
      <ReportHeader title="Beneficiary Report" description="Visual beneficiary analytics across verification quality, benefit status, state coverage, and flagged records." readOnly={readOnly} />
      <div className="flex justify-end">
        <ExportButtons reportType="beneficiaries" filters={{ ...filters, organizationId: scopedOrganizationId }} />
      </div>
      <ReportFilters value={{ ...filters, organizationId: scopedOrganizationId }} onChange={setFilters} showOrganizationFilter={showOrganizationFilter} allowedOrganizationId={showOrganizationFilter ? null : scopedOrganizationId} />
      <BeneficiaryReportSummary data={data} />
      <section className="grid gap-4 xl:grid-cols-2">
        <ReportChartCard title="Verification Status Breakdown" description="Verification mix for the current beneficiary scope.">
          <BenefitTypeChart data={data.verificationStatusBreakdown} />
        </ReportChartCard>
        <ReportChartCard title="Benefit Status Breakdown" description="Operational benefit status across beneficiaries in scope.">
          <BenefitTypeChart data={data.benefitStatusBreakdown} />
        </ReportChartCard>
        <ReportChartCard title="Beneficiary Coverage by State" description="Beneficiary footprint by state under active filters.">
          <StateDistributionChart data={data.beneficiaryCoverageByState} />
        </ReportChartCard>
        <ReportChartCard title="Flagged Records Summary" description="Operational visibility into flagged and verified records.">
          <ProgramPerformanceChart
            data={[
              { label: "Verified", value: data.demographicSummary.verifiedRecords },
              { label: "Flagged", value: data.demographicSummary.flaggedRecords },
              { label: "Active", value: data.demographicSummary.activeBeneficiaries },
              { label: "States", value: data.demographicSummary.statesCovered },
            ]}
          />
        </ReportChartCard>
      </section>
    </PageContainer>
  );
}

export function DistributionsReportModule() {
  const { filters, setFilters, showOrganizationFilter, scopedOrganizationId, readOnly } = useReportFilters();
  const dataQuery = useQuery({
    queryKey: ["distribution-report", { ...filters, organizationId: scopedOrganizationId }],
    queryFn: () => reportService.getDistributionReport({ ...filters, organizationId: scopedOrganizationId }),
  });

  if (dataQuery.isLoading) {
    return <PageContainer><LoadingState title="Loading distribution report" lines={5} /></PageContainer>;
  }

  const data = dataQuery.data?.data;
  if (!data) {
    return <PageContainer><EmptyState title="Distribution report unavailable" description="The distribution analytics view could not be loaded." /></PageContainer>;
  }

  return (
    <PageContainer>
      <ReportHeader title="Distribution Report" description="Delivery analytics combining standard distributions and enterprise-scale bulk-processing metrics." readOnly={readOnly} />
      <div className="flex justify-end">
        <ExportButtons reportType="distributions" filters={{ ...filters, organizationId: scopedOrganizationId }} />
      </div>
      <ReportFilters value={{ ...filters, organizationId: scopedOrganizationId }} onChange={setFilters} showOrganizationFilter={showOrganizationFilter} allowedOrganizationId={showOrganizationFilter ? null : scopedOrganizationId} />
      <DistributionReportSummary data={data} />
      <section className="grid gap-4 xl:grid-cols-2">
        <ReportChartCard title="Distribution Status Breakdown" description="Completed, failed, and pending distribution batches.">
          <BenefitTypeChart data={data.statusBreakdown} />
        </ReportChartCard>
        <ReportChartCard title="Bulk Job Status Breakdown" description="Bulk-engine job status mix.">
          <BenefitTypeChart data={data.bulkStatusBreakdown} />
        </ReportChartCard>
      </section>
    </PageContainer>
  );
}
