export function PageHeader({
  description,
  eyebrow,
  title,
}: {
  description: string;
  eyebrow?: string;
  title: string;
}) {
  return (
    <div className="flex flex-col gap-3">
      {eyebrow ? (
        <span className="text-xs font-semibold uppercase tracking-[0.24em] text-accent">
          {eyebrow}
        </span>
      ) : null}
      <div>
        <h1 className="text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">{title}</h1>
        <p className="mt-2 max-w-3xl text-sm leading-6 text-muted sm:text-base">{description}</p>
      </div>
    </div>
  );
}
