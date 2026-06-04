"use client";

import { useQuery } from "@tanstack/react-query";

import { PermissionDeniedState } from "@/components/shared/permission-denied-state";
import { EmptyState } from "@/components/ui/empty-state";
import { LoadingState } from "@/components/ui/loading-state";
import { PageContainer } from "@/components/ui/page-container";
import { PageHeader } from "@/components/ui/page-header";
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

  if (role === "PROGRAM_OFFICER") {
    return deny("Settings access denied", "Program Officers do not have access to platform settings.");
  }

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
  const profileQuery = useQuery({
    queryKey: ["settings-profile", role, organizationId],
    queryFn: () => settingsService.getProfileSettings(role!, organizationId),
    enabled: role === "SUPER_ADMIN" || role === "ORG_ADMIN",
  });

  if (role === "PROGRAM_OFFICER" || role === "AUDITOR") {
    return deny("Profile settings denied", "Your role cannot access profile settings.");
  }

  if (profileQuery.isLoading) {
    return <PageContainer><LoadingState title="Loading profile settings" lines={5} /></PageContainer>;
  }

  const data = profileQuery.data?.data;
  if (!data) {
    return <PageContainer><EmptyState title="Profile settings unavailable" description="Profile settings could not be loaded." /></PageContainer>;
  }

  return (
    <PageContainer>
      <PageHeader title="Profile Settings" description={role === "SUPER_ADMIN" ? "Manage the platform profile and support configuration." : "Manage your organization profile and contact details."} />
      {role === "SUPER_ADMIN" ? (
        <PlatformProfileSettingsForm initialData={data as import("@/types/settings").PlatformProfileSettings} />
      ) : (
        <OrganizationProfileSettingsForm organizationId={organizationId!} initialData={data as import("@/types/settings").OrganizationProfileSettings} />
      )}
    </PageContainer>
  );
}

export function SettingsUsersModule() {
  const role = useAuthStore((state) => state.role);
  const organizationId = useAuthStore((state) => state.organizationId);
  const usersQuery = useQuery({
    queryKey: ["settings-users", role, organizationId],
    queryFn: () => settingsService.getUsers(role!, organizationId),
    enabled: role === "SUPER_ADMIN" || role === "ORG_ADMIN",
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
      <UserManagementTable items={usersQuery.data?.data ?? []} canManage={role === "SUPER_ADMIN"} />
    </PageContainer>
  );
}

export function SettingsRolesModule() {
  const role = useAuthStore((state) => state.role);

  if (role === "PROGRAM_OFFICER" || role === "ORG_ADMIN") {
    return deny("Role settings denied", "Your role cannot access role and permission settings.");
  }

  return (
    <PageContainer>
      <PageHeader title="Roles & Permissions" description="Read the current RBAC matrix directly from the active permission configuration." />
      <RolePermissionMatrix />
    </PageContainer>
  );
}

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
