"use client";

import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";

import { settingsService } from "@/services/settings.service";
import type { PaymentSettings } from "@/types/settings";

export function PaymentSettingsPanel({ initialData }: { initialData: PaymentSettings }) {
  const [form, setForm] = useState(initialData);
  const mutation = useMutation({
    mutationFn: () => settingsService.updatePaymentSettings(form),
    onSuccess: () => toast.success("Payment settings updated"),
  });

  return (
    <section className="rounded-[28px] border border-border bg-surface p-6 shadow-sm">
      <div className="grid gap-4 md:grid-cols-2">
        <Field label="Payment Provider">
          <input value={form.paymentProvider} onChange={(event) => setForm((current) => ({ ...current, paymentProvider: event.target.value }))} className={inputClassName} />
        </Field>
        <Field label="Reconciliation Settings">
          <input value={form.reconciliationMode} onChange={(event) => setForm((current) => ({ ...current, reconciliationMode: event.target.value }))} className={inputClassName} />
        </Field>
        <Field label="Batch Processing Limit">
          <input type="number" value={form.batchProcessingLimit} onChange={(event) => setForm((current) => ({ ...current, batchProcessingLimit: Number(event.target.value) }))} className={inputClassName} />
        </Field>
        <div className="rounded-3xl border border-border bg-surface-muted px-4 py-4">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-soft">Transfer Channels</p>
          <div className="mt-3 space-y-3">
            <label className="flex items-center justify-between text-sm text-foreground">
              <span>Bank transfer enabled</span>
              <input type="checkbox" checked={form.bankTransferEnabled} onChange={(event) => setForm((current) => ({ ...current, bankTransferEnabled: event.target.checked }))} />
            </label>
            <label className="flex items-center justify-between text-sm text-foreground">
              <span>Mobile money enabled</span>
              <input type="checkbox" checked={form.mobileMoneyEnabled} onChange={(event) => setForm((current) => ({ ...current, mobileMoneyEnabled: event.target.checked }))} />
            </label>
          </div>
        </div>
      </div>
      <div className="mt-6">
        <button type="button" onClick={() => mutation.mutate()} className="inline-flex h-11 items-center rounded-2xl bg-accent px-5 text-sm font-semibold text-accent-foreground">
          Save Changes
        </button>
      </div>
    </section>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.16em] text-muted-soft">{label}</span>
      {children}
    </label>
  );
}

const inputClassName =
  "h-12 w-full rounded-2xl border border-border bg-surface px-4 text-sm text-foreground outline-none transition focus:border-accent";
