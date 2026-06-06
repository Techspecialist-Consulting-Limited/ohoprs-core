import type { Permission } from "@/constants/permissions";

export interface DashboardKpis {
  totalOrganizations: number;
  totalPrograms: number;
  totalBeneficiaries: number;
  householdImpact: number;
  totalDistributed: number;
  pendingDistributions: number;
  activePrograms: number;
}

export interface ChartPoint {
  label: string;
  value: number;
}

export interface RecentActivity {
  id: string;
  actor: string;
  action: string;
  target: string;
  timestamp: string;
  type: "ORGANIZATION" | "PROGRAM" | "BENEFICIARY" | "DISTRIBUTION" | "AUDIT";
}

export interface QuickAction {
  id: string;
  label: string;
  href: string;
  permission?: Permission;
  variant?: "primary" | "secondary";
}

export interface SystemStatus {
  label: string;
  status: "OPERATIONAL" | "DEGRADED" | "MAINTENANCE";
  description: string;
}

export interface DashboardResponse {
  scope: "NATIONAL" | "ORGANIZATION";
  title: string;
  subtitle: string;
  kpis: DashboardKpis;
  distributionOverview: ChartPoint[];
  beneficiaryGrowth: ChartPoint[];
  benefitTypeBreakdown: ChartPoint[];
  recentActivities: RecentActivity[];
  quickActions: QuickAction[];
  systemStatus: SystemStatus[];
}
