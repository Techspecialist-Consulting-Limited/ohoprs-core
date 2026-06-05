import { z } from "zod";

import type { UserRole } from "@/types/auth";

export const userRoles = [
  "SUPER_ADMIN",
  "ORG_ADMIN",
  "PROGRAM_OFFICER",
  "AUDITOR",
  "ORGANIZATION_MANAGER",
  "STORE_MANAGER",
  "DISTRIBUTION_MANAGER",
  "ACCOUNTANT",
  "DIRECTOR",
] as const satisfies readonly UserRole[];

export const loginSchema = z.object({
  email: z.email("Enter a valid email address."),
  password: z.string().min(1, "Password is required."),
  role: z.enum(userRoles),
});

export const forgotPasswordSchema = z.object({
  email: z.email("Enter a valid email address."),
});

export const resetPasswordSchema = z
  .object({
    password: z.string().min(8, "Password must be at least 8 characters."),
    confirmPassword: z.string().min(8, "Confirm your password."),
  })
  .refine((values) => values.password === values.confirmPassword, {
    message: "Passwords do not match.",
    path: ["confirmPassword"],
  });
