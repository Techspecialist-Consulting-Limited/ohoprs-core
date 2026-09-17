"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { PermissionDeniedState } from "@/components/shared/permission-denied-state";
import { EmptyState } from "@/components/ui/empty-state";
import { LoadingState } from "@/components/ui/loading-state";
import { PageContainer } from "@/components/ui/page-container";
import { hasPermission } from "@/lib/rbac";
import { householdService } from "@/services/household.service";
import { useAuthStore } from "@/store/auth.store";
import type { AddOutcomeRecordPayload, FoodConsumptionScore } from "@/types/household";

const foodConsumptionOptions: FoodConsumptionScore[] = ["POOR", "BORDERLINE", "ACCEPTABLE"];

export function FieldOutcomeFormModule({ id }: { id: string }) {
  const role = useAuthStore((state) => state.role);
  const user = useAuthStore((state) => state.user);
  const router = useRouter();
  const queryClient = useQueryClient();

  const householdQuery = useQuery({
    queryKey: ["household", id],
    queryFn: () => householdService.getHouseholdById(id),
  });

  const household = householdQuery.data?.data;

  const [form, setForm] = useState<Omit<AddOutcomeRecordPayload, "schoolAgeChildrenCount">>({
    mealsPerDay: 2,
    childrenInSchoolCount: 0,
    monthlyIncomeEstimate: 0,
    foodConsumptionScore: "BORDERLINE",
    skillsGained: "",
    notes: "",
  });
  const [schoolAgeChildrenOverride, setSchoolAgeChildrenOverride] = useState<number | null>(null);

  const derivedSchoolAgeChildren = household
    ? household.members.filter((member) => member.relationshipToHead === "CHILD").length
    : 0;
  const schoolAgeChildrenCount = schoolAgeChildrenOverride ?? derivedSchoolAgeChildren;

  const submitMutation = useMutation({
    mutationFn: (payload: AddOutcomeRecordPayload) =>
      householdService.addOutcomeRecord(id, payload, user?.id ?? "field_officer", user?.name ?? "Field Officer"),
    onSuccess: (response) => {
      if (!response.success) {
        toast.error(response.message);
        return;
      }

      void queryClient.invalidateQueries({ queryKey: ["household", id] });
      void queryClient.invalidateQueries({ queryKey: ["field-households"] });
      toast.success(response.message);
      router.push(`/households/${id}`);
    },
    onError: () => toast.error("Unable to submit outcome feedback."),
  });

  if (householdQuery.isLoading) {
    return (
      <PageContainer>
        <LoadingState title="Loading household" lines={5} />
      </PageContainer>
    );
  }

  if (householdQuery.isError || !household) {
    return (
      <PageContainer>
        <EmptyState title="Household not found" description="The requested household could not be loaded from the mock service layer." />
      </PageContainer>
    );
  }

  if (!role || !hasPermission(role, "submit_outcome_records")) {
    return (
      <PageContainer>
        <PermissionDeniedState title="Field data access denied" description="Your role cannot submit household outcome feedback." />
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <div className="rounded-[28px] border border-border bg-surface p-6 shadow-sm">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-soft">Household Outcome Feedback</p>
        <h1 className="mt-1 text-2xl font-semibold text-foreground">{household.unifiedHouseholdId}</h1>
        <p className="mt-2 text-sm text-muted">
          {household.designatedRecipientName} — {household.address}, {household.lga}, {household.state}
        </p>
      </div>

      <form
        onSubmit={(event) => {
          event.preventDefault();
          submitMutation.mutate({ ...form, schoolAgeChildrenCount });
        }}
        className="rounded-[28px] border border-border bg-surface p-6 shadow-sm"
      >
        <div className="grid gap-6 sm:grid-cols-2">
          <label className="block">
            <span className="mb-2 block text-sm font-medium text-foreground">Meals per day</span>
            <input
              type="number"
              min={0}
              max={10}
              value={form.mealsPerDay}
              onChange={(event) => setForm((current) => ({ ...current, mealsPerDay: Number(event.target.value) }))}
              className="focus-ring h-12 w-full rounded-2xl border border-border bg-background px-4 text-sm text-foreground"
            />
          </label>

          <label className="block">
            <span className="mb-2 block text-sm font-medium text-foreground">Food consumption score</span>
            <select
              value={form.foodConsumptionScore}
              onChange={(event) => setForm((current) => ({ ...current, foodConsumptionScore: event.target.value as FoodConsumptionScore }))}
              className="focus-ring h-12 w-full rounded-2xl border border-border bg-background px-4 text-sm text-foreground"
            >
              {foodConsumptionOptions.map((option) => (
                <option key={option} value={option}>{option}</option>
              ))}
            </select>
          </label>

          <label className="block">
            <span className="mb-2 block text-sm font-medium text-foreground">School-age children in household</span>
            <input
              type="number"
              min={0}
              value={schoolAgeChildrenCount}
              onChange={(event) => setSchoolAgeChildrenOverride(Number(event.target.value))}
              className="focus-ring h-12 w-full rounded-2xl border border-border bg-background px-4 text-sm text-foreground"
            />
          </label>

          <label className="block">
            <span className="mb-2 block text-sm font-medium text-foreground">Of those, currently attending school</span>
            <input
              type="number"
              min={0}
              max={schoolAgeChildrenCount}
              value={form.childrenInSchoolCount}
              onChange={(event) => setForm((current) => ({ ...current, childrenInSchoolCount: Number(event.target.value) }))}
              className="focus-ring h-12 w-full rounded-2xl border border-border bg-background px-4 text-sm text-foreground"
            />
          </label>

          <label className="block sm:col-span-2">
            <span className="mb-2 block text-sm font-medium text-foreground">Estimated monthly household income (₦)</span>
            <input
              type="number"
              min={0}
              value={form.monthlyIncomeEstimate}
              onChange={(event) => setForm((current) => ({ ...current, monthlyIncomeEstimate: Number(event.target.value) }))}
              className="focus-ring h-12 w-full rounded-2xl border border-border bg-background px-4 text-sm text-foreground"
            />
          </label>

          <label className="block sm:col-span-2">
            <span className="mb-2 block text-sm font-medium text-foreground">Skills gained (optional)</span>
            <input
              type="text"
              value={form.skillsGained}
              onChange={(event) => setForm((current) => ({ ...current, skillsGained: event.target.value }))}
              placeholder="e.g. completed tailoring skills training"
              className="focus-ring h-12 w-full rounded-2xl border border-border bg-background px-4 text-sm text-foreground"
            />
          </label>

          <label className="block sm:col-span-2">
            <span className="mb-2 block text-sm font-medium text-foreground">Additional notes (optional)</span>
            <textarea
              value={form.notes}
              onChange={(event) => setForm((current) => ({ ...current, notes: event.target.value }))}
              rows={4}
              className="focus-ring w-full rounded-2xl border border-border bg-background px-4 py-3 text-sm text-foreground"
            />
          </label>
        </div>

        <div className="mt-6 flex flex-col gap-3 border-t border-border pt-6 sm:flex-row sm:justify-end">
          <Link
            href={`/households/${id}`}
            className="inline-flex h-12 items-center justify-center rounded-2xl border border-border px-5 text-sm font-semibold text-foreground"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={submitMutation.isPending}
            className="inline-flex h-12 items-center justify-center rounded-2xl bg-accent px-5 text-sm font-semibold text-accent-foreground disabled:opacity-60"
          >
            {submitMutation.isPending ? "Submitting..." : "Submit Feedback"}
          </button>
        </div>
      </form>
    </PageContainer>
  );
}
