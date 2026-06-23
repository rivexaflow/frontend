export type HrmPermissionAction = {
  key: string;
  label: string;
  description: string;
};

export type HrmPermissionModule = {
  id: string;
  label: string;
  actions: HrmPermissionAction[];
};

export type HrmPermissionCategory = {
  id: string;
  label: string;
  modules: HrmPermissionModule[];
};

export const HRM_PERMISSION_CATEGORIES: HrmPermissionCategory[] = [
  {
    id: "people",
    label: "People",
    modules: [
      {
        id: "employees",
        label: "Employees",
        actions: [
          { key: "view", label: "View directory", description: "Browse employee profiles and org data" },
          { key: "create", label: "Add employees", description: "Create profiles and send invites" },
          { key: "edit", label: "Edit profiles", description: "Update job, department, and contact info" },
          { key: "offboard", label: "Offboard", description: "Deactivate accounts and exit workflow" },
        ],
      },
      {
        id: "departments",
        label: "Departments",
        actions: [
          { key: "view", label: "View org structure", description: "See departments and teams" },
          { key: "manage", label: "Manage structure", description: "Create departments and assign leads" },
        ],
      },
      {
        id: "recruitment",
        label: "Recruitment",
        actions: [
          { key: "view", label: "View pipeline", description: "See jobs, candidates, and interviews" },
          { key: "manage", label: "Manage hiring", description: "Post jobs, move candidates, schedule interviews" },
        ],
      },
    ],
  },
  {
    id: "operations",
    label: "Operations",
    modules: [
      {
        id: "attendance",
        label: "Attendance",
        actions: [
          { key: "view", label: "View records", description: "See attendance logs and calendars" },
          { key: "manage", label: "Manage attendance", description: "Edit punches, roster, and regularization" },
          { key: "approve", label: "Approve requests", description: "Approve regularization and corrections" },
        ],
      },
      {
        id: "leave",
        label: "Leave",
        actions: [
          { key: "view", label: "View balances", description: "See leave balances and history" },
          { key: "apply", label: "Apply leave", description: "Submit own leave requests" },
          { key: "approve", label: "Approve leave", description: "Approve or reject team leave" },
          { key: "manage", label: "Manage policies", description: "Configure leave types and accrual" },
        ],
      },
      {
        id: "payroll",
        label: "Payroll",
        actions: [
          { key: "view", label: "View payroll", description: "See salary runs and payslips" },
          { key: "run", label: "Run payroll", description: "Trigger pay runs and finalize cycles" },
          { key: "export", label: "Export payroll", description: "Download statutory and bank files" },
        ],
      },
      {
        id: "assets",
        label: "Assets",
        actions: [
          { key: "view", label: "View assets", description: "Browse assigned equipment" },
          { key: "manage", label: "Manage inventory", description: "Assign, repair, and retire assets" },
        ],
      },
    ],
  },
  {
    id: "compliance",
    label: "Compliance",
    modules: [
      {
        id: "documents",
        label: "Documents",
        actions: [
          { key: "view", label: "View submissions", description: "See employee document uploads" },
          { key: "verify", label: "Verify documents", description: "Approve or reject submissions" },
          { key: "remind", label: "Send reminders", description: "Notify employees for missing docs" },
        ],
      },
      {
        id: "policies",
        label: "Policies",
        actions: [
          { key: "view", label: "View policies", description: "Read published company policies" },
          { key: "publish", label: "Publish policies", description: "Draft, publish, and archive policies" },
          { key: "ack", label: "Track acknowledgments", description: "Monitor and remind for policy acks" },
        ],
      },
      {
        id: "grievances",
        label: "Grievances",
        actions: [
          { key: "view", label: "View tickets", description: "See grievance cases" },
          { key: "manage", label: "Manage cases", description: "Assign, resolve, and escalate tickets" },
        ],
      },
    ],
  },
  {
    id: "insights",
    label: "Insights",
    modules: [
      {
        id: "performance",
        label: "Performance",
        actions: [
          { key: "view", label: "View reviews", description: "See goals and review cycles" },
          { key: "manage", label: "Manage cycles", description: "Configure cycles and score teams" },
        ],
      },
      {
        id: "reports",
        label: "Reports",
        actions: [
          { key: "view", label: "View analytics", description: "Access HR dashboards and reports" },
          { key: "export", label: "Export reports", description: "Generate and download exports" },
        ],
      },
    ],
  },
  {
    id: "admin",
    label: "Administration",
    modules: [
      {
        id: "roles",
        label: "Roles & permissions",
        actions: [
          { key: "view", label: "View roles", description: "See role definitions" },
          { key: "manage", label: "Manage roles", description: "Create and edit HR roles" },
        ],
      },
      {
        id: "setup",
        label: "System setup",
        actions: [
          { key: "view", label: "View settings", description: "See HRM configuration" },
          { key: "manage", label: "Manage settings", description: "Change payroll, leave, and compliance defaults" },
        ],
      },
    ],
  },
];

export function hrmPermissionKey(categoryId: string, moduleId: string, actionKey: string) {
  return `${categoryId}.${moduleId}.${actionKey}`;
}

export function allHrmPermissionKeys() {
  return HRM_PERMISSION_CATEGORIES.flatMap((cat) =>
    cat.modules.flatMap((mod) => mod.actions.map((a) => hrmPermissionKey(cat.id, mod.id, a.key))),
  );
}

export function keysForHrmCategory(categoryId: string) {
  const cat = HRM_PERMISSION_CATEGORIES.find((c) => c.id === categoryId);
  if (!cat) return [];
  return cat.modules.flatMap((mod) =>
    mod.actions.map((a) => hrmPermissionKey(cat.id, mod.id, a.key)),
  );
}

export function keysForHrmModule(categoryId: string, moduleId: string): string[] {
  const cat = HRM_PERMISSION_CATEGORIES.find((c) => c.id === categoryId);
  const mod = cat?.modules.find((m) => m.id === moduleId);
  if (!mod) return [];
  return mod.actions.map((a) => hrmPermissionKey(categoryId, moduleId, a.key));
}

export function labelForHrmPermissionKey(key: string): string {
  const [catId, modId, actionKey] = key.split(".");
  if (!catId || !modId || !actionKey) return key;
  const cat = HRM_PERMISSION_CATEGORIES.find((c) => c.id === catId);
  const mod = cat?.modules.find((m) => m.id === modId);
  const action = mod?.actions.find((a) => a.key === actionKey);
  if (mod && action) return `${mod.label} · ${action.label}`;
  return key;
}
