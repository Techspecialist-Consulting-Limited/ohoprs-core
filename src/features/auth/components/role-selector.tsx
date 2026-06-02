"use client";

import { userRoles } from "@/features/auth/schemas/auth.schema";
import { cn } from "@/lib/utils";
import type { UserRole } from "@/types/auth";

const roleLabels: Record<UserRole, string> = {
  SUPER_ADMIN: "Super Admin",
  ORG_ADMIN: "Organization Admin",
  PROGRAM_OFFICER: "Program Officer",
  AUDITOR: "Auditor",
};

export function RoleSelector({
  onChange,
  value,
}: {
  onChange: (role: UserRole) => void;
  value: UserRole;
}) {
  return (
    <div className="grid gap-2 sm:grid-cols-2">
      {userRoles.map((role) => (
        <button
          key={role}
          type="button"
          className={cn(
            "rounded-2xl border px-4 py-3 text-left transition",
            value === role
              ? "border-accent bg-accent/8 text-foreground"
              : "border-border bg-surface text-muted hover:border-border-strong hover:text-foreground",
          )}
          onClick={() => onChange(role)}
        >
          <p className="text-sm font-semibold">{roleLabels[role]}</p>
          <p className="mt-1 text-xs text-muted">{role.replaceAll("_", " ")}</p>
        </button>
      ))}
    </div>
  );
}
