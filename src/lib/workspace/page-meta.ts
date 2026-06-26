export type BreadcrumbItem = { label: string; href?: string };

const SEGMENT_LABELS: Record<string, string> = {
  dashboard: "Dashboard",
  "workspace-graph": "Workspace graph",
  crm: "CRM",
  contacts: "Contacts",
  leads: "Leads",
  deals: "Deals",
  pipelines: "Pipelines",
  tasks: "Tasks",
  "my-tasks": "My tasks",
  dialer: "Dialer",
  whatsapp: "WhatsApp",
  webhooks: "Webhooks",
  "layout-builder": "Form builder",
  "facebook-leads": "Facebook leads",
  duplicates: "Duplicates",
  import: "Bulk import",
  hrm: "HRM",
  "org-chart": "Org chart",
  employees: "Employees",
  payroll: "Payroll",
  attendance: "Attendance",
  leave: "Manage leave",
  admin: "Roles & permissions",
  events: "Events",
  documents: "Documents",
  policies: "Company policy",
  setup: "System setup",
  kyc: "KYC Center",
  submissions: "Submissions",
  reviews: "Reviews",
  templates: "Templates",
  invoices: "Invoicing",
  create: "Create",
  ai: "AI Agents",
  tools: "Tools",
  history: "History",
  reports: "Analytics",
  notifications: "Notifications",
  settings: "Settings",
  workspace: "Workspace",
  branding: "Branding",
  modules: "Modules",
  "api-keys": "API Keys",
  password: "Security",
  billing: "Billing",
  team: "Team",
  user: "Users",
  users: "Users",
  role: "Roles",
  roles: "Roles",
  edit: "Edit role",
  new: "Create role",
  members: "Members",
  invites: "Invites",
  activity: "Activity",
  departments: "Departments",
  recruitment: "Recruitment",
};

function labelFor(segment: string, parentSegment?: string): string {
  if (parentSegment === "hrm" && segment === "employees") return "Employees";
  if (parentSegment === "employees") return "Profile";
  if (parentSegment === "hrm" && segment === "dashboard") return "HRM Dashboard";
  if (parentSegment === "attendance" && segment === "all") return "All employees";
  if (parentSegment === "attendance" && segment === "on-break") return "On break";
  if (parentSegment === "attendance" && segment === "not-clocked-in") return "Not clocked in";
  if (parentSegment === "attendance" && segment === "regularization") return "Regularization";
  if (parentSegment === "attendance" && segment === "roster") return "Roster";
  if (parentSegment === "attendance" && segment === "me") return "My attendance";
  if (parentSegment === "hrm" && segment === "reports") return "HR reports";
  if (parentSegment === "crm" && segment === "reports") return "CRM reports";
  if (parentSegment === "crm" && segment === "setup") return "Settings";
  if (parentSegment === "reports" && segment === "leads") return "Lead";
  if (parentSegment === "reports" && segment === "deals") return "Deal";
  if (segment === "workforce") return "Departments";
  return SEGMENT_LABELS[segment] ?? segment.charAt(0).toUpperCase() + segment.slice(1).replace(/-/g, " ");
}

/** Build breadcrumb trail from pathname like `/crm/pipelines`. */
export function resolveWorkspaceBreadcrumbs(pathname: string): BreadcrumbItem[] {
  const parts = pathname.split("/").filter(Boolean);
  if (parts.length === 0) return [{ label: "Dashboard", href: "/dashboard" }];

  const items: BreadcrumbItem[] = [{ label: "Workspace", href: "/dashboard" }];
  let path = "";

  parts.forEach((segment, index) => {
    path += `/${segment}`;
    const isLast = index === parts.length - 1;
    const parent = index > 0 ? parts[index - 1] : undefined;
    items.push({
      label: labelFor(segment, parent),
      href: isLast ? undefined : path,
    });
  });

  return items;
}

export function resolvePageTitle(pathname: string): string {
  const parts = pathname.split("/").filter(Boolean);
  if (parts.length === 0) return "Dashboard";
  const last = parts[parts.length - 1] ?? "dashboard";
  const parent = parts.length > 1 ? parts[parts.length - 2] : undefined;
  return labelFor(last, parent);
}

/** Current workspace panel title — last segment only, context-aware. */
export function resolveWorkspacePageTitle(pathname: string): string {
  return resolvePageTitle(pathname);
}
