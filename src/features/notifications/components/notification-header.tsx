"use client";

export function NotificationHeader({
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
      <div className="flex flex-wrap items-center gap-3">
        
      </div>
      <h1 className="mt-4 text-3xl font-semibold tracking-tight text-foreground">{title}</h1>
      <p className="mt-2 max-w-3xl text-sm leading-6 text-muted">{description}</p>
    </section>
  );
}
