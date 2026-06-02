"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";

import { PermissionDeniedState } from "@/components/shared/permission-denied-state";
import { LoadingState } from "@/components/ui/loading-state";
import { PageContainer } from "@/components/ui/page-container";
import { PageHeader } from "@/components/ui/page-header";
import { formatCurrency, formatDateTime } from "@/lib/formatters";
import { paymentService } from "@/services/payment.service";
import { useAuthStore } from "@/store/auth.store";
import { PaymentFailureCard } from "@/features/payments/components/payment-failure-card";
import { PaymentStatusBadge } from "@/features/payments/components/payment-status-badge";
import { PaymentSummaryCard } from "@/features/payments/components/payment-summary-card";
import { PaymentTimeline } from "@/features/payments/components/payment-timeline";

export function PaymentDetailsModule({ id }: { id: string }) {
  const role = useAuthStore((state) => state.role);
  const user = useAuthStore((state) => state.user);

  const query = useQuery({
    queryKey: ["payment", id],
    queryFn: async () => {
      const response = await paymentService.getPaymentById(id);
      return response.data;
    },
  });

  if (query.isLoading) {
    return <LoadingState title="Loading payment details" lines={6} />;
  }

  const payment = query.data;

  if (!payment) {
    return <PermissionDeniedState title="Payment record unavailable" description="This payment record could not be found in the current prototype store." />;
  }

  const canView =
    role === "SUPER_ADMIN" ||
    role === "AUDITOR" ||
    payment.organizationId === user?.organizationId;

  if (!canView) {
    return <PermissionDeniedState description="Your role cannot inspect payment records outside your organization scope." />;
  }

  return (
    <PageContainer>
      <PageHeader
        eyebrow="Payment record"
        title={payment.reference}
        description="Inspect payment status, beneficiary context, provider outcomes, and processing accountability for this beneficiary payout."
      />

      <div className="flex flex-wrap items-center gap-3">
        <PaymentStatusBadge status={payment.status} />
        {role === "AUDITOR" ? (
          <span className="rounded-full border border-warning/30 bg-warning/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-warning">
            Read-only oversight view
          </span>
        ) : null}
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        <PaymentSummaryCard label="Amount" value={formatCurrency(payment.amount)} />
        <PaymentSummaryCard label="Method" value={payment.method.replaceAll("_", " ")} />
        <PaymentSummaryCard label="Processed date" value={payment.processedAt ? formatDateTime(payment.processedAt) : "Pending"} />
      </div>

      <section className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
        <div className="space-y-6">
          <section className="rounded-[28px] border border-border bg-surface p-6 shadow-sm">
            <h2 className="text-xl font-semibold tracking-tight text-foreground">Beneficiary information</h2>
            <div className="mt-5 grid gap-4 md:grid-cols-2">
              <DetailCell label="Beneficiary" value={payment.beneficiaryName} />
              <DetailCell label="Masked NIN" value={payment.beneficiaryNin} />
              <DetailCell label="Program" value={payment.programName} />
              <DetailCell label="Organization" value={payment.organizationName} />
              <DetailCell label="Bank" value={payment.bankName} />
              <DetailCell label="Account number" value={payment.accountNumber} />
            </div>

            <div className="mt-5 flex flex-wrap gap-3">
              <Link href={`/distributions/${payment.distributionId}/payments`} className="inline-flex h-10 items-center rounded-2xl border border-border px-4 text-sm font-medium text-foreground">
                Open distribution payments
              </Link>
              <Link href={`/beneficiaries/${payment.beneficiaryId}`} className="inline-flex h-10 items-center rounded-2xl border border-border px-4 text-sm font-medium text-foreground">
                View beneficiary profile
              </Link>
            </div>
          </section>

          <PaymentFailureCard reason={payment.failureReason} />

          <section className="rounded-[28px] border border-border bg-surface p-6 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-accent">Audit preview</p>
            <div className="mt-4 grid gap-4 md:grid-cols-2">
              <DetailCell label="Created by" value={payment.createdBy} />
              <DetailCell label="Approved by" value={payment.approvedBy ?? "Pending"} />
              <DetailCell label="Processed by" value={payment.processedBy ?? "Pending"} />
              <DetailCell label="Processed date" value={payment.processedAt ? formatDateTime(payment.processedAt) : "Pending"} />
            </div>
          </section>
        </div>

        <PaymentTimeline items={payment.timeline} />
      </section>
    </PageContainer>
  );
}

function DetailCell({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-border bg-surface-muted px-4 py-3">
      <p className="text-xs uppercase tracking-[0.14em] text-muted-soft">{label}</p>
      <p className="mt-2 text-sm font-medium text-foreground">{value}</p>
    </div>
  );
}
