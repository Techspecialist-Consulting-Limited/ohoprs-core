"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { ChevronLeft, ChevronRight } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import type { ReactNode } from "react";
import { useForm, useWatch } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

import { distributionSchema } from "@/features/distributions/schemas/distribution.schema";
import { beneficiariesData } from "@/mock/beneficiaries.mock";
import { distributionService } from "@/services/distribution.service";
import { programService } from "@/services/program.service";
import { useAuthStore } from "@/store/auth.store";
import type { DistributionFormValues, DistributionPayload } from "@/types/distribution";
import { formatCurrency, formatNumber } from "@/lib/formatters";
import { cn } from "@/lib/utils";

const steps = [
  { id: "intervention", label: "Select Intervention" },
  { id: "states", label: "Select States" },
  { id: "beneficiaries", label: "Select Beneficiaries" },
  { id: "review", label: "Review" },
] as const;

type StepId = (typeof steps)[number]["id"];

const stepFields: Record<StepId, (keyof DistributionFormValues)[]> = {
  intervention: ["programId", "phaseNumber"],
  states: ["states"],
  beneficiaries: ["beneficiaryIds"],
  review: [],
};

function maskAccountNumber(value: string) {
  return `${value.slice(0, 4)}***${value.slice(-4)}`;
}

function bankNameForIndex(index: number) {
  return ["Access Bank", "UBA", "Zenith Bank", "First Bank", "Moniepoint"][index % 5];
}

function accountNumberForIndex(index: number) {
  return `01${String(10000000 + index).slice(-8)}`;
}

export function DistributionForm({
  mode,
  distributionId,
  initialValues,
  defaultOrganizationId,
}: {
  mode: "create" | "edit";
  distributionId?: string;
  initialValues?: DistributionFormValues;
  defaultOrganizationId?: string;
}) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const user = useAuthStore((state) => state.user);
  const role = useAuthStore((state) => state.role);
  const [currentStep, setCurrentStep] = useState(0);
  const [beneficiaryPage, setBeneficiaryPage] = useState(1);
  const [showApprovalRequiredModal, setShowApprovalRequiredModal] = useState(false);
  type DistributionFormInput = z.input<typeof distributionSchema>;
  type DistributionFormOutput = z.output<typeof distributionSchema>;

  const form = useForm<DistributionFormInput, unknown, DistributionFormOutput>({
    resolver: zodResolver(distributionSchema),
    defaultValues: initialValues ?? {
      programId: "",
      phaseNumber: 0,
      states: [],
      beneficiaryIds: [],
    },
  });

  const programId = useWatch({ control: form.control, name: "programId" });
  const phaseNumber = Number(useWatch({ control: form.control, name: "phaseNumber" }) ?? 0);
  const selectedStates = (useWatch({ control: form.control, name: "states" }) ?? []) as string[];
  const selectedBeneficiaryIds = (useWatch({ control: form.control, name: "beneficiaryIds" }) ?? []) as string[];
  const availablePrograms = useMemo(
    () =>
      programService.getProgramOptions({
        organizationId: defaultOrganizationId ?? user?.organizationId ?? null,
        eligibleForDistribution: true,
      }),
    [defaultOrganizationId, user?.organizationId],
  );
  const selectedProgram = programId ? programService.getProgramSnapshot(programId) : null;
  const hasDistributionApprovalSteps = Boolean(selectedProgram?.distributionApprovalSteps?.length);
  const phaseTypeLabel = selectedProgram?.benefitType === "CASH" ? "Trench" : "Batch";
  const phaseCount = selectedProgram
    ? selectedProgram.benefitType === "CASH"
      ? selectedProgram.numberOfTrenches ?? 0
      : selectedProgram.batch ?? 0
    : 0;
  const unavailablePhaseNumbers = programId ? distributionService.getUnavailablePhaseNumbers(programId) : [];
  const availablePhaseNumbers = Array.from({ length: phaseCount }, (_, index) => index + 1).filter(
    (item) => !unavailablePhaseNumbers.includes(item) || item === phaseNumber,
  );
  const availableStates = selectedProgram?.states ?? [];
  const eligibleBeneficiaries = useMemo(() => {
    if (!selectedProgram || selectedStates.length === 0) {
      return [];
    }

    return beneficiariesData
      .filter((item) => item.organizationId === selectedProgram.organizationId)
      .filter((item) => item.programIds.includes(selectedProgram.id))
      .filter((item) => selectedStates.includes(item.state))
      .map((item, index) => ({
        id: item.id,
        fullName: item.fullName,
        state: item.state,
        lga: item.lga,
        address: item.address,
        phone: item.phone,
        nin: item.nin,
        bankName: bankNameForIndex(index),
        accountNumber: accountNumberForIndex(index),
      }));
  }, [selectedProgram, selectedStates]);
  const pageSize = 10;
  const totalBeneficiaryPages = Math.max(1, Math.ceil(eligibleBeneficiaries.length / pageSize));
  const visibleBeneficiaries = eligibleBeneficiaries.slice((beneficiaryPage - 1) * pageSize, beneficiaryPage * pageSize);
  const selectedBeneficiaryCount = selectedBeneficiaryIds.length;
  const selectAllChecked =
    eligibleBeneficiaries.length > 0 && eligibleBeneficiaries.every((beneficiary) => selectedBeneficiaryIds.includes(beneficiary.id));
  const estimatedAmount =
    selectedProgram?.benefitType === "CASH"
      ? selectedBeneficiaryCount * (selectedProgram.amountPerRecipient ?? 0)
      : null;
  const isSuperAdmin = role === "SUPER_ADMIN";

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

  function toggleState(state: string) {
    const next = selectedStates.includes(state)
      ? selectedStates.filter((item) => item !== state)
      : [...selectedStates, state];

    form.setValue("states", next, { shouldValidate: true, shouldDirty: true });
    form.setValue("beneficiaryIds", [], { shouldValidate: true, shouldDirty: true });
    setBeneficiaryPage(1);
  }

  function toggleAllStates() {
    const next = selectedStates.length === availableStates.length ? [] : availableStates;
    form.setValue("states", next, { shouldValidate: true, shouldDirty: true });
    form.setValue("beneficiaryIds", [], { shouldValidate: true, shouldDirty: true });
    setBeneficiaryPage(1);
  }

  function toggleBeneficiary(id: string) {
    const next = selectedBeneficiaryIds.includes(id)
      ? selectedBeneficiaryIds.filter((item) => item !== id)
      : [...selectedBeneficiaryIds, id];

    form.setValue("beneficiaryIds", next, { shouldValidate: true, shouldDirty: true });
  }

  function toggleAllBeneficiaries() {
    const next = selectAllChecked ? [] : eligibleBeneficiaries.map((item) => item.id);
    form.setValue("beneficiaryIds", next, { shouldValidate: true, shouldDirty: true });
  }

  async function goToNextStep() {
    const stepId = steps[currentStep]?.id;

    if (!stepId) {
      return;
    }

    const fields = stepFields[stepId];
    const isValid = fields.length === 0 ? true : await form.trigger(fields);

    if (!isValid) {
      return;
    }

    if (stepId === "intervention" && selectedProgram && !hasDistributionApprovalSteps) {
      setShowApprovalRequiredModal(true);
      return;
    }

    setCurrentStep((value) => Math.min(value + 1, steps.length - 1));
  }

  function onSubmit(values: DistributionFormOutput) {
    if (currentStep < steps.length - 1) {
      setCurrentStep(steps.length - 1);
      return;
    }

    mutation.mutate(values);
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-6 xl:grid-cols-[260px_minmax(0,1fr)]">
      <aside className="rounded-[28px] border border-border bg-surface p-4 shadow-sm">
        <p className="px-3 text-xs font-semibold uppercase tracking-[0.18em] text-muted-soft">Distribution setup</p>
        <div className="mt-4 space-y-2">
          {steps.map((step, index) => {
            const isActive = index === currentStep;
            const isComplete = index < currentStep;

            return (
              <button
                key={step.id}
                type="button"
                onClick={() => {
                  if (index <= currentStep) {
                    setCurrentStep(index);
                  }
                }}
                className={cn(
                  "flex w-full items-center gap-3 rounded-2xl px-3 py-3 text-left text-sm transition",
                  isActive ? "bg-emerald-50 text-emerald-700" : "text-muted hover:bg-surface-muted",
                )}
              >
                <span
                  className={cn(
                    "inline-flex h-8 w-8 items-center justify-center rounded-full border text-xs font-semibold",
                    isActive ? "border-emerald-400 bg-white text-emerald-700" : isComplete ? "border-accent bg-accent text-accent-foreground" : "border-border text-muted",
                  )}
                >
                  {index + 1}
                </span>
                <span className="font-medium">{step.label}</span>
              </button>
            );
          })}
        </div>
      </aside>

      <section className="space-y-6">
        {currentStep === 0 ? (
          <div className="rounded-[28px] border border-border bg-surface p-6 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-soft">Step 1</p>
            <h2 className="mt-2 text-2xl font-semibold text-foreground">Select intervention</h2>
            <p className="mt-2 text-sm text-muted">Choose an assigned intervention first, then pick the available trench or batch that has not been created yet.</p>

            <div className="mt-6 grid gap-5 lg:grid-cols-2">
              <Field label="Intervention" error={form.formState.errors.programId?.message}>
                <select
                  {...form.register("programId", {
                    onChange: () => {
                      form.setValue("phaseNumber", 0);
                      form.setValue("states", []);
                      form.setValue("beneficiaryIds", []);
                      setShowApprovalRequiredModal(false);
                      setBeneficiaryPage(1);
                    },
                  })}
                  className={inputClassName}
                >
                  <option value="">Select intervention</option>
                  {availablePrograms.map((program) => (
                    <option key={program.id} value={program.id}>
                      {program.name}
                    </option>
                  ))}
                </select>
              </Field>

              <Field label={selectedProgram ? `Select ${phaseTypeLabel}` : "Select Trench / Batch"} error={form.formState.errors.phaseNumber?.message}>
                <select {...form.register("phaseNumber", { valueAsNumber: true })} className={inputClassName} disabled={!selectedProgram}>
                  <option value={0}>{selectedProgram ? `Select ${phaseTypeLabel.toLowerCase()}` : "Select intervention first"}</option>
                  {availablePhaseNumbers.map((item) => (
                    <option key={item} value={item}>
                      {phaseTypeLabel} {item}
                    </option>
                  ))}
                </select>
              </Field>
            </div>

            {selectedProgram ? (
              <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                <SummaryCard label="Benefit Type" value={selectedProgram.benefitType.replaceAll("_", " ")} />
                <SummaryCard label="Agency" value={selectedProgram.organizationName} />
                <SummaryCard label="Configured States" value={formatNumber(availableStates.length)} />
                <SummaryCard
                  label={selectedProgram.benefitType === "CASH" ? "Amount per Beneficiary" : "Recipients"}
                  value={
                    selectedProgram.benefitType === "CASH"
                      ? formatCurrency(selectedProgram.amountPerRecipient ?? 0)
                      : formatNumber(selectedProgram.recipientCount ?? 0)
                  }
                />
                <SummaryCard
                  label="Agency Approval Steps"
                  value={
                    selectedProgram.distributionApprovalSteps?.length
                      ? `${selectedProgram.distributionApprovalSteps.length} configured`
                      : "Not configured"
                  }
                />
              </div>
            ) : null}
          </div>
        ) : null}

        {currentStep === 1 ? (
          <div className="rounded-[28px] border border-border bg-surface p-6 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-soft">Step 2</p>
            <h2 className="mt-2 text-2xl font-semibold text-foreground">Select states</h2>
            <p className="mt-2 text-sm text-muted">Only states configured on the selected intervention are available here. You can select all states at once.</p>

            <div className="mt-6 rounded-3xl border border-border bg-surface-muted p-5">
              <label className="flex items-center gap-3 rounded-2xl border border-border bg-surface px-4 py-3">
                <input type="checkbox" checked={selectedStates.length === availableStates.length && availableStates.length > 0} onChange={toggleAllStates} />
                <span className="text-sm font-medium text-foreground">Select all states</span>
              </label>

              <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                {availableStates.map((state) => (
                  <label key={state} className="flex items-center gap-3 rounded-2xl border border-border bg-surface px-4 py-3">
                    <input type="checkbox" checked={selectedStates.includes(state)} onChange={() => toggleState(state)} />
                    <span className="text-sm text-foreground">{state}</span>
                  </label>
                ))}
              </div>

              {form.formState.errors.states?.message ? <p className="mt-3 text-sm text-red-600">{form.formState.errors.states.message}</p> : null}
            </div>
          </div>
        ) : null}

        {currentStep === 2 ? (
          <div className="rounded-[28px] border border-border bg-surface p-6 shadow-sm">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-soft">Step 3</p>
                <h2 className="mt-2 text-2xl font-semibold text-foreground">Select beneficiaries</h2>
                <p className="mt-2 text-sm text-muted">This list is filtered by the selected intervention and states. Select all applies to every matching beneficiary, not just this page.</p>
              </div>
              <div className="rounded-2xl border border-border bg-surface-muted px-4 py-3 text-sm text-muted">
                {formatNumber(selectedBeneficiaryCount)} selected
              </div>
            </div>

            <div className="mt-6 flex flex-wrap items-center gap-3">
              <button type="button" onClick={toggleAllBeneficiaries} className="inline-flex h-11 items-center rounded-2xl border border-border px-4 text-sm font-medium text-foreground">
                {selectAllChecked ? "Clear all beneficiaries" : "Select all beneficiaries"}
              </button>
              <p className="text-sm text-muted">
                Filtered beneficiaries: {formatNumber(eligibleBeneficiaries.length)} across {selectedStates.join(", ")}
              </p>
            </div>

            <div className="mt-6 overflow-x-auto rounded-3xl border border-border">
              <table className="min-w-full">
                <thead className="bg-surface-muted text-left text-xs font-semibold uppercase tracking-[0.16em] text-muted-soft">
                  <tr>
                    <th className="px-4 py-3">Select</th>
                    <th className="px-4 py-3">Beneficiary</th>
                    <th className="px-4 py-3">State</th>
                    {selectedProgram?.benefitType === "CASH" ? (
                      <>
                        <th className="px-4 py-3">Bank Name</th>
                        <th className="px-4 py-3">Account Number</th>
                      </>
                    ) : (
                      <>
                        <th className="px-4 py-3">LGA</th>
                        <th className="px-4 py-3">Address</th>
                      </>
                    )}
                  </tr>
                </thead>
                <tbody>
                  {visibleBeneficiaries.map((beneficiary) => (
                    <tr key={beneficiary.id} className="border-t border-border text-sm text-foreground">
                      <td className="px-4 py-3">
                        <input type="checkbox" checked={selectedBeneficiaryIds.includes(beneficiary.id)} onChange={() => toggleBeneficiary(beneficiary.id)} />
                      </td>
                      <td className="px-4 py-3">
                        <p className="font-medium text-foreground">{beneficiary.fullName}</p>
                        <p className="mt-1 text-xs text-muted">{beneficiary.phone}</p>
                      </td>
                      <td className="px-4 py-3 text-muted">{beneficiary.state}</td>
                      {selectedProgram?.benefitType === "CASH" ? (
                        <>
                          <td className="px-4 py-3 text-muted">{beneficiary.bankName}</td>
                          <td className="px-4 py-3 text-muted">
                            {isSuperAdmin ? beneficiary.accountNumber : maskAccountNumber(beneficiary.accountNumber)}
                          </td>
                        </>
                      ) : (
                        <>
                          <td className="px-4 py-3 text-muted">{beneficiary.lga}</td>
                          <td className="px-4 py-3 text-muted">{beneficiary.address}</td>
                        </>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="mt-4 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-sm text-muted">
                Showing page {beneficiaryPage} of {totalBeneficiaryPages}
              </p>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setBeneficiaryPage((page) => Math.max(1, page - 1))}
                  disabled={beneficiaryPage === 1}
                  className="inline-flex h-10 items-center rounded-2xl border border-border px-3 text-sm text-foreground disabled:opacity-50"
                >
                  Previous
                </button>
                <button
                  type="button"
                  onClick={() => setBeneficiaryPage((page) => Math.min(totalBeneficiaryPages, page + 1))}
                  disabled={beneficiaryPage === totalBeneficiaryPages}
                  className="inline-flex h-10 items-center rounded-2xl border border-border px-3 text-sm text-foreground disabled:opacity-50"
                >
                  Next
                </button>
              </div>
            </div>

            {form.formState.errors.beneficiaryIds?.message ? <p className="mt-3 text-sm text-red-600">{form.formState.errors.beneficiaryIds.message}</p> : null}
          </div>
        ) : null}

        {currentStep === 3 ? (
          <div className="rounded-[28px] border border-border bg-surface p-6 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-soft">Step 4</p>
            <h2 className="mt-2 text-2xl font-semibold text-foreground">Review</h2>
            <p className="mt-2 text-sm text-muted">Review the generated distribution details before creating the record.</p>

            <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              <SummaryCard label="Intervention" value={selectedProgram?.name ?? "-"} />
              <SummaryCard label="Trench / Batch" value={phaseNumber > 0 ? `${phaseTypeLabel} ${phaseNumber}` : "-"} />
              <SummaryCard label="States" value={selectedStates.join(", ") || "-"} />
              <SummaryCard label="Beneficiaries" value={formatNumber(selectedBeneficiaryCount)} />
            </div>

            <div className="mt-4 grid gap-4 md:grid-cols-2">
              <SummaryCard label="Agency" value={selectedProgram?.organizationName ?? "-"} />
              <SummaryCard label="Status on Create" value="Scheduled" />
              <SummaryCard label="Approval Status" value="Draft" />
              <SummaryCard
                label="Estimated Amount"
                value={selectedProgram?.benefitType === "CASH" ? formatCurrency(estimatedAmount ?? 0) : `${formatNumber(selectedBeneficiaryCount)} packages`}
              />
            </div>
          </div>
        ) : null}

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <Link href="/distributions" className="inline-flex h-11 items-center rounded-2xl border border-border px-4 text-sm font-medium text-foreground">
            Cancel
          </Link>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setCurrentStep((value) => Math.max(0, value - 1))}
              disabled={currentStep === 0}
              className="inline-flex h-11 items-center gap-2 rounded-2xl border border-border px-4 text-sm font-medium text-foreground disabled:opacity-50"
            >
              <ChevronLeft size={16} />
              Previous
            </button>

            {currentStep < steps.length - 1 ? (
              <button type="button" onClick={goToNextStep} className="inline-flex h-11 items-center gap-2 rounded-2xl bg-accent px-5 text-sm font-semibold text-accent-foreground">
                Next step
                <ChevronRight size={16} />
              </button>
            ) : (
              <button
                type="submit"
                disabled={mutation.isPending}
                className="inline-flex h-11 items-center rounded-2xl bg-accent px-5 text-sm font-semibold text-accent-foreground disabled:opacity-60"
              >
                {mutation.isPending ? "Creating..." : mode === "create" ? "Confirm and Create Benefit Distribution" : "Confirm and Save Changes"}
              </button>
            )}
          </div>
        </div>
      </section>

      {showApprovalRequiredModal && selectedProgram ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-lg rounded-[28px] border border-border bg-surface p-6 shadow-xl">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-soft">Approval steps required</p>
            <h3 className="mt-2 text-2xl font-semibold text-foreground">This intervention needs agency approval steps</h3>
            <p className="mt-3 text-sm leading-6 text-muted">
              Set up agency approval steps for <span className="font-semibold text-foreground">{selectedProgram.name}</span> before creating a benefit distribution.
            </p>
            <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={() => {
                  setShowApprovalRequiredModal(false);
                  form.setValue("programId", "", { shouldDirty: true });
                  form.setValue("phaseNumber", 0, { shouldDirty: true });
                }}
                className="inline-flex h-11 items-center justify-center rounded-2xl border border-border px-4 text-sm font-medium text-foreground"
              >
                Choose Another Intervention
              </button>
              <button
                type="button"
                onClick={() => router.push(`/programs/${selectedProgram.id}/distribution-approval`)}
                className="inline-flex h-11 items-center justify-center rounded-2xl bg-accent px-5 text-sm font-semibold text-accent-foreground"
              >
                Create Approval Steps
              </button>
            </div>
          </div>
        </div>
      ) : null}
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

function SummaryCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-3xl border border-border bg-surface-muted px-4 py-4">
      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-soft">{label}</p>
      <p className="mt-2 text-sm font-semibold text-foreground">{value}</p>
    </div>
  );
}

const inputClassName =
  "h-12 w-full rounded-2xl border border-border bg-surface px-4 text-sm text-foreground outline-none transition focus:border-accent";
