import { auditLogsData } from "@/mock/audit.mock";
import type { ApiResponse } from "@/types/api";
import type {
  AuditExportResult,
  AuditFiltersState,
  AuditLog,
  AuditLogDetails,
  AuditLogListResponse,
} from "@/types/audit";
import type { UserRole } from "@/types/auth";

function canSeeModule(role: UserRole, module: AuditLog["module"]) {
  if (role === "PROGRAM_OFFICER") {
    return ["PROGRAM", "BENEFICIARY", "DISTRIBUTION", "BULK_DISTRIBUTION"].includes(module);
  }

  return true;
}

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

export const auditService = {
  async getAuditLogs(
    filters: AuditFiltersState,
    context: { role: UserRole; organizationId?: string | null },
  ): Promise<ApiResponse<AuditLogListResponse>> {
    const {
      search = "",
      organizationId = "ALL",
      module = "ALL",
      result = "ALL",
      userQuery = "",
      page = 1,
      limit = 10,
      scopeOrganizationId = null,
    } = filters;

    let filtered = [...auditLogsData];

    if (scopeOrganizationId) {
      filtered = filtered.filter((item) => item.organizationId === scopeOrganizationId);
    }

    if (organizationId !== "ALL") {
      filtered = filtered.filter((item) => item.organizationId === organizationId);
    }

    if (module !== "ALL") {
      filtered = filtered.filter((item) => item.module === module);
    }

    if (result !== "ALL") {
      filtered = filtered.filter((item) => item.result === result);
    }

    if (search.trim()) {
      const term = search.trim().toLowerCase();
      filtered = filtered.filter(
        (item) =>
          item.description.toLowerCase().includes(term) ||
          item.resourceName?.toLowerCase().includes(term) ||
          item.module.toLowerCase().includes(term),
      );
    }

    if (userQuery.trim()) {
      const term = userQuery.trim().toLowerCase();
      filtered = filtered.filter(
        (item) =>
          item.userName.toLowerCase().includes(term) ||
          item.role.toLowerCase().includes(term) ||
          item.userEmail?.toLowerCase().includes(term),
      );
    }

    filtered = filtered.filter((item) => {
      if (context.role === "SUPER_ADMIN" || context.role === "AUDITOR") {
        return true;
      }

      if (item.organizationId !== context.organizationId) {
        return false;
      }

      return canSeeModule(context.role, item.module);
    });

    const total = filtered.length;
    const totalPages = Math.max(1, Math.ceil(total / limit));
    const safePage = Math.min(page, totalPages);
    const items = filtered
      .slice((safePage - 1) * limit, safePage * limit)
      .map<AuditLog>((item) => ({ ...item }));

    return Promise.resolve({
      success: true,
      message: "Audit logs fetched successfully",
      data: {
        items,
        meta: {
          page: safePage,
          limit,
          total,
          totalPages,
        },
      },
    });
  },

  async getAuditLogById(
    id: string,
    context: { role: UserRole; organizationId?: string | null },
  ): Promise<ApiResponse<AuditLogDetails | null>> {
    const item = auditLogsData.find((entry) => entry.id === id) ?? null;

    if (!item) {
      return Promise.resolve({
        success: false,
        message: "Audit log not found",
        data: null,
      });
    }

    const canAccess =
      context.role === "SUPER_ADMIN" ||
      context.role === "AUDITOR" ||
      (item.organizationId === context.organizationId && canSeeModule(context.role, item.module));

    return Promise.resolve({
      success: canAccess,
      message: canAccess ? "Audit log fetched successfully" : "Audit log access denied",
      data: canAccess ? item : null,
    });
  },

  async exportAuditLogs(
    filters: AuditFiltersState,
    context: { role: UserRole; organizationId?: string | null },
  ): Promise<ApiResponse<AuditExportResult>> {
    const response = await this.getAuditLogs({ ...filters, page: 1, limit: 500 }, context);
    const content = toCsv(
      response.data.items.map((item) => ({
        timestamp: item.timestamp,
        userName: item.userName,
        role: item.role,
        organizationName: item.organizationName ?? "",
        module: item.module,
        action: item.action,
        resourceName: item.resourceName ?? "",
        result: item.result,
        ipAddress: item.ipAddress,
        description: item.description,
      })),
    );

    return Promise.resolve({
      success: true,
      message: "Audit CSV export generated successfully",
      data: {
        filename: "audit-logs.csv",
        content,
      },
    });
  },
};
