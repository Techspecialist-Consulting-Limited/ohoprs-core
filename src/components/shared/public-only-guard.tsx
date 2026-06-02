"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

import { LoadingState } from "@/components/ui/loading-state";
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
    return (
      <div className="mx-auto w-full max-w-xl py-16">
        <LoadingState title="Loading authentication state" lines={3} />
      </div>
    );
  }

  if (isAuthenticated) {
    return (
      <div className="mx-auto w-full max-w-xl py-16">
        <LoadingState title="Redirecting to dashboard" lines={3} />
      </div>
    );
  }

  return children;
}
