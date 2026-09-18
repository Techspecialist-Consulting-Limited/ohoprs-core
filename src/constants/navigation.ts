import {
  Bell,
  Building2,
  ChartColumnIncreasing,
  ClipboardList,
  CreditCard,
  Files,
  Gauge,
  HandCoins,
  Home,
  Settings,
  ShieldCheck,
  Users,
} from "lucide-react";

export const navigationItems = [
  { href: "/dashboard", icon: Gauge, label: "Dashboard" },
  { href: "/organizations", icon: Building2, label: "Agencies" },
  { href: "/programs", icon: Files, label: "Interventions" },
  { href: "/beneficiaries", icon: Users, label: "Beneficiaries" },
  { href: "/households", icon: Home, label: "Households" },
  { href: "/field", icon: ClipboardList, label: "Field Data" },
  { href: "/distributions", icon: HandCoins, label: "Distributions" },
  { href: "/payments", icon: CreditCard, label: "Payement records" },
  { href: "/reports", icon: ChartColumnIncreasing, label: "Reports" },
  { href: "/audit-logs", icon: ShieldCheck, label: "Audit Logs" },
  { href: "/notifications", icon: Bell, label: "Notifications" },
  { href: "/settings", icon: Settings, label: "Settings" },
] as const;
