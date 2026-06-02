"use client";

import { StatusBadge } from "@/components/ui/status-badge";
import type { NotificationStatus } from "@/types/notification";

const tones: Record<NotificationStatus, "neutral" | "success" | "warning"> = {
  SENT: "neutral",
  DELIVERED: "success",
  FAILED: "warning",
  PENDING: "warning",
};

export function NotificationStatusBadge({ status }: { status: NotificationStatus }) {
  return <StatusBadge tone={tones[status]} label={status} />;
}
