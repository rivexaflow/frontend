import type {
  HrmEmployeeProfile,
  HrmEmployeeRecord,
  HrmEmployeeProfileSectionId,
} from "@/types/hrm";

function splitName(fullName: string) {
  const parts = fullName.trim().split(/\s+/);
  if (parts.length === 0) return { firstName: "", middleName: "", lastName: "" };
  if (parts.length === 1) return { firstName: parts[0], middleName: "", lastName: "" };
  if (parts.length === 2) return { firstName: parts[0], middleName: "", lastName: parts[1] };
  return {
    firstName: parts[0],
    middleName: parts.slice(1, -1).join(" "),
    lastName: parts[parts.length - 1],
  };
}

function isIndiaLocation(location: string) {
  return !location.includes("UK") && !location.includes("SG") && !location.includes("US");
}

const PROFILE_ENRICHMENT: Record<string, Partial<Omit<HrmEmployeeProfile, keyof HrmEmployeeRecord>>> = {
  emp_root: {
    basic: {
      firstName: "Priya",
      middleName: "",
      lastName: "Mehta",
      preferredName: "Priya",
      gender: "Female",
      dateOfBirth: "1985-03-12",
      maritalStatus: "Married",
      bloodGroup: "O+",
      nationality: "Indian",
      personalEmail: "priya.personal@gmail.com",
      personalMobile: "+91 98 2001 9901",
    },
    employmentDetails: {
      employeeCategory: "Leadership",
      confirmationDate: "2019-07-01",
      teamLead: "—",
      workLocation: "Mumbai HQ",
      officeBranch: "Nariman Point",
      costCenter: "CC-EXEC-01",
      gradeBand: "L7",
      shiftAssignment: "General · 09:30–18:30",
    },
    organization: {
      businessUnit: "Corporate",
      division: "Executive Office",
      department: "Executive",
      team: "Leadership",
      reportingManager: "Board of Directors",
      skipLevelManager: "—",
      hrManager: "Anita Desai",
    },
    contact: {
      addressLine1: "14 Marine Drive",
      addressLine2: "Nariman Point",
      city: "Mumbai",
      state: "Maharashtra",
      country: "India",
      postalCode: "400021",
      permanentSameAsCurrent: true,
      emergencyName: "Arjun Mehta",
      emergencyRelationship: "Spouse",
      emergencyMobile: "+91 98 2001 9901",
    },
    identity: {
      region: "india",
      panNumber: "ABCDE1234F",
      aadhaarNumber: "•••• •••• 8821",
      passportNumber: "Z1234567",
      uan: "100234567890",
    },
    payroll: {
      ctc: 2850000,
      basicSalary: 1200000,
      allowances: 450000,
      currency: "INR",
      bankName: "HDFC Bank",
      accountNumber: "•••• 4821",
      ifscSwift: "HDFC0001234",
      paymentMethod: "Bank transfer",
      taxRegime: "New regime",
      lastPaidPeriod: "May 2026",
    },
    attendanceLeave: {
      shift: "General · 09:30–18:30",
      weeklyOff: "Sat–Sun",
      attendancePolicy: "Standard corporate",
      leavePolicy: "Annual + sick (India)",
      workMode: "hybrid",
      workingHours: "9h / day",
      overtimeEligible: false,
      annualBalance: 18,
      sickBalance: 8,
      pendingRequests: 0,
      attendanceRate: 96,
    },
    assetsInfo: {
      laptopAssigned: true,
      laptopSerial: "C02X-9921",
      monitor: '27" Dell UltraSharp',
      phone: "iPhone 15 Pro",
      accessCard: "AC-4402",
      softwareLicenses: "Microsoft 365, Figma, Slack",
    },
    skillsInfo: {
      primarySkills: "Leadership, Strategy, Financial planning",
      secondarySkills: "Public speaking, M&A",
      certifications: "CPA (India)",
      yearsOfExperience: 18,
      previousEmployer: "Global Finance Corp",
      linkedIn: "linkedin.com/in/priyamehta",
    },
    performance: {
      probationStatus: "Confirmed",
      performanceRating: 4.8,
      kpis: "Revenue growth, EBITDA, NPS",
      goals: "Expand APAC footprint · Q3 2026",
      reviews: [
        {
          id: "p1",
          period: "FY 2025",
          rating: 4.8,
          reviewer: "Board",
          summary: "Exceeded revenue targets; strong org leadership.",
        },
      ],
    },
    access: {
      userRole: "Super Admin",
      permissions: "Full workspace",
      departmentAccess: "All departments",
      crmAccess: true,
      financeAccess: true,
      adminRights: true,
      hrRoleName: "Super Admin",
      dataScope: "COMPANY",
      workspaceUserLinked: true,
      lastLogin: "Today",
      mfaEnabled: true,
    },
    timeline: [
      { id: "act1", action: "Profile updated", detail: "Contact phone changed", occurredAt: "2 days ago", actor: "HR Admin" },
      { id: "act2", action: "Leave approved", detail: "Annual leave · 3 days", occurredAt: "1 week ago" },
    ],
    exit: { status: "none" },
  },
};

function defaultEnrichment(record: HrmEmployeeRecord): Omit<HrmEmployeeProfile, keyof HrmEmployeeRecord> {
  const hash = record.id.split("").reduce((s, c) => s + c.charCodeAt(0), 0);
  const names = splitName(record.name);
  const india = isIndiaLocation(record.location);
  const salaryBase = 45000 + (hash % 40) * 2500;
  const managerLabel = record.managerId ? "Assigned manager" : "—";

  return {
    basic: {
      ...names,
      preferredName: names.firstName,
      gender: hash % 2 === 0 ? "Male" : "Female",
      dateOfBirth: "1990-06-15",
      maritalStatus: "Single",
      bloodGroup: "B+",
      nationality: india ? "Indian" : record.location.includes("UK") ? "British" : "International",
      personalEmail: record.email.replace("@", "+personal@"),
      personalMobile: record.phone ?? "",
    },
    employmentDetails: {
      employeeCategory: "Individual contributor",
      confirmationDate: record.status === "probation" ? "—" : record.joinedAt,
      teamLead: managerLabel,
      workLocation: record.location,
      officeBranch: record.location.split(",")[0]?.trim() ?? record.location,
      costCenter: `CC-${record.department.slice(0, 3).toUpperCase()}-${hash % 99}`,
      gradeBand: `G${4 + (hash % 4)}`,
      shiftAssignment: "General · 09:30–18:30",
    },
    organization: {
      businessUnit: "Operations",
      division: record.department,
      department: record.department,
      team: `${record.department} Team`,
      reportingManager: managerLabel,
      skipLevelManager: "—",
      hrManager: "HR Operations",
    },
    contact: {
      addressLine1: "—",
      city: record.location.split(",")[0]?.trim() ?? "—",
      state: "—",
      country: record.location.split(",")[1]?.trim() ?? (india ? "India" : "—"),
      postalCode: "—",
      permanentSameAsCurrent: true,
      emergencyName: "—",
      emergencyRelationship: "—",
      emergencyMobile: record.phone ?? "—",
    },
    identity: {
      region: india ? "india" : "international",
      panNumber: india ? "•••• ••••" : undefined,
      taxId: india ? undefined : "••••-••••",
    },
    payroll: {
      ctc: salaryBase * 12,
      basicSalary: Math.round(salaryBase * 0.45),
      allowances: Math.round(salaryBase * 0.2),
      currency: record.location.includes("UK") ? "GBP" : record.location.includes("SG") ? "SGD" : "INR",
      bankName: "—",
      accountNumber: "•••• —",
      paymentMethod: "Bank transfer",
      taxRegime: india ? "New regime" : "Standard",
      lastPaidPeriod: "May 2026",
    },
    attendanceLeave: {
      shift: "General · 09:30–18:30",
      weeklyOff: "Sat–Sun",
      attendancePolicy: "Standard corporate",
      leavePolicy: "Annual + sick",
      workMode: record.workMode ?? "onsite",
      workingHours: "9h / day",
      overtimeEligible: hash % 2 === 0,
      annualBalance: 12 + (hash % 8),
      sickBalance: 6 + (hash % 4),
      pendingRequests: hash % 3,
      attendanceRate: 88 + (hash % 12),
    },
    assetsInfo: {
      laptopAssigned: hash % 5 !== 0,
      laptopSerial: hash % 5 !== 0 ? `SN-${hash}` : undefined,
    },
    skillsInfo: {
      primarySkills: record.designation,
      yearsOfExperience: 2 + (hash % 12),
    },
    documents: [
      { id: "d1", name: "Offer letter", type: "Contract", status: "verified", uploadedAt: record.joinedAt },
      { id: "d2", name: "Government ID", type: "ID", status: "pending", uploadedAt: record.joinedAt },
    ],
    assetItems: [],
    skillItems: [
      { id: "s1", name: record.designation.split(" ")[0] ?? "Core skill", level: "advanced" },
    ],
    performance: {
      probationStatus: record.status === "probation" ? "In probation" : "Confirmed",
      performanceRating: 3.5 + (hash % 15) / 10,
      reviews: [
        {
          id: "p1",
          period: "FY 2025",
          rating: 3.5 + (hash % 15) / 10,
          reviewer: "Manager",
          summary: "Solid contributor; on track for next review cycle.",
        },
      ],
    },
    access: {
      userRole: record.hrRoleName ?? "Employee",
      permissions: "Standard employee",
      departmentAccess: record.department,
      crmAccess: hash % 3 === 0,
      financeAccess: false,
      adminRights: false,
      hrRoleName: record.hrRoleName ?? "Employee",
      dataScope: record.managerId ? "TEAM" : "DEPARTMENT",
      workspaceUserLinked: true,
      lastLogin: "This week",
      mfaEnabled: hash % 3 !== 0,
    },
    timeline: [
      { id: "act1", action: "Employee created", occurredAt: record.joinedAt, actor: "HR" },
      { id: "act2", action: "Status set", detail: record.status, occurredAt: "Recently" },
    ],
    exit: {
      status: record.status === "offboarding" ? "in_progress" : record.status === "terminated" ? "completed" : "none",
      noticePeriodDays: record.status === "offboarding" ? 60 : undefined,
      reason: record.leavingDate ? "Role transition" : undefined,
      lastWorkingDay: record.leavingDate ?? undefined,
      clearanceProgress: record.status === "offboarding" ? 45 : undefined,
    },
  };
}

export function buildEmployeeProfile(record: HrmEmployeeRecord): HrmEmployeeProfile {
  const extra = PROFILE_ENRICHMENT[record.id] ?? {};
  const defaults = defaultEnrichment(record);

  return {
    ...record,
    basic: { ...defaults.basic, ...extra.basic },
    employmentDetails: { ...defaults.employmentDetails, ...extra.employmentDetails },
    organization: { ...defaults.organization, ...extra.organization },
    contact: { ...defaults.contact, ...extra.contact },
    identity: { ...defaults.identity, ...extra.identity },
    payroll: { ...defaults.payroll, ...extra.payroll },
    attendanceLeave: { ...defaults.attendanceLeave, ...extra.attendanceLeave },
    assetsInfo: { ...defaults.assetsInfo, ...extra.assetsInfo },
    skillsInfo: { ...defaults.skillsInfo, ...extra.skillsInfo },
    documents: extra.documents ?? defaults.documents,
    assetItems: extra.assetItems ?? defaults.assetItems,
    skillItems: extra.skillItems ?? defaults.skillItems,
    performance: {
      ...defaults.performance,
      ...extra.performance,
      reviews: extra.performance?.reviews ?? defaults.performance.reviews,
    },
    access: { ...defaults.access, ...extra.access },
    timeline: extra.timeline ?? defaults.timeline,
    exit: { ...defaults.exit, ...extra.exit },
  };
}

export const EMPLOYEE_PROFILE_SECTIONS: {
  id: HrmEmployeeProfileSectionId;
  label: string;
  description: string;
  shortLabel?: string;
}[] = [
  { id: "basic", label: "Basic information", shortLabel: "Basic", description: "Identity, demographics, and personal contact." },
  { id: "employment", label: "Employment information", shortLabel: "Employment", description: "Type, status, role, and tenure." },
  { id: "organization", label: "Organization hierarchy", shortLabel: "Org", description: "Business unit, team, and reporting lines." },
  { id: "contact", label: "Contact information", shortLabel: "Contact", description: "Addresses and emergency contacts." },
  { id: "identity", label: "Government & identity", shortLabel: "Identity", description: "Tax IDs, passports, and compliance." },
  { id: "payroll", label: "Payroll information", shortLabel: "Payroll", description: "Salary structure, bank, and tax." },
  { id: "attendance_leave", label: "Attendance & leave", shortLabel: "Attendance", description: "Shift, policies, balances, and work mode." },
  { id: "assets", label: "Asset management", shortLabel: "Assets", description: "Assigned equipment and licenses." },
  { id: "skills", label: "Skills & professional", shortLabel: "Skills", description: "Skills, experience, and portfolio." },
  { id: "documents", label: "Documents", shortLabel: "Docs", description: "Contracts, IDs, and compliance files." },
  { id: "performance", label: "Performance & goals", shortLabel: "Performance", description: "Ratings, KPIs, and appraisals." },
  { id: "access", label: "Access control", shortLabel: "Access", description: "Roles, permissions, and security." },
  { id: "exit", label: "Exit management", shortLabel: "Exit", description: "Offboarding, clearance, and settlement." },
  { id: "timeline", label: "Employee timeline", shortLabel: "Timeline", description: "Audit trail, notes, and activity." },
];

/** Map legacy ?section= query values to current section ids. */
export const LEGACY_PROFILE_SECTION_MAP: Record<string, HrmEmployeeProfileSectionId> = {
  personal: "basic",
  activity: "timeline",
};

export function displayFullName(basic: HrmEmployeeProfile["basic"]) {
  return [basic.firstName, basic.middleName, basic.lastName].filter(Boolean).join(" ");
}
