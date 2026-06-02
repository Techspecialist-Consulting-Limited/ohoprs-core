import {
  approvalSettings,
  auditorSettingsCards,
  integrationSettingsData,
  notificationSettings,
  orgAdminSettingsCards,
  organizationProfileSettingsById,
  paymentSettings,
  platformProfileSettings,
  securitySettings,
  settingsUsersData,
  superAdminSettingsCards,
} from "@/mock/settings.mock";
import type { ApiResponse } from "@/types/api";
import type {
  ApprovalSettings,
  NotificationSettings,
  OrganizationProfileSettings,
  PaymentSettings,
  PlatformProfileSettings,
  SecuritySettings,
  SettingsCardItem,
  SettingsUser,
} from "@/types/settings";
import type { UserRole } from "@/types/auth";

export const settingsService = {
  async getSettingsCards(role: UserRole): Promise<ApiResponse<SettingsCardItem[]>> {
    const data =
      role === "SUPER_ADMIN"
        ? superAdminSettingsCards
        : role === "ORG_ADMIN"
          ? orgAdminSettingsCards
          : role === "AUDITOR"
            ? auditorSettingsCards
            : [];

    return Promise.resolve({
      success: true,
      message: "Settings cards fetched successfully",
      data,
    });
  },

  async getProfileSettings(
    role: UserRole,
    organizationId?: string | null,
  ): Promise<ApiResponse<PlatformProfileSettings | OrganizationProfileSettings | null>> {
    if (role === "SUPER_ADMIN") {
      return Promise.resolve({
        success: true,
        message: "Platform profile settings fetched successfully",
        data: platformProfileSettings,
      });
    }

    if (role === "ORG_ADMIN" && organizationId) {
      return Promise.resolve({
        success: true,
        message: "Organization profile settings fetched successfully",
        data: organizationProfileSettingsById[organizationId] ?? null,
      });
    }

    return Promise.resolve({
      success: false,
      message: "Profile settings unavailable",
      data: null,
    });
  },

  async updatePlatformProfile(payload: PlatformProfileSettings): Promise<ApiResponse<PlatformProfileSettings>> {
    Object.assign(platformProfileSettings, payload);
    return Promise.resolve({
      success: true,
      message: "Platform profile updated successfully",
      data: platformProfileSettings,
    });
  },

  async updateOrganizationProfile(
    organizationId: string,
    payload: OrganizationProfileSettings,
  ): Promise<ApiResponse<OrganizationProfileSettings>> {
    organizationProfileSettingsById[organizationId] = payload;
    return Promise.resolve({
      success: true,
      message: "Organization profile updated successfully",
      data: organizationProfileSettingsById[organizationId],
    });
  },

  async getUsers(role: UserRole, organizationId?: string | null): Promise<ApiResponse<SettingsUser[]>> {
    const data =
      role === "SUPER_ADMIN"
        ? settingsUsersData
        : settingsUsersData.filter((item) => item.organizationId === organizationId);

    return Promise.resolve({
      success: true,
      message: "Settings users fetched successfully",
      data,
    });
  },

  async getSecuritySettings(): Promise<ApiResponse<SecuritySettings>> {
    return Promise.resolve({
      success: true,
      message: "Security settings fetched successfully",
      data: securitySettings,
    });
  },

  async updateSecuritySettings(payload: SecuritySettings): Promise<ApiResponse<SecuritySettings>> {
    Object.assign(securitySettings, payload);
    return Promise.resolve({
      success: true,
      message: "Security settings updated successfully",
      data: securitySettings,
    });
  },

  async getIntegrationSettings() {
    return Promise.resolve({
      success: true,
      message: "Integration settings fetched successfully",
      data: integrationSettingsData,
    });
  },

  async getApprovalSettings(): Promise<ApiResponse<ApprovalSettings>> {
    return Promise.resolve({
      success: true,
      message: "Approval settings fetched successfully",
      data: approvalSettings,
    });
  },

  async updateApprovalSettings(payload: ApprovalSettings): Promise<ApiResponse<ApprovalSettings>> {
    Object.assign(approvalSettings, payload);
    return Promise.resolve({
      success: true,
      message: "Approval settings updated successfully",
      data: approvalSettings,
    });
  },

  async getPaymentSettings(): Promise<ApiResponse<PaymentSettings>> {
    return Promise.resolve({
      success: true,
      message: "Payment settings fetched successfully",
      data: paymentSettings,
    });
  },

  async updatePaymentSettings(payload: PaymentSettings): Promise<ApiResponse<PaymentSettings>> {
    Object.assign(paymentSettings, payload);
    return Promise.resolve({
      success: true,
      message: "Payment settings updated successfully",
      data: paymentSettings,
    });
  },

  async getNotificationSettings(): Promise<ApiResponse<NotificationSettings>> {
    return Promise.resolve({
      success: true,
      message: "Notification settings fetched successfully",
      data: notificationSettings,
    });
  },

  async updateNotificationSettings(payload: NotificationSettings): Promise<ApiResponse<NotificationSettings>> {
    Object.assign(notificationSettings, payload);
    return Promise.resolve({
      success: true,
      message: "Notification settings updated successfully",
      data: notificationSettings,
    });
  },
};
