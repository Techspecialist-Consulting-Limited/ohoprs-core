import {
  Bell,
  Building2,
  ChartColumnIncreasing,
  Files,
  Gauge,
  HandCoins,
  Settings,
  ShieldCheck,
  Users,
} from "lucide-react";

export const navigationItems = [
  { href: "/dashboard", icon: Gauge, label: "Dashboard" },
  { href: "/organizations", icon: Building2, label: "Organizations" },
  { href: "/programs", icon: Files, label: "Programs" },
  { href: "/beneficiaries", icon: Users, label: "Beneficiaries" },
  { href: "/distributions", icon: HandCoins, label: "Distributions" },
  { href: "/reports", icon: ChartColumnIncreasing, label: "Reports" },
  { href: "/audit-logs", icon: ShieldCheck, label: "Audit Logs" },
  { href: "/notifications", icon: Bell, label: "Notifications" },
  { href: "/settings", icon: Settings, label: "Settings" },
] as const;
