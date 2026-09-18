"use client";

import { useCallback } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

export function usePageQueryState(defaultLimit = 10) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const page = Math.max(1, Number(searchParams.get("page")) || 1);
  const limit = Math.max(1, Number(searchParams.get("limit")) || defaultLimit);

  const updateParams = useCallback(
    (next: { page?: number; limit?: number }) => {
      const params = new URLSearchParams(searchParams.toString());

      if (next.limit !== undefined) {
        params.set("limit", String(next.limit));
        params.set("page", "1");
      } else if (next.page !== undefined) {
        params.set("page", String(next.page));
      }

      router.push(`${pathname}?${params.toString()}`, { scroll: false });
    },
    [pathname, router, searchParams],
  );

  const setPage = useCallback((next: number) => updateParams({ page: next }), [updateParams]);
  const setLimit = useCallback((next: number) => updateParams({ limit: next }), [updateParams]);

  return { page, limit, setPage, setLimit };
}
