export type OrganizationType =
  | "FEDERAL_MINISTRY"
  | "STATE_AGENCY"
  | "LOCAL_GOVERNMENT"
  | "NGO"
  | "DONOR_AGENCY"
  | "PRIVATE_PARTNER";

export type OrganizationStatus =
  | "ACTIVE"
  | "INACTIVE"
  | "SUSPENDED"
  | "PENDING_REVIEW";

export interface Organization {
  id: string;
  name: string;
  shortName: string;
  type: OrganizationType;
  description: string;
  contactEmail: string;
  contactPhone: string;
  website?: string;
  address: string;
  state: string;
  status: OrganizationStatus;
  programCount: number;
  beneficiaryCount: number;
  totalDistributed: number;
  createdAt: string;
  updatedAt: string;
}

export interface OrganizationProgramPreview {
  id: string;
  name: string;
  benefitType: string;
  status: string;
  beneficiaryCount: number;
}

export interface OrganizationRecentActivity {
  id: string;
  actor: string;
  action: string;
  timestamp: string;
}

export interface OrganizationAdminPreview {
  id: string;
  name: string;
  role: string;
  email: string;
}

export interface OrganizationDetails extends Organization {
  programsPreview: OrganizationProgramPreview[];
  recentActivities: OrganizationRecentActivity[];
  adminUsersPreview: OrganizationAdminPreview[];
}

export interface OrganizationListMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface OrganizationListResponse {
  items: Organization[];
  meta: OrganizationListMeta;
}

export interface OrganizationListParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: OrganizationStatus | "ALL";
  type?: OrganizationType | "ALL";
  scopeOrganizationId?: string | null;
}

export interface OrganizationPayload {
  name: string;
  shortName: string;
  type: OrganizationType;
  description: string;
  contactEmail: string;
  contactPhone: string;
  website?: string;
  address: string;
  state: string;
  status: OrganizationStatus;
}
