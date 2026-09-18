import type { JourneyStage } from "@/types/household";
import { cn } from "@/lib/utils";

const stageMap: Record<JourneyStage, string> = {
  SOCIAL_REGISTER: "border-border bg-surface-muted text-muted",
  BENEFICIARY_REGISTER: "border-accent/30 bg-accent/10 text-accent",
  GRADUATED: "border-success/20 bg-success/10 text-success",
  TRANSITIONED: "border-warning/20 bg-warning/10 text-warning",
};

export const journeyStageLabels: Record<JourneyStage, string> = {
  SOCIAL_REGISTER: "Social Register",
  BENEFICIARY_REGISTER: "Beneficiary Register",
  GRADUATED: "Graduated",
  TRANSITIONED: "Transitioned",
};

export function HouseholdJourneyStageBadge({ stage }: { stage: JourneyStage }) {
  return (
    <span className={cn("inline-flex rounded-full border px-2.5 py-1 text-xs font-semibold", stageMap[stage])}>
      {journeyStageLabels[stage]}
    </span>
  );
}
