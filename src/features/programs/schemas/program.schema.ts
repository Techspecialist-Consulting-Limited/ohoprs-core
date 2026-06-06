import { z } from "zod";

import { getStatesForRegions } from "@/constants/nigeria-regions";

function getTodayDateForValidation() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

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
  "IN_PROGRESS",
  "COMPLETED",
  "REJECTED",
  "APPROVED",
  "ACTIVE",
  "SUSPENDED",
] as const;

export const systemApprovalRoles = [
  "ORGANIZATION_MANAGER",
  "STORE_MANAGER",
  "DISTRIBUTION_MANAGER",
  "ACCOUNTANT",
  "DIRECTOR",
] as const;

export const programDurationSchema = z.object({
  days: z.coerce.number().int().min(0).max(27),
  weeks: z.coerce.number().int().min(0).max(3),
  months: z.coerce.number().int().min(0).max(11),
  years: z.coerce.number().int().min(0).max(20),
});

export const programFundingSourceSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  createdByUserId: z.string().nullable(),
  isCustom: z.boolean(),
});

export const programApprovalStepSchema = z.object({
  id: z.string().min(1),
  order: z.coerce.number().int().min(1),
  role: z.enum(systemApprovalRoles),
  assigneeUserId: z.string().min(1, "Select an assignee."),
  assigneeName: z.string().min(1),
  assigneeEmail: z.string().min(1),
  status: z.enum(["PENDING", "APPROVED", "REJECTED"]).default("PENDING"),
  approvedAt: z.string().nullable().default(null),
  rejectionReason: z.string().nullable().optional(),
});

export const programSchema = z
  .object({
    name: z.string().min(3, "Intervention name is required"),
    organizationId: z.string().min(1, "Organization is required"),
    benefitType: z.enum(benefitTypes),
    description: z.string().min(10, "Description is required"),
    startDate: z.string().optional().default(""),
    endDate: z.string().optional().default(""),
    duration: programDurationSchema,
    recipientCount: z.coerce.number().int().min(0),
    amountPerRecipient: z.coerce.number().nullable().optional(),
    regions: z.array(z.string()).default([]),
    states: z.array(z.string()).default([]),
    amount: z.coerce.number().nullable().optional(),
    budget: z.coerce.number().nullable().optional(),
    numberOfTrenches: z.coerce.number().nullable().optional(),
    batch: z.coerce.number().nullable().optional(),
    fundingSources: z.array(programFundingSourceSchema).min(1, "Select at least one funding source."),
    status: z.enum(programStatuses),
    approvalSteps: z.array(programApprovalStepSchema).min(1, "Add at least one approval step."),
    createdByUserId: z.string().nullable().optional(),
  })
  .superRefine((values, ctx) => {
    const isCash = values.benefitType === "CASH";
    const today = getTodayDateForValidation();

    if (
      values.duration.days === 0 &&
      values.duration.weeks === 0 &&
      values.duration.months === 0 &&
      values.duration.years === 0
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["duration"],
        message: "Provide at least one duration value.",
      });
    }

    if (values.startDate && values.startDate < today) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["startDate"],
        message: "Start date cannot be earlier than today.",
      });
    }

    if (values.startDate && values.endDate && values.endDate < values.startDate) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["endDate"],
        message: "End date cannot be earlier than start date.",
      });
    }

    if (values.recipientCount <= 0) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["recipientCount"],
        message: "Total number of beneficiaries/recipients is required.",
      });
    }

    if (
      values.amountPerRecipient === null ||
      values.amountPerRecipient === undefined ||
      Number.isNaN(values.amountPerRecipient) ||
      values.amountPerRecipient <= 0
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["amountPerRecipient"],
        message: "Amount to be received is required.",
      });
    }

    if (values.regions.length === 0) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["regions"],
        message: "Select at least one region.",
      });
    }

    if (values.states.length === 0) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["states"],
        message: "Select at least one state.",
      });
    }

    const allowedStates = new Set(getStatesForRegions(values.regions));
    if (values.states.some((state) => !allowedStates.has(state))) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["states"],
        message: "Selected states must belong to the selected region(s).",
      });
    }

    if (isCash) {
      if (values.amount === null || values.amount === undefined || Number.isNaN(values.amount) || values.amount <= 0) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["amount"],
          message: "Amount is required for cash interventions.",
        });
      }

      if (
        values.numberOfTrenches === null ||
        values.numberOfTrenches === undefined ||
        Number.isNaN(values.numberOfTrenches) ||
        values.numberOfTrenches <= 0
      ) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["numberOfTrenches"],
          message: "Number of trenches is required for cash interventions.",
        });
      }
    } else if (values.budget === null || values.budget === undefined || Number.isNaN(values.budget) || values.budget <= 0) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["budget"],
        message: "Budget is required for non-cash interventions.",
      });
    } else if (values.batch === null || values.batch === undefined || Number.isNaN(values.batch) || values.batch <= 0) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["batch"],
        message: "Batch is required for non-cash interventions.",
      });
    }

    const assigneeIds = values.approvalSteps.map((step) => step.assigneeUserId);
    if (new Set(assigneeIds).size !== assigneeIds.length) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["approvalSteps"],
        message: "Each approval step must have a different assignee.",
      });
    }
  });
