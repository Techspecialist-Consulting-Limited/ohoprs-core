"use client";

import { StatusBadge } from "@/components/ui/status-badge";
import type { AuditModule } from "@/types/audit";

const tones: Record<AuditModule, "neutral" | "success" | "warning"> = {
  AUTH: "neutral",
  ORGANIZATION: "neutral",
  PROGRAM: "success",
  BENEFICIARY: "success",
  DISTRIBUTION: "warning",
  BULK_DISTRIBUTION: "warning",
  REPORTS: "neutral",
  SETTINGS: "warning",
};

export function AuditModuleBadge({ module }: { module: AuditModule }) {
  return <StatusBadge tone={tones[module]} label={module.replaceAll("_", " ")} />;
}
