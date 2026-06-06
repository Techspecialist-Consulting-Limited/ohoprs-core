import type { Permission } from "@/constants/permissions";
import { rolePermissions } from "@/constants/permissions";
import type { UserRole } from "@/types/auth";

const routePermissionMap: Record<string, Permission | null> = {
  "/dashboard": null,
  "/organizations": "view_organizations",
  "/organizations/new": "create_organization",
  "/workspace": null,
  "/programs": "view_programs",
  "/programs/new": "create_program",
  "/programs/[id]/edit": "edit_program",
  "/beneficiaries": "view_beneficiaries",
  "/beneficiaries/new": "create_beneficiaries",
  "/beneficiaries/upload": "upload_beneficiaries",
  "/distributions": "view_distributions",
  "/distributions/new": "create_distribution",
  "/distributions/[id]/edit": "edit_distribution",
  "/distributions/bulk": "view_distributions",
  "/payments": "view_distributions",
  "/reports": "view_reports",
  "/audit-logs": "view_audit_logs",
  "/notifications": null,
  "/settings": null,
  "/settings/profile": null,
  "/settings/users": "manage_settings",
  "/settings/roles": "manage_settings",
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

  if (pathname.startsWith("/programs/") && pathname.endsWith("/edit")) {
    return "edit_program";
  }

  if (pathname.startsWith("/programs/")) {
    return "view_programs";
  }

  if (pathname.startsWith("/beneficiaries/") && pathname.endsWith("/edit")) {
    return "edit_beneficiaries";
  }

  if (pathname.startsWith("/beneficiaries/")) {
    return "view_beneficiaries";
  }

  if (pathname.startsWith("/distributions/") && pathname.endsWith("/edit")) {
    return "edit_distribution";
  }

  if (pathname.startsWith("/distributions/") && pathname.endsWith("/approval")) {
    return "view_distributions";
  }

  if (pathname.startsWith("/distributions/") && pathname.endsWith("/payments")) {
    return "view_distributions";
  }

  if (pathname.startsWith("/distributions/bulk/")) {
    return "view_distributions";
  }

  if (pathname.startsWith("/distributions/")) {
    return "view_distributions";
  }

  if (pathname.startsWith("/reports/")) {
    return "view_reports";
  }

  if (pathname.startsWith("/payments/")) {
    return "view_distributions";
  }

  if (pathname.startsWith("/audit-logs/")) {
    return "view_audit_logs";
  }

  if (pathname.startsWith("/notifications/templates/")) {
    return null;
  }

  if (pathname.startsWith("/notifications/history")) {
    return null;
  }

  if (pathname.startsWith("/settings/profile")) {
    return null;
  }

  if (pathname.startsWith("/settings/users")) {
    return "manage_settings";
  }

  if (pathname.startsWith("/settings/roles")) {
    return "manage_settings";
  }

  if (pathname.startsWith("/settings/")) {
    return null;
  }

  return getRoutePermission(pathname);
}
