"use client";

import { BarChart3, Map } from "lucide-react";

import { cn } from "@/lib/utils";

export type ReportViewMode = "chart" | "map";

const options: Array<{ id: ReportViewMode; label: string; icon: typeof BarChart3 }> = [
  { id: "map", label: "Map View", icon: Map },
  { id: "chart", label: "Chart View", icon: BarChart3 },
];

export function ReportViewToggle({
  value,
  onChange,
}: {
  value: ReportViewMode;
  onChange: (value: ReportViewMode) => void;
}) {
  return (
    <div className="inline-flex rounded-2xl border border-border bg-surface p-1 shadow-sm">
      {options.map((option) => {
        const Icon = option.icon;
        const isActive = value === option.id;

        return (
          <button
            key={option.id}
            type="button"
            onClick={() => onChange(option.id)}
            className={cn(
              "inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold transition",
              isActive ? "bg-accent text-accent-foreground" : "text-muted hover:bg-surface-muted hover:text-foreground",
            )}
          >
            <Icon size={16} />
            {option.label}
          </button>
        );
      })}
    </div>
  );
}
