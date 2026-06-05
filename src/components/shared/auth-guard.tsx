"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";

import { AuthTransitionLoader } from "@/components/shared/auth-transition-loader";
import { canAccessRoute, getRoutePermissionForPath, hasPermission } from "@/lib/rbac";
import { useAuthStore } from "@/store/auth.store";

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const isHydrated = useAuthStore((state) => state.isHydrated);
  const role = useAuthStore((state) => state.role);

  const allowModuleDeniedPage = role === "PROGRAM_OFFICER" && pathname.startsWith("/organizations");

  useEffect(() => {
    if (!isHydrated) {
      return;
    }

    if (!isAuthenticated) {
      router.replace("/login");
      return;
    }

    if (role && !allowModuleDeniedPage) {
      const permission = getRoutePermissionForPath(pathname);

      if (permission && !hasPermission(role, permission)) {
        router.replace("/dashboard");
        return;
      }
    }

    if (role && !canAccessRoute(role, pathname)) {
      router.replace("/dashboard");
    }
  }, [allowModuleDeniedPage, isAuthenticated, isHydrated, pathname, role, router]);

  const missingPermission = role ? getRoutePermissionForPath(pathname) : null;
  const isBlocked =
    !allowModuleDeniedPage && role && missingPermission ? !hasPermission(role, missingPermission) : false;

  if (!isHydrated || !isAuthenticated || isBlocked || (role && !canAccessRoute(role, pathname))) {
    return <AuthTransitionLoader />;
  }

  return children;
}
