export type DealStage =
  | "qualification"
  | "discovery"
  | "proposal"
  | "negotiation"
  | "closed_won"
  | "closed_lost";

export type DealRecord = {
  id: string;
  reference: string;
  title: string;
  company: string;
  contact: string;
  value: number;
  currency: string;
  stage: DealStage;
  probability: number;
  owner: string;
  closeDate: string;
  lastActivity: string;
  priority: "high" | "medium" | "low";
  source: string;
};

export const DEAL_STAGE_META: Record<
  DealStage,
  { label: string; tone: "blue" | "purple" | "amber" | "emerald" | "rose" }
> = {
  qualification: { label: "Qualification", tone: "blue" },
  discovery: { label: "Discovery", tone: "blue" },
  proposal: { label: "Proposal", tone: "purple" },
  negotiation: { label: "Negotiation", tone: "amber" },
  closed_won: { label: "Closed won", tone: "emerald" },
  closed_lost: { label: "Closed lost", tone: "rose" },
};

export const DEMO_DEALS: DealRecord[] = [
  {
    id: "d1",
    reference: "DEAL-2026-0412",
    title: "Enterprise CRM rollout",
    company: "Northwind Capital",
    contact: "Priya Mehta",
    value: 248000,
    currency: "USD",
    stage: "negotiation",
    probability: 72,
    owner: "Anika Verma",
    closeDate: "Jun 15, 2026",
    lastActivity: "2h ago",
    priority: "high",
    source: "Inbound",
  },
  {
    id: "d2",
    reference: "DEAL-2026-0398",
    title: "KYC automation suite",
    company: "Helios Securities",
    contact: "Rahul Shah",
    value: 156000,
    currency: "USD",
    stage: "proposal",
    probability: 58,
    owner: "James Okonkwo",
    closeDate: "Jul 02, 2026",
    lastActivity: "Yesterday",
    priority: "high",
    source: "Partner",
  },
  {
    id: "d3",
    reference: "DEAL-2026-0371",
    title: "Workspace expansion — APAC",
    company: "Vertex Holdings",
    contact: "Sofia Lindström",
    value: 92000,
    currency: "USD",
    stage: "discovery",
    probability: 35,
    owner: "Anika Verma",
    closeDate: "Aug 01, 2026",
    lastActivity: "3d ago",
    priority: "medium",
    source: "Outbound",
  },
  {
    id: "d4",
    reference: "DEAL-2026-0355",
    title: "Invoicing + compliance bundle",
    company: "BlueRiver FinTech",
    contact: "Marcus Chen",
    value: 64000,
    currency: "USD",
    stage: "qualification",
    probability: 22,
    owner: "Elena Rossi",
    closeDate: "Sep 10, 2026",
    lastActivity: "5d ago",
    priority: "medium",
    source: "Event",
  },
  {
    id: "d5",
    reference: "DEAL-2026-0310",
    title: "AI agents — sales copilot",
    company: "Aurora Retail Group",
    contact: "David Park",
    value: 118000,
    currency: "USD",
    stage: "closed_won",
    probability: 100,
    owner: "James Okonkwo",
    closeDate: "May 12, 2026",
    lastActivity: "1w ago",
    priority: "low",
    source: "Inbound",
  },
  {
    id: "d6",
    reference: "DEAL-2026-0288",
    title: "Legacy migration",
    company: "Summit Brokers",
    contact: "Tom Bradley",
    value: 45000,
    currency: "USD",
    stage: "closed_lost",
    probability: 0,
    owner: "Elena Rossi",
    closeDate: "Apr 28, 2026",
    lastActivity: "2w ago",
    priority: "low",
    source: "Outbound",
  },
];

export function formatDealValue(value: number, currency = "USD"): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(value);
}
