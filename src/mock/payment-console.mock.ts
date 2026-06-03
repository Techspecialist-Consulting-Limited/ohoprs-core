import { auditLogsData } from "@/mock/audit.mock";
import { beneficiariesData } from "@/mock/beneficiaries.mock";
import { distributionsData } from "@/mock/distributions.mock";
import type { DistributionDetails } from "@/types/distribution";
import type { Beneficiary360Details } from "@/types/beneficiary";
import type { PaymentStatus } from "@/types/payment";
import type {
  PaymentConsolePaymentRecord,
  PaymentConsoleSeedScenario,
  PaymentConsoleStoreItem,
  PaymentConsoleTimelineItem,
} from "@/types/payment-console";

const paymentSeedScenarios: PaymentConsoleSeedScenario[] = [
  { distributionId: "distribution_001", beneficiaryIds: ["beneficiary_001", "beneficiary_002", "beneficiary_003", "beneficiary_004", "beneficiary_005", "beneficiary_006", "beneficiary_047"], statuses: ["PAID", "PAID", "PAID", "FAILED", "PAID", "REVERSED", "PAID"] },
  { distributionId: "distribution_004", beneficiaryIds: ["beneficiary_009", "beneficiary_010", "beneficiary_011", "beneficiary_012", "beneficiary_013", "beneficiary_014"], statuses: ["PAID", "PAID", "PAID", "PAID", "PAID", "PAID"] },
  { distributionId: "distribution_008", beneficiaryIds: ["beneficiary_016", "beneficiary_017", "beneficiary_018", "beneficiary_019"], statuses: ["FAILED", "FAILED", "PENDING", "PENDING"] },
  { distributionId: "distribution_009", beneficiaryIds: ["beneficiary_021", "beneficiary_022", "beneficiary_023", "beneficiary_024"], statuses: ["PENDING", "PENDING", "FAILED", "PENDING"] },
  { distributionId: "distribution_011", beneficiaryIds: ["beneficiary_025", "beneficiary_026", "beneficiary_027", "beneficiary_028"], statuses: ["PROCESSING", "PAID", "FAILED", "PENDING"] },
  { distributionId: "distribution_013", beneficiaryIds: ["beneficiary_029", "beneficiary_030"], statuses: ["PENDING", "PENDING"] },
  { distributionId: "distribution_017", beneficiaryIds: ["beneficiary_037", "beneficiary_038", "beneficiary_039", "beneficiary_040"], statuses: ["PAID", "FAILED", "PROCESSING", "PENDING"] },
  { distributionId: "distribution_018", beneficiaryIds: ["beneficiary_041", "beneficiary_042", "beneficiary_043", "beneficiary_044"], statuses: ["PENDING", "PENDING", "PENDING", "PENDING"] },
];

function isCashMethod(method: DistributionDetails["method"]) {
  return method === "BANK_TRANSFER" || method === "MOBILE_MONEY" || method === "CASH";
}

function maskNin(value: string) {
  return `${value.slice(0, 3)}******${value.slice(-2)}`;
}

function paymentFailureReasons(beneficiary: Beneficiary360Details) {
  const reasons: string[] = [];

  if (beneficiary.verificationStatus === "FAILED") {
    reasons.push("Identity verification failed.");
  }

  if (beneficiary.verificationStatus === "FLAGGED") {
    reasons.push("Beneficiary is flagged for manual compliance review.");
  }

  if (!beneficiary.verificationSummary.bankVerified) {
    reasons.push("Bank verification failed.");
  }

  if (!beneficiary.bvn?.trim()) {
    reasons.push("Missing BVN metadata.");
  }

  if (beneficiary.verificationSummary.duplicateCheck === "FAILED" || beneficiary.verificationSummary.duplicateCheck === "REVIEW_REQUIRED") {
    reasons.push("Duplicate profile review is unresolved.");
  }

  return reasons;
}

function amountPerBeneficiary(distribution: DistributionDetails, count: number) {
  if (!count) {
    return 0;
  }

  return Math.round((distribution.amount ?? 0) / count) || 50000;
}

function createPaymentRecord(
  distribution: DistributionDetails,
  beneficiary: Beneficiary360Details,
  status: PaymentStatus,
  index: number,
): PaymentConsolePaymentRecord {
  const hasBvn = Boolean(beneficiary.bvn?.trim());
  const bankVerified = beneficiary.verificationSummary.bankVerified;
  const duplicateFlag =
    beneficiary.verificationSummary.duplicateCheck === "FAILED" ||
    beneficiary.verificationSummary.duplicateCheck === "REVIEW_REQUIRED";
  const hasAccountMetadata = hasBvn && bankVerified;
  const riskFlags = [
    ...(beneficiary.verificationStatus === "FLAGGED" ? ["FLAGGED_VERIFICATION"] : []),
    ...(beneficiary.verificationStatus === "FAILED" ? ["FAILED_VERIFICATION"] : []),
    ...(!hasBvn ? ["MISSING_BVN"] : []),
    ...(!bankVerified ? ["BANK_NOT_VERIFIED"] : []),
    ...(duplicateFlag ? ["DUPLICATE_REVIEW"] : []),
  ];
  const failureReason = paymentFailureReasons(beneficiary)[0];
  const paymentId = `pc_${distribution.id}_${beneficiary.id}`;
  const createdAt = new Date(new Date(distribution.scheduledDate).setDate(new Date(distribution.scheduledDate).getDate() - 2)).toISOString();
  const processedAt = status === "PENDING" || status === "RETRY_PENDING" ? undefined : new Date(new Date(distribution.scheduledDate).setHours(14, (index % 8) * 4, 0, 0)).toISOString();

  return {
    id: paymentId,
    beneficiaryId: beneficiary.id,
    beneficiaryName: beneficiary.fullName,
    beneficiaryNin: maskNin(beneficiary.nin),
    beneficiaryState: beneficiary.state,
    bankName: ["Access Bank", "Zenith Bank", "UBA", "Moniepoint", "First Bank"][index % 5],
    accountNumber: `01${String(10000000 + index).slice(-8)}`,
    amount: amountPerBeneficiary(distribution, Math.max(distribution.beneficiaryCount, 1)),
    verificationStatus: beneficiary.verificationStatus,
    duplicateCheck: beneficiary.verificationSummary.duplicateCheck,
    bankVerified,
    hasBvn,
    hasAccountMetadata,
    riskFlags,
    paymentReference: status === "PENDING" ? undefined : `PAY-${distribution.id.replace("distribution_", "")}-${String(index + 1).padStart(4, "0")}`,
    status,
    failureReason: status === "FAILED" || status === "RETRY_PENDING" ? failureReason : undefined,
    processedBy: status === "PAID" || status === "FAILED" || status === "REVERSED" || status === "PROCESSING" ? "Amina Bello" : undefined,
    processedAt,
    createdAt,
    updatedAt: processedAt ?? createdAt,
  };
}

function beneficiariesForScenario(distribution: DistributionDetails, scenario?: PaymentConsoleSeedScenario) {
  if (scenario?.beneficiaryIds?.length) {
    return scenario.beneficiaryIds
      .map((id) => beneficiariesData.find((beneficiary) => beneficiary.id === id))
      .filter((value): value is Beneficiary360Details => Boolean(value));
  }

  return beneficiariesData
    .filter(
      (beneficiary) =>
        beneficiary.organizationId === distribution.organizationId &&
        beneficiary.programIds.includes(distribution.programId),
    )
    .slice(0, 8);
}

function paymentsForDistribution(distribution: DistributionDetails, scenario?: PaymentConsoleSeedScenario) {
  const beneficiaries = beneficiariesForScenario(distribution, scenario);
  const defaultStatuses = scenario?.statuses ?? beneficiaries.map(() => "PENDING" as PaymentStatus);

  return beneficiaries.map((beneficiary, index) =>
    createPaymentRecord(distribution, beneficiary, defaultStatuses[index] ?? "PENDING", index),
  );
}

function buildDistributionTimeline(distribution: DistributionDetails, payments: PaymentConsolePaymentRecord[]) {
  const latestPaymentUpdate = payments
    .filter((payment) => payment.processedAt)
    .sort((a, b) => new Date(b.processedAt ?? b.updatedAt).getTime() - new Date(a.processedAt ?? a.updatedAt).getTime())[0];

  const base: PaymentConsoleTimelineItem[] = [
    {
      id: `${distribution.id}_governance_created`,
      label: "Distribution created",
      description: "Payment console initialized from the shared distribution workflow.",
      timestamp: distribution.createdAt,
      actor: distribution.createdBy,
      tone: "neutral",
    },
    ...distribution.approvalHistory.map<PaymentConsoleTimelineItem>((item) => ({
      id: item.id,
      label: item.label,
      description: item.note ?? "Governance checkpoint recorded.",
      timestamp: item.timestamp,
      actor: item.actor,
      tone:
        item.label === "Approved"
          ? "success"
          : item.label === "Rejected"
            ? "danger"
            : "neutral",
    })),
  ];

  if (latestPaymentUpdate) {
    base.unshift({
      id: `${distribution.id}_latest_execution`,
      label: "Execution activity updated",
      description: `${latestPaymentUpdate.beneficiaryName} payment is currently ${latestPaymentUpdate.status.replaceAll("_", " ").toLowerCase()}.`,
      timestamp: latestPaymentUpdate.processedAt ?? latestPaymentUpdate.updatedAt,
      actor: latestPaymentUpdate.processedBy ?? "Payment Queue",
      tone:
        latestPaymentUpdate.status === "PAID"
          ? "success"
          : latestPaymentUpdate.status === "FAILED"
            ? "danger"
            : "warning",
    });
  }

  return base.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
}

function createStoreItems() {
  const store: Record<string, PaymentConsoleStoreItem> = {};

  paymentSeedScenarios.forEach((scenario) => {
    const distribution = distributionsData.find((item) => item.id === scenario.distributionId);
    if (!distribution || !isCashMethod(distribution.method)) {
      return;
    }

    const beneficiaries = beneficiariesForScenario(distribution, scenario);
    const payments = paymentsForDistribution(distribution, scenario);
    store[distribution.id] = {
      distributionId: distribution.id,
      beneficiaryIds: beneficiaries.map((beneficiary) => beneficiary.id),
      payments,
      executionTimeline: buildDistributionTimeline(distribution, payments),
    };
  });

  return store;
}

export let paymentConsoleStore = createStoreItems();

export function getPaymentConsoleStoreItem(distributionId: string) {
  const item = paymentConsoleStore[distributionId];
  return item
    ? JSON.parse(JSON.stringify(item)) as PaymentConsoleStoreItem
    : null;
}

export function replacePaymentConsoleStoreItem(item: PaymentConsoleStoreItem) {
  paymentConsoleStore = {
    ...paymentConsoleStore,
    [item.distributionId]: JSON.parse(JSON.stringify(item)) as PaymentConsoleStoreItem,
  };

  return getPaymentConsoleStoreItem(item.distributionId);
}

export function ensurePaymentConsoleStore(distributionId: string) {
  const existing = paymentConsoleStore[distributionId];
  if (existing) {
    return getPaymentConsoleStoreItem(distributionId);
  }

  const distribution = distributionsData.find((item) => item.id === distributionId);
  if (!distribution || !isCashMethod(distribution.method)) {
    return null;
  }

  const beneficiaries = beneficiariesForScenario(distribution);
  const payments = paymentsForDistribution(distribution, undefined);
  const next: PaymentConsoleStoreItem = {
    distributionId,
    beneficiaryIds: beneficiaries.map((beneficiary) => beneficiary.id),
    payments,
    executionTimeline: buildDistributionTimeline(distribution, payments),
  };

  return replacePaymentConsoleStoreItem(next);
}

export function auditPreviewForDistribution(distributionId: string) {
  return auditLogsData
    .filter((item) => item.resourceId === distributionId || item.metadata?.distributionId === distributionId)
    .slice(0, 8);
}
