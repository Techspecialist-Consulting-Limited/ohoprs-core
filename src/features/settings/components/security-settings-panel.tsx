"use client";

import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";

import { settingsService } from "@/services/settings.service";
import type { SecuritySettings } from "@/types/settings";

export function SecuritySettingsPanel({
  initialData,
  readOnly = false,
}: {
  initialData: SecuritySettings;
  readOnly?: boolean;
}) {
  const [form, setForm] = useState(initialData);
  const mutation = useMutation({
    mutationFn: () => settingsService.updateSecuritySettings(form),
    onSuccess: () => toast.success("Security settings updated"),
  });

  return (
    <section className="rounded-[28px] border border-border bg-surface p-6 shadow-sm">
      <div className="grid gap-4 md:grid-cols-2">
        <Field label="MFA Required" value={form.mfaRequired ? "Enabled" : "Disabled"} />
        <Field label="Password Min Length" value={String(form.passwordMinLength)} />
        <Field label="Password Expiry Days" value={String(form.passwordExpiryDays)} />
        <Field label="Session Timeout Minutes" value={String(form.sessionTimeoutMinutes)} />
        <Field label="IP Restrictions" value={form.ipRestrictionsEnabled ? "Enabled" : "Disabled"} />
        <Field label="Audit Retention Days" value={String(form.auditRetentionDays)} />
      </div>
      {!readOnly ? (
        <div className="mt-6 flex flex-wrap gap-3">
          <button type="button" onClick={() => setForm((current) => ({ ...current, mfaRequired: !current.mfaRequired }))} className="inline-flex h-11 items-center rounded-2xl border border-border px-4 text-sm font-medium text-foreground">
            Toggle MFA
          </button>
          <button type="button" onClick={() => setForm((current) => ({ ...current, ipRestrictionsEnabled: !current.ipRestrictionsEnabled }))} className="inline-flex h-11 items-center rounded-2xl border border-border px-4 text-sm font-medium text-foreground">
            Toggle IP Restrictions
          </button>
          <button type="button" onClick={() => mutation.mutate()} className="inline-flex h-11 items-center rounded-2xl bg-accent px-5 text-sm font-semibold text-accent-foreground">
            Save Changes
          </button>
        </div>
      ) : null}
    </section>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-3xl border border-border bg-surface-muted px-4 py-4">
      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-soft">{label}</p>
      <p className="mt-2 text-sm font-medium text-foreground">{value}</p>
    </div>
  );
}
