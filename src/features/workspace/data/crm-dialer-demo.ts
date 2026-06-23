export type DialerQueueStatus = "pending" | "calling" | "completed" | "skipped" | "no_answer";

export type DialerContact = {
  id: string;
  name: string;
  company: string;
  title: string;
  phone: string;
  email: string;
  leadRef: string;
  source: string;
  scoreBand: "A1" | "A2" | "B1" | "B2" | "C";
  queueStatus: DialerQueueStatus;
  lastCalled?: string;
};

export type CallDisposition =
  | "connected"
  | "no_answer"
  | "voicemail"
  | "busy"
  | "wrong_number"
  | "callback"
  | "not_interested";

export type CallDirection = "outbound" | "inbound";

export type CallLogEntry = {
  id: string;
  contactId: string;
  contactName: string;
  phone: string;
  company: string;
  direction: CallDirection;
  disposition: CallDisposition;
  durationSec: number;
  notes?: string;
  startedAt: string;
};

export const CALL_DISPOSITION_META: Record<
  CallDisposition,
  { label: string; tone: "emerald" | "amber" | "slate" | "rose" | "blue" }
> = {
  connected: { label: "Connected", tone: "emerald" },
  no_answer: { label: "No answer", tone: "slate" },
  voicemail: { label: "Left voicemail", tone: "blue" },
  busy: { label: "Busy", tone: "amber" },
  wrong_number: { label: "Wrong number", tone: "rose" },
  callback: { label: "Callback scheduled", tone: "blue" },
  not_interested: { label: "Not interested", tone: "rose" },
};

export const DEMO_DIALER_QUEUE: DialerContact[] = [
  {
    id: "dq1",
    name: "Anika Verma",
    company: "Northwind Labs",
    title: "VP Revenue Operations",
    phone: "+1 415 555 0182",
    email: "anika@northwind.io",
    leadRef: "LEAD-2026-2201",
    source: "Inbound",
    scoreBand: "A1",
    queueStatus: "pending",
  },
  {
    id: "dq2",
    name: "Marcus Chen",
    company: "Helix Systems",
    title: "Head of Sales",
    phone: "+65 6123 4401",
    email: "marcus@helix.co",
    leadRef: "LEAD-2026-2198",
    source: "Outbound",
    scoreBand: "A2",
    queueStatus: "pending",
  },
  {
    id: "dq3",
    name: "Sofia Alvarez",
    company: "Brightline Retail",
    title: "Director Procurement",
    phone: "+44 20 7946 0822",
    email: "sofia@brightline.com",
    leadRef: "LEAD-2026-2204",
    source: "Partner",
    scoreBand: "A2",
    queueStatus: "pending",
  },
  {
    id: "dq4",
    name: "David Park",
    company: "Apex FinServ",
    title: "CFO",
    phone: "+1 212 555 0199",
    email: "david@apexfs.com",
    leadRef: "LEAD-2026-2190",
    source: "Webinar",
    scoreBand: "B1",
    queueStatus: "pending",
  },
  {
    id: "dq5",
    name: "Elena Rossi",
    company: "Meridian Health",
    title: "Operations Lead",
    phone: "+39 02 555 0188",
    email: "elena@meridian.health",
    leadRef: "LEAD-2026-2185",
    source: "Referral",
    scoreBand: "A1",
    queueStatus: "pending",
  },
  {
    id: "dq6",
    name: "James Okon",
    company: "Vertex Cloud",
    title: "CTO",
    phone: "+234 803 555 0144",
    email: "james@vertexcloud.io",
    leadRef: "LEAD-2026-2178",
    source: "Event",
    scoreBand: "B2",
    queueStatus: "pending",
  },
];

export const DEMO_CALL_LOG: CallLogEntry[] = [
  {
    id: "cl1",
    contactId: "dq0",
    contactName: "Priya Nair",
    phone: "+91 98 2001 4402",
    company: "Orbit Commerce",
    direction: "outbound",
    disposition: "connected",
    durationSec: 342,
    notes: "Interested in enterprise plan — send proposal.",
    startedAt: "Today · 9:42 AM",
  },
  {
    id: "cl2",
    contactId: "dq0",
    contactName: "Tom Bradley",
    phone: "+1 617 555 0133",
    company: "Summit Logistics",
    direction: "outbound",
    disposition: "voicemail",
    durationSec: 28,
    startedAt: "Today · 9:18 AM",
  },
  {
    id: "cl3",
    contactId: "dq0",
    contactName: "Lisa Huang",
    phone: "+86 21 5555 0188",
    company: "Pacific Trade Co",
    direction: "outbound",
    disposition: "no_answer",
    durationSec: 0,
    startedAt: "Today · 8:55 AM",
  },
  {
    id: "cl4",
    contactId: "dq0",
    contactName: "Carlos Mendez",
    phone: "+52 55 5555 0190",
    company: "Nova Retail",
    direction: "inbound",
    disposition: "callback",
    durationSec: 95,
    notes: "Call back Thursday 2 PM CST.",
    startedAt: "Yesterday · 4:30 PM",
  },
];

export function formatCallDuration(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

export function normalizePhoneInput(value: string): string {
  return value.replace(/[^\d+*#]/g, "");
}
