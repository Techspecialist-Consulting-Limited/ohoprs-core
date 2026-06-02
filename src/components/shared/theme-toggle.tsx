"use client";

import { Check, LaptopMinimal, MoonStar, SunMedium } from "lucide-react";
import { useEffect, useRef, useState } from "react";

import { cn } from "@/lib/utils";
import { type ThemeMode, useThemeStore } from "@/store/theme.store";

const themeOptions: Array<{
  icon: React.ReactNode;
  label: string;
  value: ThemeMode;
}> = [
  { icon: <SunMedium size={16} />, label: "Light", value: "light" },
  { icon: <MoonStar size={16} />, label: "Dark", value: "dark" },
  { icon: <LaptopMinimal size={16} />, label: "System", value: "system" },
];

export function ThemeToggle() {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const theme = useThemeStore((state) => state.theme);
  const setTheme = useThemeStore((state) => state.setTheme);

  useEffect(() => {
    function handleOutsideClick(event: MouseEvent) {
      if (!containerRef.current?.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    if (!isOpen) {
      return;
    }

    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, [isOpen]);

  const activeOption = themeOptions.find((option) => option.value === theme) ?? themeOptions[2];

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        aria-label={`Change theme. Current theme: ${activeOption.label}`}
        className="focus-ring inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-border bg-surface text-muted transition hover:text-foreground"
        onClick={() => setIsOpen((value) => !value)}
      >
        {activeOption.icon}
      </button>

      {isOpen ? (
        <div className="absolute right-0 top-12 w-40 rounded-2xl border border-border bg-surface-elevated p-1.5 shadow-[0_16px_40px_rgba(7,14,20,0.12)]">
          {themeOptions.map((option) => (
            <button
              key={option.value}
              type="button"
              className={cn(
                "flex w-full items-center justify-between rounded-xl px-3 py-2 text-sm transition",
                option.value === theme
                  ? "bg-surface-muted text-foreground"
                  : "text-muted hover:bg-surface-muted hover:text-foreground",
              )}
              onClick={() => {
                setTheme(option.value);
                setIsOpen(false);
              }}
            >
              <span className="flex items-center gap-2">
                {option.icon}
                {option.label}
              </span>
              {option.value === theme ? <Check size={15} /> : null}
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}
