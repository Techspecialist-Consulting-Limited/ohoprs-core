import { organizationsData } from "@/mock/organizations.mock";
import { programsData } from "@/mock/programs.mock";
import { beneficiariesData } from "@/mock/beneficiaries.mock";
import { distributionsData } from "@/mock/distributions.mock";
import { bulkDistributionJobsData } from "@/mock/bulk-distributions.mock";
import type { AuditAction, AuditLogDetails, AuditModule, AuditResult } from "@/types/audit";

const users = [
  {
    id: "user_001",
    name: "Amina Bello",
    email: "superadmin@gov.ng",
    role: "SUPER_ADMIN",
    organizationId: "org_001",
    organizationName: organizationsData.find((item) => item.id === "org_001")?.name,
  },
  {
    id: "user_002",
    name: "Musa Ibrahim",
    email: "orgadmin@gov.ng",
    role: "ORG_ADMIN",
    organizationId: "org_001",
    organizationName: organizationsData.find((item) => item.id === "org_001")?.name,
  },
  {
    id: "user_003",
    name: "Chioma Okafor",
    email: "officer@gov.ng",
    role: "PROGRAM_OFFICER",
    organizationId: "org_001",
    organizationName: organizationsData.find((item) => item.id === "org_001")?.name,
  },
  {
    id: "user_004",
    name: "David Audu",
    email: "auditor@gov.ng",
    role: "AUDITOR",
    organizationId: undefined,
    organizationName: undefined,
  },
] as const;

const ipAddresses = [
  "197.210.55.12",
  "102.89.44.19",
  "154.113.23.41",
  "41.203.71.88",
];

function timelineFor(module: AuditModule, action: AuditAction, timestamp: string) {
  const start = new Date(timestamp);
  const middle = new Date(start);
  middle.setMinutes(middle.getMinutes() + 2);
  const end = new Date(start);
  end.setMinutes(end.getMinutes() + 4);

  const base = [
    { id: `${module}_${action}_1`, label: "Event captured", timestamp: start.toISOString() },
    { id: `${module}_${action}_2`, label: action === "EXPORT" ? "CSV generated" : "Validation completed", timestamp: middle.toISOString() },
    { id: `${module}_${action}_3`, label: "Audit record stored", timestamp: end.toISOString() },
  ];

  return base;
}

function relatedRecordsFor(module: AuditModule, resourceId?: string, resourceName?: string, organizationId?: string) {
  const related = [];

  if (organizationId) {
    const organization = organizationsData.find((item) => item.id === organizationId);
    if (organization) {
      related.push({ id: organization.id, type: "ORGANIZATION", name: organization.name });
    }
  }

  if (resourceId && resourceName) {
    related.push({
      id: resourceId,
      type: module,
      name: resourceName,
    });
  }

  return related;
}

function createEvent(index: number): AuditLogDetails {
  const user = users[index % users.length];
  const moduleSequence: AuditModule[] = [
    "AUTH",
    "BENEFICIARY",
    "PROGRAM",
    "DISTRIBUTION",
    "BULK_DISTRIBUTION",
    "REPORTS",
    "ORGANIZATION",
    "SETTINGS",
  ];
  const actionSequence: AuditAction[] = [
    "LOGIN",
    "CREATE",
    "UPDATE",
    "VIEW",
    "EXPORT",
    "CANCEL",
    "VERIFY",
    "APPROVE",
  ];
  const resultSequence: AuditResult[] = ["SUCCESS", "SUCCESS", "WARNING", "FAILED"];

  const auditModule = moduleSequence[index % moduleSequence.length];
  const action = actionSequence[index % actionSequence.length];
  const result = resultSequence[index % resultSequence.length];
  const timestamp = new Date(Date.UTC(2026, 5, (index % 28) + 1, 8 + (index % 10), 10 + (index % 40), 0)).toISOString();

  let resourceId: string | undefined;
  let resourceName: string | undefined;
  let metadata: Record<string, unknown> = {};

  if (auditModule === "PROGRAM") {
    const program = programsData[index % programsData.length];
    resourceId = program.id;
    resourceName = program.name;
    metadata = {
      oldBudget: Math.max(program.budget - 150000000, 0),
      newBudget: program.budget,
      changedBy: user.name,
    };
  } else if (auditModule === "BENEFICIARY") {
    const beneficiary = beneficiariesData[index % beneficiariesData.length];
    resourceId = beneficiary.id;
    resourceName = beneficiary.fullName;
    metadata = {
      verificationStatus: beneficiary.verificationStatus,
      benefitStatus: beneficiary.benefitStatus,
      updatedFields: ["phone", "address", "verificationStatus"].slice(0, (index % 3) + 1),
    };
  } else if (auditModule === "DISTRIBUTION") {
    const distribution = distributionsData[index % distributionsData.length];
    resourceId = distribution.id;
    resourceName = distribution.name;
    metadata = {
      distributionStatus: distribution.status,
      beneficiaryCount: distribution.beneficiaryCount,
      amount: distribution.amount ?? null,
      quantity: distribution.quantity ?? null,
    };
  } else if (auditModule === "BULK_DISTRIBUTION") {
    const job = bulkDistributionJobsData[index % bulkDistributionJobsData.length];
    resourceId = job.id;
    resourceName = job.programName;
    metadata = {
      jobStatus: job.status,
      totalRecords: job.totalRecords,
      processedRecords: job.processedRecords,
      failedRecords: job.failedRecords,
    };
  } else if (auditModule === "ORGANIZATION") {
    const organization = organizationsData[index % organizationsData.length];
    resourceId = organization.id;
    resourceName = organization.name;
    metadata = {
      status: organization.status,
      shortName: organization.shortName,
      lastUpdatedBy: user.name,
    };
  } else if (auditModule === "REPORTS") {
    resourceId = `report_export_${String(index).padStart(3, "0")}`;
    resourceName = "CSV Report Export";
    metadata = {
      exportType: index % 2 === 0 ? "organization-report.csv" : "reports-summary.csv",
      filters: {
        organization: user.organizationName ?? "National",
        module: "REPORTS",
      },
    };
  } else if (auditModule === "AUTH") {
    resourceId = user.id;
    resourceName = user.name;
    metadata = {
      authAction: action,
      device: index % 2 === 0 ? "Desktop Web" : "Secure Browser Session",
      sessionId: `session_${String(index).padStart(4, "0")}`,
    };
  } else {
    resourceId = `settings_${String(index).padStart(3, "0")}`;
    resourceName = "Platform Settings";
    metadata = {
      changedKey: "theme.defaultMode",
      previousValue: "system",
      nextValue: "dark",
    };
  }

  const descriptionMap: Record<AuditModule, string> = {
    AUTH: action === "LOGIN" ? "User login completed successfully" : "User logout recorded",
    ORGANIZATION: "Updated organization profile and administrative settings",
    PROGRAM: "Updated program budget and execution settings",
    BENEFICIARY: "Beneficiary profile updated with verification and status changes",
    DISTRIBUTION: action === "CANCEL" ? "Cancelled distribution batch before execution" : "Created or updated distribution batch",
    BULK_DISTRIBUTION: action === "CANCEL" ? "Cancelled bulk processing job" : "Bulk processing job created or updated",
    REPORTS: "Exported filtered analytics report as CSV",
    SETTINGS: "Updated compliance-sensitive platform settings",
  };

  return {
    id: `audit_${String(index + 1).padStart(3, "0")}`,
    timestamp,
    userId: user.id,
    userName: user.name,
    userEmail: user.email,
    role: user.role,
    organizationId: user.organizationId,
    organizationName: user.organizationName,
    module: auditModule,
    action,
    resourceId,
    resourceName,
    result,
    ipAddress: ipAddresses[index % ipAddresses.length],
    description: descriptionMap[auditModule],
    metadata,
    relatedRecords: relatedRecordsFor(auditModule, resourceId, resourceName, user.organizationId),
    timeline: timelineFor(auditModule, action, timestamp),
  };
}

export const auditLogsData: AuditLogDetails[] = Array.from({ length: 120 }, (_, index) => createEvent(index));
