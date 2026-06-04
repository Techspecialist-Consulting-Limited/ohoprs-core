import { z } from "zod";

const cashMethods = ["BANK_TRANSFER", "MOBILE_MONEY", "CASH"] as const;
const supportMethods = ["FOOD_PACKAGE", "MEDICAL_SUPPORT", "EDUCATION_SUPPORT", "AGRICULTURE_SUPPORT"] as const;

export const distributionSchema = z
  .object({
    name: z.string().min(3, "Distribution name is required"),
    organizationId: z.string().min(1, "Organization is required"),
    programId: z.string().min(1, "Intervention is required"),
    method: z.enum([...cashMethods, ...supportMethods]),
    description: z.string().min(10, "Description is required"),
    beneficiaryCount: z.coerce.number().min(1, "Beneficiary count must be at least 1"),
    amount: z.coerce.number().optional(),
    quantity: z.coerce.number().optional(),
    scheduledDate: z.string().min(1, "Scheduled date is required"),
    status: z.enum(["DRAFT", "SCHEDULED", "PROCESSING", "COMPLETED", "FAILED", "CANCELLED"]),
  })
  .superRefine((value, ctx) => {
    const isCash = cashMethods.includes(value.method as (typeof cashMethods)[number]);

    if (isCash && (value.amount === undefined || Number.isNaN(value.amount) || value.amount <= 0)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["amount"],
        message: "Amount is required for cash distributions.",
      });
    }

    if (!isCash && (value.quantity === undefined || Number.isNaN(value.quantity) || value.quantity <= 0)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["quantity"],
        message: "Quantity is required for support distributions.",
      });
    }
  });

export type DistributionSchema = z.infer<typeof distributionSchema>;
