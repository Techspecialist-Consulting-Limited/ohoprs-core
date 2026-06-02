"use client";

import type { BeneficiarySegment } from "@/types/bulk-distribution";

const segmentDescriptions: Record<BeneficiarySegment, string> = {
  ALL_VERIFIED: "All verified beneficiaries in the selected program scope.",
  SELECTED_STATE: "Only beneficiaries from a selected state.",
  PROGRAM_ENROLLED: "Beneficiaries already enrolled in the selected program.",
  PENDING_UNPAID: "Eligible beneficiaries with unpaid delivery records.",
  CUSTOM_UPLOAD: "Custom uploaded list for targeted operations.",
};

export function BeneficiarySegmentSelector({
  value,
  onChange,
}: {
  value: BeneficiarySegment;
  onChange: (value: BeneficiarySegment) => void;
}) {
  return (
    <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
      {Object.entries(segmentDescriptions).map(([segment, description]) => {
        const active = segment === value;

        return (
          <button
            key={segment}
            type="button"
            onClick={() => onChange(segment as BeneficiarySegment)}
            className={`rounded-3xl border px-4 py-4 text-left transition ${
              active ? "border-accent bg-accent/10" : "border-border bg-surface-muted hover:border-accent/40"
            }`}
          >
            <p className="text-sm font-semibold text-foreground">{segment.replaceAll("_", " ")}</p>
            <p className="mt-2 text-sm text-muted">{description}</p>
          </button>
        );
      })}
    </div>
  );
}
