import {
  notificationHistoryData,
  notificationItemsData,
  notificationsDashboardData,
  notificationTemplatesData,
} from "@/mock/notifications.mock";
import type { ApiResponse } from "@/types/api";
import type {
  NotificationDashboardData,
  NotificationExportResult,
  NotificationHistoryFilters,
  NotificationHistoryListResponse,
  NotificationItem,
  NotificationTemplate,
  NotificationTemplateFormValues,
} from "@/types/notification";
import type { UserRole } from "@/types/auth";

let notificationItemsStore = [...notificationItemsData];
let notificationTemplatesStore = [...notificationTemplatesData];

function toCsv<T extends object>(rows: T[]) {
  if (!rows.length) {
    return "No data\n";
  }

  const first = rows[0] as Record<string, unknown>;
  const headers = Object.keys(first);
  const lines = rows.map((row) => {
    const record = row as Record<string, unknown>;
    return headers.map((header) => JSON.stringify(record[header] ?? "")).join(",");
  });

  return `${headers.join(",")}\n${lines.join("\n")}`;
}

export const notificationService = {
  async getNotifications(context: { role: UserRole; organizationId?: string | null }): Promise<ApiResponse<NotificationDashboardData>> {
    if (context.role === "AUDITOR") {
      return Promise.resolve({
        success: true,
        message: "Notification dashboard fetched successfully",
        data: {
          ...notificationsDashboardData,
          recentNotifications: [],
        },
      });
    }

    const recentNotifications =
      context.role === "SUPER_ADMIN"
        ? notificationItemsStore
        : notificationItemsStore.filter((item) => item.organizationId === context.organizationId);

    return Promise.resolve({
      success: true,
      message: "Notification dashboard fetched successfully",
      data: {
        ...notificationsDashboardData,
        recentNotifications,
      },
    });
  },

  async getNotificationHistory(
    filters: NotificationHistoryFilters,
    context: { role: UserRole; organizationId?: string | null },
  ): Promise<ApiResponse<NotificationHistoryListResponse>> {
    const {
      page = 1,
      limit = 10,
      channel = "ALL",
      type = "ALL",
      status = "ALL",
      recipientSearch = "",
      scopeOrganizationId = null,
    } = filters;

    let filtered = [...notificationHistoryData];

    if (scopeOrganizationId) {
      filtered = filtered.filter((item) => item.organizationId === scopeOrganizationId);
    }

    if (channel !== "ALL") {
      filtered = filtered.filter((item) => item.channel === channel);
    }

    if (type !== "ALL") {
      filtered = filtered.filter((item) => item.type === type);
    }

    if (status !== "ALL") {
      filtered = filtered.filter((item) => item.status === status);
    }

    if (recipientSearch.trim()) {
      const term = recipientSearch.trim().toLowerCase();
      filtered = filtered.filter((item) => item.recipient.toLowerCase().includes(term));
    }

    if (context.role !== "SUPER_ADMIN" && context.role !== "AUDITOR") {
      filtered = filtered.filter((item) => item.organizationId === context.organizationId);
    }

    const total = filtered.length;
    const totalPages = Math.max(1, Math.ceil(total / limit));
    const safePage = Math.min(page, totalPages);

    return Promise.resolve({
      success: true,
      message: "Notification history fetched successfully",
      data: {
        items: filtered.slice((safePage - 1) * limit, safePage * limit),
        meta: {
          page: safePage,
          limit,
          total,
          totalPages,
        },
      },
    });
  },

  async getTemplates(context: { role: UserRole; organizationId?: string | null }): Promise<ApiResponse<NotificationTemplate[]>> {
    const data =
      context.role === "SUPER_ADMIN"
        ? notificationTemplatesStore
        : notificationTemplatesStore.filter((item) => item.scope === "ORGANIZATION" && item.organizationId === context.organizationId);

    return Promise.resolve({
      success: true,
      message: "Notification templates fetched successfully",
      data,
    });
  },

  async getTemplateById(
    id: string,
    context: { role: UserRole; organizationId?: string | null },
  ): Promise<ApiResponse<NotificationTemplate | null>> {
    const item = notificationTemplatesStore.find((entry) => entry.id === id) ?? null;

    if (!item) {
      return Promise.resolve({ success: false, message: "Template not found", data: null });
    }

    const canAccess =
      context.role === "SUPER_ADMIN" ||
      (item.scope === "ORGANIZATION" && item.organizationId === context.organizationId && context.role === "ORG_ADMIN");

    return Promise.resolve({
      success: canAccess,
      message: canAccess ? "Notification template fetched successfully" : "Template access denied",
      data: canAccess ? item : null,
    });
  },

  async createTemplate(
    payload: NotificationTemplateFormValues,
    context: { role: UserRole; organizationId?: string | null; organizationName?: string | null },
  ): Promise<ApiResponse<NotificationTemplate | null>> {
    const next: NotificationTemplate = {
      id: `template_${String(notificationTemplatesStore.length + 1).padStart(3, "0")}`,
      name: payload.name,
      channel: payload.channel,
      type: payload.type,
      scope: context.role === "SUPER_ADMIN" ? payload.scope : "ORGANIZATION",
      organizationId:
        context.role === "SUPER_ADMIN"
          ? payload.scope === "ORGANIZATION"
            ? payload.organizationId
            : undefined
          : context.organizationId ?? undefined,
      organizationName:
        context.role === "SUPER_ADMIN"
          ? payload.scope === "ORGANIZATION"
            ? payload.organizationId
              ? undefined
              : undefined
            : undefined
          : context.organizationName ?? undefined,
      subject: payload.subject,
      content: payload.content,
      isActive: payload.isActive,
      createdAt: new Date().toISOString(),
    };

    notificationTemplatesStore = [next, ...notificationTemplatesStore];

    return Promise.resolve({
      success: true,
      message: "Notification template created successfully",
      data: next,
    });
  },

  async markAsRead(id: string): Promise<ApiResponse<NotificationItem | null>> {
    let updated: NotificationItem | null = null;
    notificationItemsStore = notificationItemsStore.map((item) => {
      if (item.id !== id) return item;
      updated = { ...item, isRead: true };
      return updated;
    });

    return Promise.resolve({
      success: Boolean(updated),
      message: updated ? "Notification marked as read" : "Notification not found",
      data: updated,
    });
  },

  async exportHistoryCsv(
    filters: NotificationHistoryFilters,
    context: { role: UserRole; organizationId?: string | null },
  ): Promise<ApiResponse<NotificationExportResult>> {
    const response = await this.getNotificationHistory({ ...filters, page: 1, limit: 500 }, context);

    return Promise.resolve({
      success: true,
      message: "Notification history export generated successfully",
      data: {
        filename: "notification-history.csv",
        content: toCsv(
          response.data.items.map((item) => ({
            sentAt: item.sentAt,
            channel: item.channel,
            type: item.type,
            recipient: item.recipient,
            status: item.status,
            triggerSource: item.triggerSource,
            organizationName: item.organizationName ?? "",
          })),
        ),
      },
    });
  },
};
