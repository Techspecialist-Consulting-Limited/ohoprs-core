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
import { BeneficiarySegmentSelector } from "@/features/bulk-distributions/components/beneficiary-segment-selector";
import { BulkReviewSummary } from "@/features/bulk-distributions/components/bulk-review-summary";
import { bulkDistributionSchema } from "@/features/bulk-distributions/schemas/bulk-distribution.schema";
import { bulkDistributionService } from "@/services/bulk-distribution.service";
import { useAuthStore } from "@/store/auth.store";
import type { BulkDistributionPayload } from "@/types/bulk-distribution";
import type { DistributionMethod } from "@/types/distribution";

const stateOptions = [
  "FCT",
  "Lagos",
  "Kano",
  "Kaduna",
  "Rivers",
  "Borno",
  "Osun",
  "Benue",
  "Bauchi",
];

const methodMap: Record<string, DistributionMethod[]> = {
  CASH: ["BANK_TRANSFER", "MOBILE_MONEY", "CASH"],
  FOOD: ["FOOD_PACKAGE"],
  MEDICAL: ["MEDICAL_SUPPORT"],
  EDUCATION: ["EDUCATION_SUPPORT"],
  AGRICULTURE: ["AGRICULTURE_SUPPORT"],
  HOUSING: ["AGRICULTURE_SUPPORT"],
  EMERGENCY_RELIEF: ["CASH", "FOOD_PACKAGE"],
  OTHER: ["BANK_TRANSFER", "CASH"],
};

function estimateCount(segment: string, base: number) {
  if (segment === "ALL_VERIFIED") return Math.max(base, 100000);
  if (segment === "SELECTED_STATE") return Math.max(Math.round(base * 0.35), 12000);
  if (segment === "PROGRAM_ENROLLED") return Math.max(Math.round(base * 0.62), 24000);
  if (segment === "PENDING_UNPAID") return Math.max(Math.round(base * 0.2), 8000);
  return Math.max(Math.round(base * 0.12), 3000);
}

export function BulkDistributionForm({
  canChooseOrganization,
  defaultOrganizationId,
}: {
  canChooseOrganization: boolean;
  defaultOrganizationId?: string;
}) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const user = useAuthStore((state) => state.user);
  type FormInput = z.input<typeof bulkDistributionSchema>;
  type FormOutput = z.output<typeof bulkDistributionSchema>;

  const form = useForm<FormInput, unknown, FormOutput>({
    resolver: zodResolver(bulkDistributionSchema),
    defaultValues: {
      organizationId: defaultOrganizationId ?? "",
      programId: "",
      method: "BANK_TRANSFER",
      segment: "ALL_VERIFIED",
      state: "",
      beneficiaryCount: 0,
      amount: undefined,
      quantity: undefined,
      scheduledDate: "",
      mockUploadFileName: "",
    },
  });

  const organizationId = useWatch({ control: form.control, name: "organizationId" });
  const programId = useWatch({ control: form.control, name: "programId" });
  const segment = useWatch({ control: form.control, name: "segment" });
  const method = useWatch({ control: form.control, name: "method" });
  const beneficiaryCountValue = useWatch({ control: form.control, name: "beneficiaryCount" });
  const amountValue = useWatch({ control: form.control, name: "amount" });
  const quantityValue = useWatch({ control: form.control, name: "quantity" });
  const scheduledDateValue = useWatch({ control: form.control, name: "scheduledDate" });
  const stateValue = useWatch({ control: form.control, name: "state" });
  const mockUploadFileNameValue = useWatch({ control: form.control, name: "mockUploadFileName" });

  const availablePrograms = organizationId ? programsData.filter((program) => program.organizationId === organizationId) : [];
  const selectedProgram = programsData.find((program) => program.id === programId) ?? null;
  const allowedMethods = selectedProgram ? methodMap[selectedProgram.benefitType] ?? ["BANK_TRANSFER"] : ["BANK_TRANSFER"];
  const isCash = method === "BANK_TRANSFER" || method === "MOBILE_MONEY" || method === "CASH";
  const estimatedBeneficiaryCount = selectedProgram
    ? estimateCount(segment, selectedProgram.beneficiaryCount)
    : Number(beneficiaryCountValue ?? 0);

  const mutation = useMutation({
    mutationFn: (payload: BulkDistributionPayload) =>
      bulkDistributionService.createBulkJob(payload, user?.id ?? "user_001", user?.name ?? "Amina Bello"),
    onSuccess: (response) => {
      if (!response.success || !response.data) {
        toast.error(response.message);
        return;
      }
      void queryClient.invalidateQueries({ queryKey: ["bulk-jobs"] });
      void queryClient.invalidateQueries({ queryKey: ["bulk-job", response.data.id] });
      toast.success("Bulk job created successfully");
      router.push(`/distributions/bulk/${response.data.id}`);
    },
  });

  function onSubmit(payload: FormOutput) {
    mutation.mutate({
      ...payload,
      beneficiaryCount: estimatedBeneficiaryCount,
      amount: isCash ? payload.amount : undefined,
      quantity: isCash ? undefined : payload.quantity,
    });
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
      <section className="rounded-[28px] border border-border bg-surface p-6 shadow-sm">
        <div className="grid gap-5 lg:grid-cols-2">
          <Field label="Organization" error={form.formState.errors.organizationId?.message}>
            <select
              {...form.register("organizationId", {
                onChange: () => {
                  form.setValue("programId", "");
                },
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

          <Field label="Program" error={form.formState.errors.programId?.message}>
            <select
              {...form.register("programId", {
                onChange: (event) => {
                  const nextProgram = programsData.find((program) => program.id === event.target.value);
                  const nextMethods: DistributionMethod[] = nextProgram
                    ? methodMap[nextProgram.benefitType] ?? ["BANK_TRANSFER"]
                    : ["BANK_TRANSFER"];
                  form.setValue("method", nextMethods[0]);
                },
              })}
              className={inputClassName}
            >
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
              {allowedMethods.map((allowedMethod) => (
                <option key={allowedMethod} value={allowedMethod}>
                  {allowedMethod.replaceAll("_", " ")}
                </option>
              ))}
            </select>
          </Field>

          <Field label="Scheduled Date" error={form.formState.errors.scheduledDate?.message}>
            <input {...form.register("scheduledDate")} type="datetime-local" className={inputClassName} />
          </Field>

          <Field label="Beneficiary Count Preview">
            <input value={estimatedBeneficiaryCount} disabled className={`${inputClassName} bg-surface-muted`} />
          </Field>

          {isCash ? (
            <Field label="Amount Per Beneficiary" error={form.formState.errors.amount?.message}>
              <input {...form.register("amount")} type="number" min={1} className={inputClassName} placeholder="50000" />
            </Field>
          ) : (
            <Field label="Quantity Per Beneficiary" error={form.formState.errors.quantity?.message}>
              <input {...form.register("quantity")} type="number" min={1} className={inputClassName} placeholder="1" />
            </Field>
          )}
        </div>
      </section>

      <section className="rounded-[28px] border border-border bg-surface p-6 shadow-sm">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-soft">Beneficiary segment</p>
        <h2 className="mt-2 text-xl font-semibold text-foreground">Targeting configuration</h2>
        <div className="mt-5">
          <BeneficiarySegmentSelector value={segment} onChange={(next) => form.setValue("segment", next)} />
        </div>

        {segment === "SELECTED_STATE" ? (
          <div className="mt-5 max-w-sm">
            <Field label="State" error={form.formState.errors.state?.message}>
              <select {...form.register("state")} className={inputClassName}>
                <option value="">Select state</option>
                {stateOptions.map((state) => (
                  <option key={state} value={state}>
                    {state}
                  </option>
                ))}
              </select>
            </Field>
          </div>
        ) : null}

        {segment === "CUSTOM_UPLOAD" ? (
          <div className="mt-5 rounded-3xl border border-dashed border-border bg-surface-muted p-5">
            <p className="text-sm font-semibold text-foreground">Mock uploaded list</p>
            <p className="mt-2 text-sm text-muted">Drag and drop area placeholder for enterprise custom beneficiary uploads. Parsing is mocked in this phase.</p>
            <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center">
              <button
                type="button"
                onClick={() => form.setValue("mockUploadFileName", "custom-beneficiary-list-june.csv")}
                className="inline-flex h-11 items-center rounded-2xl border border-border px-4 text-sm font-medium text-foreground"
              >
                Simulate Upload
              </button>
              <p className="text-sm text-muted">
                {mockUploadFileNameValue?.trim() ? `Uploaded: ${mockUploadFileNameValue}` : "No file selected yet"}
              </p>
            </div>
            {form.formState.errors.mockUploadFileName?.message ? (
              <p className="mt-2 text-sm text-red-600">{form.formState.errors.mockUploadFileName.message}</p>
            ) : null}
          </div>
        ) : null}
      </section>

      <BulkReviewSummary
        values={{
          organizationId: organizationId ?? "",
          programId: programId ?? "",
          method,
          segment,
          state: stateValue ?? "",
          beneficiaryCount: estimatedBeneficiaryCount,
          amount: amountValue !== undefined && amountValue !== null && amountValue !== "" ? Number(amountValue) : undefined,
          quantity: quantityValue !== undefined && quantityValue !== null && quantityValue !== "" ? Number(quantityValue) : undefined,
          scheduledDate: scheduledDateValue ?? "",
          mockUploadFileName: mockUploadFileNameValue ?? "",
        }}
        organizationName={organizationsData.find((organization) => organization.id === organizationId)?.name}
        programName={selectedProgram?.name}
        benefitType={selectedProgram?.benefitType}
      />

      <div className="flex justify-end">
        <button
          type="submit"
          disabled={mutation.isPending}
          className="inline-flex h-11 items-center rounded-2xl bg-accent px-5 text-sm font-semibold text-accent-foreground disabled:opacity-60"
        >
          {mutation.isPending ? "Submitting..." : "Submit Bulk Job"}
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
