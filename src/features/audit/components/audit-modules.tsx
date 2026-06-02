"use client";

import { useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { toast } from "sonner";

import { EmptyState } from "@/components/ui/empty-state";
import { LoadingState } from "@/components/ui/loading-state";
import { PageContainer } from "@/components/ui/page-container";
import { AuditEventSummary } from "@/features/audit/components/audit-event-summary";
import { AuditFilters } from "@/features/audit/components/audit-filters";
import { AuditLogTable } from "@/features/audit/components/audit-log-table";
import { AuditMetadataCard } from "@/features/audit/components/audit-metadata-card";
import { AuditTimeline } from "@/features/audit/components/audit-timeline";
import { RelatedRecordsCard } from "@/features/audit/components/related-records-card";
import { ReportHeader } from "@/features/reports/components/report-header";
import { auditService } from "@/services/audit.service";
import { useAuthStore } from "@/store/auth.store";
import type { AuditFiltersState } from "@/types/audit";

function downloadCsv(filename: string, content: string) {
  const blob = new Blob([content], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

export function AuditLogsModule() {
  const role = useAuthStore((state) => state.role);
  const organizationId = useAuthStore((state) => state.organizationId);
  const [filters, setFilters] = useState<AuditFiltersState>({
    datePreset: "LAST_90_DAYS",
    organizationId: role === "SUPER_ADMIN" || role === "AUDITOR" ? "ALL" : organizationId ?? undefined,
    module: "ALL",
    result: "ALL",
    page: 1,
    limit: 10,
  });

  const showOrganizationFilter = role === "SUPER_ADMIN" || role === "AUDITOR";
  const scopedOrganizationId = showOrganizationFilter ? filters.organizationId : organizationId ?? undefined;

  const logsQuery = useQuery({
    queryKey: ["audit-logs", { ...filters, organizationId: scopedOrganizationId }, role, organizationId],
    queryFn: () =>
      auditService.getAuditLogs(
        { ...filters, organizationId: scopedOrganizationId, scopeOrganizationId: showOrganizationFilter ? null : organizationId },
        { role: role!, organizationId },
      ),
  });

  const exportMutation = useMutation({
    mutationFn: () =>
      auditService.exportAuditLogs(
        { ...filters, organizationId: scopedOrganizationId, scopeOrganizationId: showOrganizationFilter ? null : organizationId },
        { role: role!, organizationId },
      ),
    onSuccess: (response) => {
      if (!response.success) {
        toast.error(response.message);
        return;
      }
      downloadCsv(response.data.filename, response.data.content);
      toast.success("Audit CSV export downloaded");
    },
  });

  if (logsQuery.isLoading) {
    return (
      <PageContainer>
        <LoadingState title="Loading audit trail" lines={6} />
      </PageContainer>
    );
  }

  const logs = logsQuery.data?.data.items ?? [];
  const meta = logsQuery.data?.data.meta;

  return (
    <PageContainer>
      <ReportHeader
        title="Audit & Compliance"
        description="Centralized audit trail for platform actions, governance oversight, and compliance review."
        readOnly={role === "AUDITOR"}
      />
      <div className="flex justify-end">
        {role === "SUPER_ADMIN" || role === "AUDITOR" ? (
          <button
            type="button"
            onClick={() => exportMutation.mutate()}
            className="inline-flex h-11 items-center rounded-2xl border border-border px-4 text-sm font-medium text-foreground"
          >
            Export CSV
          </button>
        ) : null}
      </div>
      <AuditFilters
        value={{ ...filters, organizationId: scopedOrganizationId }}
        onChange={setFilters}
        showOrganizationFilter={showOrganizationFilter}
      />
      {!meta || logs.length === 0 ? (
        <EmptyState title="No audit events found" description="Adjust the filters or broaden the reporting window to view matching compliance events." />
      ) : (
        <AuditLogTable
          items={logs}
          meta={meta}
          onPageChange={(page) => setFilters((current) => ({ ...current, page }))}
        />
      )}
    </PageContainer>
  );
}

export function AuditLogDetailsModule({ id }: { id: string }) {
  const role = useAuthStore((state) => state.role);
  const organizationId = useAuthStore((state) => state.organizationId);

  const detailsQuery = useQuery({
    queryKey: ["audit-log", id, role, organizationId],
    queryFn: () => auditService.getAuditLogById(id, { role: role!, organizationId }),
  });

  if (detailsQuery.isLoading) {
    return (
      <PageContainer>
        <LoadingState title="Loading audit event" lines={6} />
      </PageContainer>
    );
  }

  const item = detailsQuery.data?.data;

  if (!item) {
    return (
      <PageContainer>
        <EmptyState title="Audit event not found" description="The requested audit event could not be loaded or is outside your permitted scope." />
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <AuditEventSummary item={item} readOnly={role === "AUDITOR"} />
      <section className="grid gap-4 xl:grid-cols-[1fr_1fr]">
        <AuditMetadataCard item={item} />
        <RelatedRecordsCard items={item.relatedRecords} />
      </section>
      <AuditTimeline items={item.timeline} />
    </PageContainer>
  );
}
