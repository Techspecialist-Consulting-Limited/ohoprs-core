"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

import { AuthTransitionLoader } from "@/components/shared/auth-transition-loader";
import { useAuthStore } from "@/store/auth.store";

export function PublicOnlyGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const isHydrated = useAuthStore((state) => state.isHydrated);

  useEffect(() => {
    if (isHydrated && isAuthenticated) {
      router.replace("/dashboard");
    }
  }, [isAuthenticated, isHydrated, router]);

  if (!isHydrated) {
    return <AuthTransitionLoader />;
  }

  if (isAuthenticated) {
    return <AuthTransitionLoader />;
  }

  return children;
}
