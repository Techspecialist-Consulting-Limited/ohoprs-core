import type { UserRole } from "@/types/auth";

export interface SettingsUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  organizationId?: string;
  organizationName?: string;
  status: "ACTIVE" | "INVITED" | "SUSPENDED";
  lastLoginAt?: string;
}

export interface SecuritySettings {
  mfaRequired: boolean;
  passwordMinLength: number;
  passwordExpiryDays: number;
  sessionTimeoutMinutes: number;
  ipRestrictionsEnabled: boolean;
  auditRetentionDays: number;
}

export interface IntegrationSetting {
  id: string;
  name: string;
  description: string;
  status: "CONNECTED" | "NOT_CONNECTED" | "COMING_SOON";
  category: "PAYMENT" | "IDENTITY" | "COMMUNICATION" | "STORAGE";
}

export interface ApprovalSettings {
  programApprovalRequired: boolean;
  beneficiaryUploadApprovalRequired: boolean;
  distributionApprovalRequired: boolean;
  bulkPaymentApprovalRequired: boolean;
}

export interface PlatformProfileSettings {
  platformName: string;
  supportEmail: string;
  supportPhone: string;
  defaultLocale: string;
  timezone: string;
  platformDescription: string;
}

export interface OrganizationProfileSettings {
  organizationName: string;
  shortName: string;
  contactEmail: string;
  contactPhone: string;
  website: string;
  address: string;
  state: string;
  description: string;
}

export interface PaymentSettings {
  paymentProvider: string;
  bankTransferEnabled: boolean;
  mobileMoneyEnabled: boolean;
  batchProcessingLimit: number;
  reconciliationMode: string;
}

export interface NotificationSettings {
  emailEnabled: boolean;
  smsEnabled: boolean;
  whatsappEnabled: boolean;
  inAppEnabled: boolean;
  defaultSenderName: string;
  quietHours: string;
  failedRetryPolicy: string;
}

export interface SettingsCardItem {
  id: string;
  title: string;
  description: string;
  href: string;
}
