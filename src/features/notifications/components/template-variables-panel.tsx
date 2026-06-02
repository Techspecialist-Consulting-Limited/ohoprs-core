"use client";

export function TemplateVariablesPanel({ variables }: { variables: string[] }) {
  return (
    <section className="rounded-[28px] border border-border bg-surface p-6 shadow-sm">
      <p className="text-lg font-semibold text-foreground">Supported variables</p>
      <p className="mt-1 text-sm text-muted">Reusable placeholders available in mock communication templates.</p>
      <div className="mt-5 flex flex-wrap gap-3">
        {variables.map((variable) => (
          <span key={variable} className="rounded-full border border-border bg-surface-muted px-3 py-2 text-sm text-foreground">
            {variable}
          </span>
        ))}
      </div>
    </section>
  );
}
