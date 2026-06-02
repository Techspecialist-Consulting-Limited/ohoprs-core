"use client";

import { StatusBadge } from "@/components/ui/status-badge";
import type { DistributionMethod } from "@/types/distribution";

const tones: Record<DistributionMethod, "neutral" | "success" | "warning"> = {
  BANK_TRANSFER: "success",
  MOBILE_MONEY: "neutral",
  CASH: "warning",
  FOOD_PACKAGE: "neutral",
  MEDICAL_SUPPORT: "warning",
  EDUCATION_SUPPORT: "neutral",
  AGRICULTURE_SUPPORT: "success",
};

export function DistributionMethodBadge({ method }: { method: DistributionMethod }) {
  return <StatusBadge tone={tones[method]} label={method.replaceAll("_", " ")} />;
}
