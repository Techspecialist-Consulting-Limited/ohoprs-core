"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import type { ReactNode } from "react";
import { useForm, useWatch } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

import { organizationsData } from "@/mock/organizations.mock";
import { programsData } from "@/mock/programs.mock";
import { distributionSchema } from "@/features/distributions/schemas/distribution.schema";
import { distributionService } from "@/services/distribution.service";
import { useAuthStore } from "@/store/auth.store";
import type { DistributionFormValues, DistributionPayload } from "@/types/distribution";

const cashMethods = new Set(["BANK_TRANSFER", "MOBILE_MONEY", "CASH"]);

export function DistributionForm({
  mode,
  distributionId,
  initialValues,
  canChooseOrganization,
  defaultOrganizationId,
}: {
  mode: "create" | "edit";
  distributionId?: string;
  initialValues?: DistributionFormValues;
  canChooseOrganization: boolean;
  defaultOrganizationId?: string;
}) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const user = useAuthStore((state) => state.user);
  type DistributionFormInput = z.input<typeof distributionSchema>;
  type DistributionFormOutput = z.output<typeof distributionSchema>;

  const form = useForm<DistributionFormInput, unknown, DistributionFormOutput>({
    resolver: zodResolver(distributionSchema),
    defaultValues: initialValues ?? {
      name: "",
      organizationId: defaultOrganizationId ?? "",
      programId: "",
      method: "BANK_TRANSFER",
      description: "",
      beneficiaryCount: 0,
      amount: undefined,
      quantity: undefined,
      scheduledDate: "",
      status: "DRAFT",
    },
  });

  const organizationId = useWatch({ control: form.control, name: "organizationId" });
  const method = useWatch({ control: form.control, name: "method" });
  const programId = useWatch({ control: form.control, name: "programId" });
  const selectedProgram = programsData.find((program) => program.id === programId) ?? null;
  const isCash = cashMethods.has(method);
  const availablePrograms = organizationId ? programsData.filter((program) => program.organizationId === organizationId) : [];

  const mutation = useMutation({
    mutationFn: async (values: DistributionPayload) => {
      if (mode === "create") {
        return distributionService.createDistribution(values, user?.id ?? "user_001", user?.name ?? "Amina Bello");
      }

      return distributionService.updateDistribution(distributionId!, values);
    },
    onSuccess: (response) => {
      if (!response.success || !response.data) {
        toast.error(response.message);
        return;
      }

      void queryClient.invalidateQueries({ queryKey: ["distributions"] });
      void queryClient.invalidateQueries({ queryKey: ["distribution", response.data.id] });
      toast.success(mode === "create" ? "Distribution created successfully" : "Distribution updated successfully");
      router.push(`/distributions/${response.data.id}`);
    },
  });

  function onSubmit(values: DistributionFormOutput) {
    const payload: DistributionPayload = {
      ...values,
      amount: isCash ? values.amount : undefined,
      quantity: isCash ? undefined : values.quantity,
    };
    mutation.mutate(payload);
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
      <section className="grid gap-5 rounded-[28px] border border-border bg-surface p-6 shadow-sm lg:grid-cols-2">
        <Field label="Distribution Name" error={form.formState.errors.name?.message}>
          <input {...form.register("name")} className={inputClassName} placeholder="June Youth Grant Batch" />
        </Field>

        <Field label="Organization" error={form.formState.errors.organizationId?.message}>
          <select
            {...form.register("organizationId", {
              onChange: () => form.setValue("programId", ""),
            })}
            disabled={!canChooseOrganization}
            className={inputClassName}
          >
            <option value="">Select organization</option>
            {organizationsData.map((organization) => (
              <option key={organization.id} value={organization.id}>
                {organization.name}
              </option>
            ))}
          </select>
        </Field>

        <Field label="Intervention" error={form.formState.errors.programId?.message}>
          <select {...form.register("programId")} className={inputClassName}>
            <option value="">Select program</option>
            {availablePrograms.map((program) => (
              <option key={program.id} value={program.id}>
                {program.name}
              </option>
            ))}
          </select>
        </Field>

        <Field label="Benefit Type">
          <input
            value={selectedProgram?.benefitType.replaceAll("_", " ") ?? ""}
            disabled
            className={`${inputClassName} bg-surface-muted`}
            placeholder="Derived from selected program"
          />
        </Field>

        <Field label="Distribution Method" error={form.formState.errors.method?.message}>
          <select {...form.register("method")} className={inputClassName}>
            {["BANK_TRANSFER", "MOBILE_MONEY", "CASH", "FOOD_PACKAGE", "MEDICAL_SUPPORT", "EDUCATION_SUPPORT", "AGRICULTURE_SUPPORT"].map((option) => (
              <option key={option} value={option}>
                {option.replaceAll("_", " ")}
              </option>
            ))}
          </select>
        </Field>

        <Field label="Scheduled Date" error={form.formState.errors.scheduledDate?.message}>
          <input {...form.register("scheduledDate")} type="datetime-local" className={inputClassName} />
        </Field>

        <Field label="Beneficiary Count" error={form.formState.errors.beneficiaryCount?.message}>
          <input {...form.register("beneficiaryCount")} type="number" min={1} className={inputClassName} />
        </Field>

        {isCash ? (
          <Field label="Amount" error={form.formState.errors.amount?.message}>
            <input {...form.register("amount")} type="number" min={0} className={inputClassName} placeholder="500000000" />
          </Field>
        ) : (
          <Field label="Quantity" error={form.formState.errors.quantity?.message}>
            <input {...form.register("quantity")} type="number" min={0} className={inputClassName} placeholder="15000" />
          </Field>
        )}

        <Field label="Status" error={form.formState.errors.status?.message}>
          <select {...form.register("status")} className={inputClassName}>
            {["DRAFT", "SCHEDULED", "PROCESSING", "COMPLETED", "FAILED", "CANCELLED"].map((status) => (
              <option key={status} value={status}>
                {status.replaceAll("_", " ")}
              </option>
            ))}
          </select>
        </Field>

        <div className="lg:col-span-2">
          <Field label="Description" error={form.formState.errors.description?.message}>
            <textarea {...form.register("description")} className={`${inputClassName} min-h-32 py-3`} placeholder="Describe the delivery objective, target cohort, and execution notes." />
          </Field>
        </div>
      </section>

      <div className="flex justify-end gap-3">
        <button
          type="button"
          onClick={() => router.back()}
          className="inline-flex h-11 items-center rounded-2xl border border-border px-4 text-sm font-medium text-foreground"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={mutation.isPending}
          className="inline-flex h-11 items-center rounded-2xl bg-accent px-5 text-sm font-semibold text-accent-foreground disabled:opacity-60"
        >
          {mutation.isPending ? "Saving..." : mode === "create" ? "Create Distribution" : "Save Changes"}
        </button>
      </div>
    </form>
  );
}

function Field({
  label,
  children,
  error,
}: {
  label: string;
  children: ReactNode;
  error?: string;
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.16em] text-muted-soft">{label}</span>
      {children}
      {error ? <span className="mt-2 block text-sm text-red-600">{error}</span> : null}
    </label>
  );
}

const inputClassName =
  "h-12 w-full rounded-2xl border border-border bg-surface px-4 text-sm text-foreground outline-none transition focus:border-accent";
