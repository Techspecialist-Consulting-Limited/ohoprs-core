"use client";

import type { ReactNode } from "react";
import { useEffect } from "react";

import { QueryProvider } from "@/providers/query-provider";
import { ThemeProvider } from "@/providers/theme-provider";
import { useAuthStore } from "@/store/auth.store";

export function AppProviders({ children }: { children: ReactNode }) {
  useEffect(() => {
    if (useAuthStore.persist.hasHydrated()) {
      useAuthStore.getState().markHydrated();
      return;
    }

    const unsubscribe = useAuthStore.persist.onFinishHydration(() => {
      useAuthStore.getState().markHydrated();
    });

    return unsubscribe;
  }, []);

  return (
    <ThemeProvider>
      <QueryProvider>{children}</QueryProvider>
    </ThemeProvider>
  );
}
