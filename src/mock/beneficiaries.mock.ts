import { organizationsData } from "@/mock/organizations.mock";
import { programsData } from "@/mock/programs.mock";
import type {
  Beneficiary360Details,
  BenefitTimelineStatus,
  DuplicateCheckStatus,
  RiskLevel,
} from "@/types/beneficiary";

function getProgram(id: string) {
  return programsData.find((program) => program.id === id)!;
}

function buildPrograms(programIds: string[]) {
  return programIds.map((id) => {
    const program = getProgram(id);
    return {
      id: program.id,
      name: program.name,
      benefitType: program.benefitType,
      status: program.status,
    };
  });
}

function organizationName(id: string) {
  return organizationsData.find((organization) => organization.id === id)?.name ?? "Unknown Organization";
}

function createBeneficiary(index: number, organizationId: string, programIds: string[], overrides: Partial<Beneficiary360Details> = {}): Beneficiary360Details {
  const firstName = `Beneficiary${index}`;
  const lastName = `Person${index}`;
  const programs = buildPrograms(programIds);
  const verificationStatus = overrides.verificationStatus ?? (index % 5 === 0 ? "FLAGGED" : index % 4 === 0 ? "FAILED" : index % 3 === 0 ? "PENDING" : "VERIFIED");
  const benefitStatus = overrides.benefitStatus ?? (index % 6 === 0 ? "PAUSED" : index % 7 === 0 ? "EXITED" : "ACTIVE");
  const cashReceived = 450000 + index * 15000;
  const nonCash = 2 + (index % 4);
  const lastBenefitDate = `2026-05-${String((index % 20) + 5).padStart(2, "0")}T12:00:00Z`;
  const duplicateCheck: DuplicateCheckStatus =
    index % 6 === 0 ? "REVIEW_REQUIRED" : index % 5 === 0 ? "FAILED" : index % 4 === 0 ? "PENDING" : "PASSED";
  const riskLevel: RiskLevel = index % 6 === 0 ? "HIGH" : index % 4 === 0 ? "MEDIUM" : "LOW";
  const organization = organizationsData.find((item) => item.id === organizationId)!;

  return {
    id: `beneficiary_${String(index).padStart(3, "0")}`,
    organizationId,
    organizationName: organizationName(organizationId),
    firstName,
    lastName,
    middleName: index % 2 === 0 ? "A." : "",
    fullName: `${firstName} ${lastName}`,
    nin: String(41000000000 + index),
    bvn: index % 4 === 0 ? "" : String(22000000000 + index),
    phone: `+23480${String(10000000 + index).slice(0, 8)}`,
    email: `beneficiary${index}@example.ng`,
    gender: index % 3 === 0 ? "FEMALE" : index % 2 === 0 ? "MALE" : "OTHER",
    dateOfBirth: `199${index % 10}-0${(index % 8) + 1}-1${index % 9}`,
    state: ["FCT", "Lagos", "Kano", "Kaduna", "Borno", "Osun"][index % 6],
    lga: ["Municipal", "Central", "North", "South", "East", "West"][index % 6],
    address: `${10 + index} Relief Avenue`,
    programIds,
    programs,
    verificationStatus,
    benefitStatus,
    createdAt: `2026-03-${String((index % 28) + 1).padStart(2, "0")}T09:00:00Z`,
    updatedAt: `2026-06-${String((index % 28) + 1).padStart(2, "0")}T08:00:00Z`,
    verificationSummary: {
      status: verificationStatus,
      ninVerified: verificationStatus !== "FAILED",
      bvnVerified: verificationStatus === "VERIFIED",
      identityVerified: verificationStatus === "VERIFIED",
      bankVerified: verificationStatus === "VERIFIED",
      duplicateCheck,
      lastCheckedAt: `2026-06-${String((index % 28) + 1).padStart(2, "0")}T10:00:00Z`,
    },
    benefitSummary: {
      activeEnrollments: programs.length,
      totalCashReceived: cashReceived,
      nonCashBenefitsReceived: nonCash,
      lastDistributionStatus: index % 4 === 0 ? "Pending reconciliation" : "Completed successfully",
      verificationState: verificationStatus,
    },
    benefit360Summary: {
      totalCashReceived: cashReceived,
      totalNonCashBenefits: nonCash,
      programsEnrolled: programs.length,
      lastBenefitDate,
      riskFlags: riskLevel === "LOW" ? 1 : riskLevel === "MEDIUM" ? 2 : 3,
    },
    programBreakdown: programs.map((program, programIndex) => ({
      programId: program.id,
      programName: program.name,
      organizationId,
      organizationName: organization.name,
      benefitType: program.benefitType,
      totalCashReceived: program.benefitType === "CASH" ? cashReceived / Math.max(programs.length, 1) : undefined,
      nonCashBenefitCount: program.benefitType !== "CASH" ? nonCash : undefined,
      benefitDescription: program.benefitType !== "CASH" ? `${program.benefitType.replaceAll("_", " ")} support package` : undefined,
      benefitCount: 1 + ((index + programIndex) % 4),
      lastBenefitDate,
      status: benefitStatus,
    })),
    benefitTimeline: programs.flatMap((program, programIndex) => {
      const primaryDate = new Date(lastBenefitDate);
      primaryDate.setDate(primaryDate.getDate() - programIndex * 4);

      const secondaryDate = new Date(primaryDate);
      secondaryDate.setDate(secondaryDate.getDate() - 14);

      const status: BenefitTimelineStatus =
        programIndex === 0 && index % 6 === 0 ? "REVERSED" : programIndex === 1 && index % 5 === 0 ? "FAILED" : "COMPLETED";
      const secondaryStatus: BenefitTimelineStatus = programIndex === 0 && index % 4 === 0 ? "PENDING" : "COMPLETED";

      return [
        {
          id: `timeline_${index}_${program.id}_1`,
          date: primaryDate.toISOString(),
          programId: program.id,
          programName: program.name,
          benefitType: program.benefitType,
          amount: program.benefitType === "CASH" ? Math.round(cashReceived / Math.max(programs.length, 1) / 3) : undefined,
          item: program.benefitType !== "CASH" ? `${program.benefitType.replaceAll("_", " ")} package` : undefined,
          status,
          referenceId: `${program.benefitType === "CASH" ? "PAY" : "BEN"}-2026-${index}${programIndex}`,
          processedBy: programIndex % 2 === 0 ? "Musa Ibrahim" : "Chioma Okafor",
          statusReason:
            status === "REVERSED"
              ? "Reversed after duplicate eligibility review."
              : status === "FAILED"
                ? "Failed due to unresolved account verification."
                : undefined,
        },
        {
          id: `timeline_${index}_${program.id}_2`,
          date: secondaryDate.toISOString(),
          programId: program.id,
          programName: program.name,
          benefitType: program.benefitType,
          amount: program.benefitType === "CASH" ? Math.round(cashReceived / Math.max(programs.length, 1) / 4) : undefined,
          item: program.benefitType !== "CASH" ? `${program.benefitType.replaceAll("_", " ")} support item` : undefined,
          status: secondaryStatus,
          referenceId: `${program.benefitType === "CASH" ? "PAY" : "BEN"}-2026-${index}${programIndex}B`,
          processedBy: programIndex % 2 === 0 ? "Field Operations Desk" : "Distribution Queue",
        },
      ];
    }).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()),
    riskSummary: {
      riskLevel,
      flags: [
        {
          id: `risk_${index}_1`,
          label: "Duplicate phone check",
          severity: riskLevel === "LOW" ? "LOW" : "MEDIUM",
          description: "Phone number appears in another household record.",
        },
        {
          id: `risk_${index}_2`,
          label: "Verification follow-up",
          severity: riskLevel === "HIGH" ? "HIGH" : "LOW",
          description: verificationStatus === "VERIFIED" ? "No unresolved verification follow-up." : "Verification workflow requires additional review.",
        },
      ],
    },
    documentSummary: {
      idDocument: "Available",
      bankVerification: verificationStatus === "VERIFIED" ? "Available" : "Pending",
      enrollmentForm: "Available",
      supportingDocuments: index % 3 === 0 ? "Pending" : "Not Uploaded",
    },
    auditPreview: [
      {
        id: `audit_${index}_1`,
        actor: "System",
        action: "NIN verification completed",
        timestamp: `2026-05-${String((index % 20) + 1).padStart(2, "0")}T09:30:00Z`,
        module: "VERIFICATION",
      },
      {
        id: `audit_${index}_2`,
        actor: "Musa Ibrahim",
        action: "Processed cash benefit",
        timestamp: lastBenefitDate,
        module: "DISTRIBUTION",
      },
      {
        id: `audit_${index}_3`,
        actor: "Chioma Okafor",
        action: "Added to program",
        timestamp: `2026-04-${String((index % 20) + 1).padStart(2, "0")}T10:15:00Z`,
        module: "PROGRAM",
      },
      {
        id: `audit_${index}_4`,
        actor: "Benefits Intake",
        action: "Beneficiary created",
        timestamp: `2026-03-${String((index % 20) + 1).padStart(2, "0")}T09:00:00Z`,
        module: "BENEFICIARY",
      },
      {
        id: `audit_${index}_5`,
        actor: "Review Desk",
        action: "Profile updated",
        timestamp: `2026-05-${String((index % 20) + 2).padStart(2, "0")}T12:00:00Z`,
        module: "BENEFICIARY",
      },
    ],
    ...overrides,
  };
}

export const beneficiariesData: Beneficiary360Details[] = [
  createBeneficiary(1, "org_001", ["program_001", "program_002"], {
    firstName: "Aisha",
    lastName: "Bello",
    fullName: "Aisha Bello",
    state: "FCT",
    lga: "Abuja Municipal",
    verificationStatus: "VERIFIED",
    benefitStatus: "ACTIVE",
    nin: "12345678901",
    bvn: "22345678901",
    benefit360Summary: {
      totalCashReceived: 150000,
      totalNonCashBenefits: 3,
      programsEnrolled: 2,
      lastBenefitDate: "2026-05-20T12:00:00Z",
      riskFlags: 1,
    },
  }),
  createBeneficiary(2, "org_001", ["program_002", "program_003"], {
    firstName: "Sani",
    lastName: "Musa",
    fullName: "Sani Musa",
    riskSummary: {
      riskLevel: "MEDIUM",
      flags: [
        {
          id: "risk_custom_2_1",
          label: "Duplicate household address",
          severity: "MEDIUM",
          description: "Address matches another active beneficiary household.",
        },
        {
          id: "risk_custom_2_2",
          label: "BVN pending review",
          severity: "LOW",
          description: "Bank verification requires reconciliation follow-up.",
        },
      ],
    },
  }),
  createBeneficiary(3, "org_001", ["program_001"], { firstName: "Ngozi", lastName: "Okafor", fullName: "Ngozi Okafor" }),
  createBeneficiary(4, "org_001", ["program_003"], {
    firstName: "John",
    lastName: "Yakubu",
    fullName: "John Yakubu",
    verificationSummary: {
      status: "PENDING",
      ninVerified: true,
      bvnVerified: false,
      identityVerified: false,
      bankVerified: false,
      duplicateCheck: "PENDING",
      lastCheckedAt: "2026-05-22T09:30:00Z",
    },
  }),
  createBeneficiary(5, "org_001", ["program_001", "program_002", "program_003"], { firstName: "Fatima", lastName: "Abdullahi", fullName: "Fatima Abdullahi" }),
  createBeneficiary(6, "org_001", ["program_002"], { firstName: "Chinedu", lastName: "Nwosu", fullName: "Chinedu Nwosu" }),
  createBeneficiary(7, "org_001", ["program_001"], { firstName: "Maryam", lastName: "Aliyu", fullName: "Maryam Aliyu" }),
  createBeneficiary(8, "org_001", ["program_003"], { firstName: "Emeka", lastName: "Udeh", fullName: "Emeka Udeh" }),
  createBeneficiary(9, "org_002", ["program_004", "program_005"], {
    firstName: "Kemi",
    lastName: "Afolabi",
    fullName: "Kemi Afolabi",
    state: "Lagos",
    lga: "Ikeja",
    benefit360Summary: {
      totalCashReceived: 210000,
      totalNonCashBenefits: 4,
      programsEnrolled: 2,
      lastBenefitDate: "2026-05-24T12:00:00Z",
      riskFlags: 2,
    },
  }),
  createBeneficiary(10, "org_002", ["program_004"], { firstName: "Sade", lastName: "Balogun", fullName: "Sade Balogun" }),
  createBeneficiary(11, "org_002", ["program_005", "program_006"], { firstName: "Adewale", lastName: "Johnson", fullName: "Adewale Johnson" }),
  createBeneficiary(12, "org_002", ["program_004"], { firstName: "Ruth", lastName: "Ojo", fullName: "Ruth Ojo" }),
  createBeneficiary(13, "org_002", ["program_006"], { firstName: "Michael", lastName: "Adeoye", fullName: "Michael Adeoye" }),
  createBeneficiary(14, "org_002", ["program_005"], { firstName: "Bolanle", lastName: "Aina", fullName: "Bolanle Aina" }),
  createBeneficiary(15, "org_002", ["program_004", "program_006"], { firstName: "Samuel", lastName: "Lawal", fullName: "Samuel Lawal" }),
  createBeneficiary(16, "org_003", ["program_007"], {
    firstName: "Amina",
    lastName: "Sani",
    fullName: "Amina Sani",
    state: "Kano",
    lga: "Municipal",
    riskSummary: {
      riskLevel: "HIGH",
      flags: [
        {
          id: "risk_custom_16_1",
          label: "Duplicate phone check",
          severity: "HIGH",
          description: "Phone number appears across multiple high-risk records.",
        },
        {
          id: "risk_custom_16_2",
          label: "Identity follow-up required",
          severity: "MEDIUM",
          description: "Identity verification is pending manual officer review.",
        },
      ],
    },
  }),
  createBeneficiary(17, "org_003", ["program_007", "program_008"], { firstName: "Usman", lastName: "Gambo", fullName: "Usman Gambo" }),
  createBeneficiary(18, "org_003", ["program_008"], { firstName: "Hafsat", lastName: "Rabiu", fullName: "Hafsat Rabiu" }),
  createBeneficiary(19, "org_003", ["program_007"], { firstName: "Abdullahi", lastName: "Kabiru", fullName: "Abdullahi Kabiru" }),
  createBeneficiary(20, "org_003", ["program_008"], { firstName: "Zainab", lastName: "Shehu", fullName: "Zainab Shehu" }),
  createBeneficiary(21, "org_004", ["program_009", "program_010"], { firstName: "Blessing", lastName: "Oche", fullName: "Blessing Oche", state: "Kaduna" }),
  createBeneficiary(22, "org_004", ["program_009"], { firstName: "Kabir", lastName: "Danjuma", fullName: "Kabir Danjuma" }),
  createBeneficiary(23, "org_004", ["program_010"], { firstName: "Grace", lastName: "Ogbu", fullName: "Grace Ogbu" }),
  createBeneficiary(24, "org_004", ["program_009", "program_010"], { firstName: "Ibrahim", lastName: "Sule", fullName: "Ibrahim Sule" }),
  createBeneficiary(25, "org_005", ["program_011"], { firstName: "Rose", lastName: "Gyang", fullName: "Rose Gyang", state: "Plateau" }),
  createBeneficiary(26, "org_005", ["program_011"], { firstName: "Patience", lastName: "Longkat", fullName: "Patience Longkat" }),
  createBeneficiary(27, "org_006", ["program_012"], { firstName: "Amina", lastName: "Bukar", fullName: "Amina Bukar", state: "Borno" }),
  createBeneficiary(28, "org_006", ["program_012"], { firstName: "Maimuna", lastName: "Goni", fullName: "Maimuna Goni" }),
  createBeneficiary(29, "org_007", ["program_013"], { firstName: "Uche", lastName: "Okorie", fullName: "Uche Okorie", state: "Abia" }),
  createBeneficiary(30, "org_007", ["program_013"], { firstName: "Chimamanda", lastName: "Nnaji", fullName: "Chimamanda Nnaji" }),
  createBeneficiary(31, "org_008", ["program_014"], { firstName: "Tola", lastName: "Adewumi", fullName: "Tola Adewumi", state: "Osun" }),
  createBeneficiary(32, "org_008", ["program_014"], { firstName: "Racheal", lastName: "Olanrewaju", fullName: "Racheal Olanrewaju" }),
  createBeneficiary(33, "org_009", ["program_015"], { firstName: "Terver", lastName: "Aondona", fullName: "Terver Aondona", state: "Benue" }),
  createBeneficiary(34, "org_009", ["program_015"], { firstName: "Josephine", lastName: "Akaa", fullName: "Josephine Akaa" }),
  createBeneficiary(35, "org_010", ["program_016"], { firstName: "Morenike", lastName: "Taiwo", fullName: "Morenike Taiwo", state: "Ekiti" }),
  createBeneficiary(36, "org_010", ["program_016"], { firstName: "Adekunle", lastName: "Ajibola", fullName: "Adekunle Ajibola" }),
  createBeneficiary(37, "org_011", ["program_017"], { firstName: "Nneka", lastName: "Douglas", fullName: "Nneka Douglas", state: "Rivers" }),
  createBeneficiary(38, "org_011", ["program_017"], { firstName: "Boma", lastName: "Tamuno", fullName: "Boma Tamuno" }),
  createBeneficiary(39, "org_012", ["program_018"], { firstName: "Rukayya", lastName: "Haruna", fullName: "Rukayya Haruna", state: "Bauchi" }),
  createBeneficiary(40, "org_012", ["program_018"], { firstName: "Aisha", lastName: "Mohammed", fullName: "Aisha Mohammed" }),
  createBeneficiary(41, "org_013", ["program_019"], { firstName: "Mfon", lastName: "Bassey", fullName: "Mfon Bassey", state: "Cross River" }),
  createBeneficiary(42, "org_013", ["program_019"], { firstName: "Olu", lastName: "Efioanwan", fullName: "Olu Efioanwan" }),
  createBeneficiary(43, "org_014", ["program_020"], {
    firstName: "Halima",
    lastName: "Ahmed",
    fullName: "Halima Ahmed",
    state: "FCT",
    benefit360Summary: {
      totalCashReceived: 0,
      totalNonCashBenefits: 6,
      programsEnrolled: 1,
      lastBenefitDate: "2026-05-29T12:00:00Z",
      riskFlags: 1,
    },
  }),
  createBeneficiary(44, "org_014", ["program_020"], { firstName: "Yusuf", lastName: "Garba", fullName: "Yusuf Garba" }),
  createBeneficiary(45, "org_014", ["program_020"], { firstName: "Nkiru", lastName: "Okeke", fullName: "Nkiru Okeke" }),
  createBeneficiary(46, "org_014", ["program_020"], { firstName: "Binta", lastName: "Idris", fullName: "Binta Idris" }),
  createBeneficiary(47, "org_001", ["program_001"], { firstName: "Ifeoma", lastName: "Nnamdi", fullName: "Ifeoma Nnamdi" }),
  createBeneficiary(48, "org_002", ["program_004", "program_006"], { firstName: "Tobi", lastName: "Oshodi", fullName: "Tobi Oshodi" }),
  createBeneficiary(49, "org_003", ["program_007"], { firstName: "Safiya", lastName: "Adamu", fullName: "Safiya Adamu" }),
  createBeneficiary(50, "org_004", ["program_010"], { firstName: "Jonathan", lastName: "Musa", fullName: "Jonathan Musa" }),
];

export const beneficiaryUploadPreviewRows = [
  {
    firstName: "Abiola",
    lastName: "Adekunle",
    middleName: "T.",
    nin: "44100233456",
    bvn: "22345678901",
    phone: "+2348011111111",
    email: "abiola.adekunle@example.ng",
    gender: "FEMALE",
    dateOfBirth: "1991-04-10",
    state: "Lagos",
    lga: "Ikeja",
    address: "12 Civic Street",
    organizationId: "org_002",
    programIds: "program_004|program_005",
  },
  {
    firstName: "Hassan",
    lastName: "Bala",
    middleName: "",
    nin: "44100233457",
    bvn: "22345678902",
    phone: "+2348022222222",
    email: "hassan.bala@example.ng",
    gender: "MALE",
    dateOfBirth: "1988-09-02",
    state: "Kano",
    lga: "Municipal",
    address: "18 Relief Road",
    organizationId: "org_003",
    programIds: "program_007",
  },
  {
    firstName: "Grace",
    lastName: "Ola",
    middleName: "",
    nin: "44100233458",
    bvn: "22345678903",
    phone: "+2348033333333",
    email: "grace.ola@example.ng",
    gender: "FEMALE",
    dateOfBirth: "1995-01-20",
    state: "FCT",
    lga: "Abuja Municipal",
    address: "45 Hope Estate",
    organizationId: "org_001",
    programIds: "program_001|program_002",
  },
  {
    firstName: "Tijani",
    lastName: "Lawal",
    middleName: "O.",
    nin: "44100233459",
    bvn: "22345678904",
    phone: "+2348044444444",
    email: "tijani.lawal@example.ng",
    gender: "MALE",
    dateOfBirth: "1987-12-14",
    state: "Kaduna",
    lga: "Central",
    address: "7 Unity Close",
    organizationId: "org_004",
    programIds: "program_009|program_010",
  },
  {
    firstName: "Miriam",
    lastName: "Okon",
    middleName: "",
    nin: "44100233460",
    bvn: "",
    phone: "+2348055555555",
    email: "miriam.okon@example.ng",
    gender: "FEMALE",
    dateOfBirth: "1993-07-08",
    state: "Cross River",
    lga: "Calabar Municipal",
    address: "28 Anchor Crescent",
    organizationId: "org_013",
    programIds: "program_019",
  },
];
