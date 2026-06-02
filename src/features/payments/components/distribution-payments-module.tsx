"use client";

import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { PermissionDeniedState } from "@/components/shared/permission-denied-state";
import { EmptyState } from "@/components/ui/empty-state";
import { LoadingState } from "@/components/ui/loading-state";
import { PageContainer } from "@/components/ui/page-container";
import { PageHeader } from "@/components/ui/page-header";
import { distributionService } from "@/services/distribution.service";
import { paymentService } from "@/services/payment.service";
import { useAuthStore } from "@/store/auth.store";
import type { PaymentRecord } from "@/types/payment";
import { PaymentSummaryCard, paymentSummaryValue } from "@/features/payments/components/payment-summary-card";
import { PaymentTable } from "@/features/payments/components/payment-table";

function canView(role: string | null, organizationId: string, userOrganizationId?: string | null) {
  if (role === "SUPER_ADMIN" || role === "AUDITOR") return true;
  return organizationId === userOrganizationId;
}

function isCashMethod(method: string) {
  return method === "BANK_TRANSFER" || method === "MOBILE_MONEY" || method === "CASH";
}

export function DistributionPaymentsModule({ id }: { id: string }) {
  const user = useAuthStore((state) => state.user);
  const role = useAuthStore((state) => state.role);
  const queryClient = useQueryClient();
  const [confirmBulk, setConfirmBulk] = useState(false);

  const distributionQuery = useQuery({
    queryKey: ["distribution", id],
    queryFn: async () => {
      const response = await distributionService.getDistributionById(id);
      return response.data;
    },
  });

  const paymentsQuery = useQuery({
    queryKey: ["distribution-payments", id],
    queryFn: async () => {
      const response = await paymentService.getDistributionPayments(id);
      return response.data;
    },
  });

  const readinessQuery = useQuery({
    queryKey: ["distribution-payment-readiness", id],
    queryFn: async () => {
      const response = await paymentService.getDistributionReadiness(id);
      return response.data;
    },
  });

  const refresh = () => {
    queryClient.invalidateQueries({ queryKey: ["distribution", id] });
    queryClient.invalidateQueries({ queryKey: ["distribution-payments", id] });
    queryClient.invalidateQueries({ queryKey: ["distribution-payment-readiness", id] });
    queryClient.invalidateQueries({ queryKey: ["payments"] });
    queryClient.invalidateQueries({ queryKey: ["audit-logs"] });
  };

  const singleMutation = useMutation({
    mutationFn: async ({ action, item }: { action: "process" | "retry" | "reverse"; item: PaymentRecord }) => {
      if (!user) {
        throw new Error("User not available");
      }

      if (action === "process") return paymentService.processPayment(item.id, user);
      if (action === "retry") return paymentService.retryPayment(item.id, user);
      return paymentService.reversePayment(item.id, user);
    },
    onSuccess: (response) => {
      if (!response.success) {
        toast.error(response.message);
        return;
      }
      toast.success(response.message);
      refresh();
    },
  });

  const bulkMutation = useMutation({
    mutationFn: async () => {
      if (!user) {
        throw new Error("User not available");
      }
      return paymentService.processAllPayments(id, user);
    },
    onSuccess: (response) => {
      if (!response.success) {
        toast.error(response.message);
        return;
      }
      toast.success(`${response.data?.paidCount ?? 0} payments marked paid, ${response.data?.failedCount ?? 0} failed.`);
      setConfirmBulk(false);
      refresh();
    },
  });

  if (distributionQuery.isLoading || paymentsQuery.isLoading || readinessQuery.isLoading) {
    return <LoadingState title="Loading payment readiness" lines={6} />;
  }

  const distribution = distributionQuery.data;
  const payments = paymentsQuery.data ?? [];
  const readiness = readinessQuery.data;

  if (!distribution || !readiness) {
    return <PermissionDeniedState title="Payment workflow unavailable" description="This distribution payment workflow could not be loaded." />;
  }

  if (!canView(role, distribution.organizationId, user?.organizationId)) {
    return <PermissionDeniedState description="Your role cannot inspect payment workflows outside your organization scope." />;
  }

  const canProcessAll =
    role === "SUPER_ADMIN" &&
    distribution.approvalStatus === "APPROVED" &&
    ["NOT_STARTED", "FAILED", "PARTIALLY_PROCESSED"].includes(distribution.executionStatus);

  return (
    <PageContainer>
      <PageHeader
        eyebrow="Payment execution"
        title={distribution.name}
        description="Track payment readiness, review beneficiary payment records, and execute or recover payments under controlled governance."
      />

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        <PaymentSummaryCard label="Eligible beneficiaries" value={paymentSummaryValue("number", readiness.eligibleBeneficiaries)} />
        <PaymentSummaryCard label="Flagged beneficiaries" value={paymentSummaryValue("number", readiness.flaggedBeneficiaries)} tone="warning" />
        <PaymentSummaryCard label="Pending payments" value={paymentSummaryValue("number", readiness.pendingPayments)} />
        <PaymentSummaryCard label="Paid payments" value={paymentSummaryValue("number", readiness.paidPayments)} tone="success" />
        <PaymentSummaryCard label="Failed payments" value={paymentSummaryValue("number", readiness.failedPayments)} tone="warning" />
        <PaymentSummaryCard label="Estimated total payout" value={paymentSummaryValue("currency", readiness.estimatedTotalPayout)} />
      </div>

      <div className="flex flex-wrap gap-3">
        <StatusPill label="Approval status" value={distribution.approvalStatus} />
        <StatusPill label="Execution status" value={distribution.executionStatus} />
        {role === "AUDITOR" ? <StatusPill label="Mode" value="Read-only oversight view" tone="warning" /> : null}
        {canProcessAll ? (
          <button
            type="button"
            onClick={() => setConfirmBulk(true)}
            className="inline-flex h-11 items-center justify-center rounded-2xl bg-accent px-5 text-sm font-semibold text-accent-foreground"
          >
            Process all payments
          </button>
        ) : null}
      </div>

      {!isCashMethod(distribution.method) ? (
        <EmptyState title="No direct payment records for this distribution" description="This distribution uses a non-cash support method. The approval trail still applies, but direct payment execution is not used for this batch." />
      ) : (
        <PaymentTable
          items={payments}
          onProcess={(item) => singleMutation.mutate({ action: "process", item })}
          onRetry={(item) => singleMutation.mutate({ action: "retry", item })}
          onReverse={(item) => singleMutation.mutate({ action: "reverse", item })}
          canProcess={(item) => role === "SUPER_ADMIN" && item.status === "PENDING"}
          canRetry={(item) => role === "SUPER_ADMIN" && (item.status === "FAILED" || item.status === "RETRY_PENDING")}
          canReverse={(item) => role === "SUPER_ADMIN" && item.status === "PAID"}
          readOnlyHint={role === "ORG_ADMIN" ? "Only Super Admin can execute payment actions." : "Your role can view payment history but cannot execute payment actions."}
        />
      )}

      {confirmBulk ? (
        <div className="rounded-[28px] border border-border bg-surface p-6 shadow-sm">
          <h2 className="text-xl font-semibold tracking-tight text-foreground">Process all payments</h2>
          <p className="mt-3 text-sm leading-6 text-muted">
            This will immediately update mock payment records for {distribution.name}. Most payments will be marked as paid, and a small exception set will be marked failed.
          </p>
          <div className="mt-5 flex gap-3">
            <button type="button" onClick={() => setConfirmBulk(false)} className="inline-flex h-11 items-center justify-center rounded-2xl border border-border px-5 text-sm font-semibold text-foreground">
              Cancel
            </button>
            <button type="button" onClick={() => bulkMutation.mutate()} className="inline-flex h-11 items-center justify-center rounded-2xl bg-accent px-5 text-sm font-semibold text-accent-foreground">
              Confirm processing
            </button>
          </div>
        </div>
      ) : null}
    </PageContainer>
  );
}

function StatusPill({
  label,
  value,
  tone = "default",
}: {
  label: string;
  value: string;
  tone?: "default" | "warning";
}) {
  return (
    <div className={`rounded-full border px-4 py-2 text-xs font-semibold uppercase tracking-[0.16em] ${tone === "warning" ? "border-warning/30 bg-warning/10 text-warning" : "border-border bg-surface text-muted"}`}>
      {label}: <span className="text-foreground">{value.replaceAll("_", " ")}</span>
    </div>
  );
}
