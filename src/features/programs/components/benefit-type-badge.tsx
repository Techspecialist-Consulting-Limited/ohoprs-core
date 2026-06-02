import type { BenefitType } from "@/types/program";
import { cn } from "@/lib/utils";

const toneMap: Record<BenefitType, string> = {
  CASH: "border-accent/20 bg-accent/10 text-accent",
  FOOD: "border-success/20 bg-success/10 text-success",
  MEDICAL: "border-warning/20 bg-warning/10 text-warning",
  EDUCATION: "border-border bg-surface-muted text-muted",
  AGRICULTURE: "border-success/20 bg-success/10 text-success",
  HOUSING: "border-warning/20 bg-warning/10 text-warning",
  EMERGENCY_RELIEF: "border-danger/20 bg-danger/10 text-danger",
  OTHER: "border-border bg-surface-muted text-muted",
};

export function BenefitTypeBadge({ benefitType }: { benefitType: BenefitType }) {
  return (
    <span className={cn("inline-flex rounded-full border px-2.5 py-1 text-xs font-semibold", toneMap[benefitType])}>
      {benefitType.replaceAll("_", " ")}
    </span>
  );
}
