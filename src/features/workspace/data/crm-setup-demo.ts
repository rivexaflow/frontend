import type { CrmSetupSection } from "@/features/workspace/data/crm-nav";

export type CrmStageKind = "open" | "won" | "lost";

export type CrmLeadStageConfig = {
  id: string;
  name: string;
  order: number;
  kind: CrmStageKind;
  description: string;
};

export type CrmDealStageConfig = {
  id: string;
  name: string;
  order: number;
  kind: CrmStageKind;
  probability: number;
  description: string;
};

export type CrmPicklistItem = {
  id: string;
  name: string;
  active: boolean;
  description?: string;
};

export type CrmGeneralSettings = {
  defaultOwner: string;
  assignmentMethod: "manual" | "round_robin" | "territory";
  leadResponseSlaHours: number;
  duplicateCheck: "phone" | "email" | "phone_and_email";
  autoCreateTaskOnNewLead: boolean;
  requireSourceOnLead: boolean;
  requireCloseDateOnDeal: boolean;
  currency: string;
};

export const CRM_SETUP_GROUPS: {
  id: "pipeline" | "picklists" | "defaults";
  label: string;
  sections: CrmSetupSection[];
}[] = [
  {
    id: "pipeline",
    label: "Pipeline",
    sections: ["lead_stages", "deal_stages", "lost_reasons"],
  },
  {
    id: "picklists",
    label: "Picklists",
    sections: ["sources", "deal_types", "labels"],
  },
  {
    id: "defaults",
    label: "Defaults",
    sections: ["general"],
  },
];

export const DEMO_CRM_LEAD_STAGES: CrmLeadStageConfig[] = [
  { id: "ls1", name: "New", order: 1, kind: "open", description: "Lead captured but not yet contacted." },
  { id: "ls2", name: "Contacted", order: 2, kind: "open", description: "Initial outreach completed." },
  { id: "ls3", name: "Interested", order: 3, kind: "open", description: "Engaged and evaluating fit." },
  { id: "ls4", name: "Qualified", order: 4, kind: "won", description: "Ready to convert to a deal." },
  { id: "ls5", name: "Not interested", order: 5, kind: "lost", description: "Closed out — not a fit." },
];

export const DEMO_CRM_DEAL_STAGES: CrmDealStageConfig[] = [
  {
    id: "ds1",
    name: "Qualification",
    order: 1,
    kind: "open",
    probability: 10,
    description: "Confirm need, budget, and decision process.",
  },
  {
    id: "ds2",
    name: "Discovery",
    order: 2,
    kind: "open",
    probability: 25,
    description: "Demo or discovery call completed.",
  },
  {
    id: "ds3",
    name: "Proposal",
    order: 3,
    kind: "open",
    probability: 50,
    description: "Quote or proposal sent to buyer.",
  },
  {
    id: "ds4",
    name: "Negotiation",
    order: 4,
    kind: "open",
    probability: 75,
    description: "Terms, pricing, or scope under review.",
  },
  {
    id: "ds5",
    name: "Closed won",
    order: 5,
    kind: "won",
    probability: 100,
    description: "Deal signed — revenue recognized.",
  },
  {
    id: "ds6",
    name: "Closed lost",
    order: 6,
    kind: "lost",
    probability: 0,
    description: "Opportunity did not close.",
  },
];

export const DEMO_CRM_LOST_REASONS: CrmPicklistItem[] = [
  { id: "lr1", name: "Price / budget", active: true },
  { id: "lr2", name: "Chose competitor", active: true },
  { id: "lr3", name: "No decision / ghosted", active: true },
  { id: "lr4", name: "Bad timing", active: true },
  { id: "lr5", name: "Not qualified", active: true },
];

export const DEMO_CRM_SOURCES: CrmPicklistItem[] = [
  { id: "s1", name: "Website", active: true, description: "Inbound form or chat" },
  { id: "s2", name: "Google Ads", active: true },
  { id: "s3", name: "LinkedIn", active: true },
  { id: "s4", name: "Referral", active: true },
  { id: "s5", name: "Partner", active: true },
  { id: "s6", name: "Trade show", active: true },
  { id: "s7", name: "Cold outreach", active: true },
  { id: "s8", name: "Webinar", active: false },
];

export const DEMO_CRM_DEAL_TYPES: CrmPicklistItem[] = [
  { id: "dt1", name: "New business", active: true },
  { id: "dt2", name: "Renewal", active: true },
  { id: "dt3", name: "Upsell / expansion", active: true },
  { id: "dt4", name: "Services", active: true },
];

export const DEMO_CRM_LABELS: { id: string; name: string; color: string }[] = [
  { id: "lb1", name: "Hot", color: "#dc2626" },
  { id: "lb2", name: "Enterprise", color: "#191970" },
  { id: "lb3", name: "Partner", color: "#7c3aed" },
  { id: "lb4", name: "Nurture", color: "#d97706" },
  { id: "lb5", name: "VIP", color: "#059669" },
];

export const DEFAULT_CRM_GENERAL_SETTINGS: CrmGeneralSettings = {
  defaultOwner: "Round robin · Sales team",
  assignmentMethod: "round_robin",
  leadResponseSlaHours: 4,
  duplicateCheck: "phone_and_email",
  autoCreateTaskOnNewLead: true,
  requireSourceOnLead: true,
  requireCloseDateOnDeal: true,
  currency: "INR",
};

export const STAGE_KIND_LABEL: Record<CrmStageKind, string> = {
  open: "In progress",
  won: "Success",
  lost: "Closed out",
};

export const STAGE_KIND_TONE: Record<CrmStageKind, string> = {
  open: "bg-slate-100 text-slate-600",
  won: "bg-emerald-50 text-emerald-700",
  lost: "bg-rose-50 text-rose-700",
};
