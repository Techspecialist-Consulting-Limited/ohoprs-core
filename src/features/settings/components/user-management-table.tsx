"use client";

import type { ReactNode } from "react";
import { toast } from "sonner";
import { ChevronLeft } from "lucide-react";
import Link from "next/link";

import { formatDateTime } from "@/lib/formatters";
import type { SettingsUser } from "@/types/settings";

export function UserManagementTable({
  items,
  canManage,
  children,
}: {
  items: SettingsUser[];
  canManage: boolean;
  children?: ReactNode;
}) {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/settings" className="inline-flex h-10 items-center gap-2 rounded-2xl border border-border px-4 text-sm font-medium text-foreground">
          <ChevronLeft size={16} />
          Back to Settings
        </Link>
      </div>

      {children}

      <div className="overflow-hidden rounded-[28px] border border-border bg-surface shadow-sm">
      <div className="overflow-x-auto">
        <table className="min-w-full">
          <thead className="border-b border-border bg-surface-muted text-left text-xs font-semibold uppercase tracking-[0.16em] text-muted-soft">
            <tr>
              {["Name", "Email", "Role", "Scope", "Agency", "Status", "Last Login", "Actions"].map((label) => (
                <th key={label} className="px-5 py-4">{label}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {items.map((item) => (
              <tr key={item.id} className="border-b border-border last:border-b-0">
                <td className="px-5 py-4 text-sm font-medium text-foreground">{item.name}</td>
                <td className="px-5 py-4 text-sm text-muted">{item.email}</td>
                <td className="px-5 py-4 text-sm text-muted">{item.role.replaceAll("_", " ")}</td>
                <td className="px-5 py-4 text-sm text-muted">{item.scope}</td>
                <td className="px-5 py-4 text-sm text-muted">{item.organizationName ?? "System"}</td>
                <td className="px-5 py-4 text-sm text-foreground">{item.status}</td>
                <td className="px-5 py-4 text-sm text-muted">{item.lastLoginAt ? formatDateTime(item.lastLoginAt) : "Never"}</td>
                <td className="px-5 py-4">
                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => toast.success(`Viewing ${item.name}`)}
                      className="inline-flex h-9 items-center rounded-2xl border border-border px-3 text-sm font-medium text-foreground"
                    >
                      View
                    </button>
                    {canManage ? (
                      <>
                        <button
                          type="button"
                          onClick={() => toast.success(`Suspend action queued for ${item.name}`)}
                          className="inline-flex h-9 items-center rounded-2xl border border-border px-3 text-sm font-medium text-foreground"
                        >
                          Suspend
                        </button>
                        <button
                          type="button"
                          onClick={() => toast.success(`Invite resent to ${item.email}`)}
                          className="inline-flex h-9 items-center rounded-2xl border border-border px-3 text-sm font-medium text-foreground"
                        >
                          Resend Invite
                        </button>
                      </>
                    ) : null}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
    </div>
  );
}
