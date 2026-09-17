import { beneficiariesData } from "@/mock/beneficiaries.mock";
import type { Beneficiary360Details } from "@/types/beneficiary";
import type { FoodConsumptionScore, Household, HouseholdMember, JourneyStage, OutcomeRecord } from "@/types/household";

function deriveJourneyStage(beneficiary: Beneficiary360Details): JourneyStage {
  if (beneficiary.programIds.length === 0) {
    return "SOCIAL_REGISTER";
  }

  if (beneficiary.benefitStatus === "EXITED") {
    return Number(beneficiary.id.split("_")[1] ?? 0) % 2 === 0 ? "GRADUATED" : "TRANSITIONED";
  }

  return "BENEFICIARY_REGISTER";
}

function buildDateOfBirth(year: number, monthSeed: number, daySeed: number) {
  const month = String((monthSeed % 12) + 1).padStart(2, "0");
  const day = String((daySeed % 28) + 1).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function buildUnifiedHouseholdId(beneficiary: Beneficiary360Details, sequence: number) {
  const stateCode = beneficiary.state.replace(/[^A-Za-z]/g, "").slice(0, 3).toUpperCase() || "NGA";
  return `HH-${stateCode}-${String(sequence).padStart(5, "0")}`;
}

function buildMembers(beneficiary: Beneficiary360Details): HouseholdMember[] {
  const index = Number(beneficiary.id.split("_")[1] ?? 0);

  const members: HouseholdMember[] = [
    {
      id: `${beneficiary.id}_member_head`,
      fullName: beneficiary.fullName,
      relationshipToHead: "HEAD",
      gender: beneficiary.gender,
      dateOfBirth: beneficiary.dateOfBirth,
      isDesignatedRecipient: true,
      status: "ACTIVE",
      beneficiaryId: beneficiary.id,
      joinedAt: beneficiary.createdAt,
    },
  ];

  const spouseCount = beneficiary.gender === "MALE" ? beneficiary.numberOfWives : beneficiary.numberOfHusbands;
  const spouseGender = beneficiary.gender === "MALE" ? "FEMALE" : "MALE";

  for (let i = 0; i < spouseCount; i += 1) {
    members.push({
      id: `${beneficiary.id}_member_spouse_${i + 1}`,
      fullName: `${spouseGender === "FEMALE" ? "Mrs." : "Mr."} ${beneficiary.lastName} ${i + 1}`,
      relationshipToHead: "SPOUSE",
      gender: spouseGender,
      dateOfBirth: buildDateOfBirth(1988 + ((index + i) % 8), index + i, index + i * 3),
      isDesignatedRecipient: false,
      status: "ACTIVE",
      beneficiaryId: null,
      joinedAt: beneficiary.createdAt,
    });
  }

  for (let i = 0; i < beneficiary.numberOfChildren; i += 1) {
    members.push({
      id: `${beneficiary.id}_member_child_${i + 1}`,
      fullName: `Child ${i + 1} ${beneficiary.lastName}`,
      relationshipToHead: "CHILD",
      gender: (index + i) % 2 === 0 ? "MALE" : "FEMALE",
      dateOfBirth: buildDateOfBirth(2009 + ((index + i) % 15), index + i, index + i * 5),
      isDesignatedRecipient: false,
      status: "ACTIVE",
      beneficiaryId: null,
      joinedAt: beneficiary.createdAt,
    });
  }

  const namedDependents = spouseCount + beneficiary.numberOfChildren;
  const extraDependents = Math.max(0, beneficiary.householdDependents - namedDependents);

  for (let i = 0; i < extraDependents; i += 1) {
    members.push({
      id: `${beneficiary.id}_member_dependent_${i + 1}`,
      fullName: `Dependent ${i + 1} ${beneficiary.lastName}`,
      relationshipToHead: "DEPENDENT",
      gender: (index + i) % 2 === 0 ? "FEMALE" : "MALE",
      dateOfBirth: buildDateOfBirth(1955 + ((index + i) % 20), index + i, index + i * 7),
      isDesignatedRecipient: false,
      status: "ACTIVE",
      beneficiaryId: null,
      joinedAt: beneficiary.createdAt,
    });
  }

  return members;
}

function buildOutcomeRecords(beneficiary: Beneficiary360Details, members: HouseholdMember[], stage: JourneyStage): OutcomeRecord[] {
  if (stage === "SOCIAL_REGISTER") {
    return [];
  }

  const index = Number(beneficiary.id.split("_")[1] ?? 0);
  const schoolAgeChildren = members.filter((member) => member.relationshipToHead === "CHILD").length;
  const childrenInSchool = Math.min(schoolAgeChildren, Math.max(0, schoolAgeChildren - (index % 2)));
  const foodConsumptionScore: FoodConsumptionScore =
    index % 5 === 0 ? "POOR" : index % 3 === 0 ? "BORDERLINE" : "ACCEPTABLE";

  const submittedAt = `2026-06-${String((index % 20) + 1).padStart(2, "0")}T11:00:00Z`;

  return [
    {
      id: `${beneficiary.id}_outcome_1`,
      householdId: `household_${beneficiary.id}`,
      submittedByUserId: "user_011",
      submittedByName: "Zainab Yusuf",
      submittedAt,
      mealsPerDay: 1 + (index % 3),
      childrenInSchoolCount: childrenInSchool,
      schoolAgeChildrenCount: schoolAgeChildren,
      monthlyIncomeEstimate: 8000 + (index % 10) * 1500,
      foodConsumptionScore,
      skillsGained: index % 4 === 0 ? "Completed tailoring skills training" : undefined,
      notes: stage === "GRADUATED" ? "Household reports improved food security and income." : undefined,
    },
  ];
}

export const householdsData: Household[] = beneficiariesData.map((beneficiary, arrayIndex) => {
  const members = buildMembers(beneficiary);
  const journeyStage = deriveJourneyStage(beneficiary);

  return {
    id: `household_${beneficiary.id}`,
    unifiedHouseholdId: buildUnifiedHouseholdId(beneficiary, arrayIndex + 1),
    organizationId: beneficiary.organizationId,
    organizationName: beneficiary.organizationName,
    state: beneficiary.state,
    lga: beneficiary.lga,
    address: beneficiary.address,
    designatedRecipientBeneficiaryId: beneficiary.id,
    designatedRecipientName: beneficiary.fullName,
    members,
    changeLog: [],
    journeyStage,
    journeyHistory: [],
    outcomeRecords: buildOutcomeRecords(beneficiary, members, journeyStage),
    createdAt: beneficiary.createdAt,
    updatedAt: beneficiary.updatedAt,
  };
});

export function getHouseholdIdForBeneficiary(beneficiaryId: string) {
  return `household_${beneficiaryId}`;
}
