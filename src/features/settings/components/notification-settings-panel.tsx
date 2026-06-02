"use client";

import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";

import { settingsService } from "@/services/settings.service";
import type { NotificationSettings } from "@/types/settings";

export function NotificationSettingsPanel({ initialData }: { initialData: NotificationSettings }) {
  const [form, setForm] = useState(initialData);
  const mutation = useMutation({
    mutationFn: () => settingsService.updateNotificationSettings(form),
    onSuccess: () => toast.success("Notification settings updated"),
  });

  return (
    <section className="rounded-[28px] border border-border bg-surface p-6 shadow-sm">
      <div className="grid gap-4 md:grid-cols-2">
        <Field label="Default Sender Name">
          <input value={form.defaultSenderName} onChange={(event) => setForm((current) => ({ ...current, defaultSenderName: event.target.value }))} className={inputClassName} />
        </Field>
        <Field label="Quiet Hours Placeholder">
          <input value={form.quietHours} onChange={(event) => setForm((current) => ({ ...current, quietHours: event.target.value }))} className={inputClassName} />
        </Field>
        <Field label="Failed Notification Retry Placeholder">
          <input value={form.failedRetryPolicy} onChange={(event) => setForm((current) => ({ ...current, failedRetryPolicy: event.target.value }))} className={inputClassName} />
        </Field>
      </div>

      <div className="mt-5 grid gap-4 md:grid-cols-2">
        {[
          { key: "emailEnabled", label: "Email enabled" },
          { key: "smsEnabled", label: "SMS enabled" },
          { key: "whatsappEnabled", label: "WhatsApp enabled" },
          { key: "inAppEnabled", label: "In-app enabled" },
        ].map((item) => (
          <label key={item.key} className="flex items-center justify-between rounded-3xl border border-border bg-surface-muted px-4 py-4 text-sm font-medium text-foreground">
            <span>{item.label}</span>
            <input
              type="checkbox"
              checked={form[item.key as keyof NotificationSettings] as boolean}
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  [item.key]: event.target.checked,
                }))
              }
            />
          </label>
        ))}
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
