"use client";

import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { PermissionDeniedState } from "@/components/shared/permission-denied-state";
import { EmptyState } from "@/components/ui/empty-state";
import { LoadingState } from "@/components/ui/loading-state";
import { PageContainer } from "@/components/ui/page-container";
import { paymentConsoleService } from "@/services/payment-console.service";
import { useAuthStore } from "@/store/auth.store";
import type { PaymentConsoleDialogState, PaymentConsoleFilters, PaymentConsoleTab } from "@/types/payment-console";
import { ApprovalGovernanceSummary } from "@/features/payment-console/components/ApprovalGovernanceSummary";
import { BeneficiaryValidationSummary } from "@/features/payment-console/components/BeneficiaryValidationSummary";
import { FailedPaymentsPreview } from "@/features/payment-console/components/FailedPaymentsPreview";
import { PaymentActionDialogs } from "@/features/payment-console/components/PaymentActionDialogs";
import { PaymentAuditPreview } from "@/features/payment-console/components/PaymentAuditPreview";
import { PaymentBeneficiaryTable } from "@/features/payment-console/components/PaymentBeneficiaryTable";
import { PaymentBulkActions } from "@/features/payment-console/components/PaymentBulkActions";
import { PaymentConsoleHeader } from "@/features/payment-console/components/PaymentConsoleHeader";
import { PaymentConsoleTabs } from "@/features/payment-console/components/PaymentConsoleTabs";
import { PaymentExecutionMonitor } from "@/features/payment-console/components/PaymentExecutionMonitor";
import { PaymentExecutionTimeline } from "@/features/payment-console/components/PaymentExecutionTimeline";
import { PaymentReadinessCards } from "@/features/payment-console/components/PaymentReadinessCards";
import { PaymentRiskWarning } from "@/features/payment-console/components/PaymentRiskWarning";
import { PaymentTableFilters } from "@/features/payment-console/components/PaymentTableFilters";

const initialFilters: PaymentConsoleFilters = {
  search: "",
  state: "ALL",
  verificationStatus: "ALL",
  paymentStatus: "ALL",
  showOnlyFailed: false,
};

export function PaymentConsoleModule({ id }: { id: string }) {
  const queryClient = useQueryClient();
  const role = useAuthStore((state) => state.role);
  const user = useAuthStore((state) => state.user);
  const [activeTab, setActiveTab] = useState<PaymentConsoleTab>("OVERVIEW");
  const [filters, setFilters] = useState<PaymentConsoleFilters>(initialFilters);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [dialog, setDialog] = useState<PaymentConsoleDialogState | null>(null);
  const [reason, setReason] = useState("");
  const dialogDescription = dialog
    ? (() => {
        switch (dialog.action) {
          case "SUBMIT":
            return "Submit this distribution into the approval workflow and append a governance audit entry.";
          case "APPROVE":
            return "Approve this distribution and clear it for payment execution readiness.";
          case "REJECT":
            return "Reject this distribution. A rejection reason is required and will be added to governance history.";
          case "PROCESS_SINGLE":
            return "Process the selected beneficiary payment and append execution and audit events.";
          case "PROCESS_SELECTED":
            return "Process all selected payment rows. Eligible verified beneficiaries will be paid, while flagged or invalid profiles will fail.";
          case "PROCESS_ALL":
            return "Process all eligible payments in this distribution using the rule-based execution simulator.";
          case "RETRY_SINGLE":
          case "RETRY_SELECTED":
            return "Retry the failed payment selection. Unresolved profile issues will continue to fail.";
          case "REVERSE":
            return "Reverse this paid payment. A reversal reason is required and will be written to the audit trail.";
        }
      })()
    : "";

  const consoleQuery = useQuery({
    queryKey: ["payment-console", id, role, user?.id],
    enabled: Boolean(role && user),
    queryFn: async () => {
      const response = await paymentConsoleService.getConsole(id, {
        role: role!,
        user,
      });

      if (!response.success) {
        throw new Error(response.message);
      }

      return response.data;
    },
  });

  function refreshConsole() {
    queryClient.invalidateQueries({ queryKey: ["payment-console", id] });
    queryClient.invalidateQueries({ queryKey: ["distribution", id] });
    queryClient.invalidateQueries({ queryKey: ["distributions"] });
    queryClient.invalidateQueries({ queryKey: ["audit-logs"] });
    queryClient.invalidateQueries({ queryKey: ["dashboard"] });
  }

  const actionMutation = useMutation({
    mutationFn: async () => {
      if (!dialog || !user) {
        throw new Error("Action unavailable");
      }

      switch (dialog.action) {
        case "SUBMIT":
          return paymentConsoleService.submitForApproval(id, user);
        case "APPROVE":
          return paymentConsoleService.approveDistribution(id, user);
        case "REJECT":
          return paymentConsoleService.rejectDistribution(id, user, reason.trim());
        case "PROCESS_SINGLE":
          return paymentConsoleService.processPayments(id, dialog.paymentIds ?? [], user);
        case "PROCESS_SELECTED":
        case "PROCESS_ALL":
          return paymentConsoleService.processPayments(id, dialog.paymentIds ?? [], user);
        case "RETRY_SINGLE":
        case "RETRY_SELECTED":
          return paymentConsoleService.retryPayments(id, dialog.paymentIds ?? [], user);
        case "REVERSE":
          return paymentConsoleService.reversePayment(id, dialog.paymentIds?.[0] ?? "", user, reason.trim());
      }
    },
    onSuccess: (response) => {
      if (!response.success) {
        toast.error(response.message);
        return;
      }

      toast.success(response.message);
      setDialog(null);
      setReason("");
      setSelectedIds([]);
      refreshConsole();
    },
    onError: () => {
      toast.error("Unable to complete the requested payment console action.");
    },
  });

  if (consoleQuery.isLoading) {
    return (
      <PageContainer>
        <LoadingState title="Loading payment execution console" lines={7} />
      </PageContainer>
    );
  }

  if (consoleQuery.isError || !consoleQuery.data || !role || !user) {
    return (
      <PageContainer>
        <PermissionDeniedState
          title="Payment console unavailable"
          description="The selected payment execution console could not be loaded for your current role or session."
        />
      </PageContainer>
    );
  }

  const data = consoleQuery.data;
  const filteredPayments = data.payments.filter((payment) => {
    if (filters.search.trim()) {
      const term = filters.search.trim().toLowerCase();
      const haystack = [payment.beneficiaryName, payment.bankName, payment.beneficiaryState, payment.paymentReference ?? ""].join(" ").toLowerCase();
      if (!haystack.includes(term)) return false;
    }

    if (filters.state !== "ALL" && payment.beneficiaryState !== filters.state) return false;
    if (filters.verificationStatus !== "ALL" && payment.verificationStatus !== filters.verificationStatus) return false;
    if (filters.paymentStatus !== "ALL" && payment.status !== filters.paymentStatus) return false;
    if (filters.showOnlyFailed && payment.status !== "FAILED" && payment.status !== "RETRY_PENDING") return false;
    return true;
  });
  const selectedItems = filteredPayments.filter((payment) => selectedIds.includes(payment.id));
  const selectedFailedCount = selectedItems.filter((payment) => payment.status === "FAILED" || payment.status === "RETRY_PENDING").length;
  const stateOptions = Array.from(new Set(data.payments.map((payment) => payment.beneficiaryState))).sort();

  const canSubmit = role === "PROGRAM_OFFICER" && data.distribution.approvalStatus === "DRAFT" && data.distribution.createdByUserId === user.id;
  const canApprove =
    (role === "SUPER_ADMIN" && data.distribution.approvalStatus === "SUBMITTED") ||
    (role === "ORG_ADMIN" &&
      data.distribution.approvalStatus === "SUBMITTED" &&
      data.distribution.organizationId === user.organizationId &&
      data.distribution.createdByUserId !== user.id);
  const canReject = canApprove;
  const canProcessAll =
    role === "SUPER_ADMIN" &&
    data.isCashDistribution &&
    data.distribution.approvalStatus === "APPROVED" &&
    ["NOT_STARTED", "FAILED", "PARTIALLY_PROCESSED"].includes(data.distribution.executionStatus);
  const canExport = role === "SUPER_ADMIN";
  const selectable = role === "SUPER_ADMIN" && data.isCashDistribution;

  const bulkHelperText =
    role === "ORG_ADMIN"
      ? "Payment execution actions are visible for oversight but disabled for Organization Admin."
      : role === "PROGRAM_OFFICER"
        ? "Program Officers can submit for approval but cannot execute payments."
        : role === "AUDITOR"
          ? "Auditor access is read-only for payment execution."
          : undefined;

  function openDialog(next: PaymentConsoleDialogState) {
    setDialog(next);
    setReason("");
  }

  function exportCsv() {
    const result = paymentConsoleService.exportPaymentsCsv(id, filters);
    if (!result || !user) {
      toast.error("Unable to generate export for this payment batch.");
      return;
    }

    paymentConsoleService.downloadCsv(result);
    toast.success("CSV export started.");
  }

  return (
    <PageContainer>
      <PaymentConsoleHeader
        distribution={data.distribution}
        role={role}
        canSubmit={canSubmit}
        canProcessAll={canProcessAll}
        canExport={canExport}
        onSubmit={() =>
          openDialog({
            action: "SUBMIT",
            title: "Submit distribution for approval",
            description: "Submit this distribution into the approval workflow.",
            confirmLabel: "Submit for Approval",
          })
        }
        onProcessAll={() =>
          openDialog({
            action: "PROCESS_ALL",
            paymentIds: data.payments.filter((payment) => payment.status === "PENDING" || payment.status === "FAILED" || payment.status === "RETRY_PENDING").map((payment) => payment.id),
            title: "Process all payments",
            description: "Process all eligible payments in this distribution.",
            confirmLabel: "Process All Payments",
          })
        }
        onExport={exportCsv}
      />

      <PaymentConsoleTabs activeTab={activeTab} onChange={setActiveTab} />

      {activeTab === "OVERVIEW" ? (
        <section className="space-y-6">
          <PaymentRiskWarning reasons={data.risk.reasons} />
          <PaymentReadinessCards data={data.readiness} />
          <div className="grid gap-4 xl:grid-cols-[1.1fr_0.9fr]">
            <ApprovalGovernanceSummary
              data={data.governance}
              canApprove={canApprove}
              canReject={canReject}
              onApprove={() =>
                openDialog({
                  action: "APPROVE",
                  title: "Approve distribution",
                  description: "Approve this distribution and enable payment execution.",
                  confirmLabel: "Approve Distribution",
                })
              }
              onReject={() =>
                openDialog({
                  action: "REJECT",
                  title: "Reject distribution",
                  description: "Reject this distribution and capture a governance reason.",
                  confirmLabel: "Reject Distribution",
                  requiresReason: true,
                })
              }
            />
            <PaymentExecutionMonitor data={data.execution} />
          </div>
          <BeneficiaryValidationSummary data={data.validation} />
        </section>
      ) : null}

      {activeTab === "BENEFICIARIES" ? (
        <section className="space-y-6">
          <PaymentTableFilters filters={filters} states={stateOptions} onChange={setFilters} />
          <PaymentBulkActions
            selectedCount={selectedItems.length}
            failedSelectedCount={selectedFailedCount}
            canProcessSelected={role === "SUPER_ADMIN" && data.isCashDistribution && selectedItems.some((item) => item.status === "PENDING")}
            canRetrySelected={role === "SUPER_ADMIN" && data.isCashDistribution && selectedFailedCount > 0}
            helperText={bulkHelperText}
            onProcessSelected={() =>
              openDialog({
                action: "PROCESS_SELECTED",
                paymentIds: selectedItems.filter((item) => item.status === "PENDING").map((item) => item.id),
                title: "Process selected payments",
                description: "Process the currently selected pending payments.",
                confirmLabel: "Process Selected",
              })
            }
            onRetrySelected={() =>
              openDialog({
                action: "RETRY_SELECTED",
                paymentIds: selectedItems.filter((item) => item.status === "FAILED" || item.status === "RETRY_PENDING").map((item) => item.id),
                title: "Retry selected failed payments",
                description: "Retry all selected failed payment records.",
                confirmLabel: "Retry Selected",
              })
            }
          />
          {filteredPayments.length ? (
            <PaymentBeneficiaryTable
              items={filteredPayments}
              selectedIds={selectedIds}
              selectable={selectable}
              onToggle={(paymentId) =>
                setSelectedIds((current) =>
                  current.includes(paymentId)
                    ? current.filter((id) => id !== paymentId)
                    : [...current, paymentId],
                )
              }
              onProcess={(paymentId) =>
                openDialog({
                  action: "PROCESS_SINGLE",
                  paymentIds: [paymentId],
                  title: "Process payment",
                  description: "Process the selected beneficiary payment.",
                  confirmLabel: "Process Payment",
                })
              }
              onRetry={(paymentId) =>
                openDialog({
                  action: "RETRY_SINGLE",
                  paymentIds: [paymentId],
                  title: "Retry payment",
                  description: "Retry the selected failed payment.",
                  confirmLabel: "Retry Payment",
                })
              }
              onReverse={(paymentId) =>
                openDialog({
                  action: "REVERSE",
                  paymentIds: [paymentId],
                  title: "Reverse payment",
                  description: "Reverse this paid payment and record a reversal reason.",
                  confirmLabel: "Reverse Payment",
                  requiresReason: true,
                })
              }
              canProcessItem={(item) => role === "SUPER_ADMIN" && data.isCashDistribution && item.status === "PENDING" && data.distribution.approvalStatus === "APPROVED"}
              canRetryItem={(item) => role === "SUPER_ADMIN" && data.isCashDistribution && (item.status === "FAILED" || item.status === "RETRY_PENDING") && data.distribution.approvalStatus === "APPROVED"}
              canReverseItem={(item) => role === "SUPER_ADMIN" && data.isCashDistribution && item.status === "PAID"}
            />
          ) : (
            <EmptyState title="No payment rows match the active filters" description="Adjust your beneficiary or payment filters to inspect another subset of the distribution." />
          )}
        </section>
      ) : null}

      {activeTab === "EXECUTION" ? (
        data.isCashDistribution ? (
          <section className="space-y-6">
            <PaymentExecutionMonitor data={data.execution} />
            <div className="grid gap-4 xl:grid-cols-[0.95fr_1.05fr]">
              <FailedPaymentsPreview items={data.failedPreview} />
              <PaymentExecutionTimeline items={data.executionTimeline} />
            </div>
          </section>
        ) : (
          <EmptyState title="This distribution does not require cash payment execution." description="Execution controls are hidden because this distribution uses a non-cash support method. Review overview, beneficiaries, and audit tabs for the operational context." />
        )
      ) : null}

      {activeTab === "AUDIT" ? (
        <section className="space-y-6">
          <PaymentExecutionTimeline items={data.executionTimeline} title="Approval and execution history" />
          <PaymentAuditPreview items={data.auditPreview} distributionId={id} />
        </section>
      ) : null}

      <PaymentActionDialogs
        dialog={dialog ? { ...dialog, description: dialogDescription } : null}
        reason={reason}
        isSubmitting={actionMutation.isPending}
        onReasonChange={setReason}
        onClose={() => {
          setDialog(null);
          setReason("");
        }}
        onConfirm={() => actionMutation.mutate()}
      />
    </PageContainer>
  );
}
