"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";

import { PermissionDeniedState } from "@/components/shared/permission-denied-state";
import { EmptyState } from "@/components/ui/empty-state";
import { LoadingState } from "@/components/ui/loading-state";
import { PageContainer } from "@/components/ui/page-container";
import { PageHeader } from "@/components/ui/page-header";
import { organizationsData } from "@/mock/organizations.mock";
import { settingsService } from "@/services/settings.service";
import { useAuthStore } from "@/store/auth.store";
import { ApprovalSettingsPanel } from "@/features/settings/components/approval-settings-panel";
import { IntegrationCards } from "@/features/settings/components/integration-cards";
import { NotificationSettingsPanel } from "@/features/settings/components/notification-settings-panel";
import { PaymentSettingsPanel } from "@/features/settings/components/payment-settings-panel";
import {
  OrganizationProfileSettingsForm,
  PlatformProfileSettingsForm,
} from "@/features/settings/components/profile-settings-form";
import { RolePermissionMatrix } from "@/features/settings/components/role-permission-matrix";
import { SecuritySettingsPanel } from "@/features/settings/components/security-settings-panel";
import { SettingsCardGrid } from "@/features/settings/components/settings-card-grid";
import { UserManagementTable } from "@/features/settings/components/user-management-table";

function deny(title: string, description: string) {
  return (
    <PageContainer>
      <PermissionDeniedState title={title} description={description} />
    </PageContainer>
  );
}

export function SettingsDashboardModule() {
  const role = useAuthStore((state) => state.role);
  const cardsQuery = useQuery({
    queryKey: ["settings-cards", role],
    queryFn: () => settingsService.getSettingsCards(role!),
  });

  if (cardsQuery.isLoading) {
    return <PageContainer><LoadingState title="Loading settings dashboard" lines={6} /></PageContainer>;
  }

  const cards = cardsQuery.data?.data ?? [];
  return (
    <PageContainer>
      <PageHeader title="Settings & Platform Administration" description="Administrative configuration for platform governance, organization settings, security, and future-ready integrations." />
      <SettingsCardGrid items={cards} />
    </PageContainer>
  );
}

export function SettingsProfileModule() {
  const role = useAuthStore((state) => state.role);
  const organizationId = useAuthStore((state) => state.organizationId);
  const user = useAuthStore((state) => state.user);
  const currentTenant = useAuthStore((state) => state.currentTenant);
  const profileQuery = useQuery({
    queryKey: ["settings-profile", role, organizationId],
    queryFn: () => settingsService.getProfileSettings(role!, organizationId),
    enabled: role === "SUPER_ADMIN" || role === "ORG_ADMIN",
  });

  if (!role || !user) {
    return deny("Profile settings unavailable", "Your current session could not load profile settings.");
  }

  if ((role === "SUPER_ADMIN" || role === "ORG_ADMIN") && profileQuery.isLoading) {
    return <PageContainer><LoadingState title="Loading profile settings" lines={5} /></PageContainer>;
  }

  const data = profileQuery.data?.data;
  if ((role === "SUPER_ADMIN" || role === "ORG_ADMIN") && !data) {
    return <PageContainer><EmptyState title="Profile settings unavailable" description="Profile settings could not be loaded." /></PageContainer>;
  }

  return (
    <PageContainer>
      <PageHeader title="Profile Settings" description={role === "SUPER_ADMIN" ? "Manage the platform profile and support configuration." : role === "ORG_ADMIN" ? "Manage your agency profile and contact details." : "Review your account profile and assigned access context."} />
      {role === "SUPER_ADMIN" ? (
        <PlatformProfileSettingsForm initialData={data as import("@/types/settings").PlatformProfileSettings} />
      ) : role === "ORG_ADMIN" ? (
        <OrganizationProfileSettingsForm organizationId={organizationId!} initialData={data as import("@/types/settings").OrganizationProfileSettings} />
      ) : (
        <section className="rounded-[28px] border border-border bg-surface p-6 shadow-sm">
          <div className="grid gap-5 md:grid-cols-2">
            <ReadOnlyField label="Full Name" value={user.name} />
            <ReadOnlyField label="Email" value={user.email} />
            <ReadOnlyField label="Role" value={user.role.replaceAll("_", " ")} />
            <ReadOnlyField label="Scope" value={user.organizationId ? "Agency User" : "System User"} />
            <ReadOnlyField label="Agency" value={user.organizationName ?? currentTenant?.name ?? "System-wide access"} />
            <ReadOnlyField label="Tenant" value={currentTenant?.name ?? "Central deployment"} />
          </div>
        </section>
      )}
    </PageContainer>
  );
}

export function SettingsUsersModule() {
  const role = useAuthStore((state) => state.role);
  const organizationId = useAuthStore((state) => state.organizationId);
  const queryClient = useQueryClient();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [selectedRole, setSelectedRole] = useState("PROGRAM_OFFICER");
  const [scope, setScope] = useState<"SYSTEM" | "AGENCY">("AGENCY");
  const [selectedOrganizationId, setSelectedOrganizationId] = useState(organizationId ?? "");
  const usersQuery = useQuery({
    queryKey: ["settings-users", role, organizationId],
    queryFn: () => settingsService.getUsers(role!, organizationId),
    enabled: role === "SUPER_ADMIN" || role === "ORG_ADMIN",
  });
  const rolesQuery = useQuery({
    queryKey: ["settings-roles"],
    queryFn: () => settingsService.getRoles(),
    enabled: role === "SUPER_ADMIN" || role === "ORG_ADMIN",
  });
  const createUserMutation = useMutation({
    mutationFn: () =>
      settingsService.createUser({
        name,
        email,
        role: selectedRole,
        scope,
        organizationId: scope === "AGENCY" ? selectedOrganizationId : undefined,
        organizationName:
          scope === "AGENCY"
            ? organizationsData.find((item) => item.id === selectedOrganizationId)?.name
            : undefined,
        status: "INVITED",
      }),
    onSuccess: (response) => {
      if (!response.success) {
        toast.error(response.message);
        return;
      }
      toast.success(response.message);
      setName("");
      setEmail("");
      void queryClient.invalidateQueries({ queryKey: ["settings-users"] });
    },
  });

  if (role === "PROGRAM_OFFICER" || role === "AUDITOR") {
    return deny("User management denied", "Your role cannot access user management settings.");
  }

  if (usersQuery.isLoading) {
    return <PageContainer><LoadingState title="Loading user settings" lines={6} /></PageContainer>;
  }

  return (
    <PageContainer>
      <PageHeader title="User Management" description="View platform or organization users, access roles, and invite status." />
      <UserManagementTable items={usersQuery.data?.data ?? []} canManage={role === "SUPER_ADMIN" || role === "ORG_ADMIN"}>
        {role === "SUPER_ADMIN" || role === "ORG_ADMIN" ? (
          <section className="rounded-[28px] border border-border bg-surface p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-foreground">Add User</h3>
            <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              <label className="block">
                <span className="mb-2 block text-sm font-medium text-foreground">Full Name</span>
                <input value={name} onChange={(event) => setName(event.target.value)} className={inputClassName} placeholder="Amina Bello" />
              </label>
              <label className="block">
                <span className="mb-2 block text-sm font-medium text-foreground">Email</span>
                <input value={email} onChange={(event) => setEmail(event.target.value)} className={inputClassName} placeholder="amina.bello@gov.ng" />
              </label>
              <label className="block">
                <span className="mb-2 block text-sm font-medium text-foreground">Role</span>
                <select value={selectedRole} onChange={(event) => setSelectedRole(event.target.value)} className={inputClassName}>
                  {(rolesQuery.data?.data ?? []).map((item) => (
                    <option key={item.id} value={item.name}>
                      {item.name.replaceAll("_", " ")}
                    </option>
                  ))}
                </select>
              </label>
              <label className="block">
                <span className="mb-2 block text-sm font-medium text-foreground">User Scope</span>
                <select value={scope} onChange={(event) => setScope(event.target.value as "SYSTEM" | "AGENCY")} className={inputClassName}>
                  <option value="AGENCY">Agency User</option>
                  <option value="SYSTEM">System User</option>
                </select>
              </label>
            </div>
            {scope === "AGENCY" ? (
              <div className="mt-4 max-w-sm">
                <label className="block">
                  <span className="mb-2 block text-sm font-medium text-foreground">Linked Agency</span>
                  <select value={selectedOrganizationId} onChange={(event) => setSelectedOrganizationId(event.target.value)} className={inputClassName}>
                    <option value="">Select agency</option>
                    {organizationsData.map((item) => (
                      <option key={item.id} value={item.id}>
                        {item.name}
                      </option>
                    ))}
                  </select>
                </label>
              </div>
            ) : null}
            <div className="mt-5 flex justify-end">
              <button
                type="button"
                onClick={() => createUserMutation.mutate()}
                disabled={createUserMutation.isPending}
                className="inline-flex h-11 items-center rounded-2xl bg-accent px-5 text-sm font-semibold text-accent-foreground disabled:opacity-60"
              >
                {createUserMutation.isPending ? "Saving..." : "Create User"}
              </button>
            </div>
          </section>
        ) : null}
      </UserManagementTable>
    </PageContainer>
  );
}

export function SettingsRolesModule() {
  const role = useAuthStore((state) => state.role);

  if (role !== "SUPER_ADMIN" && role !== "ORG_ADMIN") {
    return deny("Role settings denied", "Your role cannot access role and permission settings.");
  }

  return (
    <PageContainer>
      <PageHeader title="Roles & Permissions" description={role === "SUPER_ADMIN" ? "View all system roles, inspect permissions, and add custom roles for system or agency users." : "View agency roles, inspect permissions, and add custom roles for your agency scope."} />
      <RolePermissionMatrix />
    </PageContainer>
  );
}

function ReadOnlyField({ label, value }: { label: string; value?: string | null }) {
  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-soft">{label}</p>
      <div className="mt-2 rounded-2xl border border-border bg-background px-4 py-3 text-sm text-foreground">
        {value?.trim() ? value : "Not provided"}
      </div>
    </div>
  );
}

const inputClassName =
  "h-12 w-full rounded-2xl border border-border bg-background px-4 text-sm text-foreground outline-none transition focus:border-accent";

export function SettingsSecurityModule() {
  const role = useAuthStore((state) => state.role);
  const securityQuery = useQuery({
    queryKey: ["settings-security"],
    queryFn: () => settingsService.getSecuritySettings(),
    enabled: role === "SUPER_ADMIN" || role === "AUDITOR",
  });

  if (role === "PROGRAM_OFFICER" || role === "ORG_ADMIN") {
    return deny("Security settings denied", "Your role cannot access platform security settings.");
  }

  if (securityQuery.isLoading) {
    return <PageContainer><LoadingState title="Loading security settings" lines={5} /></PageContainer>;
  }

  return (
    <PageContainer>
      <PageHeader title="Security Settings" description="Security controls for MFA, password policy, session handling, IP restrictions, and audit retention." />
      <SecuritySettingsPanel initialData={securityQuery.data!.data} readOnly={role === "AUDITOR"} />
    </PageContainer>
  );
}

export function SettingsIntegrationsModule() {
  const role = useAuthStore((state) => state.role);
  const integrationsQuery = useQuery({
    queryKey: ["settings-integrations"],
    queryFn: () => settingsService.getIntegrationSettings(),
    enabled: role === "SUPER_ADMIN",
  });

  if (role !== "SUPER_ADMIN") {
    return deny("Integration settings denied", "Your role cannot access integration settings.");
  }

  if (integrationsQuery.isLoading) {
    return <PageContainer><LoadingState title="Loading integrations" lines={5} /></PageContainer>;
  }

  return (
    <PageContainer>
      <PageHeader title="Integrations" description="Future-ready provider configuration across payment, identity, communication, and storage categories." />
      <IntegrationCards items={integrationsQuery.data?.data ?? []} />
    </PageContainer>
  );
}

export function SettingsApprovalsModule() {
  const role = useAuthStore((state) => state.role);
  const approvalsQuery = useQuery({
    queryKey: ["settings-approvals"],
    queryFn: () => settingsService.getApprovalSettings(),
    enabled: role === "SUPER_ADMIN",
  });

  if (role !== "SUPER_ADMIN") {
    return deny("Approval settings denied", "Your role cannot access workflow approval settings.");
  }

  if (approvalsQuery.isLoading) {
    return <PageContainer><LoadingState title="Loading approval settings" lines={5} /></PageContainer>;
  }

  return (
    <PageContainer>
      <PageHeader title="Approval Workflows" description="Configure mock approval requirements for interventions, beneficiary uploads, distributions, and bulk payments." />
      <ApprovalSettingsPanel initialData={approvalsQuery.data!.data} />
    </PageContainer>
  );
}

export function SettingsPaymentsModule() {
  const role = useAuthStore((state) => state.role);
  const paymentsQuery = useQuery({
    queryKey: ["settings-payments"],
    queryFn: () => settingsService.getPaymentSettings(),
    enabled: role === "SUPER_ADMIN",
  });

  if (role !== "SUPER_ADMIN") {
    return deny("Payment settings denied", "Your role cannot access payment configuration settings.");
  }

  if (paymentsQuery.isLoading) {
    return <PageContainer><LoadingState title="Loading payment settings" lines={5} /></PageContainer>;
  }

  return (
    <PageContainer>
      <PageHeader title="Payments" description="Placeholder configuration for payment providers, batch limits, and reconciliation controls." />
      <PaymentSettingsPanel initialData={paymentsQuery.data!.data} />
    </PageContainer>
  );
}

export function SettingsNotificationsModule() {
  const role = useAuthStore((state) => state.role);
  const notificationsQuery = useQuery({
    queryKey: ["settings-notifications"],
    queryFn: () => settingsService.getNotificationSettings(),
    enabled: role === "SUPER_ADMIN" || role === "ORG_ADMIN",
  });

  if (role === "PROGRAM_OFFICER" || role === "AUDITOR") {
    return deny("Notification settings denied", "Your role cannot access notification settings.");
  }

  if (notificationsQuery.isLoading) {
    return <PageContainer><LoadingState title="Loading notification settings" lines={5} /></PageContainer>;
  }

  return (
    <PageContainer>
      <PageHeader title="Notification Settings" description="Configure platform-level communication channel settings and delivery behavior defaults." />
      <NotificationSettingsPanel initialData={notificationsQuery.data!.data} />
    </PageContainer>
  );
}
