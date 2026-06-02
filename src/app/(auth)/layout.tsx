import type { ReactNode } from "react";

import { PublicOnlyGuard } from "@/components/shared/public-only-guard";

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <PublicOnlyGuard>
      <main className="min-h-screen bg-background">
        <div className="mx-auto flex min-h-screen w-full max-w-[1440px] items-center px-4 py-8 sm:px-6 lg:px-8">
          {children}
        </div>
      </main>
    </PublicOnlyGuard>
  );
}
