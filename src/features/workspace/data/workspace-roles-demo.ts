import { keysForCategory, permissionKey } from "@/features/workspace/data/workspace-permissions-catalog";

export type StageAccessRule = {
  view: boolean;
  move: boolean;
  edit: boolean;
};

export type WorkspaceRoleRecord = {
  id: string;
  name: string;
  permissionKeys: string[];
  memberIds: string[];
  allowedIps: string;
  systemLocked?: boolean;
  stageAccess: Record<string, StageAccessRule>;
};

const crmSalesKeys = [
  ...keysForCategory("crm").filter((k) => k.includes(".lead.") || k.includes(".crm.")),
  permissionKey("crm", "contact", "manage"),
  permissionKey("crm", "contact", "create"),
  permissionKey("crm", "pipeline", "manage"),
];

const kycKeys = keysForCategory("kyc");

const adminKeys = [
  ...keysForCategory("general"),
  ...keysForCategory("crm"),
  ...keysForCategory("kyc"),
  ...keysForCategory("operations"),
  ...keysForCategory("intelligence"),
];

function defaultStageAccess(partial?: Record<string, Partial<StageAccessRule>>): Record<string, StageAccessRule> {
  const base: Record<string, StageAccessRule> = {
    new: { view: true, move: true, edit: true },
    fresh: { view: true, move: true, edit: true },
    callback: { view: true, move: true, edit: false },
    qualified: { view: true, move: true, edit: true },
    doc_pending: { view: true, move: false, edit: false },
    kyc_error: { view: true, move: false, edit: false },
    rejected: { view: true, move: false, edit: false },
    activation: { view: true, move: true, edit: false },
  };
  if (!partial) return base;
  for (const [id, rule] of Object.entries(partial)) {
    base[id] = { ...base[id], ...rule };
  }
  return base;
}

export const INITIAL_WORKSPACE_ROLES: WorkspaceRoleRecord[] = [
  {
    id: "role_hr",
    name: "HR Manager",
    permissionKeys: [
      permissionKey("general", "user", "manage"),
      permissionKey("general", "user", "create"),
      permissionKey("general", "user", "edit"),
      permissionKey("general", "roles", "manage"),
      permissionKey("general", "workspace", "manage"),
    ],
    memberIds: ["u5"],
    allowedIps: "",
    systemLocked: true,
    stageAccess: defaultStageAccess(),
  },
  {
    id: "role_sales",
    name: "Sales Executive",
    permissionKeys: crmSalesKeys,
    memberIds: ["u2", "u4"],
    allowedIps: "",
    stageAccess: defaultStageAccess({
      kyc_error: { view: false, move: false, edit: false },
      rejected: { view: false, move: false, edit: false },
    }),
  },
  {
    id: "role_senior_sales",
    name: "Senior Sales Executive",
    permissionKeys: [
      ...crmSalesKeys,
      permissionKey("crm", "deal", "manage"),
      permissionKey("crm", "deal", "create"),
      permissionKey("crm", "deal", "edit"),
      permissionKey("crm", "lead", "convert_deal"),
    ],
    memberIds: ["u1"],
    allowedIps: "",
    stageAccess: defaultStageAccess(),
  },
  {
    id: "role_kyc",
    name: "KYC Executive",
    permissionKeys: kycKeys,
    memberIds: ["u3", "u6"],
    allowedIps: "",
    stageAccess: defaultStageAccess({
      new: { view: true, move: false, edit: false },
      fresh: { view: true, move: false, edit: false },
    }),
  },
  {
    id: "role_deal",
    name: "Deal Executive",
    permissionKeys: [
      permissionKey("crm", "deal", "manage"),
      permissionKey("crm", "deal", "create"),
      permissionKey("crm", "deal", "edit"),
      permissionKey("crm", "deal", "move"),
      permissionKey("crm", "pipeline", "manage"),
      permissionKey("crm", "lead", "show"),
    ],
    memberIds: ["u4"],
    allowedIps: "",
    stageAccess: defaultStageAccess(),
  },
  {
    id: "role_compliance",
    name: "Compliance Officer",
    permissionKeys: [
      ...kycKeys,
      permissionKey("general", "settings", "manage"),
      permissionKey("intelligence", "reports", "export"),
    ],
    memberIds: ["u6"],
    allowedIps: "203.0.113.0/24",
    stageAccess: defaultStageAccess(),
  },
  {
    id: "role_admin",
    name: "Workspace Admin",
    permissionKeys: adminKeys,
    memberIds: [],
    allowedIps: "",
    stageAccess: defaultStageAccess(),
  },
];
