import { ArrowRight } from "lucide-react";

export function EmptyState({
  description,
  title,
}: {
  description: string;
  title: string;
}) {
  return (
    <div className="rounded-[28px] border border-dashed border-border-strong bg-surface px-6 py-16 text-center shadow-sm">
      <div className="mx-auto flex max-w-2xl flex-col items-center">
        <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-accent/12 text-accent">
          <ArrowRight size={22} />
        </div>
        <h2 className="text-2xl font-semibold tracking-tight text-foreground">{title}</h2>
        <p className="mt-3 max-w-xl text-sm leading-6 text-muted">{description}</p>
      </div>
    </div>
  );
}
