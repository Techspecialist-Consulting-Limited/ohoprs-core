"use client";

export function ReportHeader({
  title,
  description,
  readOnly,
}: {
  title: string;
  description: string;
  readOnly?: boolean;
}) {
  return (
    <section className="rounded-[32px] border border-border bg-surface p-6 shadow-sm">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="flex flex-wrap items-center gap-3">
            {readOnly ? (
              <span className="rounded-full border border-border px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-muted">
                Read-only oversight view
              </span>
            ) : null}
          </div>
          <h1 className="mt-4 text-3xl font-semibold tracking-tight text-foreground">{title}</h1>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-muted">{description}</p>
        </div>
      </div>
    </section>
  );
}
