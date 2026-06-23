import {
  allHrmPermissionKeys,
  hrmPermissionKey,
  keysForHrmCategory,
} from "@/features/workspace/data/hrm-permissions-catalog";
import type { HrmRole } from "@/types/hrm";

export type HrmRoleScope = "organization" | "department" | "self";

export type HrmRoleRecord = HrmRole & {
  isSystem: boolean;
  scope: HrmRoleScope;
  memberCount: number;
  permissionKeys: string[];
};

const ALL = allHrmPermissionKeys();

const peopleOps = [
  ...keysForHrmCategory("people"),
  ...keysForHrmCategory("operations"),
  ...keysForHrmCategory("compliance"),
  ...keysForHrmCategory("insights"),
  hrmPermissionKey("admin", "roles", "view"),
  hrmPermissionKey("admin", "setup", "view"),
];

const recruiterKeys = [
  hrmPermissionKey("people", "employees", "view"),
  hrmPermissionKey("people", "recruitment", "view"),
  hrmPermissionKey("people", "recruitment", "manage"),
  hrmPermissionKey("compliance", "documents", "view"),
  hrmPermissionKey("compliance", "policies", "view"),
];

const payrollKeys = [
  hrmPermissionKey("people", "employees", "view"),
  hrmPermissionKey("operations", "attendance", "view"),
  hrmPermissionKey("operations", "leave", "view"),
  hrmPermissionKey("operations", "payroll", "view"),
  hrmPermissionKey("operations", "payroll", "run"),
  hrmPermissionKey("operations", "payroll", "export"),
  hrmPermissionKey("insights", "reports", "view"),
  hrmPermissionKey("insights", "reports", "export"),
];

const managerKeys = [
  hrmPermissionKey("people", "employees", "view"),
  hrmPermissionKey("operations", "attendance", "view"),
  hrmPermissionKey("operations", "attendance", "approve"),
  hrmPermissionKey("operations", "leave", "view"),
  hrmPermissionKey("operations", "leave", "approve"),
  hrmPermissionKey("insights", "performance", "view"),
  hrmPermissionKey("compliance", "policies", "view"),
  hrmPermissionKey("compliance", "documents", "view"),
];

const employeeKeys = [
  hrmPermissionKey("operations", "leave", "view"),
  hrmPermissionKey("operations", "leave", "apply"),
  hrmPermissionKey("operations", "attendance", "view"),
  hrmPermissionKey("compliance", "policies", "view"),
  hrmPermissionKey("compliance", "documents", "view"),
  hrmPermissionKey("operations", "assets", "view"),
];

export const DEMO_HRM_ROLES: HrmRoleRecord[] = [
  {
    id: "role_hr_admin",
    name: "HR Administrator",
    description: "Full HR platform access — auto-assigned to HR leadership.",
    isSystem: true,
    scope: "organization",
    memberCount: 3,
    permissionKeys: ALL,
    permissions: ALL,
    createdAt: "2025-01-01",
  },
  {
    id: "role_hr_manager",
    name: "HR Manager",
    description: "People operations, compliance, and reporting without system setup.",
    isSystem: true,
    scope: "organization",
    memberCount: 5,
    permissionKeys: peopleOps,
    permissions: peopleOps,
    createdAt: "2025-01-01",
  },
  {
    id: "role_recruiter",
    name: "Recruiter",
    description: "Hiring pipeline, candidate management, and onboarding docs.",
    isSystem: true,
    scope: "organization",
    memberCount: 4,
    permissionKeys: recruiterKeys,
    permissions: recruiterKeys,
    createdAt: "2025-01-01",
  },
  {
    id: "role_payroll",
    name: "Payroll Specialist",
    description: "Salary runs, attendance review, and payroll exports.",
    isSystem: true,
    scope: "organization",
    memberCount: 2,
    permissionKeys: payrollKeys,
    permissions: payrollKeys,
    createdAt: "2025-01-01",
  },
  {
    id: "role_dept_manager",
    name: "Department Manager",
    description: "Team-scoped leave approval, attendance, and performance visibility.",
    isSystem: true,
    scope: "department",
    memberCount: 12,
    permissionKeys: managerKeys,
    permissions: managerKeys,
    createdAt: "2025-01-01",
  },
  {
    id: "role_employee",
    name: "Employee (Self-service)",
    description: "Default workforce role — own leave, attendance, and policy access.",
    isSystem: true,
    scope: "self",
    memberCount: 98,
    permissionKeys: employeeKeys,
    permissions: employeeKeys,
    createdAt: "2025-01-01",
  },
];

export function getHrmRoleStats(roles: HrmRoleRecord[]) {
  return {
    total: roles.length,
    system: roles.filter((r) => r.isSystem).length,
    custom: roles.filter((r) => !r.isSystem).length,
    members: roles.reduce((s, r) => s + r.memberCount, 0),
  };
}

export function toHrmRoleRecord(role: HrmRole): HrmRoleRecord {
  const demo = DEMO_HRM_ROLES.find((r) => r.id === role.id);
  if (demo) return demo;
  return {
    ...role,
    isSystem: false,
    scope: "organization",
    memberCount: 0,
    permissionKeys: role.permissions ?? [],
  };
}

export function enrichHrmRoles(roles: HrmRole[]): HrmRoleRecord[] {
  if (roles.length === 0) return DEMO_HRM_ROLES;
  const enriched = roles.map(toHrmRoleRecord);
  const ids = new Set(enriched.map((r) => r.id));
  for (const system of DEMO_HRM_ROLES) {
    if (!ids.has(system.id)) enriched.push(system);
  }
  return enriched.sort((a, b) => {
    if (a.isSystem !== b.isSystem) return a.isSystem ? -1 : 1;
    return a.name.localeCompare(b.name);
  });
}

/** Sample assignees shown in the role members tab (demo). */
export const DEMO_HRM_ROLE_ASSIGNEES: Record<
  string,
  { id: string; name: string; designation: string; initials: string }[]
> = {
  role_hr_admin: [
    { id: "a1", name: "Priya Mehta", designation: "Head of HR", initials: "PM" },
    { id: "a2", name: "Arjun Kapoor", designation: "HR Operations Lead", initials: "AK" },
    { id: "a3", name: "Neha Desai", designation: "HR Business Partner", initials: "ND" },
  ],
  role_hr_manager: [
    { id: "m1", name: "Rahul Verma", designation: "HR Manager · Bangalore", initials: "RV" },
    { id: "m2", name: "Sana Iqbal", designation: "HR Manager · Mumbai", initials: "SI" },
  ],
  role_recruiter: [
    { id: "r1", name: "Kavya Nair", designation: "Talent Acquisition", initials: "KN" },
    { id: "r2", name: "Dev Patel", designation: "Recruiting Coordinator", initials: "DP" },
  ],
  role_payroll: [
    { id: "p1", name: "Meera Joshi", designation: "Payroll Analyst", initials: "MJ" },
    { id: "p2", name: "Vikram Singh", designation: "Compensation Specialist", initials: "VS" },
  ],
  role_dept_manager: [
    { id: "d1", name: "Anita Rao", designation: "Engineering Manager", initials: "AR" },
    { id: "d2", name: "Chris Lee", designation: "Sales Director", initials: "CL" },
  ],
  role_employee: [
    { id: "e1", name: "Sample workforce", designation: "98 active employees", initials: "98" },
  ],
};
