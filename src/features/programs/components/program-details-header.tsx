import Link from "next/link";
import { Eye, Pencil } from "lucide-react";

import type { ProgramDetails } from "@/types/program";
import { BenefitTypeBadge } from "@/features/programs/components/benefit-type-badge";
import { ProgramStatusBadge } from "@/features/programs/components/program-status-badge";

export function ProgramDetailsHeader({
  canEdit,
  program,
  readOnly,
}: {
  canEdit: boolean;
  program: ProgramDetails;
  readOnly?: boolean;
}) {
  return (
    <div className="rounded-[32px] border border-border bg-surface p-6 shadow-sm sm:p-8">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-3xl font-semibold tracking-tight text-foreground">{program.name}</h1>
            <BenefitTypeBadge benefitType={program.benefitType} />
            <ProgramStatusBadge status={program.status} />
            {readOnly ? (
              <span className="inline-flex items-center gap-2 rounded-full border border-warning/20 bg-warning/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-warning">
                <Eye size={14} />
                Read-only oversight view
              </span>
            ) : null}
          </div>
          <p className="mt-3 text-sm text-muted">{program.description}</p>
        </div>

        {canEdit ? (
          <Link
            href={`/programs/${program.id}/edit`}
            className="inline-flex h-11 items-center gap-2 rounded-2xl bg-accent px-4 text-sm font-semibold text-accent-foreground"
          >
            <Pencil size={16} />
            Edit Program
          </Link>
        ) : null}
      </div>
    </div>
  );
}
