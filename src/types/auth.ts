import type { TenantContext } from "@/types/tenant";

export type UserRole =
  | "SUPER_ADMIN"
  | "ORG_ADMIN"
  | "PROGRAM_OFFICER"
  | "AUDITOR";

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  organizationId: string | null;
  organizationName?: string | null;
}

export interface LoginPayload {
  email: string;
  password: string;
  role: UserRole;
}

export interface LoginResponse {
  user: AuthUser;
  accessToken: string;
}

export interface AuthState {
  user: AuthUser | null;
  accessToken: string | null;
  role: UserRole | null;
  organizationId: string | null;
  currentTenant: TenantContext | null;
  isAuthenticated: boolean;
  isHydrated: boolean;
  login: (payload: LoginResponse) => void;
  logout: () => void;
  setRole: (role: UserRole) => void;
  setCurrentTenant: (tenant: TenantContext | null) => void;
  markHydrated: () => void;
}
