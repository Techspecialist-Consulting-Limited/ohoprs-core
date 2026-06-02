import type { ReportDatePreset } from "@/types/report";

export type NotificationChannel =
  | "EMAIL"
  | "SMS"
  | "IN_APP"
  | "WHATSAPP";

export type NotificationStatus =
  | "SENT"
  | "DELIVERED"
  | "FAILED"
  | "PENDING";

export type NotificationType =
  | "BENEFICIARY_CREATED"
  | "BENEFICIARY_VERIFIED"
  | "DISTRIBUTION_CREATED"
  | "DISTRIBUTION_COMPLETED"
  | "BULK_JOB_COMPLETED"
  | "BULK_JOB_FAILED"
  | "SYSTEM_ALERT";

export type NotificationTemplateScope =
  | "GLOBAL"
  | "ORGANIZATION";

export interface NotificationTemplate {
  id: string;
  name: string;
  channel: NotificationChannel;
  type: NotificationType;
  scope: NotificationTemplateScope;
  organizationId?: string;
  organizationName?: string;
  subject?: string;
  content: string;
  isActive: boolean;
  createdAt: string;
}

export interface NotificationHistory {
  id: string;
  channel: NotificationChannel;
  type: NotificationType;
  recipient: string;
  status: NotificationStatus;
  triggerSource: string;
  sentAt: string;
  organizationId?: string;
  organizationName?: string;
}

export interface NotificationItem {
  id: string;
  title: string;
  description: string;
  type: NotificationType;
  isRead: boolean;
  createdAt: string;
  organizationId?: string;
  organizationName?: string;
}

export interface NotificationDashboardData {
  unreadCount: number;
  readCount: number;
  failedNotifications: number;
  activeTemplates: number;
  messagesSentToday: number;
  deliverySuccessRate: number;
  recentNotifications: NotificationItem[];
  activityChart: { label: string; value: number }[];
  deliveryBreakdown: { label: string; value: number }[];
}

export interface NotificationHistoryFilters {
  datePreset: ReportDatePreset;
  startDate?: string;
  endDate?: string;
  channel?: NotificationChannel | "ALL";
  type?: NotificationType | "ALL";
  status?: NotificationStatus | "ALL";
  recipientSearch?: string;
  scopeOrganizationId?: string | null;
  page?: number;
  limit?: number;
}

export interface NotificationHistoryListResponse {
  items: NotificationHistory[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface NotificationTemplateFormValues {
  name: string;
  scope: NotificationTemplateScope;
  organizationId?: string;
  channel: NotificationChannel;
  type: NotificationType;
  subject?: string;
  content: string;
  isActive: boolean;
}

export interface NotificationExportResult {
  filename: string;
  content: string;
}
