"use client";

import type { PaymentConsoleFilters } from "@/types/payment-console";
import type { PaymentStatus } from "@/types/payment";
import type { VerificationStatus } from "@/types/beneficiary";

export function PaymentTableFilters({
  filters,
  states,
  onChange,
}: {
  filters: PaymentConsoleFilters;
  states: string[];
  onChange: (filters: PaymentConsoleFilters) => void;
}) {
  return (
    <div className="grid gap-3 rounded-[28px] border border-border bg-surface p-4 shadow-sm lg:grid-cols-[1.8fr_1fr_1fr_1fr_auto]">
      <label className="flex h-11 items-center rounded-2xl border border-border bg-background px-3">
        <input
          value={filters.search}
          onChange={(event) => onChange({ ...filters, search: event.target.value })}
          placeholder="Search beneficiaries, references, states, or banks"
          className="w-full bg-transparent text-sm text-foreground outline-none placeholder:text-muted-soft"
        />
      </label>
      <select
        value={filters.state}
        onChange={(event) => onChange({ ...filters, state: event.target.value as string | "ALL" })}
        className="h-11 rounded-2xl border border-border bg-background px-3 text-sm text-foreground"
      >
        <option value="ALL">All states</option>
        {states.map((state) => (
          <option key={state} value={state}>{state}</option>
        ))}
      </select>
      <select
        value={filters.verificationStatus}
        onChange={(event) => onChange({ ...filters, verificationStatus: event.target.value as VerificationStatus | "ALL" })}
        className="h-11 rounded-2xl border border-border bg-background px-3 text-sm text-foreground"
      >
        <option value="ALL">All verification</option>
        {["VERIFIED", "PENDING", "FAILED", "FLAGGED"].map((status) => (
          <option key={status} value={status}>{status.replaceAll("_", " ")}</option>
        ))}
      </select>
      <select
        value={filters.paymentStatus}
        onChange={(event) => onChange({ ...filters, paymentStatus: event.target.value as PaymentStatus | "ALL" })}
        className="h-11 rounded-2xl border border-border bg-background px-3 text-sm text-foreground"
      >
        <option value="ALL">All payments</option>
        {["PENDING", "PROCESSING", "PAID", "FAILED", "REVERSED", "RETRY_PENDING"].map((status) => (
          <option key={status} value={status}>{status.replaceAll("_", " ")}</option>
        ))}
      </select>
      <label className="flex items-center gap-2 rounded-2xl border border-border bg-background px-3">
        <input
          type="checkbox"
          checked={filters.showOnlyFailed}
          onChange={(event) => onChange({ ...filters, showOnlyFailed: event.target.checked })}
        />
        <span className="text-sm text-foreground">Only failed</span>
      </label>
    </div>
  );
}
