"use client";

import { StatusBadge } from "@/components/ui/status-badge";
import type { BulkJobStatus } from "@/types/bulk-distribution";

const tones: Record<BulkJobStatus, "neutral" | "success" | "warning"> = {
  QUEUED: "neutral",
  PROCESSING: "warning",
  COMPLETED: "success",
  PARTIALLY_FAILED: "warning",
  FAILED: "warning",
  CANCELLED: "neutral",
};

export function BulkJobStatusBadge({ status }: { status: BulkJobStatus }) {
  return <StatusBadge tone={tones[status]} label={status.replaceAll("_", " ")} />;
}
