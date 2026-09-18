import type { BenefitType } from "@/types/program";

export type ReportDatePreset =
  | "LAST_30_DAYS"
  | "LAST_90_DAYS"
  | "YEAR_TO_DATE"
  | "LAST_12_MONTHS"
  | "CUSTOM";

export interface ReportKpis {
  totalOrganizations: number;
  totalBeneficiaries: number;
  householdImpact: number;
  totalPrograms: number;
  activePrograms: number;
  totalCashRelief: number;
  equivalentNonCashRelief: number;
  completedDistributions: number;
  failedDistributions: number;
  pendingAmount: number;
}

export interface ReportChartPoint {
  label: string;
  value: number;
}

export interface ReportStateMetric {
  state: string;
  region: string;
  beneficiaryCount: number;
  interventionCount: number;
  distributionCount: number;
  estimatedAmountDistributed: number;
}

export interface ReportLgaMetric {
  state: string;
  lga: string;
  beneficiaryCount: number;
  estimatedAmountDistributed: number;
}

export interface OrganizationReportRow {
  organizationId: string;
  organizationName: string;
  programCount: number;
  beneficiaryCount: number;
  totalDistributed: number;
  completionRate: number;
}

export interface ProgramReportRow {
  programId: string;
  programName: string;
  organizationName: string;
  benefitType: string;
  enrolledBeneficiaries: number;
  totalDistributed: number;
  successRate: number;
}

export interface ReportsDashboardData {
  kpis: ReportKpis;
  distributionByMonth: ReportChartPoint[];
  distributionByBenefitType: ReportChartPoint[];
  distributionByState: ReportChartPoint[];
  beneficiaryCoverageByState: ReportChartPoint[];
  programPerformance: ReportChartPoint[];
  distributionStatusBreakdown: ReportChartPoint[];
  stateMetrics: ReportStateMetric[];
  lgaMetrics: ReportLgaMetric[];
}

export interface BeneficiaryReportData {
  verificationStatusBreakdown: ReportChartPoint[];
  benefitStatusBreakdown: ReportChartPoint[];
  beneficiaryCoverageByState: ReportChartPoint[];
  demographicSummary: {
    verifiedRecords: number;
    flaggedRecords: number;
    activeBeneficiaries: number;
    statesCovered: number;
  };
}

export interface DistributionReportData {
  standardMetrics: {
    completedDistributions: number;
    failedDistributions: number;
    pendingDistributions: number;
    pendingAmount: number;
  };
  bulkJobMetrics: {
    totalBulkJobs: number;
    processingJobs: number;
    completedJobs: number;
    partiallyFailedJobs: number;
    failedRecords: number;
    totalRecordsProcessed: number;
  };
  statusBreakdown: ReportChartPoint[];
  bulkStatusBreakdown: ReportChartPoint[];
}

export interface ReportFiltersState {
  datePreset: ReportDatePreset;
  startDate?: string;
  endDate?: string;
  organizationId?: string;
  programId?: string;
  phaseNumber?: number | "ALL";
  benefitType?: BenefitType | "ALL";
  state?: string;
}

export interface ExportCsvResult {
  filename: string;
  content: string;
}
