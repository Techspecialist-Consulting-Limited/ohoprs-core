"use client";

import Link from "next/link";
import { redirect } from "next/navigation";
import { useMutation, useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { useState } from "react";

import { EmptyState } from "@/components/ui/empty-state";
import { LoadingState } from "@/components/ui/loading-state";
import { PageContainer } from "@/components/ui/page-container";
import { PermissionDeniedState } from "@/components/shared/permission-denied-state";
import { templateVariables } from "@/mock/notifications.mock";
import { NotificationActivityChart } from "@/features/notifications/components/notification-activity-chart";
import { NotificationHeader } from "@/features/notifications/components/notification-header";
import { NotificationHistoryTable } from "@/features/notifications/components/notification-history-table";
import { NotificationList } from "@/features/notifications/components/notification-list";
import { NotificationStats } from "@/features/notifications/components/notification-stats";
import { NotificationTemplateCard } from "@/features/notifications/components/notification-template-card";
import { NotificationTemplateForm } from "@/features/notifications/components/notification-template-form";
import { notificationService } from "@/services/notification.service";
import { useAuthStore } from "@/store/auth.store";
import { TemplateVariablesPanel } from "@/features/notifications/components/template-variables-panel";
import { formatDateTime } from "@/lib/formatters";

export function NotificationsDashboardModule() {
  const role = useAuthStore((state) => state.role);
  const organizationId = useAuthStore((state) => state.organizationId);

  if (role === "AUDITOR") {
    redirect("/notifications/history");
  }

  const dashboardQuery = useQuery({
    queryKey: ["notifications-dashboard", role, organizationId],
    queryFn: () => notificationService.getNotifications({ role: role!, organizationId }),
  });

  if (dashboardQuery.isLoading) {
    return <PageContainer><LoadingState title="Loading notifications dashboard" lines={6} /></PageContainer>;
  }

  const data = dashboardQuery.data?.data;
  if (!data) {
    return <PageContainer><EmptyState title="Notifications unavailable" description="The communications dashboard could not be loaded from the mock service layer." /></PageContainer>;
  }

  return (
    <PageContainer>
      <NotificationHeader title="Notifications & Communications" description="Communication center for operational notifications, template visibility, and delivery quality monitoring." />
      <NotificationStats data={data} />
      <NotificationActivityChart data={data} />
      <NotificationList items={data.recentNotifications} />
    </PageContainer>
  );
}

export function NotificationHistoryModule() {
  const role = useAuthStore((state) => state.role);
  const organizationId = useAuthStore((state) => state.organizationId);
  const [filters, setFilters] = useState({
    datePreset: "LAST_90_DAYS" as const,
    channel: "ALL" as const,
    type: "ALL" as const,
    status: "ALL" as const,
    recipientSearch: "",
    page: 1,
    limit: 10,
  });

  const historyQuery = useQuery({
    queryKey: ["notification-history", filters, role, organizationId],
    queryFn: () =>
      notificationService.getNotificationHistory(
        {
          ...filters,
          scopeOrganizationId: role === "SUPER_ADMIN" || role === "AUDITOR" ? null : organizationId,
        },
        { role: role!, organizationId },
      ),
  });

  const exportMutation = useMutation({
    mutationFn: () =>
      notificationService.exportHistoryCsv(
        {
          ...filters,
          scopeOrganizationId: role === "SUPER_ADMIN" || role === "AUDITOR" ? null : organizationId,
        },
        { role: role!, organizationId },
      ),
    onSuccess: (response) => {
      if (!response.success) {
        toast.error(response.message);
        return;
      }

      const blob = new Blob([response.data.content], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = response.data.filename;
      link.click();
      URL.revokeObjectURL(url);
      toast.success("Notification history CSV downloaded");
    },
  });

  if (historyQuery.isLoading) {
    return <PageContainer><LoadingState title="Loading notification history" lines={6} /></PageContainer>;
  }

  const data = historyQuery.data?.data;
  if (!data) {
    return <PageContainer><EmptyState title="Notification history unavailable" description="History records could not be loaded." /></PageContainer>;
  }

  return (
    <PageContainer>
      <NotificationHeader
        title="Notification History"
        description="Delivery traceability across channels, recipients, and system-triggered communication events."
        readOnly={role === "AUDITOR"}
      />
      <section className="rounded-[28px] border border-border bg-surface p-5 shadow-sm">
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
          <label className="block">
            <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.16em] text-muted-soft">Date Range</span>
            <select
              value={filters.datePreset}
              onChange={(event) => setFilters((current) => ({ ...current, datePreset: event.target.value as typeof current.datePreset, page: 1 }))}
              className="h-11 w-full rounded-2xl border border-border bg-surface px-4 text-sm text-foreground outline-none transition focus:border-accent"
            >
              {["LAST_30_DAYS", "LAST_90_DAYS", "YEAR_TO_DATE", "LAST_12_MONTHS", "CUSTOM"].map((option) => (
                <option key={option} value={option}>
                  {option.replaceAll("_", " ")}
                </option>
              ))}
            </select>
          </label>
          <label className="block">
            <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.16em] text-muted-soft">Channel</span>
            <select
              value={filters.channel}
              onChange={(event) => setFilters((current) => ({ ...current, channel: event.target.value as typeof current.channel, page: 1 }))}
              className="h-11 w-full rounded-2xl border border-border bg-surface px-4 text-sm text-foreground outline-none transition focus:border-accent"
            >
              {["ALL", "EMAIL", "SMS", "IN_APP", "WHATSAPP"].map((option) => (
                <option key={option} value={option}>
                  {option === "ALL" ? "All channels" : option}
                </option>
              ))}
            </select>
          </label>
          <label className="block">
            <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.16em] text-muted-soft">Type</span>
            <select
              value={filters.type}
              onChange={(event) => setFilters((current) => ({ ...current, type: event.target.value as typeof current.type, page: 1 }))}
              className="h-11 w-full rounded-2xl border border-border bg-surface px-4 text-sm text-foreground outline-none transition focus:border-accent"
            >
              {["ALL", "BENEFICIARY_CREATED", "BENEFICIARY_VERIFIED", "DISTRIBUTION_CREATED", "DISTRIBUTION_COMPLETED", "BULK_JOB_COMPLETED", "BULK_JOB_FAILED", "SYSTEM_ALERT"].map((option) => (
                <option key={option} value={option}>
                  {option === "ALL" ? "All types" : option.replaceAll("_", " ")}
                </option>
              ))}
            </select>
          </label>
          <label className="block">
            <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.16em] text-muted-soft">Status</span>
            <select
              value={filters.status}
              onChange={(event) => setFilters((current) => ({ ...current, status: event.target.value as typeof current.status, page: 1 }))}
              className="h-11 w-full rounded-2xl border border-border bg-surface px-4 text-sm text-foreground outline-none transition focus:border-accent"
            >
              {["ALL", "SENT", "DELIVERED", "FAILED", "PENDING"].map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </label>
          <label className="block">
            <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.16em] text-muted-soft">Recipient Search</span>
            <input
              value={filters.recipientSearch}
              onChange={(event) => setFilters((current) => ({ ...current, recipientSearch: event.target.value, page: 1 }))}
              placeholder="Phone or email"
              className="h-11 w-full rounded-2xl border border-border bg-surface px-4 text-sm text-foreground outline-none transition focus:border-accent"
            />
          </label>
        </div>
      </section>

      <div className="flex justify-end">
        {role === "SUPER_ADMIN" || role === "ORG_ADMIN" ? (
          <button
            type="button"
            onClick={() => exportMutation.mutate()}
            className="inline-flex h-11 items-center rounded-2xl border border-border px-4 text-sm font-medium text-foreground"
          >
            Export CSV
          </button>
        ) : null}
      </div>

      <NotificationHistoryTable items={data.items} meta={data.meta} onPageChange={(page) => setFilters((current) => ({ ...current, page }))} />
    </PageContainer>
  );
}

export function NotificationTemplatesModule() {
  const role = useAuthStore((state) => state.role);
  const organizationId = useAuthStore((state) => state.organizationId);
  const canAccess = role !== "PROGRAM_OFFICER" && role !== "AUDITOR";

  const templatesQuery = useQuery({
    queryKey: ["notification-templates", role, organizationId],
    queryFn: () => notificationService.getTemplates({ role: role!, organizationId }),
    enabled: canAccess,
  });

  if (!canAccess) {
    return (
      <PageContainer>
        <PermissionDeniedState title="Template access denied" description="Your role cannot manage communication templates." />
      </PageContainer>
    );
  }

  if (templatesQuery.isLoading) {
    return <PageContainer><LoadingState title="Loading notification templates" lines={6} /></PageContainer>;
  }

  const templates = templatesQuery.data?.data ?? [];

  return (
    <PageContainer>
      <NotificationHeader title="Notification Templates" description="Manage reusable communication templates across channels and workflow events." />
      <div className="flex justify-end">
        <Link href="/notifications/templates/new" className="inline-flex h-11 items-center rounded-2xl bg-accent px-4 text-sm font-semibold text-accent-foreground">
          Create Template
        </Link>
      </div>
      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {templates.map((template) => (
          <NotificationTemplateCard key={template.id} item={template} />
        ))}
      </section>
    </PageContainer>
  );
}

export function NotificationTemplateCreateModule() {
  const role = useAuthStore((state) => state.role);
  const organizationId = useAuthStore((state) => state.organizationId);

  if (role === "PROGRAM_OFFICER" || role === "AUDITOR") {
    return (
      <PageContainer>
        <PermissionDeniedState title="Template creation denied" description="Your role cannot create communication templates." />
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <NotificationHeader title="Create Notification Template" description="Create a reusable communication template for system and workflow events." />
      <NotificationTemplateForm canChooseScope={role === "SUPER_ADMIN"} defaultOrganizationId={organizationId ?? undefined} />
    </PageContainer>
  );
}

export function NotificationTemplateDetailsModule({ id }: { id: string }) {
  const role = useAuthStore((state) => state.role);
  const organizationId = useAuthStore((state) => state.organizationId);
  const canAccess = role !== "PROGRAM_OFFICER" && role !== "AUDITOR";

  const templateQuery = useQuery({
    queryKey: ["notification-template", id, role, organizationId],
    queryFn: () => notificationService.getTemplateById(id, { role: role!, organizationId }),
    enabled: canAccess,
  });

  if (!canAccess) {
    return (
      <PageContainer>
        <PermissionDeniedState title="Template access denied" description="Your role cannot view communication templates." />
      </PageContainer>
    );
  }

  if (templateQuery.isLoading) {
    return <PageContainer><LoadingState title="Loading notification template" lines={6} /></PageContainer>;
  }

  const template = templateQuery.data?.data;
  if (!template) {
    return <PageContainer><EmptyState title="Template not found" description="The selected communication template could not be loaded." /></PageContainer>;
  }

  return (
    <PageContainer>
      <NotificationHeader title={template.name} description="View-only communication template details for the current notification workflow." />
      <section className="grid gap-4 xl:grid-cols-[1fr_0.9fr]">
        <section className="rounded-[28px] border border-border bg-surface p-6 shadow-sm">
          <div className="grid gap-4 md:grid-cols-2">
            <Info label="Scope" value={template.scope === "GLOBAL" ? "Global" : template.organizationName ?? "Organization"} />
            <Info label="Channel" value={template.channel} />
            <Info label="Type" value={template.type.replaceAll("_", " ")} />
            <Info label="Active Status" value={template.isActive ? "Active" : "Inactive"} />
            {template.channel === "EMAIL" ? <Info label="Subject" value={template.subject ?? "N/A"} /> : null}
            <Info label="Created At" value={formatDateTime(template.createdAt)} />
          </div>
          <div className="mt-6 rounded-3xl border border-border bg-surface-muted px-4 py-4">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-soft">Content</p>
            <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-foreground">{template.content}</p>
          </div>
        </section>
        <TemplateVariablesPanel variables={templateVariables} />
      </section>
    </PageContainer>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-3xl border border-border bg-surface-muted px-4 py-4">
      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-soft">{label}</p>
      <p className="mt-2 text-sm font-medium text-foreground">{value}</p>
    </div>
  );
}
