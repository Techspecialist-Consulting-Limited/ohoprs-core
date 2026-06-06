import { z } from "zod";

export const organizationTypes = [
  "FEDERAL_MINISTRY",
  "STATE_AGENCY",
  "LOCAL_GOVERNMENT",
  "NGO",
  "DONOR_AGENCY",
  "PRIVATE_PARTNER",
] as const;

export const organizationStatuses = [
  "ACTIVE",
  "INACTIVE",
  "SUSPENDED",
  "PENDING_REVIEW",
] as const;

export const organizationSchema = z.object({
  name: z.string().min(3, "Agency name is required"),
  shortName: z.string().min(2, "Acronym is required"),
  type: z.enum(organizationTypes),
  description: z.string().min(10, "Description is required"),
  contactEmail: z.email("Enter a valid email"),
  contactPhone: z.string().min(8, "Contact phone is required"),
  website: z.string().url("Enter a valid website").optional().or(z.literal("")),
  address: z.string().min(5, "Address is required"),
  state: z.string().min(2, "State is required"),
  status: z.enum(organizationStatuses),
});
