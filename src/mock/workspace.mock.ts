import type { OrganizationWorkspaceResponse } from "@/types/workspace";
import type { UserRole } from "@/types/auth";

const baseWorkspaceByOrganizationId: Record<string, Omit<OrganizationWorkspaceResponse, "quickActions" | "roleScope" | "role">> = {
  org_001: {
    organization: {
      id: "org_001",
      name: "Federal Ministry of Humanitarian Affairs",
      shortName: "FMHA",
      type: "FEDERAL_MINISTRY",
      status: "ACTIVE",
      state: "FCT",
      contactEmail: "info@fmha.gov.ng",
      contactPhone: "+2348012345678",
      address: "Federal Secretariat Complex, Abuja",
    },
    kpis: {
      activePrograms: 12,
      totalBeneficiaries: 250000,
      totalDistributed: 5600000000,
      pendingDistributions: 150000000,
      completedDistributions: 284,
      benefitTypes: 4,
    },
    programs: [
      { id: "program_001", name: "Hope To Feed The Poor", benefitType: "FOOD", status: "ACTIVE", beneficiaryCount: 50000, totalDistributed: 250000000 },
      { id: "program_002", name: "Youth Empowerment Grant", benefitType: "CASH", status: "ACTIVE", beneficiaryCount: 75000, totalDistributed: 1500000000 },
      { id: "program_003", name: "Maternal Care Relief", benefitType: "MEDICAL", status: "ACTIVE", beneficiaryCount: 27000, totalDistributed: 420000000 },
      { id: "program_004", name: "Education Continuity Grant", benefitType: "EDUCATION", status: "ACTIVE", beneficiaryCount: 61000, totalDistributed: 1180000000 },
    ],
    beneficiarySummary: {
      totalBeneficiaries: 250000,
      activeBeneficiaries: 230000,
      pendingVerification: 12000,
      flaggedRecords: 8000,
      topStates: [
        { state: "FCT", count: 50000 },
        { state: "Lagos", count: 42000 },
        { state: "Kano", count: 38000 },
      ],
    },
    distributionSummary: {
      totalBatches: 320,
      completedBatches: 284,
      pendingBatches: 28,
      failedBatches: 8,
      recentBatches: [
        { id: "batch_001", name: "June Youth Grant Batch", benefitType: "CASH", status: "COMPLETED", beneficiaryCount: 25000, amount: 500000000, createdAt: "2026-06-01T09:00:00Z" },
        { id: "batch_002", name: "Food Relief Batch 12", benefitType: "FOOD", status: "PENDING", beneficiaryCount: 15000, createdAt: "2026-06-02T07:30:00Z" },
        { id: "batch_003", name: "Maternal Care Wave 8", benefitType: "MEDICAL", status: "COMPLETED", beneficiaryCount: 6000, amount: 120000000, createdAt: "2026-05-30T10:15:00Z" },
      ],
    },
    recentActivities: [
      { id: "activity_001", actor: "Musa Ibrahim", action: "created distribution batch", target: "June Youth Grant Batch", timestamp: "2026-06-02T08:20:00Z", type: "DISTRIBUTION" },
      { id: "activity_002", actor: "Chioma Okafor", action: "uploaded beneficiaries", target: "5,000 beneficiary records", timestamp: "2026-06-01T16:45:00Z", type: "BENEFICIARY" },
      { id: "activity_003", actor: "Program Registry", action: "updated program milestone", target: "Education Continuity Grant", timestamp: "2026-05-31T13:12:00Z", type: "PROGRAM" },
    ],
    operationalHealth: [
      { label: "Beneficiary Verification", status: "WARNING", description: "12,000 records pending verification." },
      { label: "Distribution Processing", status: "GOOD", description: "All active distribution batches processing normally." },
      { label: "Compliance Review", status: "GOOD", description: "No unresolved audit flags." },
    ],
  },
  org_002: {
    organization: {
      id: "org_002",
      name: "Lagos State Social Protection Agency",
      shortName: "LASPA",
      type: "STATE_AGENCY",
      status: "ACTIVE",
      state: "Lagos",
      contactEmail: "contact@laspa.gov.ng",
      contactPhone: "+2348092001002",
      address: "Alausa Secretariat, Ikeja, Lagos",
    },
    kpis: {
      activePrograms: 9,
      totalBeneficiaries: 118000,
      totalDistributed: 2480000000,
      pendingDistributions: 72000000,
      completedDistributions: 166,
      benefitTypes: 4,
    },
    programs: [
      { id: "program_011", name: "Urban Family Relief", benefitType: "CASH", status: "ACTIVE", beneficiaryCount: 36000, totalDistributed: 780000000 },
      { id: "program_012", name: "School Meal Expansion", benefitType: "FOOD", status: "ACTIVE", beneficiaryCount: 42000, totalDistributed: 560000000 },
      { id: "program_013", name: "Health Access Bridge", benefitType: "MEDICAL", status: "ACTIVE", beneficiaryCount: 18000, totalDistributed: 290000000 },
    ],
    beneficiarySummary: {
      totalBeneficiaries: 118000,
      activeBeneficiaries: 109000,
      pendingVerification: 5600,
      flaggedRecords: 3400,
      topStates: [
        { state: "Lagos Mainland", count: 36000 },
        { state: "Ikeja", count: 28000 },
        { state: "Badagry", count: 17000 },
      ],
    },
    distributionSummary: {
      totalBatches: 204,
      completedBatches: 166,
      pendingBatches: 30,
      failedBatches: 8,
      recentBatches: [
        { id: "batch_011", name: "May Urban Family Relief", benefitType: "CASH", status: "COMPLETED", beneficiaryCount: 14000, amount: 260000000, createdAt: "2026-06-01T11:20:00Z" },
        { id: "batch_012", name: "School Meal Wave 5", benefitType: "FOOD", status: "PENDING", beneficiaryCount: 9500, createdAt: "2026-06-02T08:10:00Z" },
      ],
    },
    recentActivities: [
      { id: "laspa_001", actor: "Hauwa Lawal", action: "approved operational report", target: "May Urban Family Relief", timestamp: "2026-06-02T08:00:00Z", type: "AUDIT" },
      { id: "laspa_002", actor: "Samuel Ajayi", action: "created distribution batch", target: "School Meal Wave 5", timestamp: "2026-06-01T12:40:00Z", type: "DISTRIBUTION" },
    ],
    operationalHealth: [
      { label: "Field Coordination", status: "GOOD", description: "State coordination teams are reporting on schedule." },
      { label: "Beneficiary Screening", status: "WARNING", description: "A subset of urban household records still requires verification." },
      { label: "Batch Reconciliation", status: "GOOD", description: "Completed batches have been reconciled successfully." },
    ],
  },
  org_003: {
    organization: {
      id: "org_003",
      name: "Kano Rural Welfare Board",
      shortName: "KRWB",
      type: "STATE_AGENCY",
      status: "PENDING_REVIEW",
      state: "Kano",
      contactEmail: "office@krwb.gov.ng",
      contactPhone: "+2348031002003",
      address: "State Secretariat, Kano",
    },
    kpis: {
      activePrograms: 6,
      totalBeneficiaries: 86000,
      totalDistributed: 1440000000,
      pendingDistributions: 118000000,
      completedDistributions: 91,
      benefitTypes: 3,
    },
    programs: [
      { id: "program_021", name: "Rural Nutrition Outreach", benefitType: "FOOD", status: "ACTIVE", beneficiaryCount: 27000, totalDistributed: 220000000 },
      { id: "program_022", name: "Farm Family Stabilization", benefitType: "CASH", status: "ACTIVE", beneficiaryCount: 18000, totalDistributed: 470000000 },
    ],
    beneficiarySummary: {
      totalBeneficiaries: 86000,
      activeBeneficiaries: 73100,
      pendingVerification: 8400,
      flaggedRecords: 4500,
      topStates: [
        { state: "Kano Municipal", count: 23000 },
        { state: "Wudil", count: 15000 },
        { state: "Rano", count: 12000 },
      ],
    },
    distributionSummary: {
      totalBatches: 104,
      completedBatches: 91,
      pendingBatches: 10,
      failedBatches: 3,
      recentBatches: [
        { id: "batch_021", name: "Farm Family Wave 7", benefitType: "CASH", status: "PENDING", beneficiaryCount: 7200, amount: 98000000, createdAt: "2026-06-02T06:20:00Z" },
      ],
    },
    recentActivities: [
      { id: "krwb_001", actor: "Review Board", action: "requested compliance update", target: "Farm Family Stabilization", timestamp: "2026-06-01T10:05:00Z", type: "AUDIT" },
    ],
    operationalHealth: [
      { label: "Governance Review", status: "CRITICAL", description: "Pending review status is blocking downstream approvals." },
      { label: "Distribution Queue", status: "WARNING", description: "Several rural batches are waiting for compliance sign-off." },
      { label: "Data Intake", status: "GOOD", description: "Beneficiary intake is currently stable." },
    ],
  },
};

export const workspaceQuickActionsByRole: Record<UserRole, { id: string; label: string; href: string }[]> = {
  SUPER_ADMIN: [
    { id: "ws_qa_001", label: "View Programs", href: "/programs" },
    { id: "ws_qa_002", label: "View Beneficiaries", href: "/beneficiaries" },
    { id: "ws_qa_003", label: "View Reports", href: "/reports" },
    { id: "ws_qa_004", label: "Edit Organization", href: "/organizations/:id/edit" },
  ],
  ORG_ADMIN: [
    { id: "ws_qa_005", label: "Create Program", href: "/programs" },
    { id: "ws_qa_006", label: "Upload Beneficiaries", href: "/beneficiaries" },
    { id: "ws_qa_007", label: "Create benefit distribution", href: "/distributions" },
    { id: "ws_qa_008", label: "View Reports", href: "/reports" },
  ],
  PROGRAM_OFFICER: [
    { id: "ws_qa_009", label: "Upload Beneficiaries", href: "/beneficiaries" },
    { id: "ws_qa_010", label: "Create benefit distribution", href: "/distributions" },
    { id: "ws_qa_011", label: "View Distribution History", href: "/distributions" },
  ],
  AUDITOR: [
    { id: "ws_qa_012", label: "View Reports", href: "/reports" },
    { id: "ws_qa_013", label: "View Audit Logs", href: "/audit-logs" },
    { id: "ws_qa_014", label: "View Distribution History", href: "/distributions" },
  ],
  ORGANIZATION_MANAGER: [
    { id: "ws_qa_015", label: "Open Dashboard", href: "/dashboard" },
    { id: "ws_qa_016", label: "Review Interventions", href: "/programs" },
  ],
  STORE_MANAGER: [
    { id: "ws_qa_017", label: "Open Dashboard", href: "/dashboard" },
    { id: "ws_qa_018", label: "Review Interventions", href: "/programs" },
  ],
  DISTRIBUTION_MANAGER: [
    { id: "ws_qa_019", label: "Open Dashboard", href: "/dashboard" },
    { id: "ws_qa_020", label: "Review Interventions", href: "/programs" },
  ],
  AGENCY_ACCOUNTANT: [
    { id: "ws_qa_021", label: "Open Dashboard", href: "/dashboard" },
    { id: "ws_qa_022", label: "Review Distributions", href: "/distributions" },
  ],
  SYSTEM_ACCOUNTANT: [
    { id: "ws_qa_025", label: "Open Dashboard", href: "/dashboard" },
    { id: "ws_qa_026", label: "Review Interventions", href: "/programs" },
  ],
  DIRECTOR: [
    { id: "ws_qa_023", label: "Open Dashboard", href: "/dashboard" },
    { id: "ws_qa_024", label: "Review Interventions", href: "/programs" },
  ],
};

export const sampleWorkspaceLinks = [
  { id: "org_001", label: "Federal Ministry of Humanitarian Affairs" },
  { id: "org_002", label: "Lagos State Social Protection Agency" },
  { id: "org_003", label: "Kano Rural Welfare Board" },
  { id: "org_014", label: "National School Feeding Secretariat" },
];

export function getBaseWorkspaceByOrganizationId(id: string) {
  return baseWorkspaceByOrganizationId[id] ?? null;
}
