import { beneficiariesData } from "@/mock/beneficiaries.mock";
import type { Beneficiary360Details } from "@/types/beneficiary";
import type {
  FoodConsumptionScore,
  Household,
  HouseholdChangeLogItem,
  HouseholdMember,
  JourneyStage,
  JourneyStageChange,
  OutcomeRecord,
} from "@/types/household";

const STORY_HOUSEHOLD_COUNT = 20;

const storyActors = ["Zainab Yusuf", "Musa Ibrahim", "Chioma Okafor", "Amina Bello", "David Audu"];

function addDaysIso(iso: string, days: number) {
  const date = new Date(iso);
  date.setDate(date.getDate() + days);
  return date.toISOString();
}

export function deriveJourneyStage(beneficiary: Beneficiary360Details): JourneyStage {
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

export function buildUnifiedHouseholdId(beneficiary: Beneficiary360Details, sequence: number) {
  const stateCode = beneficiary.state.replace(/[^A-Za-z]/g, "").slice(0, 3).toUpperCase() || "NGA";
  return `HH-${stateCode}-${String(sequence).padStart(5, "0")}`;
}

export function buildMembers(beneficiary: Beneficiary360Details): HouseholdMember[] {
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

function buildJourneyHistoryStory(beneficiary: Beneficiary360Details, stage: JourneyStage, index: number): JourneyStageChange[] {
  if (stage === "SOCIAL_REGISTER") {
    return [];
  }

  const registerToBeneficiary: JourneyStageChange = {
    id: `${beneficiary.id}_journey_1`,
    fromStage: "SOCIAL_REGISTER",
    toStage: "BENEFICIARY_REGISTER",
    actor: storyActors[index % storyActors.length],
    timestamp: addDaysIso(beneficiary.createdAt, 14),
    reason: "Verified eligible for the poverty response programme after social register screening.",
  };

  if (stage === "BENEFICIARY_REGISTER") {
    return [registerToBeneficiary];
  }

  const finalTransition: JourneyStageChange = {
    id: `${beneficiary.id}_journey_2`,
    fromStage: "BENEFICIARY_REGISTER",
    toStage: stage,
    actor: storyActors[(index + 1) % storyActors.length],
    timestamp: addDaysIso(beneficiary.createdAt, 240 + (index % 60)),
    reason:
      stage === "GRADUATED"
        ? "Household met graduation criteria: stable income and improved food security across consecutive outcome reviews."
        : "Household transitioned to a complementary support programme following case review.",
  };

  return [finalTransition, registerToBeneficiary];
}

function buildChangeLogStory(beneficiary: Beneficiary360Details, members: HouseholdMember[], index: number): HouseholdChangeLogItem[] {
  const head = members[0];
  const others = members.slice(1);

  const entries: HouseholdChangeLogItem[] = others.map((member, i) => ({
    id: `${beneficiary.id}_log_add_${i + 1}`,
    memberId: member.id,
    memberName: member.fullName,
    action: "ADDED",
    actor: storyActors[(index + i) % storyActors.length],
    timestamp: addDaysIso(beneficiary.createdAt, 2 + i * 5),
    reason:
      member.relationshipToHead === "SPOUSE"
        ? "Spouse enrolled during household verification."
        : member.relationshipToHead === "CHILD"
          ? "Child added following household composition verification."
          : "Dependent added following household composition verification.",
  }));

  if (others.length > 0 && index % 4 === 0) {
    const target = others[others.length - 1];
    entries.push({
      id: `${beneficiary.id}_log_status_1`,
      memberId: target.id,
      memberName: target.fullName,
      action: index % 8 === 0 ? "MARKED_DECEASED" : "MARKED_DEPARTED",
      actor: storyActors[(index + 2) % storyActors.length],
      timestamp: addDaysIso(beneficiary.createdAt, 180 + (index % 30)),
      reason:
        index % 8 === 0
          ? "Reported deceased during a routine field verification visit."
          : "Member relocated outside the programme catchment area.",
    });
  } else if (others.length > 0 && index % 4 === 2) {
    entries.push({
      id: `${beneficiary.id}_log_recipient_1`,
      memberId: head.id,
      memberName: head.fullName,
      action: "RECIPIENT_CHANGED",
      actor: storyActors[(index + 3) % storyActors.length],
      timestamp: addDaysIso(beneficiary.createdAt, 120),
      reason: "Confirmed as designated recipient following identity verification.",
    });
  }

  return entries.reverse();
}

function buildOutcomeRecordsStory(beneficiary: Beneficiary360Details, members: HouseholdMember[], stage: JourneyStage, index: number): OutcomeRecord[] {
  if (stage === "SOCIAL_REGISTER") {
    return [];
  }

  const schoolAgeChildren = members.filter((member) => member.relationshipToHead === "CHILD").length;
  const scores: FoodConsumptionScore[] = ["POOR", "BORDERLINE", "ACCEPTABLE"];
  const recordCount = stage === "GRADUATED" || stage === "TRANSITIONED" ? 4 : 3;

  const records: OutcomeRecord[] = Array.from({ length: recordCount }, (_, i) => {
    const scoreIndex = Math.min(scores.length - 1, i);
    const childrenInSchool = schoolAgeChildren === 0 ? 0 : Math.min(schoolAgeChildren, i + 1);

    return {
      id: `${beneficiary.id}_outcome_${i + 1}`,
      householdId: `household_${beneficiary.id}`,
      submittedByUserId: "user_011",
      submittedByName: storyActors[(index + i) % storyActors.length],
      submittedAt: addDaysIso(beneficiary.createdAt, 60 + i * 90),
      mealsPerDay: 1 + Math.min(2, i),
      childrenInSchoolCount: childrenInSchool,
      schoolAgeChildrenCount: schoolAgeChildren,
      monthlyIncomeEstimate: 8000 + i * 6000 + (index % 5) * 1000,
      foodConsumptionScore: scores[scoreIndex],
      skillsGained: i >= 2 ? "Completed tailoring skills training" : undefined,
      notes:
        i === recordCount - 1 && stage === "GRADUATED"
          ? "Household reports improved food security and income; recommended for graduation review."
          : undefined,
    };
  });

  return records.reverse();
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
  const isStoryHousehold = arrayIndex < STORY_HOUSEHOLD_COUNT;

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
    changeLog: isStoryHousehold ? buildChangeLogStory(beneficiary, members, arrayIndex) : [],
    journeyStage,
    journeyHistory: isStoryHousehold ? buildJourneyHistoryStory(beneficiary, journeyStage, arrayIndex) : [],
    outcomeRecords: isStoryHousehold
      ? buildOutcomeRecordsStory(beneficiary, members, journeyStage, arrayIndex)
      : buildOutcomeRecords(beneficiary, members, journeyStage),
    createdAt: beneficiary.createdAt,
    updatedAt: beneficiary.updatedAt,
  };
});

export function getHouseholdIdForBeneficiary(beneficiaryId: string) {
  return `household_${beneficiaryId}`;
}
