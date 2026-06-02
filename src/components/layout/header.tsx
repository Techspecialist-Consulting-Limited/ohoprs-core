"use client";

import { Bell, Check, ChevronsUpDown, LogOut, Search } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

import { ThemeToggle } from "@/components/shared/theme-toggle";
import { SearchInput } from "@/components/ui/search-input";
import { userRoles } from "@/features/auth/schemas/auth.schema";
import { tenantByRole } from "@/mock/auth.mock";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/store/auth.store";
import type { UserRole } from "@/types/auth";

const roleLabels: Record<UserRole, string> = {
  SUPER_ADMIN: "Super Admin",
  ORG_ADMIN: "Organization Admin",
  PROGRAM_OFFICER: "Program Officer",
  AUDITOR: "Auditor",
};

export function Header({
  menuIcon,
  onOpenMobileMenu,
}: {
  menuIcon: React.ReactNode;
  onOpenMobileMenu: () => void;
}) {
  const router = useRouter();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const currentTenant = useAuthStore((state) => state.currentTenant);
  const logout = useAuthStore((state) => state.logout);
  const role = useAuthStore((state) => state.role);
  const setRole = useAuthStore((state) => state.setRole);
  const setCurrentTenant = useAuthStore((state) => state.setCurrentTenant);
  const user = useAuthStore((state) => state.user);

  useEffect(() => {
    function handleOutsideClick(event: MouseEvent) {
      if (!menuRef.current?.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    }

    if (!isMenuOpen) {
      return;
    }

    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, [isMenuOpen]);

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
          className="focus-ring hidden min-w-0 items-center gap-3 rounded-2xl border border-border bg-surface px-3 py-2 text-left lg:flex"
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
          <div ref={menuRef} className="relative">
            <button
              type="button"
              onClick={() => setIsMenuOpen((value) => !value)}
              className="focus-ring inline-flex items-center gap-3 rounded-2xl border border-border bg-surface px-3 py-2 text-left"
            >
              <div className="hidden text-right sm:block">
                <p className="max-w-36 truncate text-sm font-semibold text-foreground">{user?.name ?? "Demo User"}</p>
                <p className="truncate text-xs text-muted">{role ? roleLabels[role] : "No role selected"}</p>
              </div>
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-accent/12 text-sm font-semibold text-accent">
                {user?.name?.split(" ").map((part) => part[0]).join("").slice(0, 2) ?? "DU"}
              </div>
              <ChevronsUpDown size={16} className="hidden text-muted sm:block" />
            </button>

            {isMenuOpen ? (
              <div className="absolute right-0 top-14 z-40 w-72 rounded-[24px] border border-border bg-surface-elevated p-2 shadow-[0_18px_48px_rgba(12,16,20,0.16)]">
                <div className="rounded-2xl bg-surface-muted p-4">
                  <p className="text-sm font-semibold text-foreground">{user?.name}</p>
                  <p className="mt-1 text-sm text-muted">{user?.email}</p>
                </div>
                <div className="px-2 py-3">
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-soft">Demo role switcher</p>
                </div>
                <div className="space-y-1 px-1 pb-2">
                  {userRoles.map((item) => (
                    <button
                      key={item}
                      type="button"
                      className={cn(
                        "flex w-full items-center justify-between rounded-2xl px-3 py-2.5 text-sm transition",
                        role === item
                          ? "bg-surface-muted text-foreground"
                          : "text-muted hover:bg-surface-muted hover:text-foreground",
                      )}
                      onClick={() => {
                        setRole(item);
                        setCurrentTenant(tenantByRole[item]);
                        setIsMenuOpen(false);
                      }}
                    >
                      <span>{roleLabels[item]}</span>
                      {role === item ? <Check size={15} /> : null}
                    </button>
                  ))}
                </div>
                <div className="border-t border-border px-1 pt-2">
                  <button
                    type="button"
                    className="flex w-full items-center gap-2 rounded-2xl px-3 py-2.5 text-sm text-danger transition hover:bg-danger/10"
                    onClick={() => {
                      logout();
                      setIsMenuOpen(false);
                      router.push("/login");
                    }}
                  >
                    <LogOut size={16} />
                    Logout
                  </button>
                </div>
              </div>
            ) : null}
          </div>
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
