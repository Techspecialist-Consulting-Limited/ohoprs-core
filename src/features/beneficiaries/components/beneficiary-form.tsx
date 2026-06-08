"use client";

import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { useForm, useWatch } from "react-hook-form";
import { toast } from "sonner";
import type { z } from "zod";

import { nigeriaStates } from "@/constants/nigeria-states";
import { organizationsData } from "@/mock/organizations.mock";
import { programsData } from "@/mock/programs.mock";
import {
  beneficiaryGenders,
  beneficiarySchema,
  benefitStatuses,
  maritalStatuses,
  verificationStatuses,
} from "@/features/beneficiaries/schemas/beneficiary.schema";
import { beneficiaryService } from "@/services/beneficiary.service";
import type { BeneficiaryPayload } from "@/types/beneficiary";

type BeneficiaryFormValues = z.input<typeof beneficiarySchema>;
type BeneficiarySubmitValues = z.output<typeof beneficiarySchema>;

export function BeneficiaryForm({
  canChooseOrganization,
  defaultOrganizationId,
  initialValues,
  isProgramOfficerEditing,
  mode,
  beneficiaryId,
}: {
  canChooseOrganization: boolean;
  defaultOrganizationId?: string;
  initialValues?: Partial<BeneficiaryFormValues>;
  isProgramOfficerEditing?: boolean;
  mode: "create" | "edit";
  beneficiaryId?: string;
}) {
  const router = useRouter();
  const form = useForm<BeneficiaryFormValues, unknown, BeneficiarySubmitValues>({
    resolver: zodResolver(beneficiarySchema),
    defaultValues: {
      firstName: initialValues?.firstName ?? "",
      lastName: initialValues?.lastName ?? "",
      middleName: initialValues?.middleName ?? "",
      nin: initialValues?.nin ?? "",
      bvn: initialValues?.bvn ?? "",
      phone: initialValues?.phone ?? "",
      email: initialValues?.email ?? "",
      gender: initialValues?.gender ?? "MALE",
      occupation: initialValues?.occupation ?? "",
      maritalStatus: initialValues?.maritalStatus ?? "SINGLE",
      householdDependents: initialValues?.householdDependents ?? 0,
      numberOfChildren: initialValues?.numberOfChildren ?? 0,
      numberOfWives: initialValues?.numberOfWives ?? 0,
      dateOfBirth: initialValues?.dateOfBirth ?? "",
      state: initialValues?.state ?? "",
      lga: initialValues?.lga ?? "",
      address: initialValues?.address ?? "",
      organizationId: initialValues?.organizationId ?? defaultOrganizationId ?? "",
      programIds: initialValues?.programIds ?? [],
      verificationStatus: initialValues?.verificationStatus ?? "PENDING",
      benefitStatus: initialValues?.benefitStatus ?? "ACTIVE",
    },
  });

  const selectedOrganizationId = useWatch({
    control: form.control,
    name: "organizationId",
  });

  const scopedPrograms = programsData.filter((program) =>
    selectedOrganizationId ? program.organizationId === selectedOrganizationId : false,
  );

  const mutation = useMutation({
    mutationFn: async (values: BeneficiarySubmitValues) => {
      const payload: BeneficiaryPayload = values;

      if (mode === "create") {
        return beneficiaryService.createBeneficiary(payload);
      }

      return beneficiaryService.updateBeneficiary(beneficiaryId!, payload);
    },
    onSuccess: (response) => {
      if (!response.success || !response.data) {
        toast.error(response.message);
        return;
      }

      toast.success(response.message);
      router.push(`/beneficiaries/${response.data.id}`);
    },
  });

  function onSubmit(values: BeneficiarySubmitValues) {
    mutation.mutate({
      ...values,
      programIds: values.programIds,
    });
  }

  const inputClassName =
    "focus-ring h-12 w-full rounded-2xl border border-border bg-background px-4 text-sm text-foreground placeholder:text-muted-soft";

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 rounded-[32px] border border-border bg-surface p-6 shadow-sm sm:p-8">
      <div className="grid gap-5 md:grid-cols-3">
        <Field label="First Name" error={form.formState.errors.firstName?.message}>
          <input {...form.register("firstName")} className={inputClassName} />
        </Field>
        <Field label="Last Name" error={form.formState.errors.lastName?.message}>
          <input {...form.register("lastName")} className={inputClassName} />
        </Field>
        <Field label="Middle Name" error={form.formState.errors.middleName?.message}>
          <input {...form.register("middleName")} className={inputClassName} />
        </Field>
      </div>

      <div className="grid gap-5 md:grid-cols-3">
        <Field label="NIN" error={form.formState.errors.nin?.message}>
          <input {...form.register("nin")} className={inputClassName} readOnly={Boolean(isProgramOfficerEditing)} />
        </Field>
        <Field label="BVN" error={form.formState.errors.bvn?.message}>
          <input {...form.register("bvn")} className={inputClassName} readOnly={Boolean(isProgramOfficerEditing)} />
        </Field>
        <Field label="Phone" error={form.formState.errors.phone?.message}>
          <input {...form.register("phone")} className={inputClassName} />
        </Field>
      </div>

      <div className="grid gap-5 md:grid-cols-3">
        <Field label="Email" error={form.formState.errors.email?.message}>
          <input type="email" {...form.register("email")} className={inputClassName} />
        </Field>
        <Field label="Gender" error={form.formState.errors.gender?.message}>
          <select {...form.register("gender")} className={inputClassName}>
            {beneficiaryGenders.map((gender) => (
              <option key={gender} value={gender}>{gender}</option>
            ))}
          </select>
        </Field>
        <Field label="Date of Birth" error={form.formState.errors.dateOfBirth?.message}>
          <input type="date" {...form.register("dateOfBirth")} className={inputClassName} />
        </Field>
      </div>

      <div className="grid gap-5 md:grid-cols-3">
        <Field label="Occupation" error={form.formState.errors.occupation?.message}>
          <input {...form.register("occupation")} className={inputClassName} />
        </Field>
        <Field label="Marital Status" error={form.formState.errors.maritalStatus?.message}>
          <select {...form.register("maritalStatus")} className={inputClassName}>
            {maritalStatuses.map((status) => (
              <option key={status} value={status}>{status}</option>
            ))}
          </select>
        </Field>
        <Field label="Household Dependents" error={form.formState.errors.householdDependents?.message}>
          <input type="number" min={0} {...form.register("householdDependents", { valueAsNumber: true })} className={inputClassName} />
        </Field>
      </div>

      <div className="grid gap-5 md:grid-cols-3">
        <Field label="Number of Children" error={form.formState.errors.numberOfChildren?.message}>
          <input type="number" min={0} {...form.register("numberOfChildren", { valueAsNumber: true })} className={inputClassName} />
        </Field>
        <Field label="Number of Wives" error={form.formState.errors.numberOfWives?.message}>
          <input type="number" min={0} {...form.register("numberOfWives", { valueAsNumber: true })} className={inputClassName} />
        </Field>
      </div>

      <div className="grid gap-5 md:grid-cols-3">
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
        <Field label="LGA" error={form.formState.errors.lga?.message}>
          <input {...form.register("lga")} className={inputClassName} />
        </Field>
        <Field label="Address" error={form.formState.errors.address?.message}>
          <input {...form.register("address")} className={inputClassName} />
        </Field>
      </div>

      <div className="grid gap-5 md:grid-cols-3">
        <Field label="Agency Benefited From" error={form.formState.errors.organizationId?.message}>
          {canChooseOrganization ? (
            <select {...form.register("organizationId")} className={inputClassName} disabled={Boolean(isProgramOfficerEditing)}>
              <option value="">Select agency</option>
              {organizationsData.map((organization) => (
                <option key={organization.id} value={organization.id}>
                  {organization.name}
                </option>
              ))}
            </select>
          ) : (
            <div className="flex h-12 items-center rounded-2xl border border-border bg-surface-muted px-4 text-sm text-foreground">
              {organizationsData.find((organization) => organization.id === selectedOrganizationId)?.name ?? "System-managed beneficiary"}
            </div>
          )}
        </Field>

        <Field label="Verification Status" error={form.formState.errors.verificationStatus?.message}>
          <select {...form.register("verificationStatus")} className={inputClassName}>
            {verificationStatuses.map((status) => (
              <option key={status} value={status}>{status}</option>
            ))}
          </select>
        </Field>

        <Field label="Benefit Status" error={form.formState.errors.benefitStatus?.message}>
          <select {...form.register("benefitStatus")} className={inputClassName}>
            {benefitStatuses.map((status) => (
              <option key={status} value={status}>{status}</option>
            ))}
          </select>
        </Field>
      </div>

      <Field label="Interventions" error={form.formState.errors.programIds?.message as string | undefined}>
        <select
          {...form.register("programIds")}
          multiple
          className="focus-ring min-h-40 w-full rounded-2xl border border-border bg-background px-4 py-3 text-sm text-foreground"
          disabled={Boolean(isProgramOfficerEditing)}
        >
          {!selectedOrganizationId ? <option value="" disabled>Select an agency first</option> : null}
          {scopedPrograms.map((program) => (
            <option key={program.id} value={program.id}>
              {program.name}
            </option>
          ))}
        </select>
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
          {mutation.isPending ? "Saving..." : mode === "create" ? "Create Beneficiary" : "Save Changes"}
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
