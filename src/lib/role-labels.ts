import type { UserRole } from "@/types/auth";

const roleLabels: Partial<Record<UserRole, string>> = {
  SUPER_ADMIN: "Super Admin",
  ORG_ADMIN: "Agency Admin",
  PROGRAM_OFFICER: "Program Officer",
  AUDITOR: "Auditor",
  ORGANIZATION_MANAGER: "Agency Manager",
  STORE_MANAGER: "Store Manager",
  DISTRIBUTION_MANAGER: "Distribution Manager",
  AGENCY_ACCOUNTANT: "Agency Accountant",
  SYSTEM_ACCOUNTANT: "System Accountant",
  DIRECTOR: "Director",
};

export function getRoleLabel(role: string) {
  return roleLabels[role as UserRole] ?? role.replaceAll("_", " ");
}
