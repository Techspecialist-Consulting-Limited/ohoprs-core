import { create } from "zustand";
import { persist } from "zustand/middleware";

import { mockUsers, tenantByRole } from "@/mock/auth.mock";
import type { AuthState, LoginResponse } from "@/types/auth";

const defaultTenant = tenantByRole.SUPER_ADMIN;

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      accessToken: null,
      role: null,
      organizationId: null,
      currentTenant: defaultTenant,
      isAuthenticated: false,
      isHydrated: false,
      login: (payload: LoginResponse) =>
        set({
          user: payload.user,
          accessToken: payload.accessToken,
          role: payload.user.role,
          organizationId: payload.user.organizationId,
          currentTenant: tenantByRole[payload.user.role],
          isAuthenticated: true,
        }),
      logout: () =>
        set({
          user: null,
          accessToken: null,
          role: null,
          organizationId: null,
          currentTenant: defaultTenant,
          isAuthenticated: false,
        }),
      setRole: (role) =>
        set(() => {
          const nextUser = mockUsers.find((user) => user.role === role) ?? null;

          return {
            role,
            user: nextUser,
            organizationId: nextUser?.organizationId ?? null,
            currentTenant: tenantByRole[role],
          };
        }),
      setCurrentTenant: (currentTenant) => set({ currentTenant }),
      markHydrated: () => set({ isHydrated: true }),
    }),
    {
      name: "auth-store",
      partialize: (state) => ({
        user: state.user,
        accessToken: state.accessToken,
        role: state.role,
        organizationId: state.organizationId,
        currentTenant: state.currentTenant,
        isAuthenticated: state.isAuthenticated,
      }),
      onRehydrateStorage: () => (state) => {
        state?.markHydrated();
      },
    },
  ),
);
