import { create } from "zustand";

import type { TenantContext } from "@/types/tenant";

interface AuthState {
  currentTenant: TenantContext | null;
}

export const useAuthStore = create<AuthState>(() => ({
  currentTenant: {
    id: "tenant-national-admin",
    logoUrl: null,
    name: "Federal Social Support Directorate",
    shortCode: "FSSD",
    tenantId: "tenant-national-admin",
  },
}));
