"use client";

import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { useForm, useWatch } from "react-hook-form";
import { toast } from "sonner";
import type { z } from "zod";

import { organizationsData } from "@/mock/organizations.mock";
import { programSchema, benefitTypes, programStatuses } from "@/features/programs/schemas/program.schema";
import { programService } from "@/services/program.service";
import type { ProgramPayload } from "@/types/program";

type ProgramFormValues = z.input<typeof programSchema>;
type ProgramSubmitValues = z.output<typeof programSchema>;

export function ProgramForm({
  canChooseOrganization,
  defaultOrganizationId,
  initialValues,
  mode,
  programId,
}: {
  canChooseOrganization: boolean;
  defaultOrganizationId?: string;
  initialValues?: Partial<ProgramFormValues>;
  mode: "create" | "edit";
  programId?: string;
}) {
  const router = useRouter();
  const form = useForm<ProgramFormValues>({
    resolver: zodResolver(programSchema),
    defaultValues: {
      name: initialValues?.name ?? "",
      organizationId: initialValues?.organizationId ?? defaultOrganizationId ?? "",
      benefitType: initialValues?.benefitType ?? "CASH",
      description: initialValues?.description ?? "",
      startDate: initialValues?.startDate ?? "",
      endDate: initialValues?.endDate ?? "",
      targetBeneficiaries: initialValues?.targetBeneficiaries ?? 1,
      budget: initialValues?.budget ?? 0,
      status: initialValues?.status ?? "DRAFT",
    },
  });
  const selectedOrganizationId = useWatch({
    control: form.control,
    name: "organizationId",
  });

  const mutation = useMutation({
    mutationFn: async (values: ProgramSubmitValues) => {
      const payload: ProgramPayload = values;

      if (mode === "create") {
        return programService.createProgram(payload);
      }

      return programService.updateProgram(programId!, payload);
    },
    onSuccess: (response) => {
      if (!response.success || !response.data) {
        toast.error(response.message);
        return;
      }

      toast.success(response.message);
      router.push(`/programs/${response.data.id}`);
    },
    onError: () => {
      toast.error("Unable to save program.");
    },
  });

  const inputClassName =
    "focus-ring h-12 w-full rounded-2xl border border-border bg-background px-4 text-sm text-foreground placeholder:text-muted-soft";

  function onSubmit(values: ProgramFormValues) {
    mutation.mutate({
      ...values,
      targetBeneficiaries: Number(values.targetBeneficiaries),
      budget: Number(values.budget),
    });
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 rounded-[32px] border border-border bg-surface p-6 shadow-sm sm:p-8">
      <div className="grid gap-5 md:grid-cols-2">
        <Field label="Intervention Name" error={form.formState.errors.name?.message}>
          <input {...form.register("name")} className={inputClassName} />
        </Field>

        <Field label="Organization" error={form.formState.errors.organizationId?.message}>
          {canChooseOrganization ? (
            <select {...form.register("organizationId")} className={inputClassName}>
              <option value="">Select organization</option>
              {organizationsData.map((organization) => (
                <option key={organization.id} value={organization.id}>
                  {organization.name}
                </option>
              ))}
            </select>
          ) : (
            <div className="flex h-12 items-center rounded-2xl border border-border bg-surface-muted px-4 text-sm text-foreground">
              {organizationsData.find((organization) => organization.id === selectedOrganizationId)?.name ?? "Assigned organization"}
            </div>
          )}
        </Field>

        <Field label="Benefit Type" error={form.formState.errors.benefitType?.message}>
          <select {...form.register("benefitType")} className={inputClassName}>
            {benefitTypes.map((benefitType) => (
              <option key={benefitType} value={benefitType}>
                {benefitType.replaceAll("_", " ")}
              </option>
            ))}
          </select>
        </Field>

        <Field label="Status" error={form.formState.errors.status?.message}>
          <select {...form.register("status")} className={inputClassName}>
            {programStatuses.map((status) => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
          </select>
        </Field>
      </div>

      <Field label="Description" error={form.formState.errors.description?.message}>
        <textarea {...form.register("description")} className="focus-ring min-h-32 w-full rounded-2xl border border-border bg-background px-4 py-3 text-sm text-foreground" />
      </Field>

      <div className="grid gap-5 md:grid-cols-2">
        <Field label="Start Date" error={form.formState.errors.startDate?.message}>
          <input type="date" {...form.register("startDate")} className={inputClassName} />
        </Field>
        <Field label="End Date" error={form.formState.errors.endDate?.message}>
          <input type="date" {...form.register("endDate")} className={inputClassName} />
        </Field>
        <Field label="Target Beneficiaries" error={form.formState.errors.targetBeneficiaries?.message}>
          <input type="number" {...form.register("targetBeneficiaries")} className={inputClassName} />
        </Field>
        <Field label="Budget" error={form.formState.errors.budget?.message}>
          <input type="number" {...form.register("budget")} className={inputClassName} />
        </Field>
      </div>

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
          {mutation.isPending ? "Saving..." : mode === "create" ? "Create Intervention" : "Save Changes"}
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
