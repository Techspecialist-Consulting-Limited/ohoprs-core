import { mockUsers } from "@/mock/auth.mock";
import { organizationsData } from "@/mock/organizations.mock";
import type {
  ApprovalSettings,
  IntegrationSetting,
  NotificationSettings,
  OrganizationProfileSettings,
  PaymentSettings,
  PlatformProfileSettings,
  SecuritySettings,
  SettingsCardItem,
  SettingsUser,
} from "@/types/settings";

export const settingsUsersData: SettingsUser[] = [
  ...mockUsers.map((user, index): SettingsUser => ({
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    organizationId: user.organizationId ?? undefined,
    organizationName: user.organizationName ?? undefined,
    status: index === 3 ? "INVITED" : "ACTIVE",
    lastLoginAt: index === 3 ? undefined : `2026-06-0${index + 1}T09:30:00Z`,
  })),
  {
    id: "user_005",
    name: "Fatima Yusuf",
    email: "fatima.yusuf@gov.ng",
    role: "PROGRAM_OFFICER",
    organizationId: "org_001",
    organizationName: organizationsData.find((item) => item.id === "org_001")?.name,
    status: "ACTIVE",
    lastLoginAt: "2026-06-02T10:40:00Z",
  },
  {
    id: "user_006",
    name: "Emeka Nwosu",
    email: "emeka.nwosu@gov.ng",
    role: "AUDITOR",
    status: "SUSPENDED",
    lastLoginAt: "2026-05-29T15:10:00Z",
  },
];

export const platformProfileSettings: PlatformProfileSettings = {
  platformName: "National Benefits Administration Platform",
  supportEmail: "support@nbap.gov.ng",
  supportPhone: "+2348001112233",
  defaultLocale: "en-NG",
  timezone: "Africa/Lagos",
  platformDescription: "Central platform for administering government benefit programs, distribution workflows, reporting, and compliance oversight.",
};

export const organizationProfileSettingsById: Record<string, OrganizationProfileSettings> = Object.fromEntries(
  organizationsData.map((organization) => [
    organization.id,
    {
      organizationName: organization.name,
      shortName: organization.shortName,
      contactEmail: organization.contactEmail,
      contactPhone: organization.contactPhone,
      website: organization.website ?? "",
      address: organization.address,
      state: organization.state,
      description: organization.description,
    },
  ]),
);

export const securitySettings: SecuritySettings = {
  mfaRequired: true,
  passwordMinLength: 12,
  passwordExpiryDays: 90,
  sessionTimeoutMinutes: 30,
  ipRestrictionsEnabled: false,
  auditRetentionDays: 365,
};

export const integrationSettingsData: IntegrationSetting[] = [
  {
    id: "integration_001",
    name: "Bank API",
    description: "Future settlement and payout provider connectivity.",
    status: "COMING_SOON",
    category: "PAYMENT",
  },
  {
    id: "integration_002",
    name: "NIBSS/BVN Verification",
    description: "Identity and bank verification placeholder.",
    status: "COMING_SOON",
    category: "IDENTITY",
  },
  {
    id: "integration_003",
    name: "NIN Verification",
    description: "National identity verification adapter placeholder.",
    status: "COMING_SOON",
    category: "IDENTITY",
  },
  {
    id: "integration_004",
    name: "SMS Gateway",
    description: "SMS delivery provider for beneficiary and admin messaging.",
    status: "CONNECTED",
    category: "COMMUNICATION",
  },
  {
    id: "integration_005",
    name: "Email Gateway",
    description: "Transactional email provider settings placeholder.",
    status: "CONNECTED",
    category: "COMMUNICATION",
  },
  {
    id: "integration_006",
    name: "WhatsApp Provider",
    description: "WhatsApp notification provider placeholder.",
    status: "COMING_SOON",
    category: "COMMUNICATION",
  },
  {
    id: "integration_007",
    name: "Cloud Storage",
    description: "Document and export storage configuration.",
    status: "CONNECTED",
    category: "STORAGE",
  },
];

export const approvalSettings: ApprovalSettings = {
  programApprovalRequired: true,
  beneficiaryUploadApprovalRequired: true,
  distributionApprovalRequired: true,
  bulkPaymentApprovalRequired: true,
};

export const paymentSettings: PaymentSettings = {
  paymentProvider: "Mock Treasury Settlement Gateway",
  bankTransferEnabled: true,
  mobileMoneyEnabled: true,
  batchProcessingLimit: 100000,
  reconciliationMode: "Daily automated reconciliation",
};

export const notificationSettings: NotificationSettings = {
  emailEnabled: true,
  smsEnabled: true,
  whatsappEnabled: false,
  inAppEnabled: true,
  defaultSenderName: "NBAP Communications",
  quietHours: "22:00 - 06:00 placeholder",
  failedRetryPolicy: "Retry twice within 30 minutes placeholder",
};

export const superAdminSettingsCards: SettingsCardItem[] = [
  { id: "profile", title: "Profile", description: "Platform profile and support contact settings.", href: "/settings/profile" },
  { id: "users", title: "Users", description: "User administration, invite status, and access controls.", href: "/settings/users" },
  { id: "roles", title: "Roles & Permissions", description: "Inspect RBAC roles and permission matrix.", href: "/settings/roles" },
  { id: "security", title: "Security", description: "MFA, password policy, sessions, IP restrictions, and audit retention.", href: "/settings/security" },
  { id: "integrations", title: "Integrations", description: "Provider connectivity for identity, payments, storage, and communications.", href: "/settings/integrations" },
  { id: "approvals", title: "Approvals", description: "Workflow controls for program, distribution, and bulk approvals.", href: "/settings/approvals" },
  { id: "payments", title: "Payments", description: "Payment provider configuration and reconciliation settings.", href: "/settings/payments" },
  { id: "notifications", title: "Notification Settings", description: "Channel availability and platform communication defaults.", href: "/settings/notifications" },
];

export const orgAdminSettingsCards: SettingsCardItem[] = [
  { id: "profile", title: "Organization Profile", description: "Manage organization identity, contact details, and address.", href: "/settings/profile" },
  { id: "users", title: "Users", description: "View and manage users within your organization.", href: "/settings/users" },
  { id: "notifications", title: "Notification Settings", description: "Organization-level communication defaults and channels.", href: "/settings/notifications" },
];

export const auditorSettingsCards: SettingsCardItem[] = [
  { id: "roles", title: "Roles & Permissions", description: "Read-only visibility into the platform RBAC structure.", href: "/settings/roles" },
  { id: "security", title: "Security", description: "Read-only summary of security policy and retention controls.", href: "/settings/security" },
  { id: "retention", title: "Audit Retention Summary", description: `Audit retention currently set to ${securitySettings.auditRetentionDays} days.`, href: "/settings/security" },
];
