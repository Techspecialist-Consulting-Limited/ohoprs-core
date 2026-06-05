import type { DashboardResponse } from "@/types/dashboard";

const monthLabels = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

export const nationalDashboardData: DashboardResponse = {
  scope: "NATIONAL",
  title: "Social Protection Overview",
  subtitle: "Real-time visibility across government benefit programs, distribution performance, and beneficiary reach nationwide.",
  kpis: {
    totalOrganizations: 12,
    totalPrograms: 56,
    totalBeneficiaries: 245678,
    totalDistributed: 5600000000,
    pendingDistributions: 150000000,
    activePrograms: 42,
  },
  distributionOverview: monthLabels.map((label, index) => ({
    label,
    value: [400, 650, 900, 1200, 1450, 1000, 1180, 1260, 1330, 1490, 1620, 1710][index] * 1_000_000,
  })),
  beneficiaryGrowth: monthLabels.map((label, index) => ({
    label,
    value: [75000, 92000, 110000, 126000, 150000, 168000, 184000, 198000, 212000, 225000, 236000, 245678][index],
  })),
  benefitTypeBreakdown: [
    { label: "Cash Transfer", value: 58 },
    { label: "Food Support", value: 24 },
    { label: "Medical Support", value: 10 },
    { label: "Education Grant", value: 8 },
  ],
  recentActivities: [
    {
      id: "act_001",
      actor: "Amina Bello",
      action: "created organization",
      target: "FCT Social Welfare Agency",
      timestamp: "2026-06-02T08:30:00Z",
      type: "ORGANIZATION",
    },
    {
      id: "act_002",
      actor: "Musa Ibrahim",
      action: "approved distribution batch",
      target: "Youth Empowerment Grant",
      timestamp: "2026-06-01T14:12:00Z",
      type: "DISTRIBUTION",
    },
    {
      id: "act_003",
      actor: "Chioma Okafor",
      action: "uploaded beneficiary register",
      target: "Emergency Nutrition Support",
      timestamp: "2026-05-31T09:05:00Z",
      type: "BENEFICIARY",
    },
    {
      id: "act_004",
      actor: "David Audu",
      action: "reviewed audit trail",
      target: "Q2 Cash Transfer Operations",
      timestamp: "2026-05-30T16:48:00Z",
      type: "AUDIT",
    },
  ],
  quickActions: [
    { id: "qa_001", label: "Create Organization", href: "/organizations", permission: "create_organization", variant: "primary" },
    { id: "qa_002", label: "Create Program", href: "/programs", permission: "create_program", variant: "secondary" },
    { id: "qa_003", label: "Upload Beneficiaries", href: "/beneficiaries", permission: "upload_beneficiaries", variant: "secondary" },
    { id: "qa_004", label: "View Reports", href: "/reports", permission: "view_reports", variant: "secondary" },
  ],
  systemStatus: [
    { label: "Mock API", status: "OPERATIONAL", description: "All mock service endpoints responding within expected thresholds." },
    { label: "Distribution Queue", status: "OPERATIONAL", description: "Batch disbursement simulator available for executive monitoring." },
    { label: "Audit Trail", status: "OPERATIONAL", description: "Cross-platform activity visibility is enabled for oversight roles." },
  ],
};

export const organizationDashboardData: DashboardResponse = {
  scope: "ORGANIZATION",
  title: "Federal Ministry of Humanitarian Affairs Overview",
  subtitle: "Management-level visibility into organization program coverage, beneficiary performance, and disbursement readiness.",
  kpis: {
    totalOrganizations: 1,
    totalPrograms: 14,
    totalBeneficiaries: 68420,
    totalDistributed: 1320000000,
    pendingDistributions: 42000000,
    activePrograms: 11,
  },
  distributionOverview: monthLabels.map((label, index) => ({
    label,
    value: [68, 84, 91, 107, 114, 122, 136, 141, 133, 152, 164, 171][index] * 1_000_000,
  })),
  beneficiaryGrowth: monthLabels.map((label, index) => ({
    label,
    value: [18000, 22400, 25800, 30200, 34800, 38900, 42700, 48900, 52800, 59400, 63700, 68420][index],
  })),
  benefitTypeBreakdown: [
    { label: "Cash Transfer", value: 46 },
    { label: "Food Support", value: 29 },
    { label: "Education Grant", value: 15 },
    { label: "Medical Support", value: 10 },
  ],
  recentActivities: [
    {
      id: "org_act_001",
      actor: "Musa Ibrahim",
      action: "approved program budget",
      target: "Household Recovery Support",
      timestamp: "2026-06-02T07:40:00Z",
      type: "PROGRAM",
    },
    {
      id: "org_act_002",
      actor: "Chioma Okafor",
      action: "uploaded beneficiary file",
      target: "Community Food Resilience",
      timestamp: "2026-06-01T10:18:00Z",
      type: "BENEFICIARY",
    },
    {
      id: "org_act_003",
      actor: "Distribution Engine",
      action: "queued payment batch",
      target: "School Inclusion Grant",
      timestamp: "2026-05-31T15:52:00Z",
      type: "DISTRIBUTION",
    },
  ],
  quickActions: [
    { id: "qa_005", label: "Create Program", href: "/programs", permission: "create_program", variant: "primary" },
    { id: "qa_006", label: "Upload Beneficiaries", href: "/beneficiaries", permission: "upload_beneficiaries", variant: "secondary" },
    { id: "qa_007", label: "View Reports", href: "/reports", permission: "view_reports", variant: "secondary" },
    { id: "qa_008", label: "Open Distributions", href: "/distributions", permission: "view_distributions", variant: "secondary" },
  ],
  systemStatus: [
    { label: "Beneficiary Intake", status: "OPERATIONAL", description: "Organization onboarding and beneficiary upload channels are available." },
    { label: "Payment Validation", status: "DEGRADED", description: "Mock validation queue shows elevated review volume before distribution." },
    { label: "Program Registry", status: "OPERATIONAL", description: "Program records are synchronized for executive preview reporting." },
  ],
};

export const programOfficerDashboardData: DashboardResponse = {
  scope: "ORGANIZATION",
  title: "FMHA Program Operations Overview",
  subtitle: "Operational monitoring for active program delivery, intake progress, and pending distributions within the assigned organization.",
  kpis: {
    totalOrganizations: 1,
    totalPrograms: 6,
    totalBeneficiaries: 28460,
    totalDistributed: 480000000,
    pendingDistributions: 86000000,
    activePrograms: 5,
  },
  distributionOverview: monthLabels.map((label, index) => ({
    label,
    value: [28, 33, 37, 41, 46, 43, 49, 57, 53, 61, 68, 64][index] * 1_000_000,
  })),
  beneficiaryGrowth: monthLabels.map((label, index) => ({
    label,
    value: [9200, 10400, 12800, 14900, 16700, 18300, 20100, 21900, 23800, 25200, 26900, 28460][index],
  })),
  benefitTypeBreakdown: [
    { label: "Cash Transfer", value: 52 },
    { label: "Food Support", value: 31 },
    { label: "Medical Support", value: 9 },
    { label: "Education Grant", value: 8 },
  ],
  recentActivities: [
    {
      id: "po_act_001",
      actor: "Chioma Okafor",
      action: "validated beneficiary upload",
      target: "Rural Nutrition Outreach",
      timestamp: "2026-06-02T08:05:00Z",
      type: "BENEFICIARY",
    },
    {
      id: "po_act_002",
      actor: "Operations Desk",
      action: "flagged pending disbursement batch",
      target: "Women Enterprise Support",
      timestamp: "2026-06-01T13:45:00Z",
      type: "DISTRIBUTION",
    },
    {
      id: "po_act_003",
      actor: "Program Registry",
      action: "updated implementation calendar",
      target: "Education Continuity Grant",
      timestamp: "2026-05-30T11:20:00Z",
      type: "PROGRAM",
    },
  ],
  quickActions: [
    { id: "qa_009", label: "Upload Beneficiaries", href: "/beneficiaries", permission: "upload_beneficiaries", variant: "primary" },
    { id: "qa_010", label: "Open Distributions", href: "/distributions", permission: "view_distributions", variant: "secondary" },
    { id: "qa_011", label: "Review Programs", href: "/programs", permission: "view_programs", variant: "secondary" },
  ],
  systemStatus: [
    { label: "Distribution Queue", status: "DEGRADED", description: "Pending approvals are elevated and require operational follow-up." },
    { label: "Beneficiary Uploads", status: "OPERATIONAL", description: "Bulk intake channel is stable for the current reporting cycle." },
    { label: "Field Sync", status: "MAINTENANCE", description: "Field validation sync is running in simulated maintenance mode." },
  ],
};

export const auditorDashboardData: DashboardResponse = {
  scope: "NATIONAL",
  title: "National Audit Overview",
  subtitle: "Read-only oversight across organizations, distributions, and platform activity for compliance review.",
  kpis: {
    totalOrganizations: 12,
    totalPrograms: 56,
    totalBeneficiaries: 245678,
    totalDistributed: 5600000000,
    pendingDistributions: 150000000,
    activePrograms: 42,
  },
  distributionOverview: nationalDashboardData.distributionOverview,
  beneficiaryGrowth: nationalDashboardData.beneficiaryGrowth,
  benefitTypeBreakdown: nationalDashboardData.benefitTypeBreakdown,
  recentActivities: [
    {
      id: "aud_act_001",
      actor: "David Audu",
      action: "reviewed exception trail",
      target: "North Central Distribution Cycle",
      timestamp: "2026-06-02T06:50:00Z",
      type: "AUDIT",
    },
    {
      id: "aud_act_002",
      actor: "Audit Monitor",
      action: "recorded control checkpoint",
      target: "Beneficiary Import Review",
      timestamp: "2026-06-01T17:12:00Z",
      type: "AUDIT",
    },
    {
      id: "aud_act_003",
      actor: "Compliance Review",
      action: "inspected distribution history",
      target: "Household Relief Transfer",
      timestamp: "2026-05-31T12:30:00Z",
      type: "DISTRIBUTION",
    },
  ],
  quickActions: [
    { id: "qa_012", label: "View Reports", href: "/reports", permission: "view_reports", variant: "secondary" },
    { id: "qa_013", label: "View Audit Logs", href: "/audit-logs", permission: "view_audit_logs", variant: "secondary" },
    { id: "qa_014", label: "Review Distribution History", href: "/distributions", permission: "view_distributions", variant: "secondary" },
  ],
  systemStatus: [
    { label: "Audit Log", status: "OPERATIONAL", description: "Cross-module event capture is available for review and traceability." },
    { label: "Control Monitoring", status: "OPERATIONAL", description: "Exception reporting is active across national distribution flows." },
    { label: "Evidence Queue", status: "DEGRADED", description: "Mock evidence review queue has elevated backlog for compliance sampling." },
  ],
};
