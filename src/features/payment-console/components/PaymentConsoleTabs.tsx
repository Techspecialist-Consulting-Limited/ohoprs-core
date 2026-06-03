"use client";

import { cn } from "@/lib/utils";
import type { PaymentConsoleTab } from "@/types/payment-console";

const tabs: Array<{ id: PaymentConsoleTab; label: string }> = [
  { id: "OVERVIEW", label: "Overview" },
  { id: "BENEFICIARIES", label: "Beneficiaries" },
  { id: "EXECUTION", label: "Execution" },
  { id: "AUDIT", label: "Audit" },
];

export function PaymentConsoleTabs({
  activeTab,
  onChange,
}: {
  activeTab: PaymentConsoleTab;
  onChange: (tab: PaymentConsoleTab) => void;
}) {
  return (
    <div className="rounded-[24px] border border-border bg-surface p-2 shadow-sm">
      <div className="grid gap-2 sm:grid-cols-4">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => onChange(tab.id)}
            className={cn(
              "rounded-2xl px-4 py-3 text-sm font-semibold transition",
              activeTab === tab.id
                ? "bg-accent text-accent-foreground"
                : "text-muted hover:bg-surface-muted hover:text-foreground",
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>
    </div>
  );
}
