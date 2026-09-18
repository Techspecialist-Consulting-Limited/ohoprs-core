"use client";

import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { EmptyState } from "@/components/ui/empty-state";
import { LoadingState } from "@/components/ui/loading-state";
import { PageContainer } from "@/components/ui/page-container";
import { PageHeader } from "@/components/ui/page-header";
import { useDebouncedValue } from "@/hooks/use-debounced-value";
import { usePageQueryState } from "@/hooks/use-page-query-state";
import { hasPermission } from "@/lib/rbac";
import { paymentService } from "@/services/payment.service";
import { useAuthStore } from "@/store/auth.store";
import type { PaymentRecord } from "@/types/payment";
import { PaymentTable } from "@/features/payments/components/payment-table";

export function PaymentsModule() {
  const role = useAuthStore((state) => state.role);
  const user = useAuthStore((state) => state.user);
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const { page, limit, setPage, setLimit } = usePageQueryState(10);
  const debouncedSearch = useDebouncedValue(search);

  const paymentsQuery = useQuery({
    queryKey: ["payments", role, user?.organizationId, debouncedSearch, page, limit],
    queryFn: async () => {
      const response = await paymentService.getPayments({
        search: debouncedSearch,
        page,
        limit,
        scopeOrganizationId: role === "SUPER_ADMIN" || role === "AUDITOR" ? null : user?.organizationId ?? null,
      });
      return response.data;
    },
    placeholderData: (previousData) => previousData,
  });

  const refresh = () => {
    queryClient.invalidateQueries({ queryKey: ["payments"] });
    queryClient.invalidateQueries({ queryKey: ["audit-logs"] });
  };

  const actionMutation = useMutation({
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

  if (paymentsQuery.isLoading && !paymentsQuery.data) {
    return <LoadingState title="Loading payment records" lines={6} />;
  }

  const items = paymentsQuery.data?.items ?? [];
  const meta = paymentsQuery.data?.meta;

  return (
    <PageContainer>
      <PageHeader
        eyebrow="Payments"
        title="Payment processing console"
        description="Review beneficiary payment records, inspect status outcomes, and execute or recover payments under government-grade separation of duties."
      />

      <div className="rounded-[28px] border border-border bg-surface p-5 shadow-sm">
        <label htmlFor="payment-search" className="text-sm font-medium text-foreground">Search payments</label>
        <input
          id="payment-search"
          value={search}
          onChange={(event) => {
            setSearch(event.target.value);
            setPage(1);
          }}
          placeholder="Search by reference, beneficiary, program, or distribution"
          className="mt-3 h-12 w-full rounded-2xl border border-border bg-surface-muted px-4 text-sm text-foreground outline-none placeholder:text-muted"
        />
      </div>

      {items.length && meta ? (
        <PaymentTable
          items={items}
          meta={meta}
          onPageChange={setPage}
          onLimitChange={setLimit}
          isFetching={paymentsQuery.isFetching}
          onProcess={(item) => actionMutation.mutate({ action: "process", item })}
          onRetry={(item) => actionMutation.mutate({ action: "retry", item })}
          onReverse={(item) => actionMutation.mutate({ action: "reverse", item })}
          canProcess={(item) => role === "SUPER_ADMIN" && item.status === "PENDING"}
          canRetry={(item) => role === "SUPER_ADMIN" && (item.status === "FAILED" || item.status === "RETRY_PENDING")}
          canReverse={(item) => Boolean(role && hasPermission(role, "reverse_payment") && item.status === "PAID")}
        />
      ) : (
        <EmptyState title="No payment records found" description="Adjust your search or create approved cash distributions to populate payment processing records." />
      )}
    </PageContainer>
  );
}
