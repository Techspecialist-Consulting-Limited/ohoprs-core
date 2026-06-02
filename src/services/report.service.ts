import {
  beneficiaryReportData,
  distributionReportData,
  organizationReportRows,
  programReportRows,
  reportsDashboardData,
} from "@/mock/reports.mock";
import type { ApiResponse } from "@/types/api";
import type {
  BeneficiaryReportData,
  DistributionReportData,
  ExportCsvResult,
  OrganizationReportRow,
  ProgramReportRow,
  ReportFiltersState,
  ReportsDashboardData,
} from "@/types/report";

function toCsv<T extends object>(rows: T[]) {
  if (!rows.length) {
    return "No data\n";
  }

  const firstRow = rows[0] as Record<string, unknown>;
  const headers = Object.keys(firstRow);
  const lines = rows.map((row) => {
    const record = row as Record<string, unknown>;
    return headers.map((header) => JSON.stringify(record[header] ?? "")).join(",");
  });
  return `${headers.join(",")}\n${lines.join("\n")}`;
}

export const reportService = {
  async getReportsDashboard(params: ReportFiltersState): Promise<ApiResponse<ReportsDashboardData>> {
    return Promise.resolve({
      success: true,
      message: "Reports dashboard fetched successfully",
      data: reportsDashboardData(params),
    });
  },

  async getOrganizationReport(params: ReportFiltersState): Promise<ApiResponse<OrganizationReportRow[]>> {
    return Promise.resolve({
      success: true,
      message: "Organization report fetched successfully",
      data: organizationReportRows(params),
    });
  },

  async getProgramReport(params: ReportFiltersState): Promise<ApiResponse<ProgramReportRow[]>> {
    return Promise.resolve({
      success: true,
      message: "Program report fetched successfully",
      data: programReportRows(params),
    });
  },

  async getBeneficiaryReport(params: ReportFiltersState): Promise<ApiResponse<BeneficiaryReportData>> {
    return Promise.resolve({
      success: true,
      message: "Beneficiary report fetched successfully",
      data: beneficiaryReportData(params),
    });
  },

  async getDistributionReport(params: ReportFiltersState): Promise<ApiResponse<DistributionReportData>> {
    return Promise.resolve({
      success: true,
      message: "Distribution report fetched successfully",
      data: distributionReportData(params),
    });
  },

  async exportCsv(
    reportType: "summary" | "organizations" | "programs" | "beneficiaries" | "distributions",
    params: ReportFiltersState,
  ): Promise<ApiResponse<ExportCsvResult>> {
    let filename = "reports-summary.csv";
    let content = "";

    if (reportType === "summary") {
      const data = reportsDashboardData(params);
      content = toCsv([
        {
          totalDistributed: data.kpis.totalDistributed,
          totalBeneficiaries: data.kpis.totalBeneficiaries,
          totalPrograms: data.kpis.totalPrograms,
          completedDistributions: data.kpis.completedDistributions,
          failedDistributions: data.kpis.failedDistributions,
          pendingAmount: data.kpis.pendingAmount,
        },
      ]);
    }

    if (reportType === "organizations") {
      filename = "organization-report.csv";
      content = toCsv(organizationReportRows(params));
    }

    if (reportType === "programs") {
      filename = "program-report.csv";
      content = toCsv(programReportRows(params));
    }

    if (reportType === "beneficiaries") {
      filename = "beneficiary-report.csv";
      const data = beneficiaryReportData(params);
      content = toCsv(
        data.beneficiaryCoverageByState.map((item) => ({
          state: item.label,
          beneficiaryCount: item.value,
        })),
      );
    }

    if (reportType === "distributions") {
      filename = "distribution-report.csv";
      const data = distributionReportData(params);
      content = toCsv([
        {
          completedDistributions: data.standardMetrics.completedDistributions,
          failedDistributions: data.standardMetrics.failedDistributions,
          pendingDistributions: data.standardMetrics.pendingDistributions,
          pendingAmount: data.standardMetrics.pendingAmount,
          totalBulkJobs: data.bulkJobMetrics.totalBulkJobs,
          processingJobs: data.bulkJobMetrics.processingJobs,
          completedJobs: data.bulkJobMetrics.completedJobs,
          partiallyFailedJobs: data.bulkJobMetrics.partiallyFailedJobs,
          failedRecords: data.bulkJobMetrics.failedRecords,
          totalRecordsProcessed: data.bulkJobMetrics.totalRecordsProcessed,
        },
      ]);
    }

    return Promise.resolve({
      success: true,
      message: "CSV export generated successfully",
      data: { filename, content },
    });
  },
};
