"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { navigationItems } from "@/constants/navigation";
import { getRoutePermission, hasPermission } from "@/lib/rbac";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/store/auth.store";

export function Sidebar({
  collapseIcon,
  collapsed,
  mobileActionIcon,
  onCloseMobileMenu,
  onCollapseToggle,
}: {
  collapseIcon?: React.ReactNode;
  collapsed: boolean;
  mobileActionIcon?: React.ReactNode;
  onCloseMobileMenu?: () => void;
  onCollapseToggle?: () => void;
}) {
  const pathname = usePathname();
  const currentTenant = useAuthStore((state) => state.currentTenant);
  const role = useAuthStore((state) => state.role);
  const sidebarItems = navigationItems.flatMap((item) => {
    if (role === "ORG_ADMIN" && item.href === "/organizations") {
      return [{ ...item, href: "/settings/profile", label: "Profile" }];
    }

    if (role === "ORG_ADMIN" && item.href === "/settings") {
      return [];
    }

    return [item];
  });

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center justify-between border-b border-white/8 px-4 py-5">
        <div className={cn("flex min-w-0 items-center gap-3", collapsed && "md:justify-center")}>
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl">
            <Image
              src="/images/OHO-Logo.png"
              alt="OHOPRS logo"
              width={44}
              height={44}
              className="h-full w-full object-contain"
              priority
            />
          </div>
          <div className={cn("min-w-0", collapsed && "md:hidden")}>
            <p className="truncate text-sm font-semibold text-sidebar-foreground">
              OHOPRS
            </p>
            <p className="truncate text-xs text-sidebar-muted">One Humanitarian One Poverty Response System</p>
          </div>
        </div>

        {onCollapseToggle ? (
          <button
            type="button"
            aria-label="Toggle sidebar"
            className="focus-ring hidden h-10 w-10 items-center justify-center rounded-2xl border border-white/8 bg-white/4 text-sidebar-foreground md:inline-flex"
            onClick={onCollapseToggle}
          >
            {collapseIcon}
          </button>
        ) : null}

        {onCloseMobileMenu ? (
          <button
            type="button"
            aria-label="Close navigation menu"
            className="focus-ring inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-white/8 bg-white/4 text-sidebar-foreground md:hidden"
            onClick={onCloseMobileMenu}
          >
            {mobileActionIcon}
          </button>
        ) : null}
      </div>

      <div className={cn("border-b border-white/8 px-4 py-4", collapsed && "md:px-3")}>
        <div className={cn("rounded-3xl border border-white/8 bg-white/4 p-4", collapsed && "md:px-2 md:py-3")}>
          <p className={cn("text-xs uppercase tracking-[0.24em] text-sidebar-muted", collapsed && "md:text-center")}>
            Current tenant
          </p>
          <p className={cn("mt-3 truncate text-sm font-semibold text-sidebar-foreground", collapsed && "md:hidden")}>
            {currentTenant?.name}
          </p>
          <p className={cn("mt-1 truncate text-xs text-sidebar-muted", collapsed && "md:hidden")}>
            Central government deployment
          </p>
          <p className={cn("mt-3 hidden text-center text-sm font-semibold text-sidebar-foreground md:block", !collapsed && "md:hidden")}>
            {currentTenant?.shortCode}
          </p>
        </div>
      </div>

      <nav className="app-scrollbar flex-1 overflow-y-auto px-3 py-4">
        <ul className="space-y-1.5">
          {sidebarItems.map((item) => {
            const isActive = pathname === item.href;
            const permission = getRoutePermission(item.href);
            const isAllowed = !permission || (role ? hasPermission(role, permission) : true);
            if (!isAllowed) {
              return null;
            }
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  onClick={onCloseMobileMenu}
                  className={cn(
                    "group flex items-center gap-3 rounded-2xl px-3 py-3 text-sm transition",
                    collapsed && "md:justify-center",
                    isActive
                      ? "bg-white text-[#111111]"
                      : "text-sidebar-muted hover:bg-white/7 hover:text-sidebar-foreground",
                  )}
                >
                  <item.icon size={18} />
                  <span className={cn("truncate font-medium", collapsed && "md:hidden")}>{item.label}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      <div className={cn("border-t border-white/8 px-4 py-4", collapsed && "md:px-3")}>
        <div className="rounded-2xl border border-white/8 bg-white/4 p-4">
          <p className={cn("text-sm font-semibold text-sidebar-foreground", collapsed && "md:hidden")}>
            Tenant-ready shell
          </p>
          <p className={cn("mt-1 text-xs leading-5 text-sidebar-muted", collapsed && "md:hidden")}>
            Interventions, beneficiaries, and reporting modules will connect to this layout in later phases.
          </p>
          <p className={cn("hidden text-center text-xs font-semibold text-sidebar-foreground md:block", !collapsed && "md:hidden")}>
            v1
          </p>
        </div>
      </div>
    </div>
  );
}
