"use client";

import { useState, type ReactNode } from "react";
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
  const [selectedUser, setSelectedUser] = useState<SettingsUser | null>(null);

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
                        onClick={() => setSelectedUser(item)}
                        className="inline-flex h-9 items-center rounded-2xl border border-border px-3 text-sm font-medium text-foreground transition hover:border-accent hover:text-accent focus-visible:border-accent focus-visible:text-accent focus-visible:outline-none"
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

      {selectedUser ? (
        <section className="rounded-[28px] border border-border bg-surface p-6 shadow-sm">
          <div className="flex flex-col gap-4 border-b border-border pb-4 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-soft">User Details</p>
              <h3 className="mt-2 text-xl font-semibold text-foreground">{selectedUser.name}</h3>
              <p className="mt-1 text-sm text-muted">{selectedUser.email}</p>
            </div>
            <button
              type="button"
              onClick={() => setSelectedUser(null)}
              className="inline-flex h-10 items-center rounded-2xl border border-border px-4 text-sm font-medium text-foreground"
            >
              Close
            </button>
          </div>
          <div className="mt-5 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            <DetailField label="Role" value={selectedUser.role.replaceAll("_", " ")} />
            <DetailField label="Scope" value={selectedUser.scope === "AGENCY" ? "Agency User" : "System User"} />
            <DetailField label="Agency" value={selectedUser.organizationName ?? "System"} />
            <DetailField label="State of Origin" value={selectedUser.stateOfOrigin} />
            <DetailField label="LGA" value={selectedUser.lga} />
            <DetailField label="Disability" value={selectedUser.hasDisability ? "Yes" : "No"} />
            <DetailField label="Status" value={selectedUser.status} />
            <DetailField label="Last Login" value={selectedUser.lastLoginAt ? formatDateTime(selectedUser.lastLoginAt) : "Never"} />
            <DetailField label="Address" value={selectedUser.address} className="md:col-span-2 xl:col-span-3" />
          </div>
        </section>
      ) : null}
    </div>
  );
}

function DetailField({
  label,
  value,
  className,
}: {
  label: string;
  value: string;
  className?: string;
}) {
  return (
    <div className={className}>
      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-soft">{label}</p>
      <div className="mt-2 rounded-2xl border border-border bg-background px-4 py-3 text-sm text-foreground">
        {value.trim() ? value : "Not provided"}
      </div>
    </div>
  );
}
