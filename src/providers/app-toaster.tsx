"use client";

import { Toaster } from "sonner";

import { useThemeStore } from "@/store/theme.store";

export function AppToaster() {
  const theme = useThemeStore((state) => state.theme);
  const resolvedTheme =
    theme === "system"
      ? undefined
      : theme;

  return (
    <Toaster
      position="top-right"
      richColors
      theme={resolvedTheme}
      toastOptions={{
        className: "!rounded-2xl",
      }}
    />
  );
}
