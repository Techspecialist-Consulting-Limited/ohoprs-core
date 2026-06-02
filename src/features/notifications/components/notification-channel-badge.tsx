"use client";

import { StatusBadge } from "@/components/ui/status-badge";
import type { NotificationChannel } from "@/types/notification";

const tones: Record<NotificationChannel, "neutral" | "success" | "warning"> = {
  EMAIL: "neutral",
  SMS: "success",
  IN_APP: "neutral",
  WHATSAPP: "warning",
};

export function NotificationChannelBadge({ channel }: { channel: NotificationChannel }) {
  return <StatusBadge tone={tones[channel]} label={channel.replaceAll("_", " ")} />;
}
