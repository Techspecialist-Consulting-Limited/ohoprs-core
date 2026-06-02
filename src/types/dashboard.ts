export interface ActivityItem {
  id: string;
  title: string;
  description: string;
  time: string;
}

export interface DashboardData {
  organizations: number;
  programs: number;
  beneficiaries: number;
  monthlyTransfers: string;
  monthlyTrend: number[];
  recentActivity: ActivityItem[];
}
