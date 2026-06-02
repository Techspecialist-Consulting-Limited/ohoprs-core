import type { AuthUser, UserRole } from "@/types/auth";
import type { TenantContext } from "@/types/tenant";

export const mockUsers: AuthUser[] = [
  {
    id: "user_001",
    name: "Amina Bello",
    email: "superadmin@gov.ng",
    role: "SUPER_ADMIN",
    organizationId: null,
    organizationName: null,
  },
  {
    id: "user_002",
    name: "Musa Ibrahim",
    email: "orgadmin@gov.ng",
    role: "ORG_ADMIN",
    organizationId: "org_001",
    organizationName: "Federal Ministry of Humanitarian Affairs",
  },
  {
    id: "user_003",
    name: "Chioma Okafor",
    email: "officer@gov.ng",
    role: "PROGRAM_OFFICER",
    organizationId: "org_001",
    organizationName: "Federal Ministry of Humanitarian Affairs",
  },
  {
    id: "user_004",
    name: "David Audu",
    email: "auditor@gov.ng",
    role: "AUDITOR",
    organizationId: null,
    organizationName: null,
  },
];

export const tenantByRole: Record<UserRole, TenantContext | null> = {
  SUPER_ADMIN: {
    id: "tenant-national-admin",
    tenantId: "tenant-national-admin",
    name: "Federal Social Support Directorate",
    shortCode: "FSSD",
    logoUrl: null,
  },
  ORG_ADMIN: {
    id: "tenant-org-001",
    tenantId: "tenant-org-001",
    name: "Federal Ministry of Humanitarian Affairs",
    shortCode: "FMHA",
    logoUrl: null,
  },
  PROGRAM_OFFICER: {
    id: "tenant-org-001",
    tenantId: "tenant-org-001",
    name: "Federal Ministry of Humanitarian Affairs",
    shortCode: "FMHA",
    logoUrl: null,
  },
  AUDITOR: {
    id: "tenant-audit",
    tenantId: "tenant-audit",
    name: "Inspectorate and Compliance Office",
    shortCode: "ICO",
    logoUrl: null,
  },
};
