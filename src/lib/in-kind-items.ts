import { getHouseholdIdForBeneficiary } from "@/mock/households.mock";
import type { DeliveryStatus, DistributionRecipientPreview, InKindItem, InKindItemDeliveryStatus } from "@/types/distribution";
import type { BenefitType } from "@/types/program";

const itemConfigByBenefitType: Partial<Record<BenefitType, { itemType: string; unit: string }>> = {
  FOOD: { itemType: "Food Package", unit: "bag" },
  FOOD_VOUCHER: { itemType: "Food Voucher", unit: "voucher" },
  MEDICAL: { itemType: "Medical Supply Kit", unit: "kit" },
  EDUCATION: { itemType: "School Supplies Pack", unit: "pack" },
  AGRICULTURE: { itemType: "Agricultural Input Pack", unit: "pack" },
  HOUSING: { itemType: "Housing Support Materials", unit: "set" },
  CONSTRUCTION_MATERIALS: { itemType: "Construction Materials", unit: "set" },
  RELIEF_MATERIALS: { itemType: "Relief Materials Kit", unit: "kit" },
  EMERGENCY_RELIEF: { itemType: "Emergency Relief Kit", unit: "kit" },
  OTHER: { itemType: "Relief Item", unit: "unit" },
};

function mapDeliveryStatus(status: DeliveryStatus): InKindItemDeliveryStatus {
  if (status === "DELIVERED") {
    return "DELIVERED";
  }

  if (status === "REVERSED") {
    return "RETURNED";
  }

  if (status === "FAILED") {
    return "FAILED";
  }

  return "PENDING";
}

export function buildInKindItems(
  distributionId: string,
  benefitType: BenefitType,
  recipients: DistributionRecipientPreview[],
): InKindItem[] {
  if (benefitType === "CASH") {
    return [];
  }

  const config = itemConfigByBenefitType[benefitType] ?? { itemType: "Relief Item", unit: "unit" };
  const codePrefix = distributionId.toUpperCase().replaceAll("_", "-");

  return recipients.map((recipient, index) => {
    const deliveryStatus = mapDeliveryStatus(recipient.deliveryStatus);
    const sequence = String(index + 1).padStart(4, "0");

    return {
      id: `${distributionId}_item_${index + 1}`,
      distributionId,
      itemType: config.itemType,
      unit: config.unit,
      quantity: 1,
      batchOrSerialCode: `BATCH-${codePrefix}-${sequence}`,
      qrCode: `QR-${codePrefix}-${sequence}`,
      recipientBeneficiaryId: recipient.beneficiaryId,
      recipientHouseholdId: getHouseholdIdForBeneficiary(recipient.beneficiaryId),
      deliveryLocation: [recipient.address, recipient.lga, recipient.state].filter(Boolean).join(", "),
      deliveryStatus,
      deliveredAt: deliveryStatus === "DELIVERED" ? new Date().toISOString() : null,
    };
  });
}
