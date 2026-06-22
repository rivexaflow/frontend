export type CrmTaskPriority = "high" | "medium" | "low";
export type CrmTaskStatus = "pending" | "in_progress" | "completed" | "cancelled";

export type CrmTaskRecord = {
  id: string;
  name: string;
  leadName: string;
  leadRef: string;
  priority: CrmTaskPriority;
  status: CrmTaskStatus;
  dueAt: string;
  assignedTo: string;
  createdAt: string;
};

export type CrmWebhookRecord = {
  id: string;
  source: string;
  subjectName: string;
  email: string;
  status: "converted" | "failed" | "pending";
  assignedTo: string;
  errorMessage?: string;
  receivedAt: string;
};

export type CrmDuplicateRecord = {
  id: string;
  field: "phone" | "email";
  value: string;
  leadA: string;
  leadB: string;
  detectedAt: string;
  status: "open" | "merged" | "ignored";
};

export type CrmFacebookLeadRecord = {
  id: string;
  campaign: string;
  formName: string;
  name: string;
  email: string;
  phone: string;
  syncedAt: string;
  receivedAt: string;
  status: "new" | "imported" | "duplicate" | "failed" | "skipped";
  assignedTo: string;
  errorMessage?: string;
};

export type CrmPipelineConfig = {
  id: string;
  name: string;
  stages: number;
  isDefault: boolean;
};

export type CrmStageConfig = {
  id: string;
  name: string;
  order: number;
  probability?: number;
};

export type CrmLabelConfig = {
  id: string;
  name: string;
  color: string;
};

export type CrmSourceConfig = {
  id: string;
  name: string;
  active: boolean;
};

export const CRM_TASK_PRIORITY_META: Record<
  CrmTaskPriority,
  { label: string; tone: "rose" | "amber" | "slate" }
> = {
  high: { label: "High", tone: "rose" },
  medium: { label: "Medium", tone: "amber" },
  low: { label: "Low", tone: "slate" },
};

export const CRM_TASK_STATUS_META: Record<
  CrmTaskStatus,
  { label: string; tone: "amber" | "blue" | "emerald" | "slate" }
> = {
  pending: { label: "Pending", tone: "amber" },
  in_progress: { label: "In progress", tone: "blue" },
  completed: { label: "Completed", tone: "emerald" },
  cancelled: { label: "Cancelled", tone: "slate" },
};

export const DEMO_CRM_TASKS: CrmTaskRecord[] = [
  {
    id: "t1",
    name: "Follow up on enterprise trial",
    leadName: "Amélie Dubois",
    leadRef: "LEAD-2026-2206",
    priority: "high",
    status: "pending",
    dueAt: "2026-03-31 10:59",
    assignedTo: "Priya Singh",
    createdAt: "2026-03-28",
  },
  {
    id: "t2",
    name: "Send pricing deck",
    leadName: "Anika Verma",
    leadRef: "LEAD-2026-2201",
    priority: "high",
    status: "in_progress",
    dueAt: "2026-03-30 14:00",
    assignedTo: "Priya Singh",
    createdAt: "2026-03-27",
  },
  {
    id: "t3",
    name: "Schedule discovery call",
    leadName: "Marcus Chen",
    leadRef: "LEAD-2026-2198",
    priority: "medium",
    status: "pending",
    dueAt: "2026-04-02 09:00",
    assignedTo: "James Okon",
    createdAt: "2026-03-26",
  },
  {
    id: "t4",
    name: "Verify partner referral",
    leadName: "Sofia Alvarez",
    leadRef: "LEAD-2026-2204",
    priority: "medium",
    status: "completed",
    dueAt: "2026-03-25 16:30",
    assignedTo: "Elena Rossi",
    createdAt: "2026-03-24",
  },
  {
    id: "t5",
    name: "Re-engage webinar attendee",
    leadName: "David Park",
    leadRef: "LEAD-2026-2190",
    priority: "low",
    status: "pending",
    dueAt: "2026-04-05 11:00",
    assignedTo: "James Okon",
    createdAt: "2026-03-23",
  },
];

export const DEMO_CRM_WEBHOOKS: CrmWebhookRecord[] = [
  {
    id: "w1",
    source: "Popup-data",
    subjectName: "Arjun Malviya",
    email: "arjun.m@example.com",
    status: "converted",
    assignedTo: "AARTI ROKADE",
    receivedAt: "2026-03-30 09:12",
  },
  {
    id: "w2",
    source: "Popup-data",
    subjectName: "Rajendra Meena",
    email: "rajendra.m@example.com",
    status: "failed",
    assignedTo: "TANISHA MORE",
    errorMessage: "Duplicate phone number found in database.",
    receivedAt: "2026-03-30 08:45",
  },
  {
    id: "w3",
    source: "Website form",
    subjectName: "Priya Sharma",
    email: "priya.s@example.com",
    status: "pending",
    assignedTo: "Priya Singh",
    receivedAt: "2026-03-29 17:20",
  },
];

export const DEMO_CRM_DUPLICATES: CrmDuplicateRecord[] = [
  {
    id: "dup1",
    field: "phone",
    value: "+91 98765 43210",
    leadA: "Akshit Kesar",
    leadB: "Akshit K",
    detectedAt: "2026-03-29",
    status: "open",
  },
  {
    id: "dup2",
    field: "email",
    value: "dinesh.k@example.com",
    leadA: "Dinesh Kumar",
    leadB: "D. Kumar",
    detectedAt: "2026-03-28",
    status: "open",
  },
];

export const DEMO_CRM_FACEBOOK_LEADS: CrmFacebookLeadRecord[] = [
  {
    id: "fb1",
    campaign: "Q1 Enterprise",
    formName: "Demo request",
    name: "Mohit Gupta",
    email: "mohit.g@corp.in",
    phone: "",
    syncedAt: "2026-03-30 07:00",
    receivedAt: "30-03-2026 · 06:04 PM",
    status: "failed",
    assignedTo: "Aniket Shukla",
    errorMessage: "Missing phone number.",
  },
  {
    id: "fb2",
    campaign: "SMB Growth",
    formName: "Pricing inquiry",
    name: "Neha Patel",
    email: "neha@startup.io",
    phone: "+91 88776 65544",
    syncedAt: "2026-03-29 14:22",
    receivedAt: "29-03-2026 · 02:22 PM",
    status: "imported",
    assignedTo: "Priya Singh",
  },
  {
    id: "fb3",
    campaign: "Stockology",
    formName: "Lead form",
    name: "Rahul Verma",
    email: "rahul.v@corp.in",
    phone: "+91 99887 76655",
    syncedAt: "2026-03-28 11:00",
    receivedAt: "28-03-2026 · 11:00 AM",
    status: "skipped",
    assignedTo: "James Okon",
    errorMessage: "Lead already exists in CRM.",
  },
  {
    id: "fb4",
    campaign: "Webinar Q1",
    formName: "Registration",
    name: "Sneha Rao",
    email: "sneha.r@example.com",
    phone: "+91 77665 54433",
    syncedAt: "2026-03-27 09:15",
    receivedAt: "27-03-2026 · 09:15 AM",
    status: "new",
    assignedTo: "Elena Rossi",
  },
];

export const DEMO_CRM_PIPELINES: CrmPipelineConfig[] = [
  { id: "p1", name: "Sales", stages: 5, isDefault: true },
  { id: "p2", name: "Fund follow-up", stages: 4, isDefault: false },
  { id: "p3", name: "Enterprise expansion", stages: 6, isDefault: false },
];

export const DEMO_CRM_LEAD_STAGES: CrmStageConfig[] = [
  { id: "ls1", name: "New leads", order: 1 },
  { id: "ls2", name: "Contacted", order: 2 },
  { id: "ls3", name: "Interested", order: 3 },
  { id: "ls4", name: "Qualified", order: 4 },
  { id: "ls5", name: "Not interested", order: 5 },
];

export const DEMO_CRM_DEAL_STAGES: CrmStageConfig[] = [
  { id: "ds1", name: "Initial contact", order: 1, probability: 10 },
  { id: "ds2", name: "Qualification", order: 2, probability: 25 },
  { id: "ds3", name: "Proposal", order: 3, probability: 50 },
  { id: "ds4", name: "Negotiation", order: 4, probability: 75 },
  { id: "ds5", name: "Closed won", order: 5, probability: 100 },
];

export const DEMO_CRM_LABELS: CrmLabelConfig[] = [
  { id: "lb1", name: "Hot", color: "#dc2626" },
  { id: "lb2", name: "Enterprise", color: "#191970" },
  { id: "lb3", name: "Partner", color: "#7c3aed" },
  { id: "lb4", name: "Nurture", color: "#d97706" },
];

export const DEMO_CRM_SOURCES: CrmSourceConfig[] = [
  { id: "s1", name: "Inbound", active: true },
  { id: "s2", name: "Outbound", active: true },
  { id: "s3", name: "Partner", active: true },
  { id: "s4", name: "Facebook", active: true },
  { id: "s5", name: "Webinar", active: false },
];

export const DEMO_CRM_REPORTS = [
  { id: "r1", name: "Pipeline velocity", description: "Stage conversion and time-in-stage", category: "Pipeline" },
  { id: "r2", name: "Lead source ROI", description: "Leads and revenue by acquisition channel", category: "Leads" },
  { id: "r3", name: "Rep performance", description: "Tasks, calls, and won deals by owner", category: "Team" },
  { id: "r4", name: "Forecast summary", description: "Weighted pipeline by close month", category: "Revenue" },
];

export const DEMO_CRM_WHATSAPP_THREADS = [
  {
    id: "wa1",
    name: "Akshit Kesar",
    phone: "+91 98765 43210",
    lastMessage: "Can you share the onboarding checklist?",
    time: "2m ago",
    unread: 2,
  },
  {
    id: "wa2",
    name: "Dinesh Kumar",
    phone: "+91 87654 32109",
    lastMessage: "Thanks, I'll review the proposal.",
    time: "1h ago",
    unread: 0,
  },
];
