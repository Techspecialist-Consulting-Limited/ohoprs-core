"use client";

import { useEffect, useId, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { ArrowLeftRight, Check, ChevronDown, GripHorizontal, Plus, Trash2 } from "lucide-react";
import { useForm, useWatch } from "react-hook-form";
import { toast } from "sonner";
import type { z } from "zod";

import { organizationsData } from "@/mock/organizations.mock";
import { fundingSourceOptions } from "@/mock/programs.mock";
import { mockUsers } from "@/mock/auth.mock";
import { getStatesForRegions, nigeriaRegions } from "@/constants/nigeria-regions";
import { formatCurrency, formatNumber } from "@/lib/formatters";
import {
  benefitTypes,
  programSchema,
  programStatuses,
  systemApprovalRoles,
} from "@/features/programs/schemas/program.schema";
import { programService } from "@/services/program.service";
import { useAuthStore } from "@/store/auth.store";
import type {
  ProgramApprovalStep,
  ProgramFundingSource,
  ProgramPayload,
  ProgramStatus,
  SystemApprovalRole,
} from "@/types/program";

type ProgramFormValues = z.input<typeof programSchema>;
type ProgramSubmitValues = z.output<typeof programSchema>;

type StepConfig = {
  id: string;
  title: string;
  description: string;
  fields?: string[];
};

const approvalRoleLabels: Record<SystemApprovalRole, string> = {
  SYSTEM_ACCOUNTANT: "System Accountant",
  DIRECTOR: "Director",
};

const statusLabels: Record<ProgramStatus, string> = {
  IN_PROGRESS: "In Progress",
  COMPLETED: "Completed",
  REJECTED: "Rejected",
  APPROVED: "Approved",
  ACTIVE: "Active",
  SUSPENDED: "Suspended",
};

const manualProgramStatuses: ProgramStatus[] = ["IN_PROGRESS", "SUSPENDED"];

const systemApprovalUsers = mockUsers.filter((user) =>
  [
    "SYSTEM_ACCOUNTANT",
    "DIRECTOR",
  ].includes(user.role),
);

const programSteps: StepConfig[] = [
  {
    id: "basic",
    title: "Basic Information",
    description: "Intervention identity and ownership.",
    fields: ["name", "organizationId", "benefitType", "status", "description"],
  },
  {
    id: "funding",
    title: "Funding Source",
    description: "Choose sponsors and funding sources.",
    fields: ["fundingSources"],
  },
  {
    id: "schedule",
    title: "Schedule",
    description: "Duration and timing setup.",
    fields: ["duration", "startDate", "endDate"],
  },
  {
    id: "benefit",
    title: "Benefit Setup",
    description: "Configure benefit value and structure.",
    fields: ["amount", "budget", "numberOfTrenches", "batch", "amountPerRecipient"],
  },
  {
    id: "coverage",
    title: "Coverage",
    description: "Recipients, regions, and states.",
    fields: ["recipientCount", "regions", "states"],
  },
  {
    id: "approval",
    title: "Approval Flow",
    description: "Arrange approval steps and assignees.",
    fields: ["approvalSteps"],
  },
  {
    id: "review",
    title: "Review",
    description: "Confirm before saving.",
  },
];

function formatDateForInput(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function getTodayDateForInput() {
  return formatDateForInput(new Date());
}

function addDurationToDate(startDate: string, duration: ProgramFormValues["duration"]) {
  if (!startDate) {
    return "";
  }

  const years = Number(duration.years ?? 0);
  const months = Number(duration.months ?? 0);
  const weeks = Number(duration.weeks ?? 0);
  const days = Number(duration.days ?? 0);

  const nextDate = new Date(`${startDate}T00:00:00`);
  if (Number.isNaN(nextDate.getTime())) {
    return "";
  }

  nextDate.setFullYear(nextDate.getFullYear() + years);
  nextDate.setMonth(nextDate.getMonth() + months);
  nextDate.setDate(nextDate.getDate() + weeks * 7 + days);
  return formatDateForInput(nextDate);
}

function createApprovalStep(role: SystemApprovalRole): ProgramApprovalStep {
  return {
    id: `approval_step_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
    order: 1,
    role,
    assigneeUserId: "",
    assigneeName: "",
    assigneeEmail: "",
    status: "PENDING",
    approvedAt: null,
  };
}

function formatNumericInput(value: number | string | null | undefined) {
  if (value === null || value === undefined || value === "") {
    return "";
  }

  const normalized = typeof value === "number" ? value : Number(String(value).replaceAll(",", ""));
  if (Number.isNaN(normalized)) {
    return "";
  }

  return formatNumber(normalized);
}

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
  const currentUser = useAuthStore((state) => state.user);
  const customFundingId = useId();
  const [customFundingName, setCustomFundingName] = useState("");
  const [draggedStepId, setDraggedStepId] = useState<string | null>(null);
  const [isStateSelectorOpen, setIsStateSelectorOpen] = useState(false);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [completedStepIds, setCompletedStepIds] = useState<string[]>([]);
  const [fundingOptions, setFundingOptions] = useState<ProgramFundingSource[]>(() => [...fundingSourceOptions]);
  const todayDate = getTodayDateForInput();

  const form = useForm<ProgramFormValues>({
    resolver: zodResolver(programSchema),
    defaultValues: {
      name: initialValues?.name ?? "",
      organizationId: initialValues?.organizationId ?? defaultOrganizationId ?? "",
      benefitType: initialValues?.benefitType ?? "CASH",
      description: initialValues?.description ?? "",
      startDate: initialValues?.startDate ?? "",
      endDate: initialValues?.endDate ?? "",
      duration: initialValues?.duration ?? {
        days: 0,
        weeks: 0,
        months: 0,
        years: 0,
      },
      recipientCount: initialValues?.recipientCount ?? 0,
      amountPerRecipient: initialValues?.amountPerRecipient ?? null,
      regions: initialValues?.regions ?? [],
      states: initialValues?.states ?? [],
      amount: initialValues?.amount ?? null,
      budget: initialValues?.budget ?? 0,
      numberOfTrenches: initialValues?.numberOfTrenches ?? null,
      batch: initialValues?.batch ?? 0,
      fundingSources: initialValues?.fundingSources ?? [fundingSourceOptions[0]],
      status: initialValues?.status ?? "IN_PROGRESS",
      approvalSteps:
        initialValues?.approvalSteps?.length
          ? initialValues.approvalSteps
          : [createApprovalStep("DIRECTOR")],
      distributionApprovalSteps: initialValues?.distributionApprovalSteps ?? [],
    },
  });

  const selectedBenefitType = useWatch({ control: form.control, name: "benefitType" });
  const selectedStatus = useWatch({ control: form.control, name: "status" });
  const selectedStartDate = useWatch({ control: form.control, name: "startDate" });
  const duration = useWatch({ control: form.control, name: "duration" });
  const amountValue = useWatch({ control: form.control, name: "amount" });
  const budgetValue = useWatch({ control: form.control, name: "budget" });
  const amountPerRecipientValue = useWatch({ control: form.control, name: "amountPerRecipient" });
  const selectedRegions = useWatch({ control: form.control, name: "regions" }) ?? [];
  const selectedStates = useWatch({ control: form.control, name: "states" }) ?? [];
  const selectedFundingSources = useWatch({ control: form.control, name: "fundingSources" });
  const approvalSteps = useWatch({ control: form.control, name: "approvalSteps" });
  const formSnapshot = useWatch({ control: form.control });

  const activeStep = programSteps[currentStepIndex];
  const isLastStep = currentStepIndex === programSteps.length - 1;
  const isFirstStep = currentStepIndex === 0;
  const isCashBenefit = selectedBenefitType === "CASH";
  const isLocked = mode === "edit" && (selectedStatus === "APPROVED" || selectedStatus === "ACTIVE");
  const canEditCustomFunding =
    !isLocked &&
    (mode === "create" ||
      selectedFundingSources.some(
        (source) => source.isCustom && source.createdByUserId === currentUser?.id,
      ));

  const availableStates = useMemo(() => getStatesForRegions(selectedRegions), [selectedRegions]);
  const availableStateSet = useMemo(() => new Set(availableStates), [availableStates]);
  const allVisibleStatesSelected =
    availableStates.length > 0 && availableStates.every((state) => selectedStates.includes(state));
  const selectedStatesLabel =
    selectedStates.length === 0
      ? "Select states"
      : selectedStates.length <= 3
        ? selectedStates.join(", ")
        : `${selectedStates.length} states selected`;
  const selectedFundingIds = useMemo(
    () => new Set(selectedFundingSources.map((source) => source.id)),
    [selectedFundingSources],
  );
  const formattedAmountValue = useMemo(
    () => formatNumericInput(typeof amountValue === "number" || typeof amountValue === "string" ? amountValue : null),
    [amountValue],
  );
  const formattedBudgetValue = useMemo(
    () => formatNumericInput(typeof budgetValue === "number" || typeof budgetValue === "string" ? budgetValue : null),
    [budgetValue],
  );
  const formattedAmountPerRecipientValue = useMemo(
    () =>
      formatNumericInput(
        typeof amountPerRecipientValue === "number" || typeof amountPerRecipientValue === "string"
          ? amountPerRecipientValue
          : null,
      ),
    [amountPerRecipientValue],
  );
  const selectedAssigneeIds = useMemo(
    () => new Set(approvalSteps.map((step) => step.assigneeUserId).filter(Boolean)),
    [approvalSteps],
  );

  useEffect(() => {
    if (!selectedStartDate) {
      return;
    }

    const computedEndDate = addDurationToDate(selectedStartDate, duration);
    form.setValue("endDate", computedEndDate, { shouldValidate: true, shouldDirty: true });
  }, [duration, form, selectedStartDate]);

  useEffect(() => {
    if (isCashBenefit) {
      form.setValue("budget", null, { shouldDirty: true });
      form.setValue("batch", null, { shouldDirty: true });
      if (form.getValues("amount") === null) {
        form.setValue("amount", 0, { shouldDirty: true });
      }
      if (form.getValues("numberOfTrenches") === null) {
        form.setValue("numberOfTrenches", 0, { shouldDirty: true });
      }
      return;
    }

    form.setValue("amount", null, { shouldDirty: true });
    form.setValue("numberOfTrenches", null, { shouldDirty: true });
    if (form.getValues("budget") === null) {
      form.setValue("budget", 0, { shouldDirty: true });
    }
    if (form.getValues("batch") === null) {
      form.setValue("batch", 0, { shouldDirty: true });
    }
  }, [form, isCashBenefit]);

  useEffect(() => {
    const currentStates = form.getValues("states") ?? [];
    const nextStates = currentStates.filter((state) => availableStateSet.has(state));

    if (nextStates.length !== currentStates.length) {
      form.setValue("states", nextStates, { shouldDirty: true, shouldValidate: true });
    }
  }, [availableStateSet, form]);

  useEffect(() => {
    if (availableStates.length === 0) {
      setIsStateSelectorOpen(false);
    }
  }, [availableStates.length]);

  const mutation = useMutation({
    mutationFn: async (values: ProgramSubmitValues) => {
      const payload: ProgramPayload = {
        ...values,
        recipientCount: values.recipientCount,
        amountPerRecipient: values.amountPerRecipient ?? null,
        regions: values.regions ?? [],
        states: values.states ?? [],
        amount: values.amount ?? null,
        budget: values.budget ?? null,
        numberOfTrenches: values.numberOfTrenches ?? null,
        batch: values.batch ?? null,
        createdByUserId: initialValues?.createdByUserId ?? currentUser?.id ?? null,
      };

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
      toast.error("Unable to save intervention.");
    },
  });

  const inputClassName =
    "focus-ring h-12 w-full rounded-2xl border border-border bg-background px-4 text-sm text-foreground placeholder:text-muted-soft disabled:cursor-not-allowed disabled:bg-surface-muted";

  function onSubmit(values: ProgramFormValues) {
    if (!isLastStep) {
      setCurrentStepIndex(programSteps.length - 1);
      return;
    }

    mutation.mutate({
      name: values.name,
      organizationId: values.organizationId,
      benefitType: values.benefitType,
      description: values.description,
      startDate: values.startDate ?? "",
      endDate: values.endDate ?? "",
      duration: {
        days: Number(values.duration.days),
        weeks: Number(values.duration.weeks),
        months: Number(values.duration.months),
        years: Number(values.duration.years),
      },
      recipientCount: Number(values.recipientCount ?? 0),
      amountPerRecipient: Number(values.amountPerRecipient ?? 0),
      regions: values.regions ?? [],
      states: values.states ?? [],
      amount: isCashBenefit ? Number(values.amount ?? 0) : null,
      budget: isCashBenefit ? null : Number(values.budget ?? 0),
      numberOfTrenches: isCashBenefit ? Number(values.numberOfTrenches ?? 0) : null,
      batch: isCashBenefit ? null : Number(values.batch ?? 0),
      fundingSources: values.fundingSources,
      status: values.status,
      approvalSteps: values.approvalSteps.map((step, index) => ({
        ...step,
        order: index + 1,
        status: step.status ?? "PENDING",
        approvedAt: step.approvedAt ?? null,
      })),
      distributionApprovalSteps: (values.distributionApprovalSteps ?? []).map((step, index) => ({
        ...step,
        order: Number(step.order ?? index + 1),
      })),
      createdByUserId: values.createdByUserId ?? null,
    });
  }

  async function goToNextStep() {
    if (activeStep.fields?.length) {
      const isValid = await form.trigger(activeStep.fields as never[], { shouldFocus: true });
      if (!isValid) {
        return;
      }
    }

    setCompletedStepIds((current) => {
      if (current.includes(activeStep.id)) {
        return current;
      }

      return [...current, activeStep.id];
    });
    setCurrentStepIndex((current) => Math.min(current + 1, programSteps.length - 1));
  }

  function goToPreviousStep() {
    setCurrentStepIndex((current) => Math.max(current - 1, 0));
  }

  function goToStep(index: number) {
    const step = programSteps[index];
    const canOpen =
      index <= currentStepIndex ||
      completedStepIds.includes(step.id) ||
      completedStepIds.includes(programSteps[index - 1]?.id ?? "");

    if (canOpen) {
      setCurrentStepIndex(index);
    }
  }

  function toggleFundingSource(option: ProgramFundingSource) {
    const current = form.getValues("fundingSources");
    const exists = current.some((source) => source.id === option.id);

    const next = exists
      ? current.filter((source) => source.id !== option.id)
      : [...current, option];

    form.setValue("fundingSources", next, { shouldDirty: true, shouldValidate: true });
  }

  function toggleRegion(region: string) {
    const currentRegions = form.getValues("regions") ?? [];
    const nextRegions = currentRegions.includes(region)
      ? currentRegions.filter((item) => item !== region)
      : [...currentRegions, region];

    form.setValue("regions", nextRegions, { shouldDirty: true, shouldValidate: true });
  }

  function toggleState(state: string) {
    const currentStates = form.getValues("states") ?? [];
    const nextStates = currentStates.includes(state)
      ? currentStates.filter((item) => item !== state)
      : [...currentStates, state];

    form.setValue("states", nextStates, { shouldDirty: true, shouldValidate: true });
  }

  function toggleAllVisibleStates() {
    const currentStates = form.getValues("states") ?? [];

    if (allVisibleStatesSelected) {
      form.setValue(
        "states",
        currentStates.filter((state) => !availableStateSet.has(state)),
        { shouldDirty: true, shouldValidate: true },
      );
      return;
    }

    form.setValue(
      "states",
      Array.from(new Set([...currentStates, ...availableStates])),
      { shouldDirty: true, shouldValidate: true },
    );
  }

  function updateFormattedNumberField(
    field: "amount" | "budget" | "amountPerRecipient",
    rawValue: string,
  ) {
    const digitsOnly = rawValue.replace(/[^\d]/g, "");
    form.setValue(field, digitsOnly ? Number(digitsOnly) : null, {
      shouldDirty: true,
      shouldValidate: true,
    });
  }

  function addCustomFundingSource() {
    const nextName = customFundingName.trim();

    if (!nextName) {
      toast.error("Enter a funding source name before adding it.");
      return;
    }

    const duplicate = fundingOptions.find(
      (option) => option.name.toLowerCase() === nextName.toLowerCase(),
    );

    if (duplicate) {
      toggleFundingSource(duplicate);
      setCustomFundingName("");
      return;
    }

    const nextSource: ProgramFundingSource = {
      id: `fund_custom_${Date.now()}`,
      name: nextName,
      createdByUserId: currentUser?.id ?? null,
      isCustom: true,
    };

    fundingSourceOptions.push(nextSource);
    setFundingOptions((current) => [...current, nextSource]);
    form.setValue("fundingSources", [...form.getValues("fundingSources"), nextSource], {
      shouldDirty: true,
      shouldValidate: true,
    });
    setCustomFundingName("");
  }

  function updateApprovalStep(index: number, patch: Partial<ProgramApprovalStep>) {
    const nextSteps = [...form.getValues("approvalSteps")];
    nextSteps[index] = {
      ...nextSteps[index],
      ...patch,
    };
    form.setValue(
      "approvalSteps",
      nextSteps.map((step, stepIndex) => ({ ...step, order: stepIndex + 1 })),
      { shouldDirty: true, shouldValidate: true },
    );
  }

  function addApprovalStep() {
    const nextSteps = [...form.getValues("approvalSteps"), createApprovalStep("DIRECTOR")];
    form.setValue(
      "approvalSteps",
      nextSteps.map((step, index) => ({ ...step, order: index + 1 })),
      { shouldDirty: true, shouldValidate: true },
    );
  }

  function removeApprovalStep(index: number) {
    const current = form.getValues("approvalSteps");
    if (current.length === 1) {
      toast.error("At least one approval step is required.");
      return;
    }

    form.setValue(
      "approvalSteps",
      current
        .filter((_, itemIndex) => itemIndex !== index)
        .map((step, stepIndex) => ({ ...step, order: stepIndex + 1 })),
      { shouldDirty: true, shouldValidate: true },
    );
  }

  function moveStep(fromIndex: number, toIndex: number) {
    if (fromIndex === toIndex) {
      return;
    }

    const nextSteps = [...form.getValues("approvalSteps")];
    const [movedStep] = nextSteps.splice(fromIndex, 1);
    if (!movedStep) {
      return;
    }
    nextSteps.splice(toIndex, 0, movedStep);

    form.setValue(
      "approvalSteps",
      nextSteps.map((step, index) => ({ ...step, order: index + 1 })),
      { shouldDirty: true, shouldValidate: true },
    );
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="rounded-[32px] border border-border bg-surface p-6 shadow-sm sm:p-8">
      <div className="grid gap-8 xl:grid-cols-[260px_minmax(0,1fr)]">
        <aside className="xl:sticky xl:top-6 xl:self-start">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-soft">
            Step {currentStepIndex + 1} of {programSteps.length}
          </p>
          <h2 className="mt-3 text-2xl font-semibold text-foreground">Intervention Setup</h2>
          <p className="mt-2 text-sm text-muted">
            Break the intervention into smaller sections and progress step by step.
          </p>
          <div className="mt-6 space-y-2">
            {programSteps.map((step, index) => {
              const isActive = index === currentStepIndex;
              const isComplete = completedStepIds.includes(step.id);

              return (
                <button
                  key={step.id}
                  type="button"
                  onClick={() => goToStep(index)}
                  className={[
                    "flex w-full items-start gap-3 rounded-2xl border px-4 py-4 text-left transition",
                    isActive
                      ? "border-accent bg-accent/10"
                      : isComplete
                        ? "border-border bg-surface-muted/60"
                        : "border-transparent bg-transparent hover:border-border hover:bg-surface-muted/40",
                  ].join(" ")}
                >
                  <span
                    className={[
                      "inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-semibold",
                      isActive || isComplete ? "bg-accent text-accent-foreground" : "bg-surface-muted text-muted",
                    ].join(" ")}
                  >
                    {isComplete ? <Check size={14} /> : index + 1}
                  </span>
                  <span className="min-w-0">
                    <span className="block text-sm font-semibold text-foreground">{step.title}</span>
                    <span className="mt-1 block text-xs leading-5 text-muted">{step.description}</span>
                  </span>
                </button>
              );
            })}
          </div>
        </aside>

        <div className="space-y-6">
          <section className="rounded-[28px] border border-border bg-background/40 p-6">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-soft">
              {activeStep.title}
            </p>
            <h3 className="mt-2 text-2xl font-semibold text-foreground">
              {activeStep.title === "Review" ? "Review Intervention" : `Configure ${activeStep.title}`}
            </h3>
            <p className="mt-2 text-sm text-muted">{activeStep.description}</p>
          </section>

          {activeStep.id === "basic" ? (
            <>
              <div className="grid gap-5 md:grid-cols-2">
                <Field label="Intervention Name" error={form.formState.errors.name?.message}>
                  <input {...form.register("name")} className={inputClassName} />
                </Field>

                <Field label="Agency" error={form.formState.errors.organizationId?.message}>
                  <select
                    {...form.register("organizationId")}
                    className={inputClassName}
                    disabled={!canChooseOrganization || isLocked}
                  >
                    <option value="">Select an Agency</option>
                    {organizationsData.map((organization) => (
                      <option key={organization.id} value={organization.id}>
                        {organization.name}
                      </option>
                    ))}
                  </select>
                </Field>

                <Field label="Benefit Type" error={form.formState.errors.benefitType?.message}>
                  <select
                    {...form.register("benefitType")}
                    className={inputClassName}
                    disabled={isLocked}
                  >
                    {benefitTypes.map((benefitType) => (
                      <option key={benefitType} value={benefitType}>
                        {benefitType.replaceAll("_", " ")}
                      </option>
                    ))}
                  </select>
                </Field>

                <Field label="Status" error={form.formState.errors.status?.message}>
                  <select {...form.register("status")} className={inputClassName}>
                    {manualProgramStatuses.map((status) => (
                      <option key={status} value={status}>
                        {statusLabels[status]}
                      </option>
                    ))}
                  </select>
                </Field>
              </div>

              <Field label="Description" error={form.formState.errors.description?.message}>
                <textarea
                  {...form.register("description")}
                  className="focus-ring min-h-32 w-full rounded-2xl border border-border bg-background px-4 py-3 text-sm text-foreground"
                />
              </Field>
            </>
          ) : null}

          {activeStep.id === "schedule" ? (
            <>
              <section className="rounded-[28px] border border-border bg-background/50 p-5">
                <div>
                  <h2 className="text-base font-semibold text-foreground">Duration</h2>
                  <p className="mt-1 text-sm text-muted">
                    Leave a field at zero if that unit is not needed. Duration is required for every intervention.
                  </p>
                </div>
                <div className="mt-5 grid gap-4 md:grid-cols-4">
                  <Field label="Days" error={form.formState.errors.duration?.days?.message}>
                    <input type="number" min={0} max={27} {...form.register("duration.days")} className={inputClassName} disabled={isLocked} />
                  </Field>
                  <Field label="Weeks" error={form.formState.errors.duration?.weeks?.message}>
                    <input type="number" min={0} max={3} {...form.register("duration.weeks")} className={inputClassName} disabled={isLocked} />
                  </Field>
                  <Field label="Months" error={form.formState.errors.duration?.months?.message}>
                    <input type="number" min={0} max={11} {...form.register("duration.months")} className={inputClassName} disabled={isLocked} />
                  </Field>
                  <Field label="Years" error={form.formState.errors.duration?.years?.message}>
                    <input type="number" min={0} max={20} {...form.register("duration.years")} className={inputClassName} disabled={isLocked} />
                  </Field>
                </div>
                {form.formState.errors.duration?.message ? (
                  <p className="mt-3 text-sm text-danger">{form.formState.errors.duration.message}</p>
                ) : null}
              </section>

              <div className="grid gap-5 md:grid-cols-2">
                <Field label="Start Date" error={form.formState.errors.startDate?.message}>
                  <input type="date" min={todayDate} {...form.register("startDate")} className={inputClassName} />
                </Field>
                <Field label="End Date" error={form.formState.errors.endDate?.message}>
                  <input
                    type="date"
                    min={selectedStartDate || todayDate}
                    {...form.register("endDate")}
                    className={inputClassName}
                  />
                </Field>
              </div>
            </>
          ) : null}

          {activeStep.id === "benefit" ? (
            <>
              <section>
                <Field
                  label={isCashBenefit ? "Amount" : "Budget"}
                  error={isCashBenefit ? form.formState.errors.amount?.message : form.formState.errors.budget?.message}
                >
                  {isCashBenefit ? (
                    <input
                      type="text"
                      inputMode="numeric"
                      value={formattedAmountValue}
                      onChange={(event) => updateFormattedNumberField("amount", event.target.value)}
                      className={inputClassName}
                      disabled={isLocked}
                    />
                  ) : (
                    <input
                      type="text"
                      inputMode="numeric"
                      value={formattedBudgetValue}
                      onChange={(event) => updateFormattedNumberField("budget", event.target.value)}
                      className={inputClassName}
                      disabled={isLocked}
                    />
                  )}
                </Field>
              </section>

              <section>
                <Field
                  label={isCashBenefit ? "Number of Trenches" : "Batch"}
                  error={
                    isCashBenefit
                      ? form.formState.errors.numberOfTrenches?.message
                      : form.formState.errors.batch?.message
                  }
                >
                  <input
                    type="number"
                    min={0}
                    {...form.register(isCashBenefit ? "numberOfTrenches" : "batch")}
                    className={inputClassName}
                    disabled={isLocked}
                  />
                </Field>
              </section>

              <Field
                label="Amount to be Received"
                error={form.formState.errors.amountPerRecipient?.message}
              >
                <input
                  type="text"
                  inputMode="numeric"
                  value={formattedAmountPerRecipientValue}
                  onChange={(event) => updateFormattedNumberField("amountPerRecipient", event.target.value)}
                  className={inputClassName}
                  disabled={isLocked}
                />
              </Field>
            </>
          ) : null}

          {activeStep.id === "coverage" ? (
            <>
              <Field
                label="Total Number of Beneficiaries/Recipients"
                error={form.formState.errors.recipientCount?.message}
              >
                <input
                  type="number"
                  min={0}
                  {...form.register("recipientCount")}
                  className={inputClassName}
                  disabled={isLocked}
                />
              </Field>

              <section className="rounded-[28px] border border-border bg-background/50 p-5">
                <div>
                  <h2 className="text-base font-semibold text-foreground">Coverage Area</h2>
                  <p className="mt-1 text-sm text-muted">
                    Select the geopolitical regions and states this intervention will cover.
                  </p>
                </div>

                <div className="mt-5">
                  <Field label="Region" error={form.formState.errors.regions?.message}>
                    <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                      {nigeriaRegions.map((region) => (
                        <label
                          key={region}
                          className="flex items-start gap-3 rounded-2xl border border-border bg-surface px-4 py-3 text-sm text-foreground"
                        >
                          <input
                            type="checkbox"
                            checked={selectedRegions.includes(region)}
                            onChange={() => toggleRegion(region)}
                            disabled={isLocked}
                            className="mt-1"
                          />
                          <span>{region}</span>
                        </label>
                      ))}
                    </div>
                  </Field>
                </div>

                <div className="mt-5">
                  <Field label="States" error={form.formState.errors.states?.message}>
                    {availableStates.length > 0 ? (
                      <div className="relative">
                        <button
                          type="button"
                          onClick={() => setIsStateSelectorOpen((current) => !current)}
                          disabled={isLocked}
                          className="focus-ring flex min-h-12 w-full items-center justify-between rounded-2xl border border-border bg-background px-4 py-3 text-left text-sm text-foreground disabled:cursor-not-allowed disabled:bg-surface-muted"
                        >
                          <span className={selectedStates.length === 0 ? "text-muted-soft" : "text-foreground"}>
                            {selectedStatesLabel}
                          </span>
                          <ChevronDown
                            size={16}
                            className={isStateSelectorOpen ? "rotate-180 transition-transform" : "transition-transform"}
                          />
                        </button>

                        {isStateSelectorOpen ? (
                          <div className="absolute z-20 mt-2 max-h-80 w-full overflow-y-auto rounded-2xl border border-border bg-surface p-3 shadow-lg">
                            <label className="flex items-start gap-3 rounded-2xl px-3 py-3 text-sm font-semibold text-foreground hover:bg-surface-muted">
                              <input
                                type="checkbox"
                                checked={allVisibleStatesSelected}
                                onChange={toggleAllVisibleStates}
                                disabled={isLocked}
                                className="mt-1"
                              />
                              <span>Select all available states</span>
                            </label>
                            <div className="my-2 border-t border-border" />
                            <div className="grid gap-2 md:grid-cols-2">
                              {availableStates.map((state) => (
                                <label
                                  key={state}
                                  className="flex items-start gap-3 rounded-2xl px-3 py-3 text-sm text-foreground hover:bg-surface-muted"
                                >
                                  <input
                                    type="checkbox"
                                    checked={selectedStates.includes(state)}
                                    onChange={() => toggleState(state)}
                                    disabled={isLocked}
                                    className="mt-1"
                                  />
                                  <span>{state}</span>
                                </label>
                              ))}
                            </div>
                          </div>
                        ) : null}
                      </div>
                    ) : (
                      <div className="rounded-2xl border border-dashed border-border bg-surface px-4 py-3 text-sm text-muted">
                        Select one or more regions to choose states.
                      </div>
                    )}
                  </Field>
                </div>
              </section>
            </>
          ) : null}

          {activeStep.id === "funding" ? (
            <section className="rounded-[28px] border border-border bg-background/50 p-5">
              <div>
                <h2 className="text-base font-semibold text-foreground">Funding Source</h2>
                <p className="mt-1 text-sm text-muted">
                  Select one or more sponsors backing this intervention. Custom sources become shared mock options.
                </p>
              </div>

              <div className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                {fundingOptions.map((option) => (
                  <label
                    key={option.id}
                    className="flex items-start gap-3 rounded-2xl border border-border bg-surface px-4 py-3 text-sm text-foreground"
                  >
                    <input
                      type="checkbox"
                      checked={selectedFundingIds.has(option.id)}
                      onChange={() => toggleFundingSource(option)}
                      disabled={isLocked}
                      className="mt-1"
                    />
                    <span>{option.name}</span>
                  </label>
                ))}
              </div>

              {canEditCustomFunding ? (
                <div className="mt-5 flex flex-col gap-3 md:flex-row">
                  <input
                    id={customFundingId}
                    value={customFundingName}
                    onChange={(event) => setCustomFundingName(event.target.value)}
                    className={inputClassName}
                    placeholder="Add another funding source"
                  />
                  <button
                    type="button"
                    onClick={addCustomFundingSource}
                    className="inline-flex h-12 items-center justify-center rounded-2xl border border-border px-4 text-sm font-semibold text-foreground"
                  >
                    Add Source
                  </button>
                </div>
              ) : null}

              {form.formState.errors.fundingSources?.message ? (
                <p className="mt-3 text-sm text-danger">{form.formState.errors.fundingSources.message}</p>
              ) : null}
            </section>
          ) : null}

          {activeStep.id === "approval" ? (
            <section className="rounded-[28px] border border-border bg-background/50 p-5">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h2 className="text-base font-semibold text-foreground">Approval Steps</h2>
                  <p className="mt-1 text-sm text-muted">
                    Arrange the approval flow in order. Step 1 must be approved before Step 2, and so on.
                  </p>
                </div>
                {!isLocked ? (
                  <button
                    type="button"
                    onClick={addApprovalStep}
                    className="inline-flex h-11 items-center justify-center gap-2 rounded-2xl border border-border px-4 text-sm font-semibold text-foreground"
                  >
                    <Plus size={16} />
                    Add Step
                  </button>
                ) : null}
              </div>

              <div className="mt-5 flex gap-4 overflow-x-auto pb-2">
                {approvalSteps.map((step, index) => {
                  const assignees = systemApprovalUsers.filter((user) => user.role === step.role);

                  return (
                    <div
                      key={step.id}
                      draggable={!isLocked}
                      onDragStart={() => setDraggedStepId(step.id)}
                      onDragOver={(event) => event.preventDefault()}
                      onDrop={() => {
                        if (!draggedStepId) {
                          return;
                        }

                        const draggedIndex = approvalSteps.findIndex((item) => item.id === draggedStepId);
                        if (draggedIndex >= 0) {
                          moveStep(draggedIndex, index);
                        }
                        setDraggedStepId(null);
                      }}
                      className="min-w-[320px] rounded-[24px] border border-border bg-surface p-4 shadow-sm"
                    >
                      <div className="flex items-center justify-between gap-3">
                        <div className="inline-flex items-center gap-2 rounded-full bg-accent/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-accent">
                          <GripHorizontal size={14} />
                          Step {index + 1}
                        </div>
                        {!isLocked ? (
                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => index > 0 && moveStep(index, index - 1)}
                              className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-border text-foreground"
                            >
                              <ArrowLeftRight size={14} />
                            </button>
                            <button
                              type="button"
                              onClick={() => removeApprovalStep(index)}
                              className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-danger/20 text-danger"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        ) : null}
                      </div>

                      <div className="mt-4 space-y-4">
                        <Field label="Approval Role" error={form.formState.errors.approvalSteps?.[index]?.role?.message}>
                          <select
                            value={step.role}
                            onChange={(event) => {
                              updateApprovalStep(index, {
                                role: event.target.value as SystemApprovalRole,
                                assigneeUserId: "",
                                assigneeName: "",
                                assigneeEmail: "",
                              });
                            }}
                            className={inputClassName}
                            disabled={isLocked}
                          >
                            {systemApprovalRoles.map((role) => (
                              <option key={role} value={role}>
                                {approvalRoleLabels[role]}
                              </option>
                            ))}
                          </select>
                        </Field>

                        <Field label="Assignee" error={form.formState.errors.approvalSteps?.[index]?.assigneeUserId?.message}>
                          <select
                            value={step.assigneeUserId}
                            onChange={(event) => {
                              const assignee = assignees.find((user) => user.id === event.target.value);
                              updateApprovalStep(index, {
                                assigneeUserId: assignee?.id ?? "",
                                assigneeName: assignee?.name ?? "",
                                assigneeEmail: assignee?.email ?? "",
                              });
                            }}
                            className={inputClassName}
                            disabled={isLocked}
                          >
                            <option value="">Select assignee</option>
                            {assignees.map((assignee) => {
                              const alreadyUsed =
                                selectedAssigneeIds.has(assignee.id) && assignee.id !== step.assigneeUserId;

                              return (
                                <option key={assignee.id} value={assignee.id} disabled={alreadyUsed}>
                                  {assignee.name}
                                </option>
                              );
                            })}
                          </select>
                        </Field>

                        <div className="rounded-2xl bg-surface-muted px-4 py-3 text-sm text-muted">
                          {step.assigneeEmail ? (
                            <span>
                              Assigned to <span className="font-semibold text-foreground">{step.assigneeName}</span> ({step.assigneeEmail})
                            </span>
                          ) : (
                            <span>Select a system approver for this step.</span>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {form.formState.errors.approvalSteps?.message ? (
                <p className="mt-3 text-sm text-danger">{form.formState.errors.approvalSteps.message}</p>
              ) : null}
            </section>
          ) : null}

          {activeStep.id === "review" ? (
            <div className="space-y-4">
              <ReviewCard
                title="Basic Information"
                items={[
                  { label: "Intervention Name", value: formSnapshot.name ?? "Not provided" },
                  {
                    label: "Organization",
                    value: organizationsData.find((item) => item.id === formSnapshot.organizationId)?.name ?? "Not selected",
                  },
                  { label: "Benefit Type", value: formSnapshot.benefitType?.replaceAll("_", " ") ?? "Not selected" },
                  { label: "Status", value: formSnapshot.status ? statusLabels[formSnapshot.status as ProgramStatus] : "Not selected" },
                  { label: "Description", value: formSnapshot.description || "Not provided" },
                ]}
              />
              <ReviewCard
                title="Schedule"
                items={[
                  { label: "Start Date", value: formSnapshot.startDate || "Not set" },
                  { label: "End Date", value: formSnapshot.endDate || "Not set" },
                  {
                    label: "Duration",
                    value: `${formSnapshot.duration?.years ?? 0}y, ${formSnapshot.duration?.months ?? 0}m, ${formSnapshot.duration?.weeks ?? 0}w, ${formSnapshot.duration?.days ?? 0}d`,
                  },
                ]}
              />
              <ReviewCard
                title="Benefit Setup"
                items={[
                  { label: isCashBenefit ? "Amount" : "Budget", value: formatCurrency(Number(isCashBenefit ? formSnapshot.amount ?? 0 : formSnapshot.budget ?? 0)) },
                  { label: isCashBenefit ? "Number of Trenches" : "Batch", value: formatNumber(Number(isCashBenefit ? formSnapshot.numberOfTrenches ?? 0 : formSnapshot.batch ?? 0)) },
                  { label: "Amount to be Received", value: formatCurrency(Number(formSnapshot.amountPerRecipient ?? 0)) },
                ]}
              />
              <ReviewCard
                title="Coverage"
                items={[
                  { label: "Recipients", value: formatNumber(Number(formSnapshot.recipientCount ?? 0)) },
                  { label: "Regions", value: (formSnapshot.regions ?? []).join(", ") || "None selected" },
                  { label: "States", value: (formSnapshot.states ?? []).join(", ") || "None selected" },
                ]}
              />
              <ReviewCard
                title="Funding & Approval"
                items={[
                  {
                    label: "Funding Sources",
                    value: (formSnapshot.fundingSources ?? []).map((source) => source.name).join(", ") || "None selected",
                  },
                  {
                    label: "Approval Steps",
                    value:
                      (formSnapshot.approvalSteps ?? [])
                        .map((step, index) => `${index + 1}. ${step.role ? approvalRoleLabels[step.role as SystemApprovalRole] : "Unassigned Role"}${step.assigneeName ? ` - ${step.assigneeName}` : ""}`)
                        .join(" | ") || "No approval steps",
                  },
                ]}
              />
            </div>
          ) : null}

          <div className="flex flex-col gap-3 border-t border-border pt-6 sm:flex-row sm:items-center sm:justify-between">
            <button
              type="button"
              onClick={() => router.back()}
              className="inline-flex h-12 items-center justify-center rounded-2xl border border-border px-5 text-sm font-semibold text-foreground"
            >
              Cancel
            </button>
            <div className="flex flex-col gap-3 sm:flex-row">
              {!isFirstStep ? (
                <button
                  type="button"
                  onClick={goToPreviousStep}
                  className="inline-flex h-12 items-center justify-center rounded-2xl border border-border px-5 text-sm font-semibold text-foreground"
                >
                  Previous Step
                </button>
              ) : null}
              {!isLastStep ? (
                <button
                  type="button"
                  onClick={goToNextStep}
                  className="inline-flex h-12 items-center justify-center rounded-2xl bg-accent px-5 text-sm font-semibold text-accent-foreground"
                >
                  Next Step
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={mutation.isPending}
                  className="inline-flex h-12 items-center justify-center rounded-2xl bg-accent px-5 text-sm font-semibold text-accent-foreground disabled:opacity-60"
                >
                  {mutation.isPending ? "Saving..." : mode === "create" ? "Confirm and Create Intervention" : "Confirm and Save Changes"}
                </button>
              )}
            </div>
          </div>
        </div>
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

function ReviewCard({
  title,
  items,
}: {
  title: string;
  items: Array<{ label: string; value: string }>;
}) {
  return (
    <section className="rounded-[28px] border border-border bg-background/50 p-5">
      <h4 className="text-base font-semibold text-foreground">{title}</h4>
      <div className="mt-4 grid gap-4 md:grid-cols-2">
        {items.map((item) => (
          <div key={`${title}-${item.label}`} className="rounded-2xl bg-surface px-4 py-3">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-soft">{item.label}</p>
            <p className="mt-2 text-sm text-foreground">{item.value}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
