"use client";

import { useEffect, useState } from "react";
import type { ReactNode } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowLeftRight, GripHorizontal, Pencil, Plus, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { PermissionDeniedState } from "@/components/shared/permission-denied-state";
import { EmptyState } from "@/components/ui/empty-state";
import { LoadingState } from "@/components/ui/loading-state";
import { PageContainer } from "@/components/ui/page-container";
import { PageHeader } from "@/components/ui/page-header";
import { agencyApprovalRoles } from "@/features/programs/schemas/program.schema";
import { mockUsers } from "@/mock/auth.mock";
import { programService } from "@/services/program.service";
import { useAuthStore } from "@/store/auth.store";
import type { AgencyApprovalRole, DistributionApprovalTemplateStep } from "@/types/program";

const agencyApprovalRoleLabels: Record<AgencyApprovalRole, string> = {
  ORGANIZATION_MANAGER: "Agency Manager",
  STORE_MANAGER: "Store Keeper",
  DISTRIBUTION_MANAGER: "Distribution Manager",
  AGENCY_ACCOUNTANT: "Agency Accountant",
};

const agencyApprovalUsers = mockUsers.filter((user) =>
  ["ORGANIZATION_MANAGER", "STORE_MANAGER", "DISTRIBUTION_MANAGER", "AGENCY_ACCOUNTANT"].includes(user.role),
);

function createApprovalStep(role: AgencyApprovalRole): DistributionApprovalTemplateStep {
  return {
    id: `distribution_approval_step_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
    order: 1,
    role,
    assigneeUserId: "",
    assigneeName: "",
    assigneeEmail: "",
  };
}

export function ProgramDistributionApprovalModule({ id, from }: { id: string; from?: string | null }) {
  const role = useAuthStore((state) => state.role);
  const router = useRouter();
  const queryClient = useQueryClient();
  const [steps, setSteps] = useState<DistributionApprovalTemplateStep[]>([]);
  const [draggedStepId, setDraggedStepId] = useState<string | null>(null);
  const programQuery = useQuery({
    queryKey: ["program", id],
    queryFn: () => programService.getProgramById(id),
  });

  const mutation = useMutation({
    mutationFn: (payload: DistributionApprovalTemplateStep[]) =>
      programService.updateDistributionApprovalSteps(id, payload),
    onSuccess: (response) => {
      if (!response.success) {
        toast.error(response.message);
        return;
      }
      toast.success(response.message);
      void queryClient.invalidateQueries({ queryKey: ["program", id] });
      void queryClient.invalidateQueries({ queryKey: ["programs"] });
      router.push(from || `/programs/${id}`);
    },
  });

  const program = programQuery.data?.data;

  useEffect(() => {
    if (!program) {
      return;
    }

    if (program.distributionApprovalSteps?.length) {
      setSteps(program.distributionApprovalSteps);
      return;
    }

    setSteps([createApprovalStep("ORGANIZATION_MANAGER")]);
  }, [program]);

  if (role !== "ORG_ADMIN") {
    return (
      <PageContainer>
        <PermissionDeniedState title="Agency approval setup denied" description="Only agency administrators can manage benefit distribution approval steps." />
      </PageContainer>
    );
  }

  if (programQuery.isLoading) {
    return (
      <PageContainer>
        <LoadingState title="Loading agency approval setup" lines={5} />
      </PageContainer>
    );
  }

  if (!program) {
    return (
      <PageContainer>
        <EmptyState title="Intervention not found" description="The selected intervention could not be loaded for agency approval setup." />
      </PageContainer>
    );
  }

  function sync(next: DistributionApprovalTemplateStep[]) {
    setSteps(next.map((step, index) => ({ ...step, order: index + 1 })));
  }

  function updateStep(index: number, patch: Partial<DistributionApprovalTemplateStep>) {
    const next = [...steps];
    next[index] = { ...next[index], ...patch };
    sync(next);
  }

  function addStep() {
    sync([...steps, createApprovalStep("ORGANIZATION_MANAGER")]);
  }

  function removeStep(index: number) {
    if (steps.length === 1) {
      toast.error("At least one agency approval step is required.");
      return;
    }
    sync(steps.filter((_, itemIndex) => itemIndex !== index));
  }

  function moveStep(fromIndex: number, toIndex: number) {
    if (fromIndex === toIndex) return;
    const next = [...steps];
    const [moved] = next.splice(fromIndex, 1);
    next.splice(toIndex, 0, moved);
    sync(next);
  }

  return (
    <PageContainer>
      <PageHeader
        title="Agency Approval Steps"
        description={`Configure draggable agency approval steps for benefit distributions created from ${program.name}.`}
      />

      <section className="rounded-[32px] border border-border bg-surface p-6 shadow-sm">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-soft">Template setup</p>
            <h2 className="mt-2 text-xl font-semibold text-foreground">Benefit distribution agency approval flow</h2>
          </div>
          <button
            type="button"
            onClick={addStep}
            className="inline-flex h-11 items-center justify-center gap-2 rounded-2xl border border-border px-4 text-sm font-semibold text-foreground"
          >
            <Plus size={16} />
            Add Step
          </button>
        </div>

        <div className="mt-5 flex gap-4 overflow-x-auto pb-2">
          {steps.map((step, index) => {
            const assignees = agencyApprovalUsers.filter((user) => user.role === step.role);

            return (
              <div
                key={step.id}
                draggable
                onDragStart={() => setDraggedStepId(step.id)}
                onDragOver={(event) => event.preventDefault()}
                onDrop={() => {
                  if (!draggedStepId) return;
                  const draggedIndex = steps.findIndex((item) => item.id === draggedStepId);
                  if (draggedIndex >= 0) moveStep(draggedIndex, index);
                  setDraggedStepId(null);
                }}
                className="min-w-[320px] rounded-[24px] border border-border bg-background p-4 shadow-sm"
              >
                <div className="flex items-center justify-between gap-3">
                  <div className="inline-flex items-center gap-2 rounded-full bg-accent/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-accent">
                    <GripHorizontal size={14} />
                    Step {index + 1}
                  </div>
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
                      onClick={() => removeStep(index)}
                      className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-danger/20 text-danger"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>

                <div className="mt-4 space-y-4">
                  <Field label="Agency Approval Role">
                    <select
                      value={step.role}
                      onChange={(event) =>
                        updateStep(index, {
                          role: event.target.value as AgencyApprovalRole,
                          assigneeUserId: "",
                          assigneeName: "",
                          assigneeEmail: "",
                        })}
                      className={inputClassName}
                    >
                      {agencyApprovalRoles.map((item) => (
                        <option key={item} value={item}>
                          {agencyApprovalRoleLabels[item]}
                        </option>
                      ))}
                    </select>
                  </Field>

                  <Field label="Assigned User">
                    <select
                      value={step.assigneeUserId}
                      onChange={(event) => {
                        const assignee = assignees.find((user) => user.id === event.target.value);
                        updateStep(index, {
                          assigneeUserId: assignee?.id ?? "",
                          assigneeName: assignee?.name ?? "",
                          assigneeEmail: assignee?.email ?? "",
                        });
                      }}
                      className={inputClassName}
                    >
                      <option value="">Select assignee</option>
                      {assignees.map((assignee) => (
                        <option key={assignee.id} value={assignee.id}>
                          {assignee.name}
                        </option>
                      ))}
                    </select>
                  </Field>
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-6 flex justify-end">
          <button
            type="button"
            onClick={() => mutation.mutate(steps)}
            disabled={mutation.isPending}
            className="inline-flex h-12 items-center justify-center gap-2 rounded-2xl bg-accent px-5 text-sm font-semibold text-accent-foreground disabled:opacity-60"
          >
            <Pencil size={16} />
            {mutation.isPending ? "Saving..." : "Save Agency Approval Steps"}
          </button>
        </div>
      </section>
    </PageContainer>
  );
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-medium text-foreground">{label}</span>
      {children}
    </label>
  );
}

const inputClassName =
  "focus-ring h-12 w-full rounded-2xl border border-border bg-background px-4 text-sm text-foreground";
