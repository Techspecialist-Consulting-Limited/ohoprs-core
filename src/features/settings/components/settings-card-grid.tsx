"use client";

import type { SettingsCardItem } from "@/types/settings";
import { SettingsCard } from "@/features/settings/components/settings-card";

export function SettingsCardGrid({ items }: { items: SettingsCardItem[] }) {
  return (
    <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
      {items.map((item) => (
        <SettingsCard key={item.id} item={item} />
      ))}
    </section>
  );
}
