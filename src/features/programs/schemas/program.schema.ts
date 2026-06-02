import { z } from "zod";

export const benefitTypes = [
  "CASH",
  "FOOD",
  "MEDICAL",
  "EDUCATION",
  "AGRICULTURE",
  "HOUSING",
  "EMERGENCY_RELIEF",
  "OTHER",
] as const;

export const programStatuses = [
  "DRAFT",
  "ACTIVE",
  "PAUSED",
  "COMPLETED",
  "SUSPENDED",
] as const;

export const programSchema = z
  .object({
    name: z.string().min(3, "Program name is required"),
    organizationId: z.string().min(1, "Organization is required"),
    benefitType: z.enum(benefitTypes),
    description: z.string().min(10, "Description is required"),
    startDate: z.string().min(1, "Start date is required"),
    endDate: z.string().min(1, "End date is required"),
    targetBeneficiaries: z.coerce.number().min(1),
    budget: z.coerce.number().min(0),
    status: z.enum(programStatuses),
  })
  .refine((values) => values.endDate >= values.startDate, {
    message: "End date cannot be earlier than start date.",
    path: ["endDate"],
  });
