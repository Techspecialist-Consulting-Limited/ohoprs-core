import type { BeneficiaryGender } from "@/types/beneficiary";

export type HouseholdMemberRelationship = "HEAD" | "SPOUSE" | "CHILD" | "DEPENDENT" | "OTHER";
export type HouseholdMemberStatus = "ACTIVE" | "DECEASED" | "DEPARTED";
export type HouseholdMemberChangeAction = "ADDED" | "MARKED_DECEASED" | "MARKED_DEPARTED" | "RECIPIENT_CHANGED";

export type JourneyStage = "SOCIAL_REGISTER" | "BENEFICIARY_REGISTER" | "GRADUATED" | "TRANSITIONED";

export interface JourneyStageChange {
  id: string;
  fromStage: JourneyStage;
  toStage: JourneyStage;
  actor: string;
  timestamp: string;
  reason?: string;
}

export interface HouseholdMember {
  id: string;
  fullName: string;
  relationshipToHead: HouseholdMemberRelationship;
  gender: BeneficiaryGender;
  dateOfBirth: string;
  isDesignatedRecipient: boolean;
  status: HouseholdMemberStatus;
  beneficiaryId: string | null;
  joinedAt: string;
  leftAt?: string | null;
  notes?: string;
}

export interface HouseholdChangeLogItem {
  id: string;
  memberId: string;
  memberName: string;
  action: HouseholdMemberChangeAction;
  actor: string;
  timestamp: string;
  reason?: string;
}

export type FoodConsumptionScore = "POOR" | "BORDERLINE" | "ACCEPTABLE";

export interface OutcomeRecord {
  id: string;
  householdId: string;
  submittedByUserId: string;
  submittedByName: string;
  submittedAt: string;
  mealsPerDay: number;
  childrenInSchoolCount: number;
  schoolAgeChildrenCount: number;
  monthlyIncomeEstimate: number;
  foodConsumptionScore: FoodConsumptionScore;
  skillsGained?: string;
  notes?: string;
}

export interface AddOutcomeRecordPayload {
  mealsPerDay: number;
  childrenInSchoolCount: number;
  schoolAgeChildrenCount: number;
  monthlyIncomeEstimate: number;
  foodConsumptionScore: FoodConsumptionScore;
  skillsGained?: string;
  notes?: string;
}

export interface Household {
  id: string;
  unifiedHouseholdId: string;
  organizationId: string;
  organizationName: string;
  state: string;
  lga: string;
  address: string;
  designatedRecipientBeneficiaryId: string;
  designatedRecipientName: string;
  members: HouseholdMember[];
  changeLog: HouseholdChangeLogItem[];
  journeyStage: JourneyStage;
  journeyHistory: JourneyStageChange[];
  outcomeRecords: OutcomeRecord[];
  createdAt: string;
  updatedAt: string;
}

export interface HouseholdListMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface HouseholdListResponse {
  items: Household[];
  meta: HouseholdListMeta;
}

export interface HouseholdListParams {
  page?: number;
  limit?: number;
  search?: string;
  organizationId?: string | "ALL";
  state?: string | "ALL";
  journeyStage?: JourneyStage | "ALL";
}

export interface AddHouseholdMemberPayload {
  fullName: string;
  relationshipToHead: HouseholdMemberRelationship;
  gender: BeneficiaryGender;
  dateOfBirth: string;
  notes?: string;
}

export interface UpdateJourneyStagePayload {
  toStage: JourneyStage;
  reason?: string;
}

export interface HouseholdLookupResult {
  householdId: string;
  unifiedHouseholdId: string;
  designatedRecipientName: string;
  state: string;
  lga: string;
  address: string;
}
