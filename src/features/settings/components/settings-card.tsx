"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";

import type { SettingsCardItem } from "@/types/settings";

export function SettingsCard({ item }: { item: SettingsCardItem }) {
  return (
    <Link href={item.href} className="rounded-[28px] border border-border bg-surface p-5 shadow-sm">
      <p className="text-lg font-semibold text-foreground">{item.title}</p>
      <p className="mt-2 text-sm leading-6 text-muted">{item.description}</p>
      <div className="mt-4 inline-flex items-center gap-2 text-sm font-medium text-accent">
        Open settings
        <ArrowRight size={16} />
      </div>
    </Link>
  );
}
