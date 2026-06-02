import { organizationsData } from "@/mock/organizations.mock";
import type {
  NotificationDashboardData,
  NotificationHistory,
  NotificationItem,
  NotificationTemplate,
  NotificationType,
  NotificationChannel,
  NotificationStatus,
} from "@/types/notification";

const org1 = organizationsData.find((item) => item.id === "org_001");
const org2 = organizationsData.find((item) => item.id === "org_002");

export const templateVariables = [
  "{{beneficiaryName}}",
  "{{programName}}",
  "{{organizationName}}",
  "{{amount}}",
  "{{distributionName}}",
  "{{date}}",
];

function createTemplate(index: number): NotificationTemplate {
  const channels: NotificationChannel[] = ["EMAIL", "SMS", "IN_APP", "WHATSAPP"];
  const types: NotificationType[] = [
    "BENEFICIARY_CREATED",
    "BENEFICIARY_VERIFIED",
    "DISTRIBUTION_CREATED",
    "DISTRIBUTION_COMPLETED",
    "BULK_JOB_COMPLETED",
    "BULK_JOB_FAILED",
    "SYSTEM_ALERT",
  ];
  const channel = channels[index % channels.length];
  const type = types[index % types.length];
  const isGlobal = index % 3 === 0;
  const organization = index % 2 === 0 ? org1 : org2;

  return {
    id: `template_${String(index + 1).padStart(3, "0")}`,
    name: `${type.replaceAll("_", " ")} ${channel} Template`,
    channel,
    type,
    scope: isGlobal ? "GLOBAL" : "ORGANIZATION",
    organizationId: isGlobal ? undefined : organization?.id,
    organizationName: isGlobal ? undefined : organization?.name,
    subject: channel === "EMAIL" ? `${type.replaceAll("_", " ")} Notification` : undefined,
    content: `Hello {{beneficiaryName}}, update regarding {{programName}} at {{organizationName}} on {{date}}.`,
    isActive: index % 5 !== 0,
    createdAt: new Date(Date.UTC(2026, 4, (index % 28) + 1, 10, 0, 0)).toISOString(),
  };
}

export const notificationTemplatesData: NotificationTemplate[] = Array.from({ length: 18 }, (_, index) =>
  createTemplate(index),
);

function createHistory(index: number): NotificationHistory {
  const channels: NotificationChannel[] = ["EMAIL", "SMS", "IN_APP", "WHATSAPP"];
  const types: NotificationType[] = [
    "BENEFICIARY_CREATED",
    "BENEFICIARY_VERIFIED",
    "DISTRIBUTION_CREATED",
    "DISTRIBUTION_COMPLETED",
    "BULK_JOB_COMPLETED",
    "BULK_JOB_FAILED",
    "SYSTEM_ALERT",
  ];
  const statuses: NotificationStatus[] = ["SENT", "DELIVERED", "FAILED", "PENDING"];
  const organization = index % 2 === 0 ? org1 : org2;
  const type = types[index % types.length];

  return {
    id: `history_${String(index + 1).padStart(3, "0")}`,
    channel: channels[index % channels.length],
    type,
    recipient: index % 3 === 0 ? `080${String(10000000 + index).slice(0, 8)}` : `user${index + 1}@example.ng`,
    status: statuses[index % statuses.length],
    triggerSource:
      type === "BULK_JOB_COMPLETED"
        ? "Youth Grant Bulk Job"
        : type === "BULK_JOB_FAILED"
          ? "Bulk Processing Exception"
          : type === "DISTRIBUTION_COMPLETED"
            ? "June Youth Grant Batch"
            : type === "SYSTEM_ALERT"
              ? "Notification Engine"
              : "Beneficiary Workflow",
    sentAt: new Date(Date.UTC(2026, 5, (index % 28) + 1, 8 + (index % 10), 10 + (index % 40), 0)).toISOString(),
    organizationId: organization?.id,
    organizationName: organization?.name,
  };
}

export const notificationHistoryData: NotificationHistory[] = Array.from({ length: 120 }, (_, index) =>
  createHistory(index),
);

export const notificationItemsData: NotificationItem[] = [
  {
    id: "notif_001",
    title: "Bulk Job Completed",
    description: "The June Youth Grant enterprise bulk job completed successfully.",
    type: "BULK_JOB_COMPLETED",
    isRead: false,
    createdAt: "2026-06-03T09:30:00Z",
    organizationId: org1?.id,
    organizationName: org1?.name,
  },
  {
    id: "notif_002",
    title: "Distribution Completed",
    description: "June Youth Grant Batch reached completed delivery status.",
    type: "DISTRIBUTION_COMPLETED",
    isRead: false,
    createdAt: "2026-06-03T08:10:00Z",
    organizationId: org1?.id,
    organizationName: org1?.name,
  },
  {
    id: "notif_003",
    title: "Beneficiary Verified",
    description: "A beneficiary verification batch finished with 95% successful checks.",
    type: "BENEFICIARY_VERIFIED",
    isRead: true,
    createdAt: "2026-06-02T16:20:00Z",
    organizationId: org1?.id,
    organizationName: org1?.name,
  },
  {
    id: "notif_004",
    title: "Bulk Job Failed",
    description: "A bulk distribution job recorded partial failures and requires review.",
    type: "BULK_JOB_FAILED",
    isRead: false,
    createdAt: "2026-06-02T13:10:00Z",
    organizationId: org2?.id,
    organizationName: org2?.name,
  },
  {
    id: "notif_005",
    title: "System Alert",
    description: "Mock notification engine latency warning observed in the delivery queue.",
    type: "SYSTEM_ALERT",
    isRead: true,
    createdAt: "2026-06-02T11:15:00Z",
  },
];

export const notificationsDashboardData: NotificationDashboardData = {
  unreadCount: 14,
  readCount: 38,
  failedNotifications: 9,
  activeTemplates: notificationTemplatesData.filter((item) => item.isActive).length,
  messagesSentToday: 126,
  deliverySuccessRate: 93,
  recentNotifications: notificationItemsData,
  activityChart: [
    { label: "Mon", value: 88 },
    { label: "Tue", value: 104 },
    { label: "Wed", value: 126 },
    { label: "Thu", value: 118 },
    { label: "Fri", value: 132 },
    { label: "Sat", value: 92 },
    { label: "Sun", value: 67 },
  ],
  deliveryBreakdown: [
    { label: "Delivered", value: 73 },
    { label: "Sent", value: 19 },
    { label: "Pending", value: 5 },
    { label: "Failed", value: 3 },
  ],
};
