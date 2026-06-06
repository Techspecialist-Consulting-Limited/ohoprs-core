import {
  Bell,
  Building2,
  ChartColumnIncreasing,
  CreditCard,
  Files,
  Gauge,
  HandCoins,
  Settings,
  ShieldCheck,
  Users,
} from "lucide-react";

export const navigationItems = [
  { href: "/dashboard", icon: Gauge, label: "Dashboard" },
  { href: "/organizations", icon: Building2, label: "Agencies" },
  { href: "/programs", icon: Files, label: "Interventions" },
  { href: "/beneficiaries", icon: Users, label: "Beneficiaries" },
  { href: "/distributions", icon: HandCoins, label: "Distributions" },
  { href: "/payments", icon: CreditCard, label: "Payments" },
  { href: "/reports", icon: ChartColumnIncreasing, label: "Reports" },
  { href: "/audit-logs", icon: ShieldCheck, label: "Audit Logs" },
  { href: "/notifications", icon: Bell, label: "Notifications" },
  { href: "/settings", icon: Settings, label: "Settings" },
] as const;
