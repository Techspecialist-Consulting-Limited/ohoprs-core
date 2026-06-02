"use client";

import { StatusBadge } from "@/components/ui/status-badge";
import type { AuditResult } from "@/types/audit";

const tones: Record<AuditResult, "neutral" | "success" | "warning"> = {
  SUCCESS: "success",
  FAILED: "warning",
  WARNING: "warning",
};

export function AuditResultBadge({ result }: { result: AuditResult }) {
  return <StatusBadge tone={tones[result]} label={result} />;
}
