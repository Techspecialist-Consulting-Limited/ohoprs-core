import { beneficiariesData } from "@/mock/beneficiaries.mock";
import { programsData } from "@/mock/programs.mock";
import type {
  DistributionApprovalStatus,
  DistributionDetails,
  DistributionExecutionStatus,
  DistributionFinalApprovalStatus,
  DistributionMethod,
  DistributionPhaseType,
  DistributionRecipientPreview,
  DistributionStatus,
  DistributionTimelineItem,
} from "@/types/distribution";
import type { ProgramDetails } from "@/types/program";

const creatorDirectory = {
  user_001: "Amina Bello",
  user_002: "Musa Ibrahim",
  user_003: "Chioma Okafor",
  user_004: "David Audu",
} as const;

function getProgram(id: string) {
  return programsData.find((item) => item.id === id) as ProgramDetails | undefined;
}

function getPhaseType(program: ProgramDetails): DistributionPhaseType {
  return program.benefitType === "CASH" ? "TRENCH" : "BATCH";
}

function getPhaseLabel(phaseType: DistributionPhaseType, phaseNumber: number) {
  return `${phaseType === "TRENCH" ? "Trench" : "Batch"} ${phaseNumber}`;
}

function getMethod(program: ProgramDetails): DistributionMethod {
  if (program.benefitType === "CASH") {
    return "BANK_TRANSFER";
  }

  if (program.benefitType === "MEDICAL") {
    return "MEDICAL_SUPPORT";
  }

  if (program.benefitType === "EDUCATION") {
    return "EDUCATION_SUPPORT";
  }

  if (program.benefitType === "AGRICULTURE") {
    return "AGRICULTURE_SUPPORT";
  }

  return "FOOD_PACKAGE";
}

function maskNin(value: string) {
  return `${value.slice(0, 3)}******${value.slice(-2)}`;
}

function accountNumberForIndex(index: number) {
  return `01${String(10000000 + index).slice(-8)}`;
}

function bankNameForIndex(index: number) {
  return ["Access Bank", "UBA", "Zenith Bank", "First Bank", "Moniepoint"][index % 5];
}

function buildRecipients(program: ProgramDetails, states: string[], count = 5): DistributionRecipientPreview[] {
  const isCash = program.benefitType === "CASH";

  return beneficiariesData
    .filter((item) => item.organizationId === program.organizationId)
    .filter((item) => item.programIds.includes(program.id))
    .filter((item) => states.length === 0 || states.includes(item.state))
    .slice(0, count)
    .map((item, index) => ({
      id: `${program.id}_recipient_${index + 1}`,
      beneficiaryId: item.id,
      fullName: item.fullName,
      nin: maskNin(item.nin),
      state: item.state,
      lga: isCash ? undefined : item.lga,
      address: isCash ? undefined : item.address,
      bankName: isCash ? bankNameForIndex(index) : undefined,
      accountNumber: isCash ? accountNumberForIndex(index) : undefined,
      deliveryStatus: index === 3 ? "PENDING" : index === 4 ? "FAILED" : "DELIVERED",
    }));
}

function buildDistributionApprovalSteps(program: ProgramDetails, approvalStatus: DistributionApprovalStatus) {
  const template = program.distributionApprovalSteps ?? [];

  if (approvalStatus === "APPROVED") {
    return template.map((step, index) => ({
      ...step,
      id: `distribution_approval_${step.id}`,
      status: "APPROVED" as const,
      approvedAt: new Date(Date.now() - (template.length - index) * 3_600_000).toISOString(),
    }));
  }

  if (approvalStatus === "REJECTED") {
    return template.map((step, index) => ({
      ...step,
      id: `distribution_approval_${step.id}`,
      status: index === 0 ? ("REJECTED" as const) : ("PENDING" as const),
      approvedAt: null,
      rejectionReason: index === 0 ? "Rejected during agency approval review." : undefined,
    }));
  }

  return template.map((step, index) => ({
    ...step,
    id: `distribution_approval_${step.id}`,
    status: index === 0 && approvalStatus === "SUBMITTED" ? ("PENDING" as const) : ("PENDING" as const),
    approvedAt: null,
  }));
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

  if (status !== "DRAFT" && status !== "SCHEDULED") {
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

function createValidationSummary(beneficiaryCount: number, estimatedTotalAmount: number, flaggedBeneficiaries: number) {
  const pendingVerification = Math.min(Math.round(beneficiaryCount * 0.04), 600);
  const failedVerification = Math.min(Math.round(beneficiaryCount * 0.01), 120);
  const duplicateRecords = Math.min(Math.round(beneficiaryCount * 0.005), 60);
  const verifiedBeneficiaries = Math.max(beneficiaryCount - pendingVerification - failedVerification, 0);
  const eligibleBeneficiaries = Math.max(verifiedBeneficiaries - duplicateRecords - flaggedBeneficiaries, 0);

  return {
    verifiedBeneficiaries,
    pendingVerification,
    failedVerification,
    duplicateRecords,
    flaggedBeneficiaries,
    eligibleBeneficiaries,
    estimatedTotalAmount,
  };
}

function isHighRisk(summary: { estimatedTotalAmount: number; flaggedBeneficiaries: number }, beneficiaryCount: number) {
  return summary.estimatedTotalAmount >= 500000000 || beneficiaryCount >= 10000 || summary.flaggedBeneficiaries > 0;
}

function buildApprovalHistory(
  id: string,
  createdBy: string,
  approvalStatus: DistributionApprovalStatus,
  scheduledDate: string,
  rejectionReason?: string,
) {
  const createdAt = new Date(scheduledDate);
  createdAt.setDate(createdAt.getDate() - 8);
  const submittedAt = new Date(scheduledDate);
  submittedAt.setDate(submittedAt.getDate() - 5);
  const decidedAt = new Date(scheduledDate);
  decidedAt.setDate(decidedAt.getDate() - 3);

  const history = [
    {
      id: `${id}_approval_created`,
      label: "Created",
      actor: createdBy,
      timestamp: createdAt.toISOString(),
      note: "Distribution draft captured for payment governance review.",
    },
  ];

  if (approvalStatus !== "DRAFT") {
    history.push({
      id: `${id}_approval_submitted`,
      label: "Submitted for approval",
      actor: createdBy,
      timestamp: submittedAt.toISOString(),
      note: "Distribution submitted for authorization review.",
    });
  }

  if (approvalStatus === "APPROVED") {
    history.push({
      id: `${id}_approval_approved`,
      label: "Agency approved",
      actor: "Amina Bello",
      timestamp: decidedAt.toISOString(),
      note: "Agency approval workflow completed.",
    });
  }

  if (approvalStatus === "REJECTED") {
    history.push({
      id: `${id}_approval_rejected`,
      label: "Rejected",
      actor: "Musa Ibrahim",
      timestamp: decidedAt.toISOString(),
      note: rejectionReason ?? "Beneficiary validation exceptions require correction.",
    });
  }

  return history.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
}

function createDistribution(input: {
  id: string;
  programId: string;
  phaseNumber: number;
  status: DistributionStatus;
  approvalStatus?: DistributionApprovalStatus;
  finalApprovalStatus?: DistributionFinalApprovalStatus;
  executionStatus?: DistributionExecutionStatus;
  beneficiaryCount: number;
  amount?: number;
  quantity?: number;
  scheduledDate: string;
  createdByUserId: keyof typeof creatorDirectory;
  description?: string;
  flaggedBeneficiaries?: number;
  rejectionReason?: string;
  states?: string[];
}): DistributionDetails {
  const program = getProgram(input.programId)!;
  const phaseType = getPhaseType(program);
  const method = getMethod(program);
  const states = input.states?.length ? input.states : (program.states ?? []).slice(0, Math.min(3, program.states?.length ?? 0));
  const recipients = buildRecipients(program, states);
  const selectedBeneficiaryIds = recipients.map((item) => item.beneficiaryId);
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
  const estimatedTotalAmount = program.benefitType === "CASH" ? input.amount ?? 0 : input.beneficiaryCount * 15000;
  const validationSummary = createValidationSummary(
    input.beneficiaryCount,
    estimatedTotalAmount,
    input.flaggedBeneficiaries ?? (input.status === "FAILED" ? 8 : input.beneficiaryCount >= 10000 ? 5 : 0),
  );
  const approvalStatus =
    input.approvalStatus ??
    (input.status === "DRAFT" ? "DRAFT" : input.status === "SCHEDULED" ? "SUBMITTED" : "APPROVED");
  const executionStatus =
    input.executionStatus ??
    (input.status === "COMPLETED"
      ? "COMPLETED"
      : input.status === "PROCESSING"
        ? "PROCESSING"
        : input.status === "FAILED" || input.status === "CANCELLED"
          ? "FAILED"
          : "NOT_STARTED");

  const finalApprovalStatus =
    input.finalApprovalStatus ??
    (approvalStatus === "APPROVED" && executionStatus !== "NOT_STARTED" ? "APPROVED" : "PENDING");

  return {
    id: input.id,
    organizationId: program.organizationId,
    organizationName: program.organizationName,
    programId: program.id,
    programName: program.name,
    name: getPhaseLabel(phaseType, input.phaseNumber),
    phaseType,
    phaseNumber: input.phaseNumber,
    states,
    selectedBeneficiaryIds,
    benefitType: program.benefitType,
    method,
    description:
      input.description ??
      `${getPhaseLabel(phaseType, input.phaseNumber)} prepared for ${input.beneficiaryCount.toLocaleString()} selected beneficiaries.`,
    beneficiaryCount: input.beneficiaryCount,
    amount: program.benefitType === "CASH" ? input.amount ?? 0 : undefined,
    quantity: program.benefitType === "CASH" ? undefined : input.quantity ?? input.beneficiaryCount,
    status: input.status,
    approvalStatus,
    finalApprovalStatus,
    executionStatus,
    distributionApprovalSteps: buildDistributionApprovalSteps(program, approvalStatus),
    scheduledDate: input.scheduledDate,
    createdByUserId: input.createdByUserId,
    createdBy,
    createdAt: new Date(new Date(input.scheduledDate).setDate(new Date(input.scheduledDate).getDate() - 8)).toISOString(),
    updatedAt: new Date(new Date(input.scheduledDate).setDate(new Date(input.scheduledDate).getDate() - 1)).toISOString(),
    finalApprovedAt: finalApprovalStatus === "APPROVED" ? new Date(new Date(input.scheduledDate).setDate(new Date(input.scheduledDate).getDate() - 2)).toISOString() : null,
    finalApprovedBy: finalApprovalStatus === "APPROVED" ? "Amina Bello" : null,
    paymentInitiatedAt: executionStatus === "PROCESSING" || executionStatus === "COMPLETED" ? new Date(new Date(input.scheduledDate).setDate(new Date(input.scheduledDate).getDate() - 1)).toISOString() : null,
    paymentInitiatedBy: executionStatus === "PROCESSING" || executionStatus === "COMPLETED" ? "Tunde Afolabi" : null,
    programStatus: program.status,
    organizationType: program.organizationType,
    organizationStatus: program.organizationStatus,
    recipients,
    statistics: {
      beneficiaries: input.beneficiaryCount,
      amountDistributed: program.benefitType === "CASH" ? input.amount ?? 0 : 0,
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
        action: `Created ${getPhaseLabel(phaseType, input.phaseNumber).toLowerCase()}`,
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
    approvalHistory: buildApprovalHistory(input.id, createdBy, approvalStatus, input.scheduledDate, input.rejectionReason),
    validationSummary,
    isHighRisk: isHighRisk(validationSummary, input.beneficiaryCount),
    rejectionReason: input.rejectionReason,
  };
}

export const distributionsData: DistributionDetails[] = [
  createDistribution({ id: "distribution_001", programId: "program_002", phaseNumber: 1, status: "COMPLETED", approvalStatus: "APPROVED", executionStatus: "COMPLETED", beneficiaryCount: 25000, amount: 500000000, scheduledDate: "2026-06-01T09:00:00Z", createdByUserId: "user_002", states: ["FCT", "Lagos"] }),
  createDistribution({ id: "distribution_002", programId: "program_001", phaseNumber: 1, status: "SCHEDULED", approvalStatus: "SUBMITTED", executionStatus: "NOT_STARTED", beneficiaryCount: 15000, quantity: 15000, scheduledDate: "2026-06-03T08:00:00Z", createdByUserId: "user_003", states: ["FCT", "Kaduna"] }),
  createDistribution({ id: "distribution_003", programId: "program_003", phaseNumber: 1, status: "PROCESSING", approvalStatus: "APPROVED", executionStatus: "PROCESSING", beneficiaryCount: 8000, quantity: 8000, scheduledDate: "2026-06-04T10:00:00Z", createdByUserId: "user_003", states: ["FCT", "Borno"] }),
  createDistribution({ id: "distribution_004", programId: "program_004", phaseNumber: 1, status: "COMPLETED", beneficiaryCount: 12000, amount: 180000000, scheduledDate: "2026-05-29T09:30:00Z", createdByUserId: "user_002", states: ["Lagos"] }),
  createDistribution({ id: "distribution_005", programId: "program_005", phaseNumber: 1, status: "COMPLETED", beneficiaryCount: 17000, quantity: 17000, scheduledDate: "2026-05-28T07:45:00Z", createdByUserId: "user_003", states: ["Lagos"] }),
  createDistribution({ id: "distribution_006", programId: "program_006", phaseNumber: 1, status: "FAILED", approvalStatus: "APPROVED", executionStatus: "FAILED", beneficiaryCount: 4500, quantity: 4500, scheduledDate: "2026-05-26T11:00:00Z", createdByUserId: "user_002", flaggedBeneficiaries: 11, states: ["Lagos"] }),
  createDistribution({ id: "distribution_007", programId: "program_007", phaseNumber: 1, status: "PROCESSING", beneficiaryCount: 9000, quantity: 9000, scheduledDate: "2026-06-05T08:30:00Z", createdByUserId: "user_003", states: ["Kano"] }),
  createDistribution({ id: "distribution_008", programId: "program_008", phaseNumber: 1, status: "CANCELLED", approvalStatus: "REJECTED", executionStatus: "FAILED", beneficiaryCount: 6000, amount: 96000000, scheduledDate: "2026-05-21T09:00:00Z", createdByUserId: "user_003", rejectionReason: "Approval rejected pending duplicate household remediation.", states: ["Kano"] }),
  createDistribution({ id: "distribution_009", programId: "program_009", phaseNumber: 1, status: "SCHEDULED", beneficiaryCount: 5200, amount: 78000000, scheduledDate: "2026-06-06T10:00:00Z", createdByUserId: "user_002", states: ["Kaduna"] }),
  createDistribution({ id: "distribution_010", programId: "program_010", phaseNumber: 1, status: "COMPLETED", beneficiaryCount: 8400, quantity: 8400, scheduledDate: "2026-05-25T08:15:00Z", createdByUserId: "user_002", states: ["Kaduna"] }),
  createDistribution({ id: "distribution_011", programId: "program_011", phaseNumber: 1, status: "PROCESSING", approvalStatus: "APPROVED", executionStatus: "PROCESSING", beneficiaryCount: 7100, amount: 142000000, scheduledDate: "2026-06-02T09:45:00Z", createdByUserId: "user_001", states: ["Plateau"] }),
  createDistribution({ id: "distribution_012", programId: "program_012", phaseNumber: 1, status: "SCHEDULED", beneficiaryCount: 4500, quantity: 4500, scheduledDate: "2026-06-07T12:00:00Z", createdByUserId: "user_001", states: ["Borno"] }),
  createDistribution({ id: "distribution_013", programId: "program_013", phaseNumber: 1, status: "DRAFT", approvalStatus: "DRAFT", executionStatus: "NOT_STARTED", beneficiaryCount: 1800, amount: 18000000, scheduledDate: "2026-06-10T10:30:00Z", createdByUserId: "user_001", states: ["Abia"] }),
  createDistribution({ id: "distribution_014", programId: "program_014", phaseNumber: 1, status: "COMPLETED", beneficiaryCount: 9800, quantity: 9800, scheduledDate: "2026-05-23T08:00:00Z", createdByUserId: "user_001", states: ["Osun"] }),
  createDistribution({ id: "distribution_015", programId: "program_015", phaseNumber: 1, status: "FAILED", approvalStatus: "APPROVED", executionStatus: "FAILED", beneficiaryCount: 4300, quantity: 4300, scheduledDate: "2026-05-20T11:30:00Z", createdByUserId: "user_001", flaggedBeneficiaries: 6, states: ["Benue"] }),
  createDistribution({ id: "distribution_016", programId: "program_016", phaseNumber: 1, status: "COMPLETED", beneficiaryCount: 6200, quantity: 6200, scheduledDate: "2026-05-24T09:20:00Z", createdByUserId: "user_001", states: ["Ekiti"] }),
  createDistribution({ id: "distribution_017", programId: "program_017", phaseNumber: 1, status: "PROCESSING", approvalStatus: "APPROVED", executionStatus: "PROCESSING", beneficiaryCount: 11500, amount: 230000000, scheduledDate: "2026-06-08T09:40:00Z", createdByUserId: "user_001", states: ["Rivers"] }),
  createDistribution({ id: "distribution_018", programId: "program_018", phaseNumber: 1, status: "SCHEDULED", approvalStatus: "SUBMITTED", executionStatus: "NOT_STARTED", beneficiaryCount: 5400, amount: 70200000, scheduledDate: "2026-06-09T13:00:00Z", createdByUserId: "user_001", states: ["Bauchi"] }),
  createDistribution({ id: "distribution_019", programId: "program_019", phaseNumber: 1, status: "COMPLETED", beneficiaryCount: 3900, quantity: 3900, scheduledDate: "2026-05-27T10:10:00Z", createdByUserId: "user_001", states: ["Cross River"] }),
  createDistribution({ id: "distribution_020", programId: "program_020", phaseNumber: 1, status: "COMPLETED", beneficiaryCount: 30000, quantity: 30000, scheduledDate: "2026-05-31T07:30:00Z", createdByUserId: "user_001", states: ["FCT"] }),
];
