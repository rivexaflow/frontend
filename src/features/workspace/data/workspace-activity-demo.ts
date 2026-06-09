export type ActivityEventType =
  | "login"
  | "update"
  | "create"
  | "delete"
  | "export"
  | "invite"
  | "approve"
  | "role_change";

export type ActivityModuleKey = "all" | "crm" | "kyc" | "users" | "compliance" | "billing" | "hrm";

export type WorkspaceActivityRecord = {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  action: string;
  summary: string;
  module: string;
  moduleKey: ActivityModuleKey;
  type: ActivityEventType;
  when: string;
  whenGroup: "Today" | "Yesterday" | "This week";
  occurredAt: string;
  ip?: string;
  device?: string;
  location?: string;
  resource?: string;
  details?: string[];
};

export const ACTIVITY_MODULES: { id: ActivityModuleKey; label: string }[] = [
  { id: "all", label: "All modules" },
  { id: "crm", label: "CRM" },
  { id: "kyc", label: "KYC" },
  { id: "users", label: "User management" },
  { id: "compliance", label: "Compliance" },
  { id: "billing", label: "Billing" },
  { id: "hrm", label: "HRM" },
];

export const ACTIVITY_TYPE_LABELS: Record<ActivityEventType, string> = {
  login: "Sign-in",
  update: "Updated",
  create: "Created",
  delete: "Deleted",
  export: "Exported",
  invite: "Invited",
  approve: "Approved",
  role_change: "Role change",
};

export const DEMO_WORKSPACE_ACTIVITY: WorkspaceActivityRecord[] = [
  {
    id: "act_1",
    userId: "u2",
    userName: "Priya Mehta",
    userEmail: "priya.mehta@acme.com",
    action: "Updated lead stage",
    summary: "Moved lead “Northwind Traders” from Fresh to Qualified.",
    module: "CRM · Leads",
    moduleKey: "crm",
    type: "update",
    when: "12 min ago",
    whenGroup: "Today",
    occurredAt: "2026-06-03T01:04:00",
    ip: "203.0.113.42",
    device: "Chrome · macOS",
    resource: "Lead #LD-2841",
    details: ["Stage: Fresh → Qualified", "Pipeline: Enterprise APAC"],
  },
  {
    id: "act_2",
    userId: "u3",
    userName: "James Okonkwo",
    userEmail: "james.okonkwo@acme.com",
    action: "Approved KYC case",
    summary: "Verified identity documents for applicant Aisha Khan.",
    module: "KYC Center",
    moduleKey: "kyc",
    type: "approve",
    when: "34 min ago",
    whenGroup: "Today",
    occurredAt: "2026-06-03T00:42:00",
    resource: "Case #KYC-1092",
    details: ["Status: Pending → Approved", "Risk score: Low"],
  },
  {
    id: "act_3",
    userId: "u4",
    userName: "Elena Rossi",
    userEmail: "elena.rossi@acme.com",
    action: "Closed deal",
    summary: "Marked deal “Acme Corp · Enterprise” as won.",
    module: "CRM · Pipelines",
    moduleKey: "crm",
    type: "update",
    when: "1 hr ago",
    whenGroup: "Today",
    occurredAt: "2026-06-03T00:16:00",
    resource: "Deal #DL-7720",
    details: ["Value: $48,000 ARR", "Owner: Elena Rossi"],
  },
  {
    id: "act_4",
    userId: "u5",
    userName: "Sarah Chen",
    userEmail: "sarah.chen@acme.com",
    action: "Invited new member",
    summary: "Sent workspace invitation to marcus.webb@acme.com.",
    module: "User management",
    moduleKey: "users",
    type: "invite",
    when: "2 hr ago",
    whenGroup: "Today",
    occurredAt: "2026-06-02T23:16:00",
    resource: "Member invite",
    details: ["Role: Compliance Officer", "Department: Compliance"],
  },
  {
    id: "act_5",
    userId: "u6",
    userName: "Marcus Webb",
    userEmail: "marcus.webb@acme.com",
    action: "Exported audit log",
    summary: "Downloaded compliance activity report for May 2026.",
    module: "Compliance",
    moduleKey: "compliance",
    type: "export",
    when: "3 hr ago",
    whenGroup: "Today",
    occurredAt: "2026-06-02T22:16:00",
    ip: "198.51.100.8",
    device: "Safari · iPadOS",
    resource: "Audit export",
    details: ["Format: CSV", "Records: 1,284"],
  },
  {
    id: "act_6",
    userId: "u1",
    userName: "Anil Yadav",
    userEmail: "anil.yadav@acme.com",
    action: "Signed in",
    summary: "Successful workspace sign-in.",
    module: "Authentication",
    moduleKey: "users",
    type: "login",
    when: "4 hr ago",
    whenGroup: "Today",
    occurredAt: "2026-06-02T21:16:00",
    ip: "203.0.113.18",
    device: "Chrome · Windows",
    location: "Mumbai, IN",
  },
  {
    id: "act_7",
    userId: "u5",
    userName: "Sarah Chen",
    userEmail: "sarah.chen@acme.com",
    action: "Changed member role",
    summary: "Updated role assignment for James Okonkwo.",
    module: "User management",
    moduleKey: "users",
    type: "role_change",
    when: "Yesterday",
    whenGroup: "Yesterday",
    occurredAt: "2026-06-02T14:30:00",
    resource: "James Okonkwo",
    details: ["Previous: KYC Analyst", "New: KYC Executive"],
  },
  {
    id: "act_8",
    userId: "u2",
    userName: "Priya Mehta",
    userEmail: "priya.mehta@acme.com",
    action: "Created contact",
    summary: "Added new contact “Helena Voss” at Brightline GmbH.",
    module: "CRM · Contacts",
    moduleKey: "crm",
    type: "create",
    when: "Yesterday",
    whenGroup: "Yesterday",
    occurredAt: "2026-06-02T11:05:00",
    resource: "Contact #CT-9912",
  },
  {
    id: "act_9",
    userId: "u3",
    userName: "James Okonkwo",
    userEmail: "james.okonkwo@acme.com",
    action: "Rejected KYC case",
    summary: "Returned case for document resubmission.",
    module: "KYC Center",
    moduleKey: "kyc",
    type: "update",
    when: "Yesterday",
    whenGroup: "Yesterday",
    occurredAt: "2026-06-02T09:40:00",
    resource: "Case #KYC-1088",
    details: ["Reason: Blurry ID scan"],
  },
  {
    id: "act_10",
    userId: "u4",
    userName: "Elena Rossi",
    userEmail: "elena.rossi@acme.com",
    action: "Created invoice",
    summary: "Issued invoice #INV-2044 for Acme Corp.",
    module: "Billing",
    moduleKey: "billing",
    type: "create",
    when: "This week",
    whenGroup: "This week",
    occurredAt: "2026-06-01T16:20:00",
    resource: "Invoice #INV-2044",
    details: ["Amount: $12,400", "Due: Jun 15, 2026"],
  },
];
