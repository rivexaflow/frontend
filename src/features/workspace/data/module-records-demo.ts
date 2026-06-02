export type KycSubmission = {
  id: string;
  applicant: string;
  company: string;
  type: string;
  risk: "low" | "medium" | "high";
  status: "pending" | "in_review" | "approved" | "rejected";
  sla: string;
};

export type InvoiceRecord = {
  id: string;
  number: string;
  client: string;
  amount: string;
  dueDate: string;
  status: "draft" | "sent" | "paid" | "overdue";
};

export type AiAgentRecord = {
  id: string;
  name: string;
  module: string;
  status: "active" | "paused" | "draft";
  runsToday: number;
  successRate: string;
};

export type ReportRecord = {
  id: string;
  name: string;
  category: string;
  schedule: string;
  lastRun: string;
};

export const DEMO_KYC: KycSubmission[] = [
  {
    id: "k1",
    applicant: "Sofia Alvarez",
    company: "Brightline Retail",
    type: "Corporate KYB",
    risk: "medium",
    status: "in_review",
    sla: "4h left",
  },
  {
    id: "k2",
    applicant: "David Park",
    company: "Apex FinServ",
    type: "Individual KYC",
    risk: "high",
    status: "pending",
    sla: "1h left",
  },
  {
    id: "k3",
    applicant: "Mei Tanaka",
    company: "Orbit Logistics",
    type: "UBO verification",
    risk: "low",
    status: "approved",
    sla: "—",
  },
];

export const DEMO_INVOICES: InvoiceRecord[] = [
  {
    id: "i1",
    number: "INV-2041",
    client: "Sterling Holdings",
    amount: "$24,500",
    dueDate: "Jun 02",
    status: "sent",
  },
  {
    id: "i2",
    number: "INV-2038",
    client: "NovaPay",
    amount: "$8,120",
    dueDate: "May 28",
    status: "overdue",
  },
  {
    id: "i3",
    number: "INV-2035",
    client: "Northwind Labs",
    amount: "$41,000",
    dueDate: "May 20",
    status: "paid",
  },
];

export const DEMO_AGENTS: AiAgentRecord[] = [
  {
    id: "a1",
    name: "Lead scoring copilot",
    module: "CRM",
    status: "active",
    runsToday: 842,
    successRate: "99.2%",
  },
  {
    id: "a2",
    name: "KYC document extractor",
    module: "KYC",
    status: "active",
    runsToday: 126,
    successRate: "97.8%",
  },
  {
    id: "a3",
    name: "Invoice dunning assistant",
    module: "Invoicing",
    status: "paused",
    runsToday: 0,
    successRate: "—",
  },
];

export const DEMO_REPORTS: ReportRecord[] = [
  {
    id: "r1",
    name: "Executive revenue summary",
    category: "Finance",
    schedule: "Weekly · Mon 9:00",
    lastRun: "2d ago",
  },
  {
    id: "r2",
    name: "Pipeline velocity",
    category: "CRM",
    schedule: "Daily",
    lastRun: "6h ago",
  },
  {
    id: "r3",
    name: "KYC SLA compliance",
    category: "Compliance",
    schedule: "Monthly",
    lastRun: "1w ago",
  },
];
