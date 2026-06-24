import { RESERVED_ROOT_SEGMENTS } from "@/lib/constants/routes";

/** Canonical workspace URLs (no tenant slug in the path). */
export const WORKSPACE_ROOT_SEGMENTS = [
  "dashboard",
  "workspace-graph",
  "crm",
  "kyc",
  "invoices",
  "ai",
  "reports",
  "notifications",
  "settings",
  "user",
  "role",
  "hrm",
  "workforce",
  "migration",
] as const;

export type WorkspaceRootSegment = (typeof WORKSPACE_ROOT_SEGMENTS)[number];

export const workspacePaths = {
  dashboard: "/dashboard",
  workspaceGraph: "/workspace-graph",
  contacts: "/crm/contacts",
  leads: "/crm/leads",
  deals: "/crm/deals",
  migration: "/migration",
  pipelines: "/crm/pipelines",
  crmTasks: "/crm/tasks",
  crmMyTasks: "/crm/my-tasks",
  crmDialer: "/crm/dialer",
  crmSetup: "/crm/setup",
  crmWhatsapp: "/crm/whatsapp",
  crmWebhooks: "/crm/webhooks",
  crmLayoutBuilder: "/crm/layout-builder",
  crmFacebookLeads: "/crm/facebook-leads",
  crmDuplicates: "/crm/duplicates",
  crmImport: "/migration",
  crmReports: "/crm/reports/leads",
  crmLeadReports: "/crm/reports/leads",
  crmDealReports: "/crm/reports/deals",
  hrmDashboard: "/hrm/dashboard",
  hrmOrgChart: "/hrm/org-chart",
  hrmEmployees: "/hrm/employees",
  hrmDepartments: "/hrm/departments",
  hrmRecruitment: "/hrm/recruitment",
  hrmPayroll: "/hrm/payroll",
  hrmAttendance: "/hrm/attendance",
  hrmAttendanceAll: "/hrm/attendance/all",
  hrmAttendanceOnBreak: "/hrm/attendance/on-break",
  hrmAttendanceNotClockedIn: "/hrm/attendance/not-clocked-in",
  hrmAttendanceRegularization: "/hrm/attendance/regularization",
  hrmAttendanceRoster: "/hrm/attendance/roster",
  hrmAttendanceMe: "/hrm/attendance/me",
  hrmLeave: "/hrm/leave",
  hrmGrievances: "/hrm/grievances",
  hrmPerformance: "/hrm/performance",
  hrmLoans: "/hrm/loans",
  hrmAssets: "/hrm/assets",
  hrmAdmin: "/hrm/admin",
  hrmSettings: "/hrm/settings",
  hrmActivity: "/hrm/activity",
  workforce: "/workforce",
  hrmEvents: "/hrm/events",
  hrmDocuments: "/hrm/documents",
  hrmPolicies: "/hrm/policies",
  hrmSetup: "/hrm/setup",
  hrmReports: "/hrm/reports",
  kyc: "/kyc",
  invoices: "/invoices",
  ai: "/ai",
  reports: "/reports",
  notifications: "/notifications",
  settings: "/settings",
  /** User management — users list */
  user: "/user",
  /** Roles & permissions (sibling of /user, not nested) */
  role: "/role",
  roleNew: "/role/new",
  userActivity: "/user/activity",
} as const;

/** @deprecated Use workspacePaths.role */
export const userRolesPath = workspacePaths.role;

export function roleEditPath(roleId: string): string {
  return `/role/${roleId}/edit`;
}

export function isWorkspaceAppPath(pathname: string): boolean {
  if (pathname === "/dashboard") return true;
  return WORKSPACE_ROOT_SEGMENTS.some(
    (seg) => pathname === `/${seg}` || pathname.startsWith(`/${seg}/`),
  );
}

/**
 * Maps legacy `/{workspaceSlug}/dashboard` (and similar) to canonical paths.
 * e.g. `/dashboard/dashboard` → `/dashboard`, `/acme-corp/crm/leads` → `/crm/leads`
 */
/** Legacy `/team` URLs → canonical user-management routes. */
function legacyTeamPath(pathname: string): string | null {
  if (pathname === "/team" || pathname === "/team/users") return workspacePaths.user;
  if (pathname === "/team/roles") return workspacePaths.role;
  if (pathname === "/team/activity") return workspacePaths.userActivity;
  if (pathname.startsWith("/team/")) return workspacePaths.user;
  return null;
}

/** Legacy `/user/roles/*` → canonical `/role/*`. */
function legacyUserRolesPath(pathname: string): string | null {
  if (pathname === "/user/roles" || pathname === "/user/roles/") return workspacePaths.role;
  if (pathname === "/user/roles/new") return workspacePaths.roleNew;
  const editMatch = pathname.match(/^\/user\/roles\/([^/]+)\/edit\/?$/);
  if (editMatch?.[1]) return roleEditPath(editMatch[1]);
  return null;
}

export function canonicalWorkspacePath(pathname: string): string | null {
  const teamTarget = legacyTeamPath(pathname);
  if (teamTarget) return teamTarget;

  const userRolesTarget = legacyUserRolesPath(pathname);
  if (userRolesTarget) return userRolesTarget;

  const segments = pathname.split("/").filter(Boolean);
  if (segments.length === 0) return null;

  const [first, ...rest] = segments;

  if (first === "dashboard" && rest.length === 0) return workspacePaths.dashboard;
  if (first === "dashboard" && rest.length === 1 && rest[0] === "dashboard") {
    return workspacePaths.dashboard;
  }

  if (WORKSPACE_ROOT_SEGMENTS.includes(first as WorkspaceRootSegment)) {
    return `/${segments.join("/")}`;
  }

  // Single segment like /acme-corp → /dashboard; never rewrite public/auth routes (/login, /about, …).
  if (rest.length === 0) {
    return RESERVED_ROOT_SEGMENTS.has(first) ? null : workspacePaths.dashboard;
  }

  const [module, ...sub] = rest;
  if (!WORKSPACE_ROOT_SEGMENTS.includes(module as WorkspaceRootSegment)) return null;

  return sub.length > 0 ? `/${module}/${sub.join("/")}` : `/${module}`;
}

export function workspaceHref(path: string): string {
  if (path.startsWith("/")) return path;
  return `/${path}`;
}

/** Build module href under canonical workspace paths (no slug prefix). */
export function moduleHref(relativePath: string): string {
  const clean = relativePath.replace(/^\//, "");
  return `/${clean}`;
}
