import { nationalDashboardData } from "@/mock/dashboard.mock";
import { beneficiariesData } from "@/mock/beneficiaries.mock";
import { bulkDistributionJobsData } from "@/mock/bulk-distributions.mock";
import { distributionsData } from "@/mock/distributions.mock";
import { organizationsData } from "@/mock/organizations.mock";
import { programsData } from "@/mock/programs.mock";
import type {
  BeneficiaryReportData,
  DistributionReportData,
  OrganizationReportRow,
  ProgramReportRow,
  ReportChartPoint,
  ReportFiltersState,
  ReportsDashboardData,
  ReportKpis,
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

const stateToRegion: Record<string, string> = {
  Abia: "South East",
  Anambra: "South East",
  Bauchi: "North East",
  Benue: "North Central",
  Borno: "North East",
  "Cross River": "South South",
  Ebonyi: "South East",
  Ekiti: "South West",
  Enugu: "South East",
  FCT: "North Central",
  Imo: "South East",
  Jigawa: "North West",
  Kaduna: "North West",
  Kano: "North West",
  Katsina: "North West",
  Kebbi: "North West",
  Kogi: "North Central",
  Kwara: "North Central",
  Lagos: "South West",
  Nasarawa: "North Central",
  Niger: "North Central",
  Osun: "South West",
  Oyo: "South West",
  Plateau: "North Central",
  Rivers: "South South",
  Sokoto: "North West",
  Zamfara: "North West",
};

export function getScopedPrograms(filters: ReportFiltersState) {
  return programsData.filter(
    (item) =>
      matchesOrganization(item, filters.organizationId) &&
      (!filters.programId || filters.programId === "ALL" || item.id === filters.programId) &&
      matchesBenefitType(item.benefitType, filters.benefitType),
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
  return aggregateCounts(items, (item) => stateToRegion[getState(item)] ?? "Other");
}

export function reportsDashboardData(filters: ReportFiltersState): ReportsDashboardData {
  const distributions = getScopedDistributions(filters);
  const beneficiaries = getScopedBeneficiaries(filters);
  const programs = getScopedPrograms(filters);

  return {
    kpis: buildReportKpis(filters),
    distributionByMonth: aggregateByMonth(distributions),
    distributionByBenefitType: aggregateCounts(distributions, (item) => item.benefitType),
    distributionByState: aggregateRegions(beneficiaries, (item) => item.state)
      .map((item) => ({ ...item, value: item.value * 15000 }))
      .slice(0, 6),
    beneficiaryCoverageByState: aggregateRegions(beneficiaries, (item) => item.state).slice(0, 6),
    programPerformance: programs
      .slice(0, 8)
      .map((item) => ({
        label: item.name.length > 18 ? `${item.name.slice(0, 18)}...` : item.name,
        value: Math.min(99, Math.round((item.totalDistributed / Math.max(item.budget ?? 0, 1)) * 100)),
      })),
    distributionStatusBreakdown: aggregateCounts(distributions, (item) =>
      item.status === "SCHEDULED" || item.status === "PROCESSING" ? "PENDING" : item.status,
    ),
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

  return {
    verificationStatusBreakdown: aggregateCounts(beneficiaries, (item) => item.verificationStatus),
    benefitStatusBreakdown: aggregateCounts(beneficiaries, (item) => item.benefitStatus),
    beneficiaryCoverageByState: aggregateRegions(beneficiaries, (item) => item.state).slice(0, 6),
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
