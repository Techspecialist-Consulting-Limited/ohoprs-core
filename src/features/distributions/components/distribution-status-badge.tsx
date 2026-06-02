"use client";

import { StatusBadge } from "@/components/ui/status-badge";
import type { DistributionStatus } from "@/types/distribution";

const tones: Record<DistributionStatus, "neutral" | "success" | "warning"> = {
  DRAFT: "neutral",
  SCHEDULED: "warning",
  PROCESSING: "neutral",
  COMPLETED: "success",
  FAILED: "warning",
  CANCELLED: "neutral",
};

export function DistributionStatusBadge({ status }: { status: DistributionStatus }) {
  return <StatusBadge tone={tones[status]} label={status.replaceAll("_", " ")} />;
}
