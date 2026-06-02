"use client";

import { rolePermissions } from "@/constants/permissions";
import type { UserRole } from "@/types/auth";

const roles: UserRole[] = ["SUPER_ADMIN", "ORG_ADMIN", "PROGRAM_OFFICER", "AUDITOR"];
const permissions = Array.from(
  new Set(Object.values(rolePermissions).flat()),
);

export function RolePermissionMatrix() {
  return (
    <div className="overflow-hidden rounded-[28px] border border-border bg-surface shadow-sm">
      <div className="overflow-x-auto">
        <table className="min-w-full">
          <thead className="border-b border-border bg-surface-muted text-left text-xs font-semibold uppercase tracking-[0.16em] text-muted-soft">
            <tr>
              <th className="px-5 py-4">Permission</th>
              {roles.map((role) => (
                <th key={role} className="px-5 py-4">{role.replaceAll("_", " ")}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {permissions.map((permission) => (
              <tr key={permission} className="border-b border-border last:border-b-0">
                <td className="px-5 py-4 text-sm font-medium text-foreground">{permission}</td>
                {roles.map((role) => (
                  <td key={role} className="px-5 py-4 text-sm text-muted">
                    {rolePermissions[role].includes(permission) ? "Yes" : "No"}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
