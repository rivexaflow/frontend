/** Workspace profile roles (operational titles), distinct from auth ADMIN/USER. */
export const WORKSPACE_PROFILE_ROLES = [
  "Workspace Admin",
  "Senior Sales Executive",
  "Sales Executive",
  "Deal Executive",
  "KYC Executive",
  "Compliance Officer",
  "HR Manager",
  "Finance Executive",
  "Operations Manager",
  "Customer Success Manager",
  "Support Specialist",
  "Data Analyst",
] as const;

export type WorkspaceProfileRole = (typeof WORKSPACE_PROFILE_ROLES)[number];

export const WORKSPACE_USER_STATUSES = ["active", "invited", "suspended", "locked"] as const;

export type WorkspaceUserStatus = (typeof WORKSPACE_USER_STATUSES)[number];

export function roleBadgeTone(role: string): "blue" | "indigo" | "emerald" | "amber" | "purple" | "slate" {
  if (role.includes("KYC") || role.includes("Compliance")) return "emerald";
  if (role.includes("Sales") || role.includes("Deal")) return "blue";
  if (role.includes("HR")) return "purple";
  if (role.includes("Finance")) return "amber";
  if (role.includes("Admin")) return "indigo";
  return "slate";
}
