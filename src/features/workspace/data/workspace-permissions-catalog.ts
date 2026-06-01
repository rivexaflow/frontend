export type PermissionAction = {
  key: string;
  label: string;
};

export type PermissionModule = {
  id: string;
  label: string;
  actions: PermissionAction[];
};

export type PermissionCategory = {
  id: string;
  label: string;
  modules: PermissionModule[];
};

export type CrmStageAccess = {
  id: string;
  label: string;
  group: string;
};

export const PERMISSION_CATEGORIES: PermissionCategory[] = [
  {
    id: "general",
    label: "General",
    modules: [
      {
        id: "user",
        label: "user",
        actions: [
          { key: "manage", label: "manage" },
          { key: "create", label: "create" },
          { key: "edit", label: "edit" },
          { key: "delete", label: "delete" },
          { key: "profile_manage", label: "profile manage" },
          { key: "reset_password", label: "reset password" },
          { key: "login_manage", label: "login manage" },
          { key: "import", label: "import" },
        ],
      },
      {
        id: "roles",
        label: "roles",
        actions: [
          { key: "manage", label: "manage" },
          { key: "create", label: "create" },
          { key: "edit", label: "edit" },
          { key: "delete", label: "delete" },
        ],
      },
      {
        id: "workspace",
        label: "workspace",
        actions: [
          { key: "manage", label: "manage" },
          { key: "create", label: "create" },
          { key: "edit", label: "edit" },
          { key: "delete", label: "delete" },
        ],
      },
      {
        id: "settings",
        label: "settings",
        actions: [{ key: "manage", label: "manage" }],
      },
    ],
  },
  {
    id: "crm",
    label: "CRM",
    modules: [
      {
        id: "crm",
        label: "crm",
        actions: [
          { key: "manage", label: "manage" },
          { key: "dashboard_manage", label: "dashboard manage" },
          { key: "report_manage", label: "report manage" },
        ],
      },
      {
        id: "lead",
        label: "lead",
        actions: [
          { key: "manage", label: "manage" },
          { key: "create", label: "create" },
          { key: "edit", label: "edit" },
          { key: "delete", label: "delete" },
          { key: "show", label: "show" },
          { key: "move", label: "move" },
          { key: "import", label: "import" },
          { key: "convert_deal", label: "to deal convert" },
        ],
      },
      {
        id: "deal",
        label: "deal",
        actions: [
          { key: "manage", label: "manage" },
          { key: "create", label: "create" },
          { key: "edit", label: "edit" },
          { key: "delete", label: "delete" },
          { key: "show", label: "show" },
          { key: "move", label: "move" },
        ],
      },
      {
        id: "contact",
        label: "contact",
        actions: [
          { key: "manage", label: "manage" },
          { key: "create", label: "create" },
          { key: "edit", label: "edit" },
          { key: "delete", label: "delete" },
        ],
      },
      {
        id: "pipeline",
        label: "pipeline",
        actions: [
          { key: "manage", label: "manage" },
          { key: "create", label: "create" },
          { key: "edit", label: "edit" },
          { key: "delete", label: "delete" },
        ],
      },
    ],
  },
  {
    id: "kyc",
    label: "KYC & compliance",
    modules: [
      {
        id: "kyc",
        label: "kyc",
        actions: [
          { key: "manage", label: "manage" },
          { key: "dashboard_manage", label: "dashboard manage" },
          { key: "report_manage", label: "report manage" },
        ],
      },
      {
        id: "case",
        label: "case",
        actions: [
          { key: "manage", label: "manage" },
          { key: "create", label: "create" },
          { key: "edit", label: "edit" },
          { key: "approve", label: "approve" },
          { key: "reject", label: "reject" },
        ],
      },
      {
        id: "screening",
        label: "screening",
        actions: [
          { key: "manage", label: "manage" },
          { key: "view", label: "view" },
          { key: "escalate", label: "escalate" },
        ],
      },
      {
        id: "document",
        label: "document",
        actions: [
          { key: "manage", label: "manage" },
          { key: "upload", label: "upload" },
          { key: "verify", label: "verify" },
        ],
      },
    ],
  },
  {
    id: "operations",
    label: "Operations",
    modules: [
      {
        id: "invoice",
        label: "invoice",
        actions: [
          { key: "manage", label: "manage" },
          { key: "create", label: "create" },
          { key: "edit", label: "edit" },
          { key: "delete", label: "delete" },
          { key: "send", label: "send" },
          { key: "payment_create", label: "payment create" },
        ],
      },
      {
        id: "notification",
        label: "notification",
        actions: [
          { key: "manage", label: "manage" },
          { key: "send", label: "send" },
        ],
      },
    ],
  },
  {
    id: "intelligence",
    label: "Intelligence",
    modules: [
      {
        id: "ai",
        label: "ai",
        actions: [
          { key: "manage", label: "manage" },
          { key: "tools_use", label: "tools use" },
          { key: "history_view", label: "history view" },
        ],
      },
      {
        id: "reports",
        label: "reports",
        actions: [
          { key: "manage", label: "manage" },
          { key: "export", label: "export" },
        ],
      },
    ],
  },
];

export const CRM_PIPELINE_STAGES: CrmStageAccess[] = [
  { id: "new", label: "New leads", group: "Sales" },
  { id: "fresh", label: "Fresh leads", group: "Sales" },
  { id: "callback", label: "Call back", group: "Sales" },
  { id: "qualified", label: "Qualified", group: "Sales" },
  { id: "doc_pending", label: "Document pending", group: "Sales" },
  { id: "kyc_error", label: "KYC error pending", group: "Compliance" },
  { id: "rejected", label: "Account rejected", group: "Compliance" },
  { id: "activation", label: "Move to activation", group: "Onboarding" },
];

export function permissionKey(categoryId: string, moduleId: string, actionKey: string): string {
  return `${categoryId}.${moduleId}.${actionKey}`;
}

export function allPermissionKeys(): string[] {
  const keys: string[] = [];
  for (const cat of PERMISSION_CATEGORIES) {
    for (const mod of cat.modules) {
      for (const action of mod.actions) {
        keys.push(permissionKey(cat.id, mod.id, action.key));
      }
    }
  }
  return keys;
}

export function keysForCategory(categoryId: string): string[] {
  const cat = PERMISSION_CATEGORIES.find((c) => c.id === categoryId);
  if (!cat) return [];
  return cat.modules.flatMap((mod) =>
    mod.actions.map((a) => permissionKey(cat.id, mod.id, a.key)),
  );
}

export function keysForModule(categoryId: string, moduleId: string): string[] {
  const cat = PERMISSION_CATEGORIES.find((c) => c.id === categoryId);
  const mod = cat?.modules.find((m) => m.id === moduleId);
  if (!cat || !mod) return [];
  return mod.actions.map((a) => permissionKey(cat.id, mod.id, a.key));
}

export function labelForPermissionKey(key: string): string {
  const parts = key.split(".");
  const action = parts[parts.length - 1]?.replace(/_/g, " ") ?? key;
  return action;
}
