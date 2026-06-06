import { z } from "zod";

export const distributionSchema = z.object({
  programId: z.string().min(1, "Intervention is required"),
  phaseNumber: z.coerce.number().min(1, "Select a trench or batch"),
  states: z.array(z.string()).min(1, "Select at least one state"),
  beneficiaryIds: z.array(z.string()).min(1, "Select at least one beneficiary"),
});

export type DistributionSchema = z.infer<typeof distributionSchema>;
