import type { Permission } from "@/constants/permissions";
import { rolePermissions } from "@/constants/permissions";
import type { UserRole } from "@/types/auth";

const routePermissionMap: Record<string, Permission | null> = {
  "/dashboard": null,
  "/organizations": "view_organizations",
  "/organizations/new": "create_organization",
  "/workspace": null,
  "/programs": "view_programs",
  "/beneficiaries": "view_beneficiaries",
  "/distributions": "view_distributions",
  "/reports": "view_reports",
  "/audit-logs": "view_audit_logs",
  "/notifications": null,
  "/settings": "manage_settings",
};

export function hasPermission(role: UserRole, permission: Permission) {
  return rolePermissions[role]?.includes(permission) ?? false;
}

export function canAccessRoute(role: UserRole, route: string) {
  const permission = routePermissionMap[route];

  if (!permission) {
    return true;
  }

  return hasPermission(role, permission);
}

export function getRoutePermission(route: string) {
  return routePermissionMap[route] ?? null;
}

export function getRoutePermissionForPath(pathname: string) {
  if (pathname.startsWith("/organizations/") && pathname.endsWith("/edit")) {
    return "create_organization";
  }

  if (pathname.startsWith("/organizations/") && pathname.endsWith("/workspace")) {
    return null;
  }

  if (pathname.startsWith("/organizations/")) {
    return "view_organizations";
  }

  return getRoutePermission(pathname);
}
