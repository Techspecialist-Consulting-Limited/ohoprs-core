"use client";

import { Menu, PanelLeftClose, PanelLeftOpen, X } from "lucide-react";
import { useState } from "react";

import { Header } from "@/components/layout/header";
import { Sidebar } from "@/components/layout/sidebar";
import { cn } from "@/lib/utils";

export function AppShell({ children }: { children: React.ReactNode }) {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  return (
    <div className="h-screen overflow-hidden bg-background text-foreground">
      <div className="flex h-full min-h-0">
        <aside
          className={cn(
            "hidden h-full border-r border-border bg-sidebar text-sidebar-foreground md:flex md:flex-col",
            isSidebarCollapsed ? "md:w-24" : "md:w-72",
          )}
        >
          <Sidebar
            collapsed={isSidebarCollapsed}
            onCollapseToggle={() => setIsSidebarCollapsed((value) => !value)}
            collapseIcon={isSidebarCollapsed ? <PanelLeftOpen size={18} /> : <PanelLeftClose size={18} />}
          />
        </aside>

        <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
          <Header
            onOpenMobileMenu={() => setIsDrawerOpen(true)}
            menuIcon={<Menu size={20} />}
          />
          <main className="min-h-0 min-w-0 flex-1 overflow-y-auto overflow-x-hidden">
            <div className="mx-auto flex min-h-full w-full min-w-0 max-w-[1600px] flex-col px-4 py-6 sm:px-6 lg:px-8">
              {children}
            </div>
          </main>
        </div>
      </div>

      {isDrawerOpen ? (
        <div className="fixed inset-0 z-50 md:hidden">
          <button
            type="button"
            aria-label="Close navigation menu"
            className="absolute inset-0 bg-[#161616]/55 backdrop-blur-sm"
            onClick={() => setIsDrawerOpen(false)}
          />
          <div className="relative h-full w-[84%] max-w-xs border-r border-border bg-sidebar text-sidebar-foreground shadow-2xl">
            <Sidebar
              collapsed={false}
              onCloseMobileMenu={() => setIsDrawerOpen(false)}
              mobileActionIcon={<X size={18} />}
            />
          </div>
        </div>
      ) : null}
    </div>
  );
}
