export type LeadScoreBand = "A1" | "A2" | "B1" | "B2" | "C";
export type LeadLifecycle = "lead" | "mql" | "sql";
export type LeadSlaStatus = "on_track" | "at_risk" | "breached";
export type LeadStatus =
  | "new"
  | "not_interested"
  | "not_pickup_call"
  | "callback"
  | "interested"
  | "ready_to_open_account"
  | "document_pending"
  | "document_received"
  | "technical_error_kyc"
  | "account_rejected"
  | "move_to_activation"
  | "nurturing"
  | "qualified"
  | "lost";

export type LeadRecord = {
  id: string;
  reference: string;
  name: string;
  title: string;
  company: string;
  email: string;
  phone?: string;
  country: string;
  source: string;
  score: number;
  fitScore: number;
  engagementScore: number;
  scoreBand: LeadScoreBand;
  status: LeadStatus;
  lifecycle: LeadLifecycle;
  owner: string;
  slaStatus: LeadSlaStatus;
  slaDue: string;
  firstTouchDue: string;
  lastActivity: string;
  updatedAt: string;
  touchCount: number;
  /** Kanban column override when using custom pipeline stages. */
  boardStage?: string;
};

export const LEAD_STATUS_LABELS: Record<LeadStatus, string> = {
  new: "New lead",
  not_interested: "Not interested",
  not_pickup_call: "Not pick up call",
  callback: "Call back",
  interested: "Interested",
  ready_to_open_account: "Ready to open account",
  document_pending: "Document pending",
  document_received: "Document received",
  technical_error_kyc: "Technical error in KYC",
  account_rejected: "Account rejected",
  move_to_activation: "Move to activation",
  nurturing: "In progress",
  qualified: "Qualified",
  lost: "Closed",
};

export type LeadBoardStage = {
  id: string;
  name: string;
  tone: "blue" | "amber" | "emerald" | "slate" | "rose";
};

export type LeadPipelinePhase = {
  id: string;
  label: string;
  description: string;
  stageIds: string[];
};

export const LEAD_PIPELINE_PHASES: LeadPipelinePhase[] = [
  {
    id: "intake",
    label: "Intake",
    description: "New inquiries & first contact",
    stageIds: ["new", "not_pickup_call", "callback"],
  },
  {
    id: "engagement",
    label: "Engagement",
    description: "Interest qualification",
    stageIds: ["not_interested", "interested"],
  },
  {
    id: "onboarding",
    label: "Account opening",
    description: "Documentation & KYC prep",
    stageIds: ["ready_to_open_account", "document_pending", "document_received"],
  },
  {
    id: "activation",
    label: "Activation",
    description: "Final review & go-live",
    stageIds: ["technical_error_kyc", "account_rejected", "move_to_activation"],
  },
];

export function resolveLeadBoardStageId(lead: LeadRecord, stageIds: Set<string>): string {
  if (lead.boardStage && stageIds.has(lead.boardStage)) return lead.boardStage;
  if (stageIds.has(lead.status)) return lead.status;
  return "new";
}

export function slugifyLeadStageId(name: string): string {
  const base = name
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_|_$/g, "");
  return base || `stage_${Date.now()}`;
}

export const LEAD_BOARD_STAGES: LeadBoardStage[] = [
  { id: "new", name: "New leads", tone: "blue" },
  { id: "not_interested", name: "Not interested", tone: "slate" },
  { id: "not_pickup_call", name: "Not pick up call", tone: "amber" },
  { id: "callback", name: "Call back", tone: "amber" },
  { id: "interested", name: "Interested", tone: "emerald" },
  { id: "ready_to_open_account", name: "Ready to open account", tone: "blue" },
  { id: "document_pending", name: "Document pending", tone: "amber" },
  { id: "document_received", name: "Document received", tone: "emerald" },
  { id: "technical_error_kyc", name: "Technical error in KYC", tone: "rose" },
  { id: "account_rejected", name: "Account rejected", tone: "rose" },
  { id: "move_to_activation", name: "Move to activation", tone: "blue" },
];

export function isTerminalLeadStatus(status: LeadStatus): boolean {
  return status === "not_interested" || status === "account_rejected" || status === "lost";
}

export function scoreBandFromTotal(score: number): LeadScoreBand {
  if (score >= 90) return "A1";
  if (score >= 75) return "A2";
  if (score >= 60) return "B1";
  if (score >= 40) return "B2";
  return "C";
}

export const SCORE_BAND_META: Record<
  LeadScoreBand,
  { label: string; hint: string; sla: string; tone: "emerald" | "blue" | "amber" | "slate" | "rose" }
> = {
  A1: { label: "Hot (A1)", hint: "90+ · ICP fit", sla: "24h first touch", tone: "emerald" },
  A2: { label: "Strong (A2)", hint: "75–89", sla: "48h follow-up", tone: "blue" },
  B1: { label: "Engaged (B1)", hint: "60–74", sla: "48h qualify", tone: "amber" },
  B2: { label: "Nurture (B2)", hint: "40–59", sla: "7d nurture track", tone: "slate" },
  C: { label: "Cold (C)", hint: "<40", sla: "Marketing educate", tone: "slate" },
};

export type LeadActivity = {
  id: string;
  leadRef: string;
  leadName: string;
  type: "email" | "call" | "meeting" | "form" | "note";
  summary: string;
  occurredAt: string;
};

export type ContactRecord = {
  id: string;
  name: string;
  company: string;
  email: string;
  role: string;
  engagement: "high" | "medium" | "low";
  lastTouch: string;
  owner: string;
};

export type PipelineStage = {
  id: string;
  name: string;
  tone: "blue" | "indigo" | "purple" | "emerald" | "amber";
};

export type OpportunityRecord = {
  id: string;
  title: string;
  company: string;
  value: number;
  stageId: string;
  owner: string;
  closeDate: string;
  priority: "high" | "medium" | "low";
  probability: number;
};

export const PIPELINE_STAGES: PipelineStage[] = [
  { id: "discovery", name: "Discovery", tone: "blue" },
  { id: "qualified", name: "Qualified", tone: "indigo" },
  { id: "proposal", name: "Proposal", tone: "purple" },
  { id: "negotiation", name: "Negotiation", tone: "amber" },
  { id: "closed_won", name: "Closed won", tone: "emerald" },
];

export const DEMO_LEADS: LeadRecord[] = [
  {
    id: "l1",
    reference: "LEAD-2026-2201",
    name: "Anika Verma",
    title: "VP Revenue Operations",
    company: "Northwind Labs",
    email: "anika@northwind.io",
    phone: "+1 415 555 0182",
    country: "United States",
    source: "Inbound",
    score: 92,
    fitScore: 88,
    engagementScore: 96,
    scoreBand: "A1",
    status: "interested",
    lifecycle: "sql",
    owner: "Priya Singh",
    slaStatus: "on_track",
    slaDue: "On track",
    firstTouchDue: "Met",
    lastActivity: "Demo booked",
    updatedAt: "2h ago",
    touchCount: 6,
  },
  {
    id: "l2",
    reference: "LEAD-2026-2198",
    name: "Marcus Chen",
    title: "Head of Sales",
    company: "Helix Systems",
    email: "marcus@helix.co",
    phone: "+65 8123 4567",
    country: "Singapore",
    source: "Outbound",
    score: 78,
    fitScore: 82,
    engagementScore: 74,
    scoreBand: "A2",
    status: "callback",
    lifecycle: "mql",
    owner: "James Okon",
    slaStatus: "on_track",
    slaDue: "18h left",
    firstTouchDue: "Met",
    lastActivity: "Email opened",
    updatedAt: "5h ago",
    touchCount: 4,
  },
  {
    id: "l3",
    reference: "LEAD-2026-2204",
    name: "Sofia Alvarez",
    title: "Director Procurement",
    company: "Brightline Retail",
    email: "sofia@brightline.com",
    phone: "+44 7700 900123",
    country: "United Kingdom",
    source: "Partner",
    score: 85,
    fitScore: 79,
    engagementScore: 91,
    scoreBand: "A2",
    status: "new",
    lifecycle: "lead",
    owner: "Priya Singh",
    slaStatus: "at_risk",
    slaDue: "6h left",
    firstTouchDue: "Due today",
    lastActivity: "Form submit",
    updatedAt: "Today",
    touchCount: 1,
  },
  {
    id: "l4",
    reference: "LEAD-2026-2190",
    name: "David Park",
    title: "CFO",
    company: "Apex FinServ",
    email: "david@apexfs.com",
    phone: "+1 212 555 0144",
    country: "United States",
    source: "Webinar",
    score: 64,
    fitScore: 70,
    engagementScore: 58,
    scoreBand: "B1",
    status: "callback",
    lifecycle: "mql",
    owner: "Elena Rossi",
    slaStatus: "on_track",
    slaDue: "2d nurture",
    firstTouchDue: "Met",
    lastActivity: "Webinar attended",
    updatedAt: "Yesterday",
    touchCount: 3,
  },
  {
    id: "l5",
    reference: "LEAD-2026-2175",
    name: "Hannah Wright",
    title: "Operations Manager",
    company: "CloudNine Health",
    email: "hannah@c9health.org",
    country: "Canada",
    source: "Inbound",
    score: 41,
    fitScore: 38,
    engagementScore: 44,
    scoreBand: "B2",
    status: "not_interested",
    lifecycle: "lead",
    owner: "James Okon",
    slaStatus: "breached",
    slaDue: "Closed",
    firstTouchDue: "Missed",
    lastActivity: "Unsubscribed",
    updatedAt: "3d ago",
    touchCount: 2,
  },
  {
    id: "l6",
    reference: "LEAD-2026-2205",
    name: "Tomás Rivera",
    title: "CEO",
    company: "LatAm Logistics",
    email: "tomas@latamlogistics.mx",
    phone: "+52 55 1234 5678",
    country: "Mexico",
    source: "Referral",
    score: 88,
    fitScore: 85,
    engagementScore: 90,
    scoreBand: "A2",
    status: "new",
    lifecycle: "lead",
    owner: "Priya Singh",
    slaStatus: "on_track",
    slaDue: "22h left",
    firstTouchDue: "Due tomorrow",
    lastActivity: "Referral intro",
    updatedAt: "1h ago",
    touchCount: 1,
  },
  {
    id: "l7",
    reference: "LEAD-2026-2195",
    name: "Yuki Nakamura",
    title: "Product Lead",
    company: "Sakura FinTech",
    email: "yuki@sakuraft.jp",
    country: "Japan",
    source: "Inbound",
    score: 71,
    fitScore: 68,
    engagementScore: 74,
    scoreBand: "B1",
    status: "interested",
    lifecycle: "sql",
    owner: "Elena Rossi",
    slaStatus: "on_track",
    slaDue: "On track",
    firstTouchDue: "Met",
    lastActivity: "Pricing page",
    updatedAt: "4h ago",
    touchCount: 5,
  },
  {
    id: "l8",
    reference: "LEAD-2026-2206",
    name: "Amélie Dubois",
    title: "CFO",
    company: "EuroClear SA",
    email: "amelie@euroclear.eu",
    country: "France",
    source: "Inbound",
    score: 94,
    fitScore: 91,
    engagementScore: 97,
    scoreBand: "A1",
    status: "new",
    lifecycle: "mql",
    owner: "Priya Singh",
    slaStatus: "at_risk",
    slaDue: "3h left",
    firstTouchDue: "Due today",
    lastActivity: "Enterprise trial",
    updatedAt: "30m ago",
    touchCount: 2,
  },
  {
    id: "l9",
    reference: "LEAD-2026-2188",
    name: "Oliver Grant",
    title: "Director IT",
    company: "Summit Energy",
    email: "oliver@summit.energy",
    country: "Germany",
    source: "Outbound",
    score: 58,
    fitScore: 62,
    engagementScore: 54,
    scoreBand: "B2",
    status: "callback",
    lifecycle: "lead",
    owner: "James Okon",
    slaStatus: "on_track",
    slaDue: "5d nurture",
    firstTouchDue: "Met",
    lastActivity: "Sequence step 2",
    updatedAt: "2d ago",
    touchCount: 2,
  },
  {
    id: "l10",
    reference: "LEAD-2026-2210",
    name: "Rajesh Kumar",
    title: "Trader",
    company: "Mumbai Capital",
    email: "rajesh@mumbaicap.in",
    phone: "+91 98765 43210",
    country: "India",
    source: "Inbound",
    score: 52,
    fitScore: 48,
    engagementScore: 55,
    scoreBand: "B2",
    status: "not_pickup_call",
    lifecycle: "lead",
    owner: "Priya Singh",
    slaStatus: "at_risk",
    slaDue: "4h left",
    firstTouchDue: "Due today",
    lastActivity: "No answer x3",
    updatedAt: "1h ago",
    touchCount: 3,
  },
  {
    id: "l11",
    reference: "LEAD-2026-2211",
    name: "Fatima Al-Sayed",
    title: "Investment Advisor",
    company: "Gulf Horizon",
    email: "fatima@gulfhorizon.ae",
    phone: "+971 50 123 4567",
    country: "UAE",
    source: "Partner",
    score: 81,
    fitScore: 78,
    engagementScore: 84,
    scoreBand: "A2",
    status: "ready_to_open_account",
    lifecycle: "sql",
    owner: "James Okon",
    slaStatus: "on_track",
    slaDue: "On track",
    firstTouchDue: "Met",
    lastActivity: "KYC initiated",
    updatedAt: "3h ago",
    touchCount: 7,
  },
  {
    id: "l12",
    reference: "LEAD-2026-2212",
    name: "Chen Wei",
    title: "Portfolio Manager",
    company: "Pacific Trade Co",
    email: "chen@pacifictrade.cn",
    phone: "+86 138 0000 1111",
    country: "China",
    source: "Outbound",
    score: 76,
    fitScore: 72,
    engagementScore: 80,
    scoreBand: "A2",
    status: "document_pending",
    lifecycle: "sql",
    owner: "Elena Rossi",
    slaStatus: "on_track",
    slaDue: "2d left",
    firstTouchDue: "Met",
    lastActivity: "Awaiting PAN upload",
    updatedAt: "6h ago",
    touchCount: 5,
  },
  {
    id: "l13",
    reference: "LEAD-2026-2213",
    name: "Isabelle Martin",
    title: "Private Banker",
    company: "Alpine Wealth",
    email: "isabelle@alpinewealth.ch",
    phone: "+41 79 555 0101",
    country: "Switzerland",
    source: "Referral",
    score: 89,
    fitScore: 86,
    engagementScore: 92,
    scoreBand: "A1",
    status: "document_received",
    lifecycle: "sql",
    owner: "Priya Singh",
    slaStatus: "on_track",
    slaDue: "On track",
    firstTouchDue: "Met",
    lastActivity: "All docs verified",
    updatedAt: "45m ago",
    touchCount: 8,
  },
  {
    id: "l14",
    reference: "LEAD-2026-2214",
    name: "Samuel Okafor",
    title: "CEO",
    company: "Lagos FinTech",
    email: "samuel@lagosft.ng",
    phone: "+234 803 555 0199",
    country: "Nigeria",
    source: "Inbound",
    score: 67,
    fitScore: 64,
    engagementScore: 70,
    scoreBand: "B1",
    status: "technical_error_kyc",
    lifecycle: "mql",
    owner: "James Okon",
    slaStatus: "at_risk",
    slaDue: "12h left",
    firstTouchDue: "Due today",
    lastActivity: "KYC API timeout",
    updatedAt: "2h ago",
    touchCount: 4,
  },
  {
    id: "l15",
    reference: "LEAD-2026-2215",
    name: "Petra Novak",
    title: "Director",
    company: "Baltic Securities",
    email: "petra@balticsec.cz",
    phone: "+420 601 234 567",
    country: "Czech Republic",
    source: "Webinar",
    score: 44,
    fitScore: 40,
    engagementScore: 48,
    scoreBand: "B2",
    status: "account_rejected",
    lifecycle: "lead",
    owner: "Elena Rossi",
    slaStatus: "breached",
    slaDue: "Closed",
    firstTouchDue: "Missed",
    lastActivity: "Compliance rejection",
    updatedAt: "1d ago",
    touchCount: 3,
  },
  {
    id: "l16",
    reference: "LEAD-2026-2216",
    name: "Arjun Mehta",
    title: "HNI Client",
    company: "Mehta Holdings",
    email: "arjun@mehtaholdings.in",
    phone: "+91 99887 76655",
    country: "India",
    source: "Referral",
    score: 91,
    fitScore: 88,
    engagementScore: 94,
    scoreBand: "A1",
    status: "move_to_activation",
    lifecycle: "sql",
    owner: "Priya Singh",
    slaStatus: "on_track",
    slaDue: "On track",
    firstTouchDue: "Met",
    lastActivity: "Activation queued",
    updatedAt: "20m ago",
    touchCount: 9,
  },
];

export const DEMO_LEAD_ACTIVITIES: LeadActivity[] = [
  { id: "a1", leadRef: "LEAD-2026-2206", leadName: "Amélie Dubois", type: "form", summary: "Started enterprise trial", occurredAt: "30m ago" },
  { id: "a2", leadRef: "LEAD-2026-2201", leadName: "Anika Verma", type: "meeting", summary: "Discovery call scheduled", occurredAt: "2h ago" },
  { id: "a3", leadRef: "LEAD-2026-2204", leadName: "Sofia Alvarez", type: "form", summary: "Partner referral form", occurredAt: "Today" },
  { id: "a4", leadRef: "LEAD-2026-2198", leadName: "Marcus Chen", type: "email", summary: "Opened nurture email #3", occurredAt: "5h ago" },
  { id: "a5", leadRef: "LEAD-2026-2205", leadName: "Tomás Rivera", type: "note", summary: "Warm intro from existing customer", occurredAt: "1h ago" },
];

export const DEMO_CONTACTS: ContactRecord[] = [
  {
    id: "c1",
    name: "Robert Klein",
    company: "Sterling Holdings",
    email: "r.klein@sterling.com",
    role: "VP Operations",
    engagement: "high",
    lastTouch: "1h ago",
    owner: "Priya Singh",
  },
  {
    id: "c2",
    name: "Mei Tanaka",
    company: "Orbit Logistics",
    email: "mei@orbitlogistics.jp",
    role: "Head of Procurement",
    engagement: "medium",
    lastTouch: "Yesterday",
    owner: "Elena Rossi",
  },
  {
    id: "c3",
    name: "Oliver Grant",
    company: "Summit Energy",
    email: "oliver@summit.energy",
    role: "Director IT",
    engagement: "high",
    lastTouch: "4h ago",
    owner: "Priya Singh",
  },
  {
    id: "c4",
    name: "Lina Hassan",
    company: "NovaPay",
    email: "lina@novapay.io",
    role: "Compliance Lead",
    engagement: "low",
    lastTouch: "1w ago",
    owner: "James Okon",
  },
  {
    id: "c5",
    name: "Amélie Dubois",
    company: "EuroClear SA",
    email: "amelie@euroclear.eu",
    role: "CFO",
    engagement: "high",
    lastTouch: "Today",
    owner: "Priya Singh",
  },
];

export const DEMO_OPPORTUNITIES: OpportunityRecord[] = [
  {
    id: "o1",
    title: "Enterprise CRM rollout",
    company: "Northwind Labs",
    value: 185000,
    stageId: "discovery",
    owner: "Priya Singh",
    closeDate: "2026-06-15",
    priority: "high",
    probability: 25,
  },
  {
    id: "o2",
    title: "KYC automation bundle",
    company: "Helix Systems",
    value: 92000,
    stageId: "discovery",
    owner: "James Okon",
    closeDate: "2026-05-30",
    priority: "medium",
    probability: 20,
  },
  {
    id: "o3",
    title: "Multi-region workspace",
    company: "Sterling Holdings",
    value: 240000,
    stageId: "qualified",
    owner: "Priya Singh",
    closeDate: "2026-07-01",
    priority: "high",
    probability: 45,
  },
  {
    id: "o4",
    title: "Invoicing + AI agents",
    company: "Brightline Retail",
    value: 68000,
    stageId: "qualified",
    owner: "Elena Rossi",
    closeDate: "2026-06-20",
    priority: "medium",
    probability: 40,
  },
  {
    id: "o5",
    title: "Compliance workspace",
    company: "NovaPay",
    value: 156000,
    stageId: "proposal",
    owner: "James Okon",
    closeDate: "2026-05-18",
    priority: "high",
    probability: 55,
  },
  {
    id: "o6",
    title: "Analytics expansion",
    company: "Summit Energy",
    value: 44000,
    stageId: "proposal",
    owner: "Priya Singh",
    closeDate: "2026-06-08",
    priority: "low",
    probability: 50,
  },
  {
    id: "o7",
    title: "Platform renewal",
    company: "Orbit Logistics",
    value: 128000,
    stageId: "negotiation",
    owner: "Elena Rossi",
    closeDate: "2026-05-12",
    priority: "high",
    probability: 75,
  },
  {
    id: "o8",
    title: "EU entity onboarding",
    company: "EuroClear SA",
    value: 210000,
    stageId: "negotiation",
    owner: "Priya Singh",
    closeDate: "2026-05-22",
    priority: "high",
    probability: 70,
  },
  {
    id: "o9",
    title: "SMB growth tier",
    company: "LatAm Logistics",
    value: 36000,
    stageId: "closed_won",
    owner: "James Okon",
    closeDate: "2026-04-28",
    priority: "medium",
    probability: 100,
  },
  {
    id: "o10",
    title: "Health vertical package",
    company: "CloudNine Health",
    value: 89000,
    stageId: "discovery",
    owner: "Elena Rossi",
    closeDate: "2026-08-01",
    priority: "medium",
    probability: 15,
  },
];

/** @deprecated Use PIPELINE_STAGES */
export const DEMO_PIPELINE_STAGES = PIPELINE_STAGES.map((s) => ({
  ...s,
  deals: 0,
  value: "$0",
  conversion: "—",
}));

export function formatDealValue(amount: number): string {
  if (amount >= 1_000_000) return `$${(amount / 1_000_000).toFixed(1)}M`;
  if (amount >= 1_000) return `$${Math.round(amount / 1_000)}k`;
  return `$${amount}`;
}

export function sumStageValue(opportunities: OpportunityRecord[], stageId: string): number {
  return opportunities
    .filter((o) => o.stageId === stageId)
    .reduce((sum, o) => sum + o.value, 0);
}
