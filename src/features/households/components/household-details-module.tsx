"use client";

import { useState } from "react";
import Link from "next/link";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { PermissionDeniedState } from "@/components/shared/permission-denied-state";
import { EmptyState } from "@/components/ui/empty-state";
import { LoadingState } from "@/components/ui/loading-state";
import { PageContainer } from "@/components/ui/page-container";
import { formatDate } from "@/lib/formatters";
import { hasPermission } from "@/lib/rbac";
import { householdService } from "@/services/household.service";
import { useAuthStore } from "@/store/auth.store";
import type { AddHouseholdMemberPayload, HouseholdMember, HouseholdMemberRelationship, JourneyStage } from "@/types/household";
import { HouseholdJourneyStageBadge, journeyStageLabels } from "@/features/households/components/household-journey-stage-badge";
import { HouseholdMemberStatusBadge } from "@/features/households/components/household-member-status-badge";

const relationshipOptions: HouseholdMemberRelationship[] = ["HEAD", "SPOUSE", "CHILD", "DEPENDENT", "OTHER"];
const journeyStageOptions: JourneyStage[] = ["SOCIAL_REGISTER", "BENEFICIARY_REGISTER", "GRADUATED", "TRANSITIONED"];

export function HouseholdDetailsModule({ id }: { id: string }) {
  const role = useAuthStore((state) => state.role);
  const user = useAuthStore((state) => state.user);
  const queryClient = useQueryClient();
  const [showAddMember, setShowAddMember] = useState(false);
  const [statusTarget, setStatusTarget] = useState<{ member: HouseholdMember; status: "DECEASED" | "DEPARTED" } | null>(null);
  const [reason, setReason] = useState("");
  const [showStageChange, setShowStageChange] = useState(false);
  const [nextStage, setNextStage] = useState<JourneyStage>("BENEFICIARY_REGISTER");
  const [stageReason, setStageReason] = useState("");
  const [form, setForm] = useState<AddHouseholdMemberPayload>({
    fullName: "",
    relationshipToHead: "DEPENDENT",
    gender: "MALE",
    dateOfBirth: "",
    notes: "",
  });

  const householdQuery = useQuery({
    queryKey: ["household", id],
    queryFn: () => householdService.getHouseholdById(id),
  });

  const actor = user?.name ?? "Unknown user";

  const addMemberMutation = useMutation({
    mutationFn: (payload: AddHouseholdMemberPayload) => householdService.addMember(id, payload, actor),
    onSuccess: (response) => {
      if (!response.success) {
        toast.error(response.message);
        return;
      }

      void queryClient.invalidateQueries({ queryKey: ["household", id] });
      toast.success(response.message);
      setShowAddMember(false);
      setForm({ fullName: "", relationshipToHead: "DEPENDENT", gender: "MALE", dateOfBirth: "", notes: "" });
    },
    onError: () => toast.error("Unable to add household member."),
  });

  const statusMutation = useMutation({
    mutationFn: ({ memberId, status, reason: statusReason }: { memberId: string; status: "DECEASED" | "DEPARTED"; reason?: string }) =>
      householdService.updateMemberStatus(id, memberId, status, actor, statusReason),
    onSuccess: (response) => {
      if (!response.success) {
        toast.error(response.message);
        return;
      }

      void queryClient.invalidateQueries({ queryKey: ["household", id] });
      toast.success(response.message);
      setStatusTarget(null);
      setReason("");
    },
    onError: () => toast.error("Unable to update household member."),
  });

  const recipientMutation = useMutation({
    mutationFn: (memberId: string) => householdService.changeDesignatedRecipient(id, memberId, actor),
    onSuccess: (response) => {
      if (!response.success) {
        toast.error(response.message);
        return;
      }

      void queryClient.invalidateQueries({ queryKey: ["household", id] });
      toast.success(response.message);
    },
    onError: () => toast.error("Unable to update designated recipient."),
  });

  const stageMutation = useMutation({
    mutationFn: ({ toStage, reason: stageChangeReason }: { toStage: JourneyStage; reason?: string }) =>
      householdService.updateJourneyStage(id, toStage, actor, stageChangeReason),
    onSuccess: (response) => {
      if (!response.success) {
        toast.error(response.message);
        return;
      }

      void queryClient.invalidateQueries({ queryKey: ["household", id] });
      toast.success(response.message);
      setShowStageChange(false);
      setStageReason("");
    },
    onError: () => toast.error("Unable to update household journey stage."),
  });

  if (householdQuery.isLoading) {
    return (
      <PageContainer>
        <LoadingState title="Loading household" lines={5} />
      </PageContainer>
    );
  }

  const household = householdQuery.data?.data;

  if (householdQuery.isError || !household) {
    return (
      <PageContainer>
        <EmptyState title="Household not found" description="The requested household could not be loaded from the mock service layer." />
      </PageContainer>
    );
  }

  if (!role || !hasPermission(role, "view_households")) {
    return (
      <PageContainer>
        <PermissionDeniedState title="Household access denied" description="Your role cannot access the household registry." />
      </PageContainer>
    );
  }

  const canEdit = hasPermission(role, "edit_households");
  const canSubmitOutcomeRecords = hasPermission(role, "submit_outcome_records");
  const activeMembers = household.members.filter((member) => member.status === "ACTIVE");

  return (
    <PageContainer>
      <section className="rounded-[28px] border border-border bg-surface p-6 shadow-sm">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-soft">Unified Household ID</p>
            <div className="mt-1 flex flex-wrap items-center gap-3">
              <h1 className="text-2xl font-semibold text-foreground">{household.unifiedHouseholdId}</h1>
              <HouseholdJourneyStageBadge stage={household.journeyStage} />
            </div>
            <p className="mt-2 text-sm text-muted">
              {household.address}, {household.lga}, {household.state}
            </p>
            <p className="mt-1 text-sm text-muted">Agency: {household.organizationName}</p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row">
            {canEdit ? (
              <button
                type="button"
                onClick={() => {
                  setNextStage(journeyStageOptions.find((stage) => stage !== household.journeyStage) ?? household.journeyStage);
                  setShowStageChange(true);
                }}
                className="inline-flex h-11 items-center justify-center rounded-2xl bg-accent px-4 text-sm font-semibold text-accent-foreground"
              >
                Move to Another Stage
              </button>
            ) : null}
            {household.designatedRecipientBeneficiaryId ? (
              <Link
                href={`/beneficiaries/${household.designatedRecipientBeneficiaryId}`}
                className="inline-flex h-11 items-center justify-center rounded-2xl border border-border px-4 text-sm font-semibold text-foreground hover:bg-surface-muted"
              >
                View Recipient&apos;s Beneficiary Record
              </Link>
            ) : null}
          </div>
        </div>
        <div className="mt-6 grid gap-4 sm:grid-cols-3">
          <div className="rounded-2xl bg-surface-muted p-4">
            <p className="text-xs uppercase tracking-wide text-muted-soft">Designated Recipient</p>
            <p className="mt-1 text-lg font-semibold text-foreground">{household.designatedRecipientName || "Unassigned"}</p>
          </div>
          <div className="rounded-2xl bg-surface-muted p-4">
            <p className="text-xs uppercase tracking-wide text-muted-soft">Active Members</p>
            <p className="mt-1 text-lg font-semibold text-foreground">{activeMembers.length}</p>
          </div>
          <div className="rounded-2xl bg-surface-muted p-4">
            <p className="text-xs uppercase tracking-wide text-muted-soft">Total Members Recorded</p>
            <p className="mt-1 text-lg font-semibold text-foreground">{household.members.length}</p>
          </div>
        </div>
      </section>

      <section className="rounded-[28px] border border-border bg-surface p-6 shadow-sm">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-foreground">Household Members</h2>
          {canEdit ? (
            <button
              type="button"
              onClick={() => setShowAddMember(true)}
              className="inline-flex h-10 items-center justify-center rounded-2xl bg-accent px-4 text-sm font-semibold text-accent-foreground"
            >
              Add Member
            </button>
          ) : null}
        </div>

        <div className="mt-4 overflow-x-auto">
          <table className="min-w-full">
            <thead className="border-b border-border">
              <tr className="text-left text-xs font-semibold uppercase tracking-[0.16em] text-muted-soft">
                {["Name", "Relationship", "Gender", "Date of Birth", "Status", "Recipient", "Actions"].map((label) => (
                  <th key={label} className="px-4 py-3">{label}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {household.members.map((member) => (
                <tr key={member.id} className="border-b border-border last:border-b-0">
                  <td className="px-4 py-3 text-sm font-medium text-foreground">{member.fullName}</td>
                  <td className="px-4 py-3 text-sm text-muted">{member.relationshipToHead}</td>
                  <td className="px-4 py-3 text-sm text-muted">{member.gender}</td>
                  <td className="px-4 py-3 text-sm text-muted">{formatDate(member.dateOfBirth)}</td>
                  <td className="px-4 py-3"><HouseholdMemberStatusBadge status={member.status} /></td>
                  <td className="px-4 py-3 text-sm text-muted">{member.isDesignatedRecipient ? "Yes" : "No"}</td>
                  <td className="px-4 py-3">
                    {canEdit && member.status === "ACTIVE" ? (
                      <div className="flex flex-wrap gap-2">
                        {!member.isDesignatedRecipient && member.beneficiaryId ? (
                          <button
                            type="button"
                            onClick={() => recipientMutation.mutate(member.id)}
                            className="rounded-lg border border-border px-2.5 py-1 text-xs font-semibold text-foreground hover:bg-surface-muted"
                          >
                            Set as Recipient
                          </button>
                        ) : null}
                        <button
                          type="button"
                          onClick={() => setStatusTarget({ member, status: "DEPARTED" })}
                          className="rounded-lg border border-border px-2.5 py-1 text-xs font-semibold text-foreground hover:bg-surface-muted"
                        >
                          Mark Departed
                        </button>
                        <button
                          type="button"
                          onClick={() => setStatusTarget({ member, status: "DECEASED" })}
                          className="rounded-lg border border-danger/30 px-2.5 py-1 text-xs font-semibold text-danger hover:bg-danger/10"
                        >
                          Mark Deceased
                        </button>
                      </div>
                    ) : null}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="rounded-[28px] border border-border bg-surface p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-foreground">Membership Change Log</h2>
        {household.changeLog.length ? (
          <ul className="mt-4 space-y-3">
            {household.changeLog.map((entry) => (
              <li key={entry.id} className="rounded-2xl bg-surface-muted px-4 py-3 text-sm text-muted">
                <span className="font-semibold text-foreground">{entry.memberName}</span> — {entry.action.replaceAll("_", " ").toLowerCase()} by {entry.actor} on {formatDate(entry.timestamp)}
                {entry.reason ? <span className="block text-xs">Reason: {entry.reason}</span> : null}
              </li>
            ))}
          </ul>
        ) : (
          <p className="mt-4 text-sm text-muted">No membership changes recorded yet.</p>
        )}
      </section>

      <section className="rounded-[28px] border border-border bg-surface p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-foreground">Beneficiary Journey History</h2>
        <p className="mt-1 text-sm text-muted">
          Tracks this household&apos;s progression from the social register through to graduation or transition.
        </p>
        {household.journeyHistory.length ? (
          <ul className="mt-4 space-y-3">
            {household.journeyHistory.map((entry) => (
              <li key={entry.id} className="rounded-2xl bg-surface-muted px-4 py-3 text-sm text-muted">
                Moved from <span className="font-semibold text-foreground">{journeyStageLabels[entry.fromStage]}</span> to{" "}
                <span className="font-semibold text-foreground">{journeyStageLabels[entry.toStage]}</span> by {entry.actor} on {formatDate(entry.timestamp)}
                {entry.reason ? <span className="block text-xs">Reason: {entry.reason}</span> : null}
              </li>
            ))}
          </ul>
        ) : (
          <p className="mt-4 text-sm text-muted">No journey stage changes recorded yet.</p>
        )}
      </section>

      <section className="rounded-[28px] border border-border bg-surface p-6 shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-foreground">Household Outcome Records</h2>
            <p className="mt-1 text-sm text-muted">
              Periodic field feedback on this household&apos;s food consumption, school attendance, and income since receiving support.
            </p>
          </div>
          {canSubmitOutcomeRecords ? (
            <Link
              href={`/field/households/${household.id}/feedback`}
              className="inline-flex h-10 shrink-0 items-center justify-center rounded-2xl bg-accent px-4 text-sm font-semibold text-accent-foreground"
            >
              Submit Feedback
            </Link>
          ) : null}
        </div>
        {household.outcomeRecords.length ? (
          <ul className="mt-4 space-y-3">
            {household.outcomeRecords.map((record) => (
              <li key={record.id} className="rounded-2xl bg-surface-muted px-4 py-3 text-sm text-muted">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="font-semibold text-foreground">
                    Submitted by {record.submittedByName} on {formatDate(record.submittedAt)}
                  </span>
                  <span className="rounded-full border border-border bg-surface px-2.5 py-1 text-xs font-semibold text-foreground">
                    Food consumption: {record.foodConsumptionScore}
                  </span>
                </div>
                <div className="mt-2 grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
                  <span>Meals/day: <strong className="text-foreground">{record.mealsPerDay}</strong></span>
                  <span>
                    In school: <strong className="text-foreground">{record.childrenInSchoolCount}/{record.schoolAgeChildrenCount}</strong>
                  </span>
                  <span>
                    Est. monthly income: <strong className="text-foreground">{record.monthlyIncomeEstimate.toLocaleString()}</strong>
                  </span>
                  {record.skillsGained ? <span>Skills: <strong className="text-foreground">{record.skillsGained}</strong></span> : null}
                </div>
                {record.notes ? <p className="mt-2 text-xs">{record.notes}</p> : null}
              </li>
            ))}
          </ul>
        ) : (
          <p className="mt-4 text-sm text-muted">No outcome feedback recorded yet.</p>
        )}
      </section>

      {showAddMember ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
          <button type="button" className="absolute inset-0 bg-[#161616]/55" onClick={() => setShowAddMember(false)} />
          <div className="relative z-10 w-full max-w-lg rounded-[32px] border border-border bg-surface p-6 shadow-2xl">
            <h2 className="text-2xl font-semibold text-foreground">Add household member</h2>
            <p className="mt-2 text-sm text-muted">Record a new member joining this household.</p>
            <div className="mt-6 space-y-4">
              <label className="block">
                <span className="mb-2 block text-sm font-medium text-foreground">Full name</span>
                <input
                  type="text"
                  value={form.fullName}
                  onChange={(event) => setForm((current) => ({ ...current, fullName: event.target.value }))}
                  className="focus-ring h-12 w-full rounded-2xl border border-border bg-background px-4 text-sm text-foreground"
                />
              </label>
              <div className="grid gap-4 sm:grid-cols-2">
                <label className="block">
                  <span className="mb-2 block text-sm font-medium text-foreground">Relationship to head</span>
                  <select
                    value={form.relationshipToHead}
                    onChange={(event) => setForm((current) => ({ ...current, relationshipToHead: event.target.value as HouseholdMemberRelationship }))}
                    className="focus-ring h-12 w-full rounded-2xl border border-border bg-background px-4 text-sm text-foreground"
                  >
                    {relationshipOptions.map((option) => (
                      <option key={option} value={option}>{option}</option>
                    ))}
                  </select>
                </label>
                <label className="block">
                  <span className="mb-2 block text-sm font-medium text-foreground">Gender</span>
                  <select
                    value={form.gender}
                    onChange={(event) => setForm((current) => ({ ...current, gender: event.target.value as "MALE" | "FEMALE" }))}
                    className="focus-ring h-12 w-full rounded-2xl border border-border bg-background px-4 text-sm text-foreground"
                  >
                    <option value="MALE">Male</option>
                    <option value="FEMALE">Female</option>
                  </select>
                </label>
              </div>
              <label className="block">
                <span className="mb-2 block text-sm font-medium text-foreground">Date of birth</span>
                <input
                  type="date"
                  value={form.dateOfBirth}
                  onChange={(event) => setForm((current) => ({ ...current, dateOfBirth: event.target.value }))}
                  className="focus-ring h-12 w-full rounded-2xl border border-border bg-background px-4 text-sm text-foreground"
                />
              </label>
              <label className="block">
                <span className="mb-2 block text-sm font-medium text-foreground">Notes (optional)</span>
                <textarea
                  value={form.notes}
                  onChange={(event) => setForm((current) => ({ ...current, notes: event.target.value }))}
                  rows={3}
                  className="focus-ring w-full rounded-2xl border border-border bg-background px-4 py-3 text-sm text-foreground"
                />
              </label>
            </div>
            <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={() => setShowAddMember(false)}
                className="inline-flex h-12 items-center justify-center rounded-2xl border border-border px-5 text-sm font-semibold text-foreground"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={!form.fullName.trim() || !form.dateOfBirth || addMemberMutation.isPending}
                onClick={() => addMemberMutation.mutate(form)}
                className="inline-flex h-12 items-center justify-center rounded-2xl bg-accent px-5 text-sm font-semibold text-accent-foreground disabled:opacity-60"
              >
                {addMemberMutation.isPending ? "Adding..." : "Add Member"}
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {statusTarget ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
          <button type="button" className="absolute inset-0 bg-[#161616]/55" onClick={() => setStatusTarget(null)} />
          <div className="relative z-10 w-full max-w-lg rounded-[32px] border border-border bg-surface p-6 shadow-2xl">
            <h2 className="text-2xl font-semibold text-foreground">
              Mark {statusTarget.member.fullName} as {statusTarget.status.toLowerCase()}
            </h2>
            <p className="mt-2 text-sm text-muted">
              This member will be moved out of the active household roster. This does not delete their history.
            </p>
            <label className="mt-6 block">
              <span className="mb-2 block text-sm font-medium text-foreground">Reason (optional)</span>
              <textarea
                value={reason}
                onChange={(event) => setReason(event.target.value)}
                rows={3}
                className="focus-ring w-full rounded-2xl border border-border bg-background px-4 py-3 text-sm text-foreground"
              />
            </label>
            <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={() => setStatusTarget(null)}
                className="inline-flex h-12 items-center justify-center rounded-2xl border border-border px-5 text-sm font-semibold text-foreground"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={statusMutation.isPending}
                onClick={() =>
                  statusMutation.mutate({ memberId: statusTarget.member.id, status: statusTarget.status, reason: reason.trim() || undefined })
                }
                className="inline-flex h-12 items-center justify-center rounded-2xl bg-accent px-5 text-sm font-semibold text-accent-foreground disabled:opacity-60"
              >
                {statusMutation.isPending ? "Saving..." : "Confirm"}
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {showStageChange ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
          <button type="button" className="absolute inset-0 bg-[#161616]/55" onClick={() => setShowStageChange(false)} />
          <div className="relative z-10 w-full max-w-lg rounded-[32px] border border-border bg-surface p-6 shadow-2xl">
            <h2 className="text-2xl font-semibold text-foreground">Move household to another stage</h2>
            <p className="mt-2 text-sm text-muted">
              Current stage: <span className="font-semibold text-foreground">{journeyStageLabels[household.journeyStage]}</span>
            </p>
            <label className="mt-6 block">
              <span className="mb-2 block text-sm font-medium text-foreground">New stage</span>
              <select
                value={nextStage}
                onChange={(event) => setNextStage(event.target.value as JourneyStage)}
                className="focus-ring h-12 w-full rounded-2xl border border-border bg-background px-4 text-sm text-foreground"
              >
                {journeyStageOptions.map((stage) => (
                  <option key={stage} value={stage} disabled={stage === household.journeyStage}>
                    {journeyStageLabels[stage]}
                  </option>
                ))}
              </select>
            </label>
            <label className="mt-4 block">
              <span className="mb-2 block text-sm font-medium text-foreground">Reason (optional)</span>
              <textarea
                value={stageReason}
                onChange={(event) => setStageReason(event.target.value)}
                rows={3}
                placeholder="e.g. household income and food consumption improved after cash transfer support"
                className="focus-ring w-full rounded-2xl border border-border bg-background px-4 py-3 text-sm text-foreground"
              />
            </label>
            <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={() => setShowStageChange(false)}
                className="inline-flex h-12 items-center justify-center rounded-2xl border border-border px-5 text-sm font-semibold text-foreground"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={stageMutation.isPending}
                onClick={() => stageMutation.mutate({ toStage: nextStage, reason: stageReason.trim() || undefined })}
                className="inline-flex h-12 items-center justify-center rounded-2xl bg-accent px-5 text-sm font-semibold text-accent-foreground disabled:opacity-60"
              >
                {stageMutation.isPending ? "Saving..." : "Confirm Stage Change"}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </PageContainer>
  );
}
