import type { UserRole } from "@/types/auth";

export const permissions = [
  "create_organization",
  "view_organizations",
  "create_program",
  "view_programs",
  "upload_beneficiaries",
  "view_beneficiaries",
  "create_distribution",
  "view_distributions",
  "view_reports",
  "view_audit_logs",
  "manage_settings",
] as const;

export type Permission = (typeof permissions)[number];

export const rolePermissions: Record<UserRole, Permission[]> = {
  SUPER_ADMIN: [
    "create_organization",
    "view_organizations",
    "create_program",
    "view_programs",
    "upload_beneficiaries",
    "view_beneficiaries",
    "create_distribution",
    "view_distributions",
    "view_reports",
    "view_audit_logs",
    "manage_settings",
  ],
  ORG_ADMIN: [
    "view_organizations",
    "create_program",
    "view_programs",
    "upload_beneficiaries",
    "view_beneficiaries",
    "create_distribution",
    "view_distributions",
    "view_reports",
  ],
  PROGRAM_OFFICER: [
    "view_programs",
    "upload_beneficiaries",
    "view_beneficiaries",
    "create_distribution",
    "view_distributions",
  ],
  AUDITOR: [
    "view_organizations",
    "view_programs",
    "view_beneficiaries",
    "view_distributions",
    "view_reports",
    "view_audit_logs",
  ],
};
