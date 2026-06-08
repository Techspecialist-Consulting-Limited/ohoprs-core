import { z } from "zod";

export const verificationStatuses = ["VERIFIED", "PENDING", "FAILED", "FLAGGED"] as const;
export const benefitStatuses = ["ACTIVE", "PAUSED", "EXITED", "SUSPENDED"] as const;
export const beneficiaryGenders = ["MALE", "FEMALE"] as const;
export const maritalStatuses = ["SINGLE", "MARRIED", "DIVORCED", "WIDOWED"] as const;

const optionalDigits = (message: string) =>
  z
    .string()
    .regex(/^\d{11}$/, message)
    .optional()
    .or(z.literal(""));

export const beneficiarySchema = z.object({
  firstName: z.string().min(2, "First name is required"),
  lastName: z.string().min(2, "Last name is required"),
  middleName: z.string().optional().or(z.literal("")),
  nin: z.string().regex(/^\d{11}$/, "NIN must be exactly 11 digits"),
  bvn: optionalDigits("BVN must be exactly 11 digits"),
  phone: z.string().min(8, "Phone is required"),
  email: z.email("Enter a valid email").optional().or(z.literal("")),
  gender: z.enum(beneficiaryGenders),
  occupation: z.string().min(2, "Occupation is required"),
  maritalStatus: z.enum(maritalStatuses),
  householdDependents: z.coerce.number().min(0, "Household dependents cannot be negative"),
  numberOfChildren: z.coerce.number().min(0, "Number of children cannot be negative"),
  numberOfWives: z.coerce.number().min(0, "Number of wives cannot be negative"),
  dateOfBirth: z.string().min(1, "Date of birth is required"),
  state: z.string().min(2, "State is required"),
  lga: z.string().min(2, "LGA is required"),
  address: z.string().min(5, "Address is required"),
  organizationId: z.string().min(1, "Agency is required"),
  programIds: z.array(z.string()).min(1, "Select at least one program"),
  verificationStatus: z.enum(verificationStatuses),
  benefitStatus: z.enum(benefitStatuses),
});
