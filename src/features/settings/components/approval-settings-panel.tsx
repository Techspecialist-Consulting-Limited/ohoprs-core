"use client";

import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";

import { settingsService } from "@/services/settings.service";
import type { ApprovalSettings } from "@/types/settings";

export function ApprovalSettingsPanel({ initialData }: { initialData: ApprovalSettings }) {
  const [form, setForm] = useState(initialData);
  const mutation = useMutation({
    mutationFn: () => settingsService.updateApprovalSettings(form),
    onSuccess: () => toast.success("Approval settings updated"),
  });

  const rows = [
    { key: "programApprovalRequired", label: "Program approval required" },
    { key: "beneficiaryUploadApprovalRequired", label: "Beneficiary upload approval required" },
    { key: "distributionApprovalRequired", label: "Distribution approval required" },
    { key: "bulkPaymentApprovalRequired", label: "Bulk payment approval required" },
  ] as const;

  return (
    <section className="rounded-[28px] border border-border bg-surface p-6 shadow-sm">
      <div className="space-y-4">
        {rows.map((row) => (
          <label key={row.key} className="flex items-center justify-between rounded-3xl border border-border bg-surface-muted px-4 py-4 text-sm font-medium text-foreground">
            <span>{row.label}</span>
            <input
              type="checkbox"
              checked={form[row.key]}
              onChange={(event) => setForm((current) => ({ ...current, [row.key]: event.target.checked }))}
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
