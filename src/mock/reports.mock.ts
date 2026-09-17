import { nationalDashboardData } from "@/mock/dashboard.mock";
import { beneficiariesData } from "@/mock/beneficiaries.mock";
import { bulkDistributionJobsData } from "@/mock/bulk-distributions.mock";
import { distributionsData } from "@/mock/distributions.mock";
import { organizationsData } from "@/mock/organizations.mock";
import { programsData } from "@/mock/programs.mock";
import { getRegionForState, nigeriaStates } from "@/constants/nigeria-regions";
import type {
  BeneficiaryReportData,
  DistributionReportData,
  OrganizationReportRow,
  ProgramReportRow,
  ReportChartPoint,
  ReportFiltersState,
  ReportsDashboardData,
  ReportKpis,
  ReportLgaMetric,
  ReportStateMetric,
} from "@/types/report";

function matchesOrganization<T extends { organizationId: string }>(item: T, organizationId?: string) {
  return !organizationId || organizationId === "ALL" || item.organizationId === organizationId;
}

function matchesProgram<T extends { programId: string }>(item: T, programId?: string) {
  return !programId || programId === "ALL" || item.programId === programId;
}

function matchesBenefitType(benefitType: string, filter?: string) {
  return !filter || filter === "ALL" || benefitType === filter;
}

function matchesState(state: string | undefined, filter?: string) {
  return !filter || filter === "ALL" || state === filter;
}

function titleCase(label: string) {
  return label
    .toLowerCase()
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function sum(values: number[]) {
  return values.reduce((total, value) => total + value, 0);
}

const nationalBeneficiaryCoverageByRegion: ReportChartPoint[] = [
  { label: "North West", value: 780000 },
  { label: "North East", value: 690000 },
  { label: "North Central", value: 510000 },
  { label: "South West", value: 420000 },
  { label: "South South", value: 330000 },
  { label: "South East", value: 270000 },
];

const nationalDistributionByRegion: ReportChartPoint[] = [
  { label: "North West", value: 156000000000 },
  { label: "North East", value: 138000000000 },
  { label: "North Central", value: 102000000000 },
  { label: "South West", value: 84000000000 },
  { label: "South South", value: 66000000000 },
  { label: "South East", value: 54000000000 },
];

export function getScopedPrograms(filters: ReportFiltersState) {
  return programsData.filter(
    (item) =>
      matchesOrganization(item, filters.organizationId) &&
      (!filters.programId || filters.programId === "ALL" || item.id === filters.programId) &&
      matchesBenefitType(item.benefitType, filters.benefitType),
  );
}

export function getScopedOrganizations(filters: ReportFiltersState) {
  return organizationsData.filter(
    (item) => !filters.organizationId || filters.organizationId === "ALL" || item.id === filters.organizationId,
  );
}

export function getScopedBeneficiaries(filters: ReportFiltersState) {
  return beneficiariesData.filter(
    (item) =>
      matchesOrganization(item, filters.organizationId) &&
      matchesState(item.state, filters.state) &&
      (!filters.programId || filters.programId === "ALL" || item.programIds.includes(filters.programId)),
  );
}

export function getScopedDistributions(filters: ReportFiltersState) {
  return distributionsData.filter(
    (item) =>
      matchesOrganization(item, filters.organizationId) &&
      matchesProgram(item, filters.programId) &&
      matchesBenefitType(item.benefitType, filters.benefitType),
  );
}

export function getScopedBulkJobs(filters: ReportFiltersState) {
  return bulkDistributionJobsData.filter(
    (item) =>
      matchesOrganization(item, filters.organizationId) &&
      matchesProgram(item, filters.programId) &&
      matchesBenefitType(item.benefitType, filters.benefitType),
  );
}

export function buildReportKpis(filters: ReportFiltersState): ReportKpis {
  const distributions = getScopedDistributions(filters);
  const completedDistributionCount = distributions.filter((item) => item.status === "COMPLETED").length;
  const failedDistributionCount = distributions.filter((item) => item.status === "FAILED").length;
  const pendingAmount = sum(
    distributions
      .filter((item) => item.status === "SCHEDULED" || item.status === "PROCESSING")
      .map((item) => item.amount ?? 0),
  );

  if (filters.organizationId === "ALL") {
    return {
      totalOrganizations: nationalDashboardData.kpis.totalOrganizations,
      totalBeneficiaries: nationalDashboardData.kpis.totalBeneficiaries,
      householdImpact: nationalDashboardData.kpis.householdImpact,
      totalPrograms: nationalDashboardData.kpis.totalPrograms,
      activePrograms: nationalDashboardData.kpis.activePrograms,
      totalCashRelief: nationalDashboardData.kpis.totalCashRelief,
      equivalentNonCashRelief: nationalDashboardData.kpis.equivalentNonCashRelief,
      completedDistributions: completedDistributionCount,
      failedDistributions: failedDistributionCount,
      pendingAmount,
    };
  }

  const organizations = getScopedOrganizations(filters);
  const programs = getScopedPrograms(filters);
  const beneficiaries = getScopedBeneficiaries(filters);
  const completedDistributions = distributions.filter((item) => item.status === "COMPLETED");
  const cashLikePrograms = new Set(
    programs.filter((program) => program.benefitType === "CASH").map((program) => program.id),
  );
  const totalCashRelief = sum(
    completedDistributions
      .filter((item) => cashLikePrograms.has(item.programId))
      .map((item) => item.amount ?? 0),
  );
  const equivalentNonCashRelief = sum(
    completedDistributions
      .filter((item) => !cashLikePrograms.has(item.programId))
      .map((item) => item.amount ?? 0),
  );

  return {
    totalOrganizations: organizations.length,
    totalBeneficiaries: sum(programs.map((item) => item.beneficiaryCount)),
    householdImpact: Math.round(sum(programs.map((item) => item.beneficiaryCount)) * 1.8),
    totalPrograms: programs.length,
    activePrograms: programs.filter((item) => item.status === "ACTIVE").length,
    totalCashRelief,
    equivalentNonCashRelief,
    completedDistributions: completedDistributionCount,
    failedDistributions: failedDistributionCount,
    pendingAmount,
  };
}

function aggregateByMonth(distributions: ReturnType<typeof getScopedDistributions>) {
  const labels = ["Jan", "Feb", "Mar", "Apr", "May", "Jun"];
  const totals = Array.from({ length: 6 }, () => 0);

  distributions.forEach((item) => {
    const month = new Date(item.scheduledDate).getMonth();
    if (month >= 0 && month < 6) {
      totals[month] += item.amount ?? Math.max((item.quantity ?? 0) * 10000, 0);
    }
  });

  return labels.map((label, index) => ({ label, value: totals[index] || (index + 1) * 50000000 }));
}

function aggregateCounts<T>(items: T[], getKey: (item: T) => string): ReportChartPoint[] {
  const map = new Map<string, number>();
  items.forEach((item) => {
    const key = getKey(item);
    map.set(key, (map.get(key) ?? 0) + 1);
  });
  return Array.from(map.entries()).map(([label, value]) => ({ label: titleCase(label), value }));
}

function aggregateRegions<T>(items: T[], getState: (item: T) => string): ReportChartPoint[] {
  return aggregateCounts(items, (item) => getRegionForState(getState(item)) ?? "Other");
}

function buildStateMetrics(filters: ReportFiltersState): ReportStateMetric[] {
  const programs = getScopedPrograms(filters);
  const distributions = getScopedDistributions(filters);
  const beneficiaries = getScopedBeneficiaries(filters);

  return nigeriaStates.map((state) => {
    const stateBeneficiaries = beneficiaries.filter((item) => item.state === state);
    const stateDistributions = distributions.filter((item) => item.states.includes(state));
    const stateInterventions = programs.filter((item) => (item.states ?? []).includes(state));
    const estimatedAmountDistributed = sum(
      stateDistributions.map((item) => (item.amount ?? 0) / Math.max(item.states.length, 1)),
    );

    return {
      state,
      region: getRegionForState(state) ?? "Other",
      beneficiaryCount: stateBeneficiaries.length,
      interventionCount: stateInterventions.length,
      distributionCount: stateDistributions.length,
      estimatedAmountDistributed: Math.round(estimatedAmountDistributed),
    };
  });
}

function buildLgaMetrics(filters: ReportFiltersState): ReportLgaMetric[] {
  const beneficiaries = getScopedBeneficiaries(filters);
  const map = new Map<string, ReportLgaMetric>();

  beneficiaries.forEach((item) => {
    const key = `${item.state}::${item.lga}`;
    const existing = map.get(key);

    if (existing) {
      existing.beneficiaryCount += 1;
      existing.estimatedAmountDistributed += 15000;
      return;
    }

    map.set(key, {
      state: item.state,
      lga: item.lga,
      beneficiaryCount: 1,
      estimatedAmountDistributed: 15000,
    });
  });

  return Array.from(map.values());
}

export function reportsDashboardData(filters: ReportFiltersState): ReportsDashboardData {
  const distributions = getScopedDistributions(filters);
  const beneficiaries = getScopedBeneficiaries(filters);
  const programs = getScopedPrograms(filters);
  const isNationalScope = filters.organizationId === "ALL";

  return {
    kpis: buildReportKpis(filters),
    distributionByMonth: aggregateByMonth(distributions),
    distributionByBenefitType: aggregateCounts(distributions, (item) => item.benefitType),
    distributionByState: isNationalScope
      ? nationalDistributionByRegion
      : aggregateRegions(beneficiaries, (item) => item.state)
          .map((item) => ({ ...item, value: item.value * 15000 }))
          .slice(0, 6),
    beneficiaryCoverageByState: isNationalScope
      ? nationalBeneficiaryCoverageByRegion
      : aggregateRegions(beneficiaries, (item) => item.state).slice(0, 6),
    programPerformance: programs
      .slice(0, 8)
      .map((item) => ({
        label: item.name.length > 18 ? `${item.name.slice(0, 18)}...` : item.name,
        value: Math.min(99, Math.round((item.totalDistributed / Math.max(item.budget ?? 0, 1)) * 100)),
      })),
    distributionStatusBreakdown: aggregateCounts(distributions, (item) =>
      item.status === "SCHEDULED" || item.status === "PROCESSING" ? "PENDING" : item.status,
    ),
    stateMetrics: buildStateMetrics(filters),
    lgaMetrics: buildLgaMetrics(filters),
  };
}

export function organizationReportRows(filters: ReportFiltersState): OrganizationReportRow[] {
  return organizationsData
    .filter((organization) => !filters.organizationId || filters.organizationId === "ALL" || organization.id === filters.organizationId)
    .map((organization) => {
      const programs = programsData.filter((item) => item.organizationId === organization.id);
      const beneficiaries = beneficiariesData.filter((item) => item.organizationId === organization.id);
      const distributions = distributionsData.filter((item) => item.organizationId === organization.id);

      return {
        organizationId: organization.id,
        organizationName: organization.name,
        programCount: programs.length,
        beneficiaryCount: beneficiaries.length,
        totalDistributed: sum(distributions.map((item) => item.amount ?? 0)),
        completionRate:
          distributions.length > 0
            ? Math.round((distributions.filter((item) => item.status === "COMPLETED").length / distributions.length) * 100)
            : 0,
      };
    });
}

export function programReportRows(filters: ReportFiltersState): ProgramReportRow[] {
  return getScopedPrograms(filters).map((program) => ({
    programId: program.id,
    programName: program.name,
    organizationName: program.organizationName,
    benefitType: titleCase(program.benefitType),
    enrolledBeneficiaries: program.beneficiaryCount,
    totalDistributed: program.totalDistributed,
    successRate: Math.min(100, Math.round((program.totalDistributed / Math.max(program.budget ?? 0, 1)) * 100)),
  }));
}

export function beneficiaryReportData(filters: ReportFiltersState): BeneficiaryReportData {
  const beneficiaries = getScopedBeneficiaries(filters);
  const isNationalScope = filters.organizationId === "ALL";

  return {
    verificationStatusBreakdown: aggregateCounts(beneficiaries, (item) => item.verificationStatus),
    benefitStatusBreakdown: aggregateCounts(beneficiaries, (item) => item.benefitStatus),
    beneficiaryCoverageByState: isNationalScope
      ? nationalBeneficiaryCoverageByRegion
      : aggregateRegions(beneficiaries, (item) => item.state).slice(0, 6),
    demographicSummary: {
      verifiedRecords: beneficiaries.filter((item) => item.verificationStatus === "VERIFIED").length,
      flaggedRecords: beneficiaries.filter((item) => item.verificationStatus === "FLAGGED").length,
      activeBeneficiaries: beneficiaries.filter((item) => item.benefitStatus === "ACTIVE").length,
      statesCovered: new Set(beneficiaries.map((item) => item.state)).size,
    },
  };
}

export function distributionReportData(filters: ReportFiltersState): DistributionReportData {
  const distributions = getScopedDistributions(filters);
  const bulkJobs = getScopedBulkJobs(filters);

  return {
    standardMetrics: {
      completedDistributions: distributions.filter((item) => item.status === "COMPLETED").length,
      failedDistributions: distributions.filter((item) => item.status === "FAILED").length,
      pendingDistributions: distributions.filter((item) => item.status === "SCHEDULED" || item.status === "PROCESSING").length,
      pendingAmount: sum(
        distributions
          .filter((item) => item.status === "SCHEDULED" || item.status === "PROCESSING")
          .map((item) => item.amount ?? 0),
      ),
    },
    bulkJobMetrics: {
      totalBulkJobs: bulkJobs.length,
      processingJobs: bulkJobs.filter((item) => item.status === "PROCESSING" || item.status === "QUEUED").length,
      completedJobs: bulkJobs.filter((item) => item.status === "COMPLETED").length,
      partiallyFailedJobs: bulkJobs.filter((item) => item.status === "PARTIALLY_FAILED").length,
      failedRecords: sum(bulkJobs.map((item) => item.failedRecords)),
      totalRecordsProcessed: sum(bulkJobs.map((item) => item.processedRecords)),
    },
    statusBreakdown: aggregateCounts(distributions, (item) =>
      item.status === "SCHEDULED" || item.status === "PROCESSING" ? "PENDING" : item.status,
    ),
    bulkStatusBreakdown: aggregateCounts(bulkJobs, (item) => item.status),
  };
}
