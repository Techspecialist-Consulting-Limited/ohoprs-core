import type { ReportDatePreset } from "@/types/report";

export type AuditModule =
  | "AUTH"
  | "ORGANIZATION"
  | "PROGRAM"
  | "BENEFICIARY"
  | "DISTRIBUTION"
  | "BULK_DISTRIBUTION"
  | "REPORTS"
  | "SETTINGS";

export type AuditAction =
  | "LOGIN"
  | "LOGOUT"
  | "CREATE"
  | "UPDATE"
  | "DELETE"
  | "VIEW"
  | "EXPORT"
  | "APPROVE"
  | "CANCEL"
  | "VERIFY";

export type AuditResult =
  | "SUCCESS"
  | "FAILED"
  | "WARNING";

export interface AuditLog {
  id: string;
  timestamp: string;
  userId: string;
  userName: string;
  userEmail?: string;
  role: string;
  organizationId?: string;
  organizationName?: string;
  module: AuditModule;
  action: AuditAction;
  resourceId?: string;
  resourceName?: string;
  result: AuditResult;
  ipAddress: string;
  description: string;
}

export interface AuditTimelineItem {
  id: string;
  label: string;
  timestamp: string;
}

export interface RelatedAuditRecord {
  id: string;
  type: string;
  name: string;
}

export interface AuditLogDetails extends AuditLog {
  metadata: Record<string, unknown>;
  relatedRecords: RelatedAuditRecord[];
  timeline: AuditTimelineItem[];
}

export interface AuditLogListMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface AuditLogListResponse {
  items: AuditLog[];
  meta: AuditLogListMeta;
}

export interface AuditFiltersState {
  search?: string;
  datePreset: ReportDatePreset;
  startDate?: string;
  endDate?: string;
  organizationId?: string;
  module?: AuditModule | "ALL";
  result?: AuditResult | "ALL";
  userQuery?: string;
  page?: number;
  limit?: number;
  scopeOrganizationId?: string | null;
}

export interface AuditExportResult {
  filename: string;
  content: string;
}
