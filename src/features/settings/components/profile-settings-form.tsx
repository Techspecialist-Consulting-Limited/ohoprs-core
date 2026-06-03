"use client";

import Link from "next/link";
import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Pencil } from "lucide-react";
import { toast } from "sonner";

import { nigeriaStates } from "@/constants/nigeria-states";
import { settingsService } from "@/services/settings.service";
import type { OrganizationProfileSettings, PlatformProfileSettings } from "@/types/settings";

export function PlatformProfileSettingsForm({ initialData }: { initialData: PlatformProfileSettings }) {
  const [form, setForm] = useState(initialData);
  const mutation = useMutation({
    mutationFn: () => settingsService.updatePlatformProfile(form),
    onSuccess: () => toast.success("Platform profile updated"),
  });

  return (
    <section className="rounded-[28px] border border-border bg-surface p-6 shadow-sm">
      <div className="grid gap-4 md:grid-cols-2">
        <Field label="Platform Name"><input value={form.platformName} onChange={(event) => setForm((current) => ({ ...current, platformName: event.target.value }))} className={inputClassName} /></Field>
        <Field label="Support Email"><input value={form.supportEmail} onChange={(event) => setForm((current) => ({ ...current, supportEmail: event.target.value }))} className={inputClassName} /></Field>
        <Field label="Support Phone"><input value={form.supportPhone} onChange={(event) => setForm((current) => ({ ...current, supportPhone: event.target.value }))} className={inputClassName} /></Field>
        <Field label="Default Locale"><input value={form.defaultLocale} onChange={(event) => setForm((current) => ({ ...current, defaultLocale: event.target.value }))} className={inputClassName} /></Field>
        <Field label="Timezone"><input value={form.timezone} onChange={(event) => setForm((current) => ({ ...current, timezone: event.target.value }))} className={inputClassName} /></Field>
        <div className="md:col-span-2">
          <Field label="Platform Description"><textarea value={form.platformDescription} onChange={(event) => setForm((current) => ({ ...current, platformDescription: event.target.value }))} className={`${inputClassName} min-h-32 py-3`} /></Field>
        </div>
      </div>
      <div className="mt-6">
        <button type="button" onClick={() => mutation.mutate()} className="inline-flex h-11 items-center rounded-2xl bg-accent px-5 text-sm font-semibold text-accent-foreground">Save Changes</button>
      </div>
    </section>
  );
}

export function OrganizationProfileSettingsForm({
  initialData,
  organizationId,
}: {
  initialData: OrganizationProfileSettings;
  organizationId: string;
}) {
  const [form, setForm] = useState(initialData);
  const [isEditing, setIsEditing] = useState(false);
  const mutation = useMutation({
    mutationFn: () => settingsService.updateOrganizationProfile(organizationId, form),
    onSuccess: () => {
      toast.success("Organization profile updated");
      setIsEditing(false);
    },
  });

  if (!isEditing) {
    return (
      <section className="rounded-[28px] border border-border bg-surface p-6 shadow-sm">
        <div className="flex flex-col gap-4 border-b border-border pb-5 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-soft">Organization profile</p>
            <h2 className="mt-2 text-2xl font-semibold text-foreground">{form.organizationName}</h2>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-muted">
              {form.description || "No organization description has been provided yet."}
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link
              href={`/organizations/${organizationId}`}
              className="inline-flex h-11 items-center rounded-2xl border border-border px-4 text-sm font-medium text-foreground"
            >
              View organization details
            </Link>
            <button
              type="button"
              onClick={() => setIsEditing(true)}
              className="inline-flex h-11 items-center gap-2 rounded-2xl bg-accent px-4 text-sm font-semibold text-accent-foreground"
            >
              <Pencil size={16} />
              Edit profile
            </button>
          </div>
        </div>

        <div className="mt-6 grid gap-5 md:grid-cols-2">
          <ReadOnlyField label="Organization Name" value={form.organizationName} />
          <ReadOnlyField label="Short Name" value={form.shortName} />
          <ReadOnlyField label="Contact Email" value={form.contactEmail} />
          <ReadOnlyField label="Contact Phone" value={form.contactPhone} />
          <ReadOnlyField label="Website" value={form.website} />
          <ReadOnlyField label="State" value={form.state} />
          <div className="md:col-span-2">
            <ReadOnlyField label="Address" value={form.address} />
          </div>
          <div className="md:col-span-2">
            <ReadOnlyField label="Description" value={form.description} />
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="rounded-[28px] border border-border bg-surface p-6 shadow-sm">
      <div className="mb-6 flex flex-col gap-3 border-b border-border pb-5 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-soft">Edit organization profile</p>
          <p className="mt-2 text-sm text-muted">Update the profile details below. Current values are prefilled.</p>
        </div>
        <button
          type="button"
          onClick={() => {
            setForm(initialData);
            setIsEditing(false);
          }}
          className="inline-flex h-11 items-center rounded-2xl border border-border px-4 text-sm font-medium text-foreground"
        >
          Cancel
        </button>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <Field label="Organization Name"><input value={form.organizationName} onChange={(event) => setForm((current) => ({ ...current, organizationName: event.target.value }))} className={inputClassName} /></Field>
        <Field label="Short Name"><input value={form.shortName} onChange={(event) => setForm((current) => ({ ...current, shortName: event.target.value }))} className={inputClassName} /></Field>
        <Field label="Contact Email"><input value={form.contactEmail} onChange={(event) => setForm((current) => ({ ...current, contactEmail: event.target.value }))} className={inputClassName} /></Field>
        <Field label="Contact Phone"><input value={form.contactPhone} onChange={(event) => setForm((current) => ({ ...current, contactPhone: event.target.value }))} className={inputClassName} /></Field>
        <Field label="Website"><input value={form.website} onChange={(event) => setForm((current) => ({ ...current, website: event.target.value }))} className={inputClassName} /></Field>
        <Field label="State">
          <select value={form.state} onChange={(event) => setForm((current) => ({ ...current, state: event.target.value }))} className={inputClassName}>
            <option value="">Select state</option>
            {nigeriaStates.map((state) => (
              <option key={state} value={state}>
                {state}
              </option>
            ))}
          </select>
        </Field>
        <div className="md:col-span-2">
          <Field label="Address"><input value={form.address} onChange={(event) => setForm((current) => ({ ...current, address: event.target.value }))} className={inputClassName} /></Field>
        </div>
        <div className="md:col-span-2">
          <Field label="Description"><textarea value={form.description} onChange={(event) => setForm((current) => ({ ...current, description: event.target.value }))} className={`${inputClassName} min-h-32 py-3`} /></Field>
        </div>
      </div>
      <div className="mt-6">
        <button type="button" onClick={() => mutation.mutate()} className="inline-flex h-11 items-center rounded-2xl bg-accent px-5 text-sm font-semibold text-accent-foreground">Save Changes</button>
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

function ReadOnlyField({ label, value }: { label: string; value?: string | null }) {
  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-soft">{label}</p>
      <div className="mt-2 rounded-2xl border border-border bg-background px-4 py-3 text-sm text-foreground">
        {value?.trim() ? value : "Not provided"}
      </div>
    </div>
  );
}

const inputClassName =
  "h-12 w-full rounded-2xl border border-border bg-surface px-4 text-sm text-foreground outline-none transition focus:border-accent";
