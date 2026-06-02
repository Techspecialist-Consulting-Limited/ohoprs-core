import type { OrganizationStatus, OrganizationType } from "@/types/organization";
import type { UserRole } from "@/types/auth";

export interface WorkspaceKpis {
  activePrograms: number;
  totalBeneficiaries: number;
  totalDistributed: number;
  pendingDistributions: number;
  completedDistributions: number;
  benefitTypes: number;
}

export interface WorkspaceOrganizationSummary {
  id: string;
  name: string;
  shortName: string;
  type: OrganizationType | string;
  status: OrganizationStatus | string;
  state: string;
  contactEmail: string;
  contactPhone: string;
  address: string;
}

export interface WorkspaceProgramPreview {
  id: string;
  name: string;
  benefitType: "CASH" | "FOOD" | "MEDICAL" | "EDUCATION" | "AGRICULTURE" | "OTHER";
  status: "ACTIVE" | "INACTIVE" | "COMPLETED" | "SUSPENDED";
  beneficiaryCount: number;
  totalDistributed: number;
}

export interface WorkspaceBeneficiaryPreview {
  totalBeneficiaries: number;
  activeBeneficiaries: number;
  pendingVerification: number;
  flaggedRecords: number;
  topStates: {
    state: string;
    count: number;
  }[];
}

export interface WorkspaceDistributionPreview {
  totalBatches: number;
  completedBatches: number;
  pendingBatches: number;
  failedBatches: number;
  recentBatches: {
    id: string;
    name: string;
    benefitType: string;
    status: string;
    beneficiaryCount: number;
    amount?: number;
    createdAt: string;
  }[];
}

export interface WorkspaceActivity {
  id: string;
  actor: string;
  action: string;
  target: string;
  timestamp: string;
  type: "PROGRAM" | "BENEFICIARY" | "DISTRIBUTION" | "AUDIT";
}

export interface OperationalHealthItem {
  label: string;
  status: "GOOD" | "WARNING" | "CRITICAL";
  description: string;
}

export interface WorkspaceQuickAction {
  id: string;
  label: string;
  href: string;
}

export interface OrganizationWorkspace {
  organization: WorkspaceOrganizationSummary;
  kpis: WorkspaceKpis;
  programs: WorkspaceProgramPreview[];
  beneficiarySummary: WorkspaceBeneficiaryPreview;
  distributionSummary: WorkspaceDistributionPreview;
  recentActivities: WorkspaceActivity[];
  operationalHealth: OperationalHealthItem[];
}

export interface OrganizationWorkspaceResponse extends OrganizationWorkspace {
  quickActions: WorkspaceQuickAction[];
  roleScope: "MANAGEMENT" | "OPERATIONS" | "OVERSIGHT";
  role: UserRole;
}
