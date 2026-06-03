import type { ReactNode } from "react";
import Image from "next/image";

import { PublicOnlyGuard } from "@/components/shared/public-only-guard";

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <PublicOnlyGuard>
      <main className="relative min-h-screen overflow-hidden bg-[#173625]">
        <Image
          src="/images/background-auth.png"
          alt=""
          fill
          priority
          className="object-cover"
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(11,24,17,0.42),rgba(11,24,17,0.58))]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.16),transparent_26%),radial-gradient(circle_at_bottom_right,rgba(255,255,255,0.12),transparent_22%)]" />
        <div className="relative mx-auto flex min-h-screen w-full max-w-[1600px] items-center justify-center px-4 py-6 sm:px-6 lg:px-8">
          {children}
        </div>
      </main>
    </PublicOnlyGuard>
  );
}
