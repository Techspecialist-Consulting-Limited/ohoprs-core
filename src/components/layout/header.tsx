"use client";

import { Bell, ChevronsUpDown, Search } from "lucide-react";

import { ThemeToggle } from "@/components/shared/theme-toggle";
import { SearchInput } from "@/components/ui/search-input";
import { useAuthStore } from "@/store/auth.store";

export function Header({
  menuIcon,
  onOpenMobileMenu,
}: {
  menuIcon: React.ReactNode;
  onOpenMobileMenu: () => void;
}) {
  const currentTenant = useAuthStore((state) => state.currentTenant);

  return (
    <header className="sticky top-0 z-30 border-b border-border bg-background/90 backdrop-blur-xl">
      <div className="mx-auto flex h-18 w-full max-w-[1600px] items-center gap-3 px-4 sm:px-6 lg:px-8">
        <button
          type="button"
          aria-label="Open navigation menu"
          className="focus-ring inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-border bg-surface text-foreground md:hidden"
          onClick={onOpenMobileMenu}
        >
          {menuIcon}
        </button>

        <div className="hidden min-w-0 flex-1 md:flex">
          <SearchInput
            ariaLabel="Search platform"
            icon={<Search size={16} />}
            placeholder="Search platform, modules, and records"
          />
        </div>

        <button
          type="button"
          className="focus-ring hidden min-w-0 items-center gap-3 rounded-2xl border border-border bg-surface px-3 py-2 text-left md:flex"
        >
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-accent/12 text-sm font-semibold text-accent">
            {currentTenant?.shortCode ?? "NB"}
          </div>
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-foreground">{currentTenant?.name}</p>
            <p className="truncate text-xs text-muted">Tenant switcher placeholder</p>
          </div>
          <ChevronsUpDown size={16} className="text-muted" />
        </button>

        <div className="ml-auto flex items-center gap-2">
          <button
            type="button"
            aria-label="Notifications"
            className="focus-ring inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-border bg-surface text-muted transition hover:text-foreground"
          >
            <Bell size={18} />
          </button>
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
