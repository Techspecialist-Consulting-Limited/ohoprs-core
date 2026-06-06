"use client";

import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ChevronDown, ChevronLeft, Plus } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";

import { permissions, type Permission } from "@/constants/permissions";
import { settingsService } from "@/services/settings.service";
import { useAuthStore } from "@/store/auth.store";

const permissionLabels: Record<Permission, string> = {
  create_organization: "Create Agencies",
  view_organizations: "View Agencies",
  create_program: "Create Interventions",
  edit_program: "Edit Interventions",
  approve_program: "Approve Interventions",
  change_program_status: "Change Intervention Status",
  view_programs: "View Interventions",
  create_beneficiaries: "Create Beneficiaries",
  edit_beneficiaries: "Edit Beneficiaries",
  upload_beneficiaries: "Upload Beneficiaries",
  view_beneficiaries: "View Beneficiaries",
  create_distribution: "Create Benefit Distributions",
  edit_distribution: "Edit Benefit Distributions",
  change_distribution_status: "Change Distribution Status",
  view_distributions: "View Benefit Distributions",
  reverse_payment: "Reverse Payments",
  view_reports: "View Reports",
  view_audit_logs: "View Audit Logs",
  manage_settings: "Manage Settings",
};

export function RolePermissionMatrix() {
  const role = useAuthStore((state) => state.role);
  const queryClient = useQueryClient();
  const [openRoleIds, setOpenRoleIds] = useState<string[]>([]);
  const [name, setName] = useState("");
  const [scope, setScope] = useState<"SYSTEM" | "AGENCY">("AGENCY");
  const [selectedPermissions, setSelectedPermissions] = useState<Permission[]>([]);

  const rolesQuery = useQuery({
    queryKey: ["settings-roles"],
    queryFn: () => settingsService.getRoles(),
  });

  const reservedPermissions = useMemo(() => settingsService.getReservedSuperAdminPermissions(), []);
  const availableCustomPermissions = permissions.filter((permission) => !reservedPermissions.includes(permission));

  const createRoleMutation = useMutation({
    mutationFn: () =>
      settingsService.createCustomRole({
        name,
        scope,
        permissions: selectedPermissions,
      }),
    onSuccess: (response) => {
      if (!response.success) {
        toast.error(response.message);
        return;
      }
      toast.success(response.message);
      setName("");
      setScope("AGENCY");
      setSelectedPermissions([]);
      void queryClient.invalidateQueries({ queryKey: ["settings-roles"] });
    },
  });

  const roles = rolesQuery.data?.data ?? [];

  function togglePermission(permission: Permission) {
    setSelectedPermissions((current) =>
      current.includes(permission) ? current.filter((item) => item !== permission) : [...current, permission],
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/settings" className="inline-flex h-10 items-center gap-2 rounded-2xl border border-border px-4 text-sm font-medium text-foreground">
          <ChevronLeft size={16} />
          Back to Settings
        </Link>
      </div>

      {role === "SUPER_ADMIN" ? (
        <section className="rounded-[28px] border border-border bg-surface p-6 shadow-sm">
          <div className="flex items-center gap-2">
            <Plus size={16} />
            <h3 className="text-lg font-semibold text-foreground">Add Custom Role</h3>
          </div>
          <div className="mt-5 grid gap-4 md:grid-cols-2">
            <label className="block">
              <span className="mb-2 block text-sm font-medium text-foreground">Role Name</span>
              <input value={name} onChange={(event) => setName(event.target.value)} className={inputClassName} placeholder="Agency Review Officer" />
            </label>
            <label className="block">
              <span className="mb-2 block text-sm font-medium text-foreground">Scope</span>
              <select value={scope} onChange={(event) => setScope(event.target.value as "SYSTEM" | "AGENCY")} className={inputClassName}>
                <option value="AGENCY">Agency</option>
                <option value="SYSTEM">System</option>
              </select>
            </label>
          </div>
          <div className="mt-5">
            <p className="text-sm font-medium text-foreground">Selectable Permissions</p>
            <div className="mt-3 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
              {availableCustomPermissions.map((permission) => (
                <label key={permission} className="flex items-start gap-3 rounded-2xl border border-border bg-surface-muted px-4 py-3 text-sm text-foreground">
                  <input type="checkbox" checked={selectedPermissions.includes(permission)} onChange={() => togglePermission(permission)} className="mt-1" />
                  <span>{permissionLabels[permission]}</span>
                </label>
              ))}
            </div>
          </div>
          <div className="mt-5 flex justify-end">
            <button
              type="button"
              onClick={() => createRoleMutation.mutate()}
              disabled={createRoleMutation.isPending}
              className="inline-flex h-11 items-center rounded-2xl bg-accent px-5 text-sm font-semibold text-accent-foreground disabled:opacity-60"
            >
              {createRoleMutation.isPending ? "Saving..." : "Create Custom Role"}
            </button>
          </div>
        </section>
      ) : null}

      <section className="space-y-4">
        {roles.map((item) => {
          const isOpen = openRoleIds.includes(item.id);
          return (
            <div key={item.id} className="overflow-hidden rounded-[28px] border border-border bg-surface shadow-sm">
              <button
                type="button"
                onClick={() =>
                  setOpenRoleIds((current) =>
                    current.includes(item.id) ? current.filter((id) => id !== item.id) : [...current, item.id],
                  )}
                className="flex w-full items-center justify-between px-6 py-5 text-left"
              >
                <div>
                  <p className="text-base font-semibold text-foreground">{item.name.replaceAll("_", " ")}</p>
                  <p className="mt-1 text-sm text-muted">
                    {item.isSystem ? "System Role" : "Custom Role"} • {item.scope} • {item.permissions.length} permissions
                  </p>
                </div>
                <ChevronDown size={18} className={isOpen ? "rotate-180 transition-transform" : "transition-transform"} />
              </button>

              {isOpen ? (
                <div className="border-t border-border px-6 py-5">
                  <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                    {item.permissions.map((permission) => (
                      <div key={permission} className="rounded-2xl border border-border bg-surface-muted px-4 py-3 text-sm text-foreground">
                        {permissionLabels[permission]}
                      </div>
                    ))}
                  </div>
                  {item.isSystem ? <p className="mt-4 text-sm text-muted">System role permissions are read-only.</p> : null}
                </div>
              ) : null}
            </div>
          );
        })}
      </section>
    </div>
  );
}

const inputClassName =
  "h-12 w-full rounded-2xl border border-border bg-background px-4 text-sm text-foreground outline-none transition focus:border-accent";
