import { mockUsers, tenantByRole } from "@/mock/auth.mock";
import type { ApiResponse } from "@/types/api";
import type { LoginPayload, LoginResponse } from "@/types/auth";
import type { TenantContext } from "@/types/tenant";

export const authService = {
  async login(payload: LoginPayload): Promise<ApiResponse<LoginResponse>> {
    const user = mockUsers.find((item) => item.role === payload.role);

    if (!user || !payload.password.trim()) {
      return Promise.resolve({
        success: false,
        message: "Invalid login credentials.",
        data: {
          user: mockUsers[0],
          accessToken: "",
        },
      });
    }

    return Promise.resolve({
      success: true,
      message: "Login successful",
      data: {
        user: {
          ...user,
          email: payload.email || user.email,
        },
        accessToken: "mock_access_token",
      },
    });
  },

  async forgotPassword(email: string): Promise<ApiResponse<{ email: string }>> {
    return Promise.resolve({
      success: true,
      message: "Password reset instructions have been sent.",
      data: { email },
    });
  },

  async resetPassword(password: string, token?: string): Promise<ApiResponse<{ token?: string }>> {
    if (!password.trim()) {
      return Promise.resolve({
        success: false,
        message: "Password is required.",
        data: { token },
      });
    }

    return Promise.resolve({
      success: true,
      message: "Password reset successful.",
      data: { token },
    });
  },

  getTenantForRole(role: LoginPayload["role"]): TenantContext | null {
    return tenantByRole[role];
  },
};
