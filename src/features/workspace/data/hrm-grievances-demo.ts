export type GrievanceStage = "submitted" | "under_review" | "assigned" | "resolved";

export type GrievanceCategory =
  | "Workplace conduct"
  | "Payroll & benefits"
  | "Harassment & safety"
  | "Facilities & seating"
  | "Policy concern"
  | "Other";

export type GrievancePriority = "low" | "medium" | "high";

export type GrievanceEvidence = {
  id: string;
  name: string;
  sizeLabel: string;
  mime: string;
};

export type GrievanceComment = {
  id: string;
  author: string;
  role: "employee" | "hr" | "manager";
  body: string;
  at: string;
};

export type HrmGrievanceTicket = {
  id: string;
  subject: string;
  category: GrievanceCategory;
  description: string;
  employee: string;
  department: string;
  priority: GrievancePriority;
  stage: GrievanceStage;
  assignedTo?: string;
  anonymous: boolean;
  language: string;
  evidence: GrievanceEvidence[];
  comments: GrievanceComment[];
  filedAt: string;
  updatedAt: string;
};

export const GRIEVANCE_STAGES: { id: GrievanceStage; label: string }[] = [
  { id: "submitted", label: "Submitted" },
  { id: "under_review", label: "Under review" },
  { id: "assigned", label: "Assigned" },
  { id: "resolved", label: "Resolved" },
];

export const GRIEVANCE_CATEGORIES: GrievanceCategory[] = [
  "Workplace conduct",
  "Payroll & benefits",
  "Harassment & safety",
  "Facilities & seating",
  "Policy concern",
  "Other",
];

export const DEMO_HRM_GRIEVANCES: HrmGrievanceTicket[] = [
  {
    id: "G-101",
    subject: "Shift timing clarification",
    category: "Policy concern",
    description:
      "My roster shows 10:00 AM start but the team lead expects 9:30 AM. I need written confirmation of official shift hours for payroll accuracy.",
    employee: "Karan Patel",
    department: "Operations",
    priority: "medium",
    stage: "under_review",
    assignedTo: "Anita Desai",
    anonymous: false,
    language: "English",
    evidence: [{ id: "e1", name: "roster-screenshot.png", sizeLabel: "420 KB", mime: "image/png" }],
    comments: [
      {
        id: "c1",
        author: "Karan Patel",
        role: "employee",
        body: "Submitted with roster screenshot. Happy to discuss on a call if needed.",
        at: "Jun 14, 2026 · 10:22 AM",
      },
      {
        id: "c2",
        author: "Anita Desai",
        role: "hr",
        body: "Thanks Karan — we're checking with Operations. You'll hear back within 2 business days.",
        at: "Jun 14, 2026 · 2:15 PM",
      },
    ],
    filedAt: "Jun 14, 2026",
    updatedAt: "Jun 14, 2026",
  },
  {
    id: "G-102",
    subject: "Workspace seating request",
    category: "Facilities & seating",
    description:
      "Current desk is near the server room and it's noisy. Requesting relocation to the open area near Marketing, or noise-cancelling headphones as interim support.",
    employee: "Neha Singh",
    department: "Marketing",
    priority: "low",
    stage: "submitted",
    anonymous: false,
    language: "English",
    evidence: [],
    comments: [
      {
        id: "c3",
        author: "Neha Singh",
        role: "employee",
        body: "Open to any available desk on Floor 2.",
        at: "Jun 15, 2026 · 9:05 AM",
      },
    ],
    filedAt: "Jun 15, 2026",
    updatedAt: "Jun 15, 2026",
  },
  {
    id: "G-103",
    subject: "Payslip deduction query — June cycle",
    category: "Payroll & benefits",
    description:
      "June payslip shows an unexpected ₹2,400 deduction labelled 'Adjustment'. No prior email or notice received.",
    employee: "Anonymous",
    department: "Finance",
    priority: "high",
    stage: "assigned",
    assignedTo: "Priya Mehta",
    anonymous: true,
    language: "English",
    evidence: [{ id: "e2", name: "payslip-june.pdf", sizeLabel: "1.2 MB", mime: "application/pdf" }],
    comments: [
      {
        id: "c4",
        author: "HR Team",
        role: "hr",
        body: "Ticket assigned to Payroll. We will respond without revealing your identity to your manager.",
        at: "Jun 12, 2026 · 4:30 PM",
      },
    ],
    filedAt: "Jun 12, 2026",
    updatedAt: "Jun 13, 2026",
  },
  {
    id: "G-100",
    subject: "Break room hygiene standards",
    category: "Facilities & seating",
    description: "Repeated cleanliness issues in the 3rd floor pantry. Resolved after facilities deep-clean.",
    employee: "Amit Shah",
    department: "Operations",
    priority: "medium",
    stage: "resolved",
    assignedTo: "Facilities Team",
    anonymous: false,
    language: "Hindi",
    evidence: [{ id: "e3", name: "pantry-photo.jpg", sizeLabel: "890 KB", mime: "image/jpeg" }],
    comments: [
      {
        id: "c5",
        author: "Facilities Team",
        role: "manager",
        body: "Deep clean completed Jun 8. Daily checklist added for pantry staff.",
        at: "Jun 9, 2026 · 11:00 AM",
      },
    ],
    filedAt: "Jun 5, 2026",
    updatedAt: "Jun 9, 2026",
  },
];

export function getGrievanceStats(tickets: HrmGrievanceTicket[] = DEMO_HRM_GRIEVANCES) {
  const active = tickets.filter((t) => t.stage !== "resolved").length;
  const pending = tickets.filter((t) => t.stage === "submitted" || t.stage === "under_review").length;
  const assigned = tickets.filter((t) => t.stage === "assigned").length;
  const resolved = tickets.filter((t) => t.stage === "resolved").length;
  const highPriority = tickets.filter((t) => t.priority === "high" && t.stage !== "resolved").length;
  return { total: tickets.length, active, pending, assigned, resolved, highPriority };
}

export function displayEmployee(ticket: HrmGrievanceTicket) {
  return ticket.anonymous ? "Anonymous" : ticket.employee;
}

export function nextTicketId(tickets: HrmGrievanceTicket[]) {
  const nums = tickets.map((t) => parseInt(t.id.replace(/\D/g, ""), 10)).filter((n) => !Number.isNaN(n));
  const next = (nums.length ? Math.max(...nums) : 100) + 1;
  return `G-${next}`;
}
