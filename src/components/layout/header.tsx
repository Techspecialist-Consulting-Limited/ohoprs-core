"use client";

import Image from "next/image";
import { Bell, Check, ChevronsUpDown, LogOut } from "lucide-react";
import { useEffect, useRef, useState } from "react";

import { ThemeToggle } from "@/components/shared/theme-toggle";
import { userRoles } from "@/features/auth/schemas/auth.schema";
import { tenantByRole } from "@/mock/auth.mock";
import { organizationsData } from "@/mock/organizations.mock";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/store/auth.store";
import type { UserRole } from "@/types/auth";
import type { TenantContext } from "@/types/tenant";

const roleLabels: Record<UserRole, string> = {
  SUPER_ADMIN: "Super Admin",
  ORG_ADMIN: "Agency Admin",
  PROGRAM_OFFICER: "Program Officer",
  AUDITOR: "Auditor",
  ORGANIZATION_MANAGER: "Agency Manager",
  STORE_MANAGER: "Store Manager",
  DISTRIBUTION_MANAGER: "Distribution Manager",
  ACCOUNTANT: "Accountant",
  DIRECTOR: "Director",
};

const organizationLogoById: Record<string, string> = {
  org_001: "/images/federal-ministry-affirs.jpeg",
  org_002: "/images/org-002-logo.svg",
  org_003: "/images/org-003-logo.svg",
  org_004: "/images/org-004-logo.svg",
  org_005: "/images/org-005-logo.svg",
  org_006: "/images/org-006-logo.svg",
  org_007: "/images/org-007-logo.svg",
  org_008: "/images/org-008-logo.svg",
  org_009: "/images/org-009-logo.svg",
  org_010: "/images/org-010-logo.svg",
  org_011: "/images/org-011-logo.svg",
  org_012: "/images/org-012-logo.svg",
  org_013: "/images/org-013-logo.svg",
  org_014: "/images/org-014-logo.svg",
  org_015: "/images/org-015-logo.svg",
};

export function Header({
  menuIcon,
  onOpenMobileMenu,
}: {
  menuIcon: React.ReactNode;
  onOpenMobileMenu: () => void;
}) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isTenantMenuOpen, setIsTenantMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const tenantMenuRef = useRef<HTMLDivElement>(null);
  const currentTenant = useAuthStore((state) => state.currentTenant);
  const logout = useAuthStore((state) => state.logout);
  const role = useAuthStore((state) => state.role);
  const setRole = useAuthStore((state) => state.setRole);
  const setCurrentTenant = useAuthStore((state) => state.setCurrentTenant);
  const user = useAuthStore((state) => state.user);
  const isSuperAdmin = role === "SUPER_ADMIN";

  const superAdminTenants: TenantContext[] = organizationsData.map((organization) => ({
    id: organization.id,
    tenantId: organization.id,
    name: organization.name,
    shortCode: organization.shortName,
    logoUrl: organizationLogoById[organization.id] ?? null,
  }));

  useEffect(() => {
    function handleOutsideClick(event: MouseEvent) {
      if (!menuRef.current?.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }

      if (!tenantMenuRef.current?.contains(event.target as Node)) {
        setIsTenantMenuOpen(false);
      }
    }

    if (!isMenuOpen && !isTenantMenuOpen) {
      return;
    }

    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, [isMenuOpen, isTenantMenuOpen]);

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

        <div className="hidden min-w-0 flex-1 md:flex" />


        <div ref={tenantMenuRef} className="relative hidden lg:block gap-6">
          <button
            type="button"
            onClick={() => {
              if (!isSuperAdmin) {
                return;
              }

              setIsTenantMenuOpen((value) => !value);
            }}
            className={cn(
              "focus-ring hidden min-w-0 items-center gap-3 rounded-2xl border border-border bg-surface px-3 py-2 text-left lg:flex",
              isSuperAdmin && "cursor-pointer",
            )}
          >
            <div className="flex h-9 w-9 items-center justify-center overflow-hidden rounded-xl bg-accent/12">
              {currentTenant?.logoUrl ? (
                <Image
                  src={currentTenant.logoUrl}
                  alt={`${currentTenant.name} logo`}
                  width={28}
                  height={28}
                  className="h-7 w-7 object-contain"
                />
              ) : currentTenant?.shortCode ? (
                <span className="text-sm font-semibold text-accent">{currentTenant.shortCode}</span>
              ) : (
                <Image
                  src="/icon"
                  alt="App icon"
                  width={24}
                  height={24}
                  className="h-6 w-6 object-contain"
                />
              )}
            </div>
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-foreground">{currentTenant?.name}</p>
              <p className="truncate text-xs text-muted">
                {isSuperAdmin ? "Switch agency context" : "Assigned agency"}
              </p>
            </div>
            {isSuperAdmin ? <ChevronsUpDown size={16} className="text-muted" /> : null}
          </button>

          {isSuperAdmin && isTenantMenuOpen ? (
            <div className="absolute left-0 top-14 z-40 w-[360px] rounded-[24px] border border-border bg-surface-elevated p-2 shadow-[0_18px_48px_rgba(12,16,20,0.16)]">
              <div className="px-3 pb-2 pt-1">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-soft">Agencies</p>
                <p className="mt-1 text-xs text-muted">Select a tenant context for the current session.</p>
              </div>
              <div className="app-scrollbar max-h-80 space-y-1 overflow-y-auto px-1 pb-1">
                {superAdminTenants.map((tenant) => {
                  const isActiveTenant = currentTenant?.tenantId === tenant.tenantId;

                  return (
                    <button
                      key={tenant.tenantId}
                      type="button"
                      className={cn(
                        "flex w-full items-center gap-3 rounded-2xl px-3 py-3 text-left transition",
                        isActiveTenant
                          ? "bg-surface-muted text-foreground"
                          : "text-muted hover:bg-surface-muted hover:text-foreground",
                      )}
                      onClick={() => {
                        setCurrentTenant(tenant);
                        setIsTenantMenuOpen(false);
                      }}
                    >
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-accent/12">
                        {tenant.logoUrl ? (
                          <Image
                            src={tenant.logoUrl}
                            alt={`${tenant.name} logo`}
                            width={28}
                            height={28}
                            className="h-7 w-7 object-contain"
                          />
                        ) : (
                          <span className="text-sm font-semibold text-accent">{tenant.shortCode}</span>
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-semibold">{tenant.name}</p>
                        <p className="truncate text-xs text-muted-soft">{tenant.shortCode}</p>
                      </div>
                      {isActiveTenant ? <Check size={16} className="shrink-0" /> : null}
                    </button>
                  );
                })}
              </div>
            </div>
          ) : null}
        </div>

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
                      window.location.href = "https://ohoprs.vercel.app/";
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
