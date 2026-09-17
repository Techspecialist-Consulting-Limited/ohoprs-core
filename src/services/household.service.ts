import { householdsData } from "@/mock/households.mock";
import type { ApiResponse } from "@/types/api";
import type {
  AddHouseholdMemberPayload,
  AddOutcomeRecordPayload,
  Household,
  HouseholdListParams,
  HouseholdListResponse,
  HouseholdLookupResult,
  HouseholdMember,
  JourneyStage,
  OutcomeRecord,
} from "@/types/household";

let householdStore = [...householdsData];

function findIndex(id: string) {
  return householdStore.findIndex((item) => item.id === id);
}

function appendChangeLog(
  household: Household,
  entry: Omit<Household["changeLog"][number], "id">,
): Household["changeLog"] {
  return [
    { id: `${household.id}_log_${household.changeLog.length + 1}`, ...entry },
    ...household.changeLog,
  ];
}

export const householdService = {
  async getHouseholds(params: HouseholdListParams = {}): Promise<ApiResponse<HouseholdListResponse>> {
    const { journeyStage = "ALL", limit = 10, organizationId = "ALL", page = 1, search = "", state = "ALL" } = params;

    let filtered = [...householdStore];

    if (organizationId !== "ALL") {
      filtered = filtered.filter((item) => item.organizationId === organizationId);
    }

    if (state !== "ALL") {
      filtered = filtered.filter((item) => item.state === state);
    }

    if (journeyStage !== "ALL") {
      filtered = filtered.filter((item) => item.journeyStage === journeyStage);
    }

    if (search.trim()) {
      const term = search.trim().toLowerCase();
      filtered = filtered.filter(
        (item) =>
          item.unifiedHouseholdId.toLowerCase().includes(term) ||
          item.designatedRecipientName.toLowerCase().includes(term) ||
          item.address.toLowerCase().includes(term),
      );
    }

    const total = filtered.length;
    const totalPages = Math.max(1, Math.ceil(total / limit));
    const safePage = Math.min(page, totalPages);
    const items = filtered.slice((safePage - 1) * limit, safePage * limit);

    return Promise.resolve({
      success: true,
      message: "Households fetched successfully",
      data: {
        items,
        meta: { page: safePage, limit, total, totalPages },
      },
    });
  },

  async searchHouseholds(query: string, limit = 8): Promise<ApiResponse<HouseholdLookupResult[]>> {
    const term = query.trim().toLowerCase();

    if (!term) {
      return Promise.resolve({ success: true, message: "No search term provided", data: [] });
    }

    const matches = householdStore
      .filter(
        (item) =>
          item.unifiedHouseholdId.toLowerCase().includes(term) ||
          item.designatedRecipientName.toLowerCase().includes(term) ||
          item.address.toLowerCase().includes(term) ||
          item.members.some((member) => member.fullName.toLowerCase().includes(term)),
      )
      .slice(0, limit)
      .map((item) => ({
        householdId: item.id,
        unifiedHouseholdId: item.unifiedHouseholdId,
        designatedRecipientName: item.designatedRecipientName,
        state: item.state,
        lga: item.lga,
        address: item.address,
      }));

    return Promise.resolve({
      success: true,
      message: "Household search completed successfully",
      data: matches,
    });
  },

  async getHouseholdById(id: string): Promise<ApiResponse<Household | null>> {
    const household = householdStore.find((item) => item.id === id) ?? null;

    return Promise.resolve({
      success: Boolean(household),
      message: household ? "Household fetched successfully" : "Household not found",
      data: household,
    });
  },

  async getHouseholdByBeneficiaryId(beneficiaryId: string): Promise<ApiResponse<Household | null>> {
    const household = householdStore.find((item) => item.designatedRecipientBeneficiaryId === beneficiaryId) ?? null;

    return Promise.resolve({
      success: Boolean(household),
      message: household ? "Household fetched successfully" : "Household not found",
      data: household,
    });
  },

  async addMember(
    householdId: string,
    payload: AddHouseholdMemberPayload,
    actor: string,
  ): Promise<ApiResponse<Household | null>> {
    const index = findIndex(householdId);

    if (index === -1) {
      return Promise.resolve({ success: false, message: "Household not found", data: null });
    }

    const household = householdStore[index];
    const timestamp = new Date().toISOString();
    const newMember: HouseholdMember = {
      id: `${householdId}_member_${household.members.length + 1}_${Date.now()}`,
      fullName: payload.fullName,
      relationshipToHead: payload.relationshipToHead,
      gender: payload.gender,
      dateOfBirth: payload.dateOfBirth,
      isDesignatedRecipient: false,
      status: "ACTIVE",
      beneficiaryId: null,
      joinedAt: timestamp,
      notes: payload.notes,
    };

    const updated: Household = {
      ...household,
      members: [...household.members, newMember],
      changeLog: appendChangeLog(household, {
        memberId: newMember.id,
        memberName: newMember.fullName,
        action: "ADDED",
        actor,
        timestamp,
      }),
      updatedAt: timestamp,
    };

    householdStore = householdStore.map((item, itemIndex) => (itemIndex === index ? updated : item));

    return Promise.resolve({ success: true, message: "Household member added successfully", data: updated });
  },

  async updateMemberStatus(
    householdId: string,
    memberId: string,
    status: "DECEASED" | "DEPARTED",
    actor: string,
    reason?: string,
  ): Promise<ApiResponse<Household | null>> {
    const index = findIndex(householdId);

    if (index === -1) {
      return Promise.resolve({ success: false, message: "Household not found", data: null });
    }

    const household = householdStore[index];
    const timestamp = new Date().toISOString();
    const existingMember = household.members.find((member) => member.id === memberId);

    if (!existingMember) {
      return Promise.resolve({ success: false, message: "Household member not found", data: null });
    }

    const changedMember: HouseholdMember = { ...existingMember, status, leftAt: timestamp, isDesignatedRecipient: false };
    const members = household.members.map((member) => (member.id === memberId ? changedMember : member));
    const wasRecipient = existingMember.isDesignatedRecipient;

    const updated: Household = {
      ...household,
      members,
      designatedRecipientBeneficiaryId: wasRecipient ? "" : household.designatedRecipientBeneficiaryId,
      designatedRecipientName: wasRecipient ? "Unassigned" : household.designatedRecipientName,
      changeLog: appendChangeLog(household, {
        memberId,
        memberName: changedMember.fullName,
        action: status === "DECEASED" ? "MARKED_DECEASED" : "MARKED_DEPARTED",
        actor,
        timestamp,
        reason,
      }),
      updatedAt: timestamp,
    };

    householdStore = householdStore.map((item, itemIndex) => (itemIndex === index ? updated : item));

    return Promise.resolve({ success: true, message: "Household member updated successfully", data: updated });
  },

  async changeDesignatedRecipient(
    householdId: string,
    memberId: string,
    actor: string,
  ): Promise<ApiResponse<Household | null>> {
    const index = findIndex(householdId);

    if (index === -1) {
      return Promise.resolve({ success: false, message: "Household not found", data: null });
    }

    const household = householdStore[index];
    const targetMember = household.members.find((member) => member.id === memberId);

    if (!targetMember || targetMember.status !== "ACTIVE") {
      return Promise.resolve({ success: false, message: "Member is not eligible to become the designated recipient", data: null });
    }

    if (!targetMember.beneficiaryId) {
      return Promise.resolve({
        success: false,
        message: "Only a member who is a registered beneficiary can be set as the designated recipient",
        data: null,
      });
    }

    const timestamp = new Date().toISOString();
    const members = household.members.map((member) => ({
      ...member,
      isDesignatedRecipient: member.id === memberId,
    }));

    const updated: Household = {
      ...household,
      members,
      designatedRecipientBeneficiaryId: targetMember.beneficiaryId,
      designatedRecipientName: targetMember.fullName,
      changeLog: appendChangeLog(household, {
        memberId,
        memberName: targetMember.fullName,
        action: "RECIPIENT_CHANGED",
        actor,
        timestamp,
      }),
      updatedAt: timestamp,
    };

    householdStore = householdStore.map((item, itemIndex) => (itemIndex === index ? updated : item));

    return Promise.resolve({ success: true, message: "Designated recipient updated successfully", data: updated });
  },

  async updateJourneyStage(
    householdId: string,
    toStage: JourneyStage,
    actor: string,
    reason?: string,
  ): Promise<ApiResponse<Household | null>> {
    const index = findIndex(householdId);

    if (index === -1) {
      return Promise.resolve({ success: false, message: "Household not found", data: null });
    }

    const household = householdStore[index];

    if (household.journeyStage === toStage) {
      return Promise.resolve({ success: false, message: "Household is already at that journey stage", data: null });
    }

    const timestamp = new Date().toISOString();
    const stageChange = {
      id: `${householdId}_journey_${household.journeyHistory.length + 1}`,
      fromStage: household.journeyStage,
      toStage,
      actor,
      timestamp,
      reason,
    };

    const updated: Household = {
      ...household,
      journeyStage: toStage,
      journeyHistory: [stageChange, ...household.journeyHistory],
      updatedAt: timestamp,
    };

    householdStore = householdStore.map((item, itemIndex) => (itemIndex === index ? updated : item));

    return Promise.resolve({ success: true, message: "Household journey stage updated successfully", data: updated });
  },

  async addOutcomeRecord(
    householdId: string,
    payload: AddOutcomeRecordPayload,
    submittedByUserId: string,
    submittedByName: string,
  ): Promise<ApiResponse<Household | null>> {
    const index = findIndex(householdId);

    if (index === -1) {
      return Promise.resolve({ success: false, message: "Household not found", data: null });
    }

    const household = householdStore[index];
    const timestamp = new Date().toISOString();
    const record: OutcomeRecord = {
      id: `${householdId}_outcome_${household.outcomeRecords.length + 1}`,
      householdId,
      submittedByUserId,
      submittedByName,
      submittedAt: timestamp,
      ...payload,
    };

    const updated: Household = {
      ...household,
      outcomeRecords: [record, ...household.outcomeRecords],
      updatedAt: timestamp,
    };

    householdStore = householdStore.map((item, itemIndex) => (itemIndex === index ? updated : item));

    return Promise.resolve({ success: true, message: "Outcome record submitted successfully", data: updated });
  },
};
