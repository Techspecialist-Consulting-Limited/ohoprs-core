import { z } from "zod";

const cashMethods = ["BANK_TRANSFER", "MOBILE_MONEY", "CASH"] as const;
const supportMethods = ["FOOD_PACKAGE", "MEDICAL_SUPPORT", "EDUCATION_SUPPORT", "AGRICULTURE_SUPPORT"] as const;

export const bulkDistributionSchema = z
  .object({
    organizationId: z.string().min(1, "Organization is required"),
    programId: z.string().min(1, "Program is required"),
    method: z.enum([...cashMethods, ...supportMethods]),
    segment: z.enum(["ALL_VERIFIED", "SELECTED_STATE", "PROGRAM_ENROLLED", "PENDING_UNPAID", "CUSTOM_UPLOAD"]),
    state: z.string().optional(),
    beneficiaryCount: z.coerce.number().min(1, "Beneficiary count must be at least 1"),
    amount: z.coerce.number().optional(),
    quantity: z.coerce.number().optional(),
    scheduledDate: z.string().min(1, "Scheduled date is required"),
    mockUploadFileName: z.string().optional(),
  })
  .superRefine((value, ctx) => {
    const isCash = cashMethods.includes(value.method as (typeof cashMethods)[number]);

    if (isCash && (value.amount === undefined || Number.isNaN(value.amount) || value.amount <= 0)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["amount"],
        message: "Amount per beneficiary is required for cash jobs.",
      });
    }

    if (!isCash && (value.quantity === undefined || Number.isNaN(value.quantity) || value.quantity <= 0)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["quantity"],
        message: "Quantity per beneficiary is required for support jobs.",
      });
    }

    if (value.segment === "SELECTED_STATE" && !value.state?.trim()) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["state"],
        message: "State is required for selected-state jobs.",
      });
    }

    if (value.segment === "CUSTOM_UPLOAD" && !value.mockUploadFileName?.trim()) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["mockUploadFileName"],
        message: "Mock upload file is required for custom upload jobs.",
      });
    }
  });
