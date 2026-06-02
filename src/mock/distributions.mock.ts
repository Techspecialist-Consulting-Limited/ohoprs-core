import { beneficiariesData } from "@/mock/beneficiaries.mock";
import { programsData } from "@/mock/programs.mock";
import type {
  DistributionDetails,
  DistributionMethod,
  DistributionRecipientPreview,
  DistributionStatus,
  DistributionTimelineItem,
} from "@/types/distribution";

const creatorDirectory = {
  user_001: "Amina Bello",
  user_002: "Musa Ibrahim",
  user_003: "Chioma Okafor",
  user_004: "David Audu",
} as const;

function isCashMethod(method: DistributionMethod) {
  return method === "BANK_TRANSFER" || method === "MOBILE_MONEY" || method === "CASH";
}

function maskNin(value: string) {
  return `${value.slice(0, 3)}******${value.slice(-2)}`;
}

function buildTimeline(
  id: string,
  status: DistributionStatus,
  scheduledDate: string,
  createdBy: string,
): DistributionTimelineItem[] {
  const createdAt = new Date(scheduledDate);
  createdAt.setDate(createdAt.getDate() - 8);
  const scheduledAt = new Date(scheduledDate);
  scheduledAt.setDate(scheduledAt.getDate() - 4);
  const processingAt = new Date(scheduledDate);
  processingAt.setDate(processingAt.getDate() - 1);
  const finalAt = new Date(scheduledDate);

  const timeline: DistributionTimelineItem[] = [
    {
      id: `${id}_created`,
      label: "Created",
      description: "Distribution batch was created and saved for operational review.",
      status: "DRAFT",
      timestamp: createdAt.toISOString(),
      actor: createdBy,
    },
    {
      id: `${id}_scheduled`,
      label: "Scheduled",
      description: "Beneficiary targeting and implementation date were approved.",
      status: "SCHEDULED",
      timestamp: scheduledAt.toISOString(),
      actor: "Operations Desk",
    },
  ];

  if (status !== "DRAFT") {
    timeline.push({
      id: `${id}_processing`,
      label: "Processing Started",
      description: "Batch preparation and channel validation moved into processing.",
      status: "PROCESSING",
      timestamp: processingAt.toISOString(),
      actor: "Distribution Queue",
    });
  }

  if (status === "COMPLETED") {
    timeline.push({
      id: `${id}_completed`,
      label: "Completed",
      description: "Distribution batch completed and delivery results were reconciled.",
      status: "COMPLETED",
      timestamp: finalAt.toISOString(),
      actor: "Settlement Desk",
    });
  }

  if (status === "FAILED") {
    timeline.push({
      id: `${id}_failed`,
      label: "Failed",
      description: "Distribution execution failed after validation or delivery exceptions.",
      status: "FAILED",
      timestamp: finalAt.toISOString(),
      actor: "Exception Desk",
    });
  }

  if (status === "CANCELLED") {
    timeline.push({
      id: `${id}_cancelled`,
      label: "Cancelled",
      description: "Batch was cancelled before execution after management review.",
      status: "CANCELLED",
      timestamp: finalAt.toISOString(),
      actor: "Program Control",
    });
  }

  return timeline.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
}

function buildRecipients(organizationId: string, programId: string, count = 5): DistributionRecipientPreview[] {
  return beneficiariesData
    .filter((item) => item.organizationId === organizationId && item.programIds.includes(programId))
    .slice(0, count)
    .map((item, index) => ({
      id: `${programId}_recipient_${index + 1}`,
      beneficiaryId: item.id,
      fullName: item.fullName,
      nin: maskNin(item.nin),
      state: item.state,
      deliveryStatus: index === 3 ? "PENDING" : index === 4 ? "FAILED" : "DELIVERED",
    }));
}

function createDistribution(input: {
  id: string;
  programId: string;
  name: string;
  method: DistributionMethod;
  status: DistributionStatus;
  beneficiaryCount: number;
  amount?: number;
  quantity?: number;
  scheduledDate: string;
  createdByUserId: keyof typeof creatorDirectory;
  description: string;
}): DistributionDetails {
  const program = programsData.find((item) => item.id === input.programId)!;
  const recipients = buildRecipients(program.organizationId, program.id);
  const createdBy = creatorDirectory[input.createdByUserId];
  const failedDeliveries = recipients.filter((item) => item.deliveryStatus === "FAILED").length;
  const successful = recipients.filter((item) => item.deliveryStatus === "DELIVERED").length;
  const totalPreview = Math.max(recipients.length, 1);
  const successRate = Math.round((successful / totalPreview) * 100);
  const completionRate =
    input.status === "COMPLETED"
      ? 100
      : input.status === "PROCESSING"
        ? 72
        : input.status === "FAILED"
          ? 48
          : input.status === "SCHEDULED"
            ? 24
            : input.status === "CANCELLED"
              ? 0
              : 10;

  return {
    id: input.id,
    organizationId: program.organizationId,
    organizationName: program.organizationName,
    programId: program.id,
    programName: program.name,
    name: input.name,
    benefitType: program.benefitType,
    method: input.method,
    description: input.description,
    beneficiaryCount: input.beneficiaryCount,
    amount: isCashMethod(input.method) ? input.amount ?? 0 : undefined,
    quantity: isCashMethod(input.method) ? undefined : input.quantity ?? 0,
    status: input.status,
    scheduledDate: input.scheduledDate,
    createdByUserId: input.createdByUserId,
    createdBy,
    createdAt: new Date(new Date(input.scheduledDate).setDate(new Date(input.scheduledDate).getDate() - 8)).toISOString(),
    updatedAt: new Date(new Date(input.scheduledDate).setDate(new Date(input.scheduledDate).getDate() - 1)).toISOString(),
    programStatus: program.status,
    organizationType: program.organizationType,
    organizationStatus: program.organizationStatus,
    recipients,
    statistics: {
      beneficiaries: input.beneficiaryCount,
      amountDistributed: isCashMethod(input.method) ? input.amount ?? 0 : 0,
      successRate,
      failedDeliveries,
      completionRate,
      lastUpdated: new Date(new Date(input.scheduledDate).setHours(14, 30, 0, 0)).toISOString(),
    },
    timeline: buildTimeline(input.id, input.status, input.scheduledDate, createdBy),
    recentActivities: [
      {
        id: `${input.id}_activity_1`,
        actor: createdBy,
        action: "Created distribution batch",
        timestamp: new Date(new Date(input.scheduledDate).setDate(new Date(input.scheduledDate).getDate() - 8)).toISOString(),
      },
      {
        id: `${input.id}_activity_2`,
        actor: "Operations Desk",
        action: "Validated beneficiary selection",
        timestamp: new Date(new Date(input.scheduledDate).setDate(new Date(input.scheduledDate).getDate() - 4)).toISOString(),
      },
      {
        id: `${input.id}_activity_3`,
        actor: input.status === "FAILED" ? "Exception Desk" : "Distribution Queue",
        action: input.status === "FAILED" ? "Recorded delivery exceptions" : "Updated distribution execution status",
        timestamp: new Date(new Date(input.scheduledDate).setDate(new Date(input.scheduledDate).getDate() - 1)).toISOString(),
      },
    ],
  };
}

export const distributionsData: DistributionDetails[] = [
  createDistribution({ id: "distribution_001", programId: "program_002", name: "June Youth Grant Batch", method: "BANK_TRANSFER", status: "COMPLETED", beneficiaryCount: 25000, amount: 500000000, scheduledDate: "2026-06-01T09:00:00Z", createdByUserId: "user_002", description: "Monthly youth enterprise cash support batch for verified participants." }),
  createDistribution({ id: "distribution_002", programId: "program_001", name: "Food Relief Batch 12", method: "FOOD_PACKAGE", status: "SCHEDULED", beneficiaryCount: 15000, quantity: 15000, scheduledDate: "2026-06-03T08:00:00Z", createdByUserId: "user_003", description: "Rice and beans package distribution for vulnerable households." }),
  createDistribution({ id: "distribution_003", programId: "program_003", name: "Emergency Nutrition Wave 4", method: "MEDICAL_SUPPORT", status: "PROCESSING", beneficiaryCount: 8000, quantity: 8000, scheduledDate: "2026-06-04T10:00:00Z", createdByUserId: "user_003", description: "Nutrition support distribution for children and at-risk mothers." }),
  createDistribution({ id: "distribution_004", programId: "program_004", name: "Urban Family Relief - Ikeja Batch", method: "MOBILE_MONEY", status: "COMPLETED", beneficiaryCount: 12000, amount: 180000000, scheduledDate: "2026-05-29T09:30:00Z", createdByUserId: "user_002", description: "Urban family relief disbursement targeting verified Lagos households." }),
  createDistribution({ id: "distribution_005", programId: "program_005", name: "School Feeding Distribution - Cluster A", method: "FOOD_PACKAGE", status: "COMPLETED", beneficiaryCount: 17000, quantity: 17000, scheduledDate: "2026-05-28T07:45:00Z", createdByUserId: "user_003", description: "School meal distribution covering public primary school beneficiaries." }),
  createDistribution({ id: "distribution_006", programId: "program_006", name: "Health Access Starter Batch", method: "MEDICAL_SUPPORT", status: "FAILED", beneficiaryCount: 4500, quantity: 4500, scheduledDate: "2026-05-26T11:00:00Z", createdByUserId: "user_002", description: "Pilot medical assistance batch with unresolved provider validation issues." }),
  createDistribution({ id: "distribution_007", programId: "program_007", name: "Rural Nutrition Outreach - May Wave", method: "FOOD_PACKAGE", status: "PROCESSING", beneficiaryCount: 9000, quantity: 9000, scheduledDate: "2026-06-05T08:30:00Z", createdByUserId: "user_003", description: "Nutrition package delivery across rural household clusters." }),
  createDistribution({ id: "distribution_008", programId: "program_008", name: "Farm Family Stabilization Batch 2", method: "CASH", status: "CANCELLED", beneficiaryCount: 6000, amount: 96000000, scheduledDate: "2026-05-21T09:00:00Z", createdByUserId: "user_003", description: "Farm household stabilization payout batch cancelled after compliance review." }),
  createDistribution({ id: "distribution_009", programId: "program_009", name: "Community Relief Window - South Zone", method: "CASH", status: "SCHEDULED", beneficiaryCount: 5200, amount: 78000000, scheduledDate: "2026-06-06T10:00:00Z", createdByUserId: "user_002", description: "Community relief payments for low-income households in Kaduna South." }),
  createDistribution({ id: "distribution_010", programId: "program_010", name: "Learner Support Kit Batch", method: "EDUCATION_SUPPORT", status: "COMPLETED", beneficiaryCount: 8400, quantity: 8400, scheduledDate: "2026-05-25T08:15:00Z", createdByUserId: "user_002", description: "Education kits for learners enrolled in continuity support cohorts." }),
  createDistribution({ id: "distribution_011", programId: "program_011", name: "Women Enterprise Grant", method: "BANK_TRANSFER", status: "PROCESSING", beneficiaryCount: 7100, amount: 142000000, scheduledDate: "2026-06-02T09:45:00Z", createdByUserId: "user_001", description: "Cash grants for women-led micro-enterprise stabilization." }),
  createDistribution({ id: "distribution_012", programId: "program_012", name: "Shelter Recovery Materials Batch", method: "AGRICULTURE_SUPPORT", status: "SCHEDULED", beneficiaryCount: 4500, quantity: 4500, scheduledDate: "2026-06-07T12:00:00Z", createdByUserId: "user_001", description: "Support package covering reconstruction inputs and household recovery materials." }),
  createDistribution({ id: "distribution_013", programId: "program_013", name: "Digital Enablement Stipend", method: "MOBILE_MONEY", status: "DRAFT", beneficiaryCount: 1800, amount: 18000000, scheduledDate: "2026-06-10T10:30:00Z", createdByUserId: "user_001", description: "Draft stipend batch for digital payout enablement pilots." }),
  createDistribution({ id: "distribution_014", programId: "program_014", name: "Osun Family Support Batch 6", method: "FOOD_PACKAGE", status: "COMPLETED", beneficiaryCount: 9800, quantity: 9800, scheduledDate: "2026-05-23T08:00:00Z", createdByUserId: "user_001", description: "Household food basket distribution for Osun family support beneficiaries." }),
  createDistribution({ id: "distribution_015", programId: "program_015", name: "Farm Relief Input Batch", method: "AGRICULTURE_SUPPORT", status: "FAILED", beneficiaryCount: 4300, quantity: 4300, scheduledDate: "2026-05-20T11:30:00Z", createdByUserId: "user_001", description: "Seed and farm input support batch affected by logistics exceptions." }),
  createDistribution({ id: "distribution_016", programId: "program_016", name: "Maternal Nutrition Pack Cycle", method: "MEDICAL_SUPPORT", status: "COMPLETED", beneficiaryCount: 6200, quantity: 6200, scheduledDate: "2026-05-24T09:20:00Z", createdByUserId: "user_001", description: "Maternal wellness packs delivered to verified health support recipients." }),
  createDistribution({ id: "distribution_017", programId: "program_017", name: "Livelihood Restart Wave 3", method: "BANK_TRANSFER", status: "PROCESSING", beneficiaryCount: 11500, amount: 230000000, scheduledDate: "2026-06-08T09:40:00Z", createdByUserId: "user_001", description: "Livelihood restart grants for verified post-crisis recovery households." }),
  createDistribution({ id: "distribution_018", programId: "program_018", name: "Household Stabilization Batch 4", method: "CASH", status: "SCHEDULED", beneficiaryCount: 5400, amount: 70200000, scheduledDate: "2026-06-09T13:00:00Z", createdByUserId: "user_001", description: "Household stabilization cash support scheduled for field release." }),
  createDistribution({ id: "distribution_019", programId: "program_019", name: "Community Enterprise Input Batch", method: "AGRICULTURE_SUPPORT", status: "COMPLETED", beneficiaryCount: 3900, quantity: 3900, scheduledDate: "2026-05-27T10:10:00Z", createdByUserId: "user_001", description: "Agricultural support kits delivered to enterprise bridge participants." }),
  createDistribution({ id: "distribution_020", programId: "program_020", name: "School Feeding Distribution - National Wave", method: "FOOD_PACKAGE", status: "COMPLETED", beneficiaryCount: 30000, quantity: 30000, scheduledDate: "2026-05-31T07:30:00Z", createdByUserId: "user_001", description: "National school feeding rollout for the current monthly cycle." }),
];
