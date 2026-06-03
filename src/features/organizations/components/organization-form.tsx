"use client";

import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import type { z } from "zod";

import { nigeriaStates } from "@/constants/nigeria-states";
import {
  organizationSchema,
  organizationStatuses,
  organizationTypes,
} from "@/features/organizations/schemas/organization.schema";
import { organizationService } from "@/services/organization.service";

type OrganizationFormValues = z.infer<typeof organizationSchema>;

export function OrganizationForm({
  initialValues,
  mode,
  organizationId,
}: {
  initialValues?: Partial<OrganizationFormValues>;
  mode: "create" | "edit";
  organizationId?: string;
}) {
  const router = useRouter();
  const form = useForm<OrganizationFormValues>({
    resolver: zodResolver(organizationSchema),
    defaultValues: {
      name: initialValues?.name ?? "",
      shortName: initialValues?.shortName ?? "",
      type: initialValues?.type ?? "FEDERAL_MINISTRY",
      description: initialValues?.description ?? "",
      contactEmail: initialValues?.contactEmail ?? "",
      contactPhone: initialValues?.contactPhone ?? "",
      website: initialValues?.website ?? "",
      address: initialValues?.address ?? "",
      state: initialValues?.state ?? "",
      status: initialValues?.status ?? "ACTIVE",
    },
  });

  const mutation = useMutation({
    mutationFn: async (values: OrganizationFormValues) => {
      if (mode === "create") {
        return organizationService.createOrganization(values);
      }

      return organizationService.updateOrganization(organizationId!, values);
    },
    onSuccess: (response) => {
      if (!response.success || !response.data) {
        toast.error(response.message);
        return;
      }

      toast.success(response.message);
      router.push(`/organizations/${response.data.id}`);
    },
    onError: () => {
      toast.error("Unable to save organization.");
    },
  });

  function onSubmit(values: OrganizationFormValues) {
    mutation.mutate(values);
  }

  const inputClassName =
    "focus-ring h-12 w-full rounded-2xl border border-border bg-background px-4 text-sm text-foreground placeholder:text-muted-soft";

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 rounded-[32px] border border-border bg-surface p-6 shadow-sm sm:p-8">
      <div className="grid gap-5 md:grid-cols-2">
        <Field label="Name" error={form.formState.errors.name?.message}>
          <input {...form.register("name")} className={inputClassName} />
        </Field>
        <Field label="Short Name" error={form.formState.errors.shortName?.message}>
          <input {...form.register("shortName")} className={inputClassName} />
        </Field>
        <Field label="Type" error={form.formState.errors.type?.message}>
          <select {...form.register("type")} className={inputClassName}>
            {organizationTypes.map((type) => (
              <option key={type} value={type}>{type.replaceAll("_", " ")}</option>
            ))}
          </select>
        </Field>
        <Field label="Status" error={form.formState.errors.status?.message}>
          <select {...form.register("status")} className={inputClassName}>
            {organizationStatuses.map((status) => (
              <option key={status} value={status}>{status.replaceAll("_", " ")}</option>
            ))}
          </select>
        </Field>
      </div>

      <Field label="Description" error={form.formState.errors.description?.message}>
        <textarea {...form.register("description")} className="focus-ring min-h-32 w-full rounded-2xl border border-border bg-background px-4 py-3 text-sm text-foreground" />
      </Field>

      <div className="grid gap-5 md:grid-cols-2">
        <Field label="Contact Email" error={form.formState.errors.contactEmail?.message}>
          <input type="email" {...form.register("contactEmail")} className={inputClassName} />
        </Field>
        <Field label="Contact Phone" error={form.formState.errors.contactPhone?.message}>
          <input {...form.register("contactPhone")} className={inputClassName} />
        </Field>
        <Field label="Website" error={form.formState.errors.website?.message}>
          <input {...form.register("website")} className={inputClassName} />
        </Field>
        <Field label="State" error={form.formState.errors.state?.message}>
          <select {...form.register("state")} className={inputClassName}>
            <option value="">Select state</option>
            {nigeriaStates.map((state) => (
              <option key={state} value={state}>
                {state}
              </option>
            ))}
          </select>
        </Field>
      </div>

      <Field label="Address" error={form.formState.errors.address?.message}>
        <input {...form.register("address")} className={inputClassName} />
      </Field>

      <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
        <button
          type="button"
          onClick={() => router.back()}
          className="inline-flex h-12 items-center justify-center rounded-2xl border border-border px-5 text-sm font-semibold text-foreground"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={mutation.isPending}
          className="inline-flex h-12 items-center justify-center rounded-2xl bg-accent px-5 text-sm font-semibold text-accent-foreground disabled:opacity-60"
        >
          {mutation.isPending ? "Saving..." : mode === "create" ? "Create Organization" : "Save Changes"}
        </button>
      </div>
    </form>
  );
}

function Field({
  children,
  error,
  label,
}: {
  children: React.ReactNode;
  error?: string;
  label: string;
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-medium text-foreground">{label}</span>
      {children}
      {error ? <p className="mt-2 text-sm text-danger">{error}</p> : null}
    </label>
  );
}
