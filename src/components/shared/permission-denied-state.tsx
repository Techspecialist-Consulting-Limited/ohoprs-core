import Link from "next/link";
import { LockKeyhole } from "lucide-react";

export function PermissionDeniedState({
  description = "Your current role does not have access to this area.",
  title = "Permission denied",
}: {
  description?: string;
  title?: string;
}) {
  return (
    <div className="rounded-[32px] border border-warning/20 bg-surface p-8 shadow-sm sm:p-10">
      <div className="mx-auto flex max-w-2xl flex-col items-center text-center">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-warning/12 text-warning">
          <LockKeyhole size={22} />
        </div>
        <h1 className="mt-5 text-3xl font-semibold tracking-tight text-foreground">{title}</h1>
        <p className="mt-3 text-sm leading-6 text-muted">{description}</p>
        <Link
          href="/dashboard"
          className="mt-6 inline-flex h-11 items-center justify-center rounded-2xl bg-accent px-5 text-sm font-semibold text-accent-foreground transition hover:opacity-95"
        >
          Return to dashboard
        </Link>
      </div>
    </div>
  );
}
