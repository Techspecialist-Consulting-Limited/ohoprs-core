import { beneficiariesData } from "@/mock/beneficiaries.mock";
import { distributionsData } from "@/mock/distributions.mock";
import type {
  DistributionExecutionStatus,
  DistributionMethod,
} from "@/types/distribution";
import type {
  DistributionPaymentReadiness,
  PaymentDetails,
  PaymentMethod,
  PaymentRecord,
  PaymentStatus,
  PaymentTimelineEvent,
} from "@/types/payment";

const supportedMethods: DistributionMethod[] = ["BANK_TRANSFER", "MOBILE_MONEY", "CASH"];
const bankNames = ["Access Bank", "UBA", "Zenith Bank", "First Bank", "Moniepoint"];

function isPaymentMethod(method: DistributionMethod): method is PaymentMethod {
  return supportedMethods.includes(method);
}

function maskNin(value: string) {
  return `${value.slice(0, 3)}******${value.slice(-2)}`;
}

function accountForIndex(index: number) {
  return `01${String(10000000 + index).slice(-8)}`;
}

function timelineForPayment(
  paymentId: string,
  createdAt: string,
  status: PaymentStatus,
  actor: string,
  failureReason?: string,
): PaymentTimelineEvent[] {
  const created = new Date(createdAt);
  const queued = new Date(created);
  queued.setMinutes(queued.getMinutes() + 5);
  const processing = new Date(created);
  processing.setMinutes(processing.getMinutes() + 20);
  const final = new Date(created);
  final.setMinutes(final.getMinutes() + 45);

  const events: PaymentTimelineEvent[] = [
    {
      id: `${paymentId}_created`,
      label: "Payment record created",
      description: "Beneficiary payment record was created after approval.",
      timestamp: created.toISOString(),
      actor,
      status: "COMPLETED",
    },
    {
      id: `${paymentId}_queued`,
      label: "Queued for processing",
      description: "Payment was queued for provider submission.",
      timestamp: queued.toISOString(),
      actor: "Payment Queue",
      status: "COMPLETED",
    },
    {
      id: `${paymentId}_processing`,
      label: "Sent to payment provider",
      description: "Provider handoff completed and processing started.",
      timestamp: processing.toISOString(),
      actor: "Settlement Switch",
      status: status === "PENDING" ? "PENDING" : "COMPLETED",
    },
  ];

  if (status === "PAID") {
    events.push({
      id: `${paymentId}_paid`,
      label: "Paid successfully",
      description: "Payment completed successfully and reconciliation passed.",
      timestamp: final.toISOString(),
      actor: "Settlement Switch",
      status: "COMPLETED",
    });
  }

  if (status === "FAILED" || status === "RETRY_PENDING") {
    events.push({
      id: `${paymentId}_failed`,
      label: status === "RETRY_PENDING" ? "Retry queued" : "Payment failed",
      description: failureReason ?? "Payment provider returned an exception response.",
      timestamp: final.toISOString(),
      actor: "Exception Desk",
      status: status === "RETRY_PENDING" ? "CURRENT" : "FAILED",
    });
  }

  if (status === "REVERSED") {
    events.push({
      id: `${paymentId}_reversed`,
      label: "Reversed after review",
      description: "Payment was reversed after post-settlement compliance review.",
      timestamp: final.toISOString(),
      actor: "Compliance Desk",
      status: "FAILED",
    });
  }

  if (status === "PROCESSING") {
    events.push({
      id: `${paymentId}_processing_current`,
      label: "Processing",
      description: "Provider processing is still in progress.",
      timestamp: final.toISOString(),
      actor: "Settlement Switch",
      status: "CURRENT",
    });
  }

  if (status === "PENDING") {
    events.push({
      id: `${paymentId}_pending`,
      label: "Pending execution",
      description: "Payment is waiting for execution.",
      timestamp: final.toISOString(),
      actor: "Payment Queue",
      status: "PENDING",
    });
  }

  return events.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
}

function mapStatus(index: number): { status: PaymentStatus; failureReason?: string } {
  if (index % 17 === 0) {
    return { status: "REVERSED", failureReason: "Reversed after duplicate eligibility review." };
  }

  if (index % 9 === 0) {
    return { status: "FAILED", failureReason: "Invalid bank account number." };
  }

  if (index % 11 === 0) {
    return { status: "RETRY_PENDING", failureReason: "Payment provider timeout." };
  }

  if (index % 7 === 0) {
    return { status: "PROCESSING" };
  }

  if (index % 5 === 0) {
    return { status: "PENDING" };
  }

  return { status: "PAID" };
}

function paymentDistributionScope() {
  return distributionsData.filter(
    (distribution): distribution is typeof distribution & { method: PaymentMethod } =>
      isPaymentMethod(distribution.method),
  );
}

function createPaymentRows() {
  const rows: PaymentDetails[] = [];
  const sourceDistributions = paymentDistributionScope();

  sourceDistributions.forEach((distribution, distributionIndex) => {
    const matchingBeneficiaries = beneficiariesData
      .filter(
        (beneficiary) =>
          beneficiary.organizationId === distribution.organizationId &&
          beneficiary.programIds.includes(distribution.programId),
      )
      .slice(0, 8);

    matchingBeneficiaries.forEach((beneficiary, beneficiaryIndex) => {
      const paymentIndex = rows.length + 1;
      const createdAt = new Date(new Date(distribution.scheduledDate).setDate(new Date(distribution.scheduledDate).getDate() - 1)).toISOString();
      const processedAt = new Date(new Date(createdAt).setHours(16, beneficiaryIndex * 3, 0, 0)).toISOString();
      const statusData = mapStatus(paymentIndex + distributionIndex);
      const amount = Math.round((distribution.amount ?? 0) / Math.max(distribution.beneficiaryCount, 1)) || 50000;
      const createdBy = distribution.createdBy;
      const approvedBy =
        distribution.createdByUserId === "user_002" || distribution.createdByUserId === "user_003"
          ? "Amina Bello"
          : "Musa Ibrahim";

      rows.push({
        id: `payment_${String(paymentIndex).padStart(4, "0")}`,
        reference: `PAY-2026-${String(paymentIndex).padStart(6, "0")}`,
        distributionId: distribution.id,
        distributionName: distribution.name,
        programId: distribution.programId,
        programName: distribution.programName,
        organizationId: distribution.organizationId,
        organizationName: distribution.organizationName,
        beneficiaryId: beneficiary.id,
        beneficiaryName: beneficiary.fullName,
        beneficiaryNin: maskNin(beneficiary.nin),
        beneficiaryPhone: beneficiary.phone,
        beneficiaryState: beneficiary.state,
        bankName: bankNames[paymentIndex % bankNames.length],
        accountNumber: accountForIndex(paymentIndex),
        amount,
        method: distribution.method as PaymentMethod,
        status: statusData.status,
        processedByUserId:
          statusData.status === "PAID" ||
          statusData.status === "FAILED" ||
          statusData.status === "REVERSED" ||
          statusData.status === "PROCESSING"
            ? "user_001"
            : undefined,
        processedBy:
          statusData.status === "PAID" ||
          statusData.status === "FAILED" ||
          statusData.status === "REVERSED" ||
          statusData.status === "PROCESSING"
            ? "Amina Bello"
            : undefined,
        processedAt:
          statusData.status === "PENDING" || statusData.status === "RETRY_PENDING"
            ? undefined
            : processedAt,
        createdAt,
        updatedAt: processedAt,
        failureReason: statusData.failureReason,
        approvedBy,
        approvedAt: new Date(new Date(createdAt).setHours(11, 15, 0, 0)).toISOString(),
        createdBy,
        timeline: timelineForPayment(
          `payment_${String(paymentIndex).padStart(4, "0")}`,
          createdAt,
          statusData.status,
          createdBy,
          statusData.failureReason,
        ),
      });
    });
  });

  return rows;
}

export const paymentsData: PaymentDetails[] = createPaymentRows();

export function createReadinessSummary(distributionId: string): DistributionPaymentReadiness {
  const payments = paymentsData.filter((payment) => payment.distributionId === distributionId);
  const paidPayments = payments.filter((payment) => payment.status === "PAID").length;
  const failedPayments = payments.filter(
    (payment) => payment.status === "FAILED" || payment.status === "RETRY_PENDING",
  ).length;
  const pendingPayments = payments.filter(
    (payment) => payment.status === "PENDING" || payment.status === "PROCESSING",
  ).length;
  const flaggedBeneficiaries = payments.filter((payment) => payment.status === "FAILED").length;

  return {
    distributionId,
    eligibleBeneficiaries: payments.length,
    flaggedBeneficiaries,
    pendingPayments,
    paidPayments,
    failedPayments,
    estimatedTotalPayout: payments.reduce((total, payment) => total + payment.amount, 0),
  };
}

export function determineExecutionStatusForPayments(distributionId: string): DistributionExecutionStatus {
  const payments = paymentsData.filter((payment) => payment.distributionId === distributionId);

  if (!payments.length) {
    return "NOT_STARTED";
  }

  const paid = payments.filter((payment) => payment.status === "PAID").length;
  const failed = payments.filter(
    (payment) => payment.status === "FAILED" || payment.status === "RETRY_PENDING",
  ).length;
  const reversed = payments.filter((payment) => payment.status === "REVERSED").length;
  const inFlight = payments.filter(
    (payment) => payment.status === "PENDING" || payment.status === "PROCESSING",
  ).length;

  if (reversed > 0 && reversed === payments.length) {
    return "REVERSED";
  }

  if (inFlight > 0) {
    return "PROCESSING";
  }

  if (paid > 0 && failed > 0) {
    return "PARTIALLY_PROCESSED";
  }

  if (paid === payments.length) {
    return "COMPLETED";
  }

  if (failed === payments.length) {
    return "FAILED";
  }

  return "PARTIALLY_PROCESSED";
}

export function toPaymentRecord(item: PaymentDetails): PaymentRecord {
  return {
    id: item.id,
    reference: item.reference,
    distributionId: item.distributionId,
    distributionName: item.distributionName,
    programId: item.programId,
    programName: item.programName,
    organizationId: item.organizationId,
    organizationName: item.organizationName,
    beneficiaryId: item.beneficiaryId,
    beneficiaryName: item.beneficiaryName,
    beneficiaryNin: item.beneficiaryNin,
    bankName: item.bankName,
    accountNumber: item.accountNumber,
    amount: item.amount,
    method: item.method,
    status: item.status,
    processedByUserId: item.processedByUserId,
    processedBy: item.processedBy,
    processedAt: item.processedAt,
    createdAt: item.createdAt,
    updatedAt: item.updatedAt,
    failureReason: item.failureReason,
  };
}
