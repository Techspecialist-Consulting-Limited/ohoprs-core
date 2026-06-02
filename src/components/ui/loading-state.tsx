export function LoadingState({
  lines = 3,
  title = "Loading data",
}: {
  lines?: number;
  title?: string;
}) {
  return (
    <div className="rounded-[28px] border border-border bg-surface p-6 shadow-sm">
      <div className="animate-pulse">
        <div className="h-5 w-36 rounded-full bg-surface-muted" />
        <p className="mt-2 text-sm text-muted">{title}</p>
        <div className="mt-6 space-y-3">
          {Array.from({ length: lines }).map((_, index) => (
            <div key={index} className="h-4 rounded-full bg-surface-muted" />
          ))}
        </div>
      </div>
    </div>
  );
}
