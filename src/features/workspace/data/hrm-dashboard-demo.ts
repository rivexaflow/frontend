import type { CrmChartPoint } from "@/features/workspace/data/crm-reports-demo";

/** Rivexaflow brand palette — blue, green, red (not purple) */
export const HRM_DASHBOARD_COLORS = {
  blue: "#2277ff",
  midnight: "#191970",
  royal: "#0056ff",
  sky: "#0ea5e9",
  green: "#10b981",
  red: "#ef4444",
  amber: "#f59e0b",
} as const;

export type HrmRecruitmentStage = "applicant" | "interviewed" | "hired";

export type HrmDashboardKpi = {
  id: HrmRecruitmentStage;
  label: string;
  value: number;
  delta: string;
  deltaUp: boolean;
  sparkline: number[];
};

export type HrmCandidate = {
  id: string;
  name: string;
  role: string;
  email: string;
  stageId: HrmRecruitmentStage;
  score?: number;
  appliedAt: string;
  positionId: string;
};

export type HrmOpenPosition = CrmChartPoint & {
  id: string;
  department: string;
  openings: number;
  avgDaysOpen: number;
  description: string;
};

export type HrmDailyTask = {
  id: string;
  name: string;
  assignedBy: string;
  team: { name: string }[];
  status: "in_progress" | "need_review" | "done";
};

export type HrmScheduleEvent = {
  id: string;
  date: number;
  time: string;
  name: string;
  role: string;
  bio: string;
  kind: "interview" | "meeting";
  meetingUrl?: string;
};

export type HrmDashboardMonthDay = {
  date: number;
  weekday: string;
  isToday?: boolean;
};

export const HRM_RECRUITMENT_STAGES: { id: HrmRecruitmentStage; name: string; tone: "blue" | "sky" | "green" }[] = [
  { id: "applicant", name: "Applicant", tone: "blue" },
  { id: "interviewed", name: "Interviewed", tone: "sky" },
  { id: "hired", name: "Hired", tone: "green" },
];

export const HRM_DASHBOARD_KPIS: HrmDashboardKpi[] = [
  {
    id: "applicant",
    label: "Applicant",
    value: 18,
    delta: "+20.2% last month",
    deltaUp: true,
    sparkline: [42, 58, 48, 72, 65, 88, 95],
  },
  {
    id: "interviewed",
    label: "Interviewed",
    value: 17,
    delta: "+15.7% last month",
    deltaUp: true,
    sparkline: [28, 35, 40, 38, 52, 48, 56],
  },
  {
    id: "hired",
    label: "Hired",
    value: 10,
    delta: "+12.4% last month",
    deltaUp: true,
    sparkline: [18, 22, 20, 16, 14, 12, 10],
  },
];

export const HRM_OPEN_POSITIONS: HrmOpenPosition[] = [
  {
    id: "sales-rep",
    label: "Sales Representative",
    value: 9,
    color: HRM_DASHBOARD_COLORS.midnight,
    department: "Sales",
    openings: 4,
    avgDaysOpen: 14,
    description: "Outbound SaaS sales, pipeline management, and quota attainment.",
  },
  {
    id: "account-executive",
    label: "Account Executive",
    value: 8,
    color: HRM_DASHBOARD_COLORS.blue,
    department: "Sales",
    openings: 3,
    avgDaysOpen: 16,
    description: "Mid-market and enterprise deal cycles, demos, and closing.",
  },
  {
    id: "customer-success",
    label: "Customer Success",
    value: 7,
    color: HRM_DASHBOARD_COLORS.sky,
    department: "Customer",
    openings: 2,
    avgDaysOpen: 19,
    description: "Onboarding, retention, and expansion for CRM accounts.",
  },
  {
    id: "sdr",
    label: "SDR / BDR",
    value: 9,
    color: HRM_DASHBOARD_COLORS.green,
    department: "Sales",
    openings: 5,
    avgDaysOpen: 12,
    description: "Lead qualification, outreach sequences, and meeting booking.",
  },
  {
    id: "engineering",
    label: "Software Engineer",
    value: 6,
    color: HRM_DASHBOARD_COLORS.royal,
    department: "Engineering",
    openings: 2,
    avgDaysOpen: 22,
    description: "Full-stack TypeScript, Next.js, and API integrations.",
  },
  {
    id: "support",
    label: "Support Specialist",
    value: 6,
    color: HRM_DASHBOARD_COLORS.amber,
    department: "Operations",
    openings: 2,
    avgDaysOpen: 15,
    description: "Tier-1/2 support, CRM troubleshooting, and SLA management.",
  },
];

export const DEMO_HRM_CANDIDATES: HrmCandidate[] = [
  // Account Executive
  { id: "c1", name: "Elena Rodriguez", role: "Account Executive", email: "elena.rodriguez@mail.com", stageId: "interviewed", score: 92, appliedAt: "Jun 2", positionId: "account-executive" },
  { id: "c6", name: "Tom Becker", role: "Account Executive", email: "tom.becker@mail.com", stageId: "hired", score: 94, appliedAt: "May 28", positionId: "account-executive" },
  { id: "c11", name: "Rachel Kim", role: "Account Executive", email: "rachel.kim@mail.com", stageId: "interviewed", score: 89, appliedAt: "Jun 1", positionId: "account-executive" },
  { id: "c12", name: "Daniel Osei", role: "Account Executive", email: "daniel.osei@mail.com", stageId: "applicant", score: 83, appliedAt: "Jun 8", positionId: "account-executive" },
  { id: "c13", name: "Hannah Wright", role: "Account Executive", email: "hannah.wright@mail.com", stageId: "applicant", score: 80, appliedAt: "Jun 9", positionId: "account-executive" },
  { id: "c14", name: "Arjun Mehta", role: "Account Executive", email: "arjun.mehta@mail.com", stageId: "interviewed", score: 87, appliedAt: "May 30", positionId: "account-executive" },
  { id: "c15", name: "Olivia Santos", role: "Account Executive", email: "olivia.santos@mail.com", stageId: "hired", score: 91, appliedAt: "May 18", positionId: "account-executive" },
  { id: "c16", name: "Chris Dalton", role: "Account Executive", email: "chris.dalton@mail.com", stageId: "applicant", score: 76, appliedAt: "Jun 10", positionId: "account-executive" },

  // Sales Representative
  { id: "c2", name: "Marcus Chen", role: "Sales Representative", email: "marcus.chen@mail.com", stageId: "interviewed", score: 88, appliedAt: "Jun 4", positionId: "sales-rep" },
  { id: "c5", name: "Priya Nair", role: "Sales Representative", email: "priya.nair@mail.com", stageId: "applicant", score: 81, appliedAt: "Jun 6", positionId: "sales-rep" },
  { id: "c17", name: "Jordan Blake", role: "Sales Representative", email: "jordan.blake@mail.com", stageId: "interviewed", score: 85, appliedAt: "Jun 3", positionId: "sales-rep" },
  { id: "c18", name: "Fatima Al-Hassan", role: "Sales Representative", email: "fatima.alhassan@mail.com", stageId: "hired", score: 90, appliedAt: "May 22", positionId: "sales-rep" },
  { id: "c19", name: "Ryan Cooper", role: "Sales Representative", email: "ryan.cooper@mail.com", stageId: "applicant", score: 78, appliedAt: "Jun 11", positionId: "sales-rep" },
  { id: "c20", name: "Mei Lin", role: "Sales Representative", email: "mei.lin@mail.com", stageId: "interviewed", score: 86, appliedAt: "May 29", positionId: "sales-rep" },
  { id: "c21", name: "Samuel Torres", role: "Sales Representative", email: "samuel.torres@mail.com", stageId: "applicant", score: 74, appliedAt: "Jun 12", positionId: "sales-rep" },
  { id: "c22", name: "Grace O'Brien", role: "Sales Representative", email: "grace.obrien@mail.com", stageId: "hired", score: 88, appliedAt: "May 15", positionId: "sales-rep" },
  { id: "c23", name: "Vikram Singh", role: "Sales Representative", email: "vikram.singh@mail.com", stageId: "applicant", score: 82, appliedAt: "Jun 7", positionId: "sales-rep" },

  // Customer Success
  { id: "c3", name: "Sofia Patel", role: "Customer Success", email: "sofia.patel@mail.com", stageId: "applicant", score: 85, appliedAt: "Jun 5", positionId: "customer-success" },
  { id: "c10", name: "David Park", role: "Customer Success", email: "david.park@mail.com", stageId: "applicant", score: 77, appliedAt: "Jun 7", positionId: "customer-success" },
  { id: "c24", name: "Emily Nguyen", role: "Customer Success", email: "emily.nguyen@mail.com", stageId: "interviewed", score: 91, appliedAt: "Jun 1", positionId: "customer-success" },
  { id: "c25", name: "Benjamin Cole", role: "Customer Success", email: "benjamin.cole@mail.com", stageId: "interviewed", score: 84, appliedAt: "May 27", positionId: "customer-success" },
  { id: "c26", name: "Isabelle Dubois", role: "Customer Success", email: "isabelle.dubois@mail.com", stageId: "hired", score: 93, appliedAt: "May 12", positionId: "customer-success" },
  { id: "c27", name: "Kevin Zhang", role: "Customer Success", email: "kevin.zhang@mail.com", stageId: "applicant", score: 79, appliedAt: "Jun 9", positionId: "customer-success" },
  { id: "c28", name: "Amara Johnson", role: "Customer Success", email: "amara.johnson@mail.com", stageId: "interviewed", score: 88, appliedAt: "Jun 4", positionId: "customer-success" },

  // SDR / BDR
  { id: "c4", name: "James Okonkwo", role: "SDR", email: "james.okonkwo@mail.com", stageId: "applicant", score: 79, appliedAt: "Jun 6", positionId: "sdr" },
  { id: "c9", name: "Nina Volkov", role: "SDR", email: "nina.volkov@mail.com", stageId: "interviewed", score: 84, appliedAt: "Jun 3", positionId: "sdr" },
  { id: "c29", name: "Tyler Brooks", role: "SDR", email: "tyler.brooks@mail.com", stageId: "interviewed", score: 82, appliedAt: "Jun 2", positionId: "sdr" },
  { id: "c30", name: "Zara Ahmed", role: "SDR", email: "zara.ahmed@mail.com", stageId: "hired", score: 87, appliedAt: "May 19", positionId: "sdr" },
  { id: "c31", name: "Lucas Fernandez", role: "SDR", email: "lucas.fernandez@mail.com", stageId: "applicant", score: 75, appliedAt: "Jun 10", positionId: "sdr" },
  { id: "c32", name: "Chloe Bennett", role: "SDR", email: "chloe.bennett@mail.com", stageId: "interviewed", score: 86, appliedAt: "May 31", positionId: "sdr" },
  { id: "c33", name: "Mohammed Rahman", role: "SDR", email: "mohammed.rahman@mail.com", stageId: "applicant", score: 73, appliedAt: "Jun 11", positionId: "sdr" },
  { id: "c34", name: "Anna Kowalski", role: "SDR", email: "anna.kowalski@mail.com", stageId: "hired", score: 89, appliedAt: "May 14", positionId: "sdr" },
  { id: "c35", name: "Ethan Walsh", role: "SDR", email: "ethan.walsh@mail.com", stageId: "applicant", score: 80, appliedAt: "Jun 8", positionId: "sdr" },

  // Software Engineer
  { id: "c8", name: "Leo Martins", role: "Software Engineer", email: "leo.martins@mail.com", stageId: "interviewed", score: 86, appliedAt: "Jun 1", positionId: "engineering" },
  { id: "c36", name: "Sarah Mitchell", role: "Software Engineer", email: "sarah.mitchell@mail.com", stageId: "interviewed", score: 92, appliedAt: "May 26", positionId: "engineering" },
  { id: "c37", name: "Raj Patel", role: "Software Engineer", email: "raj.patel@mail.com", stageId: "applicant", score: 88, appliedAt: "Jun 5", positionId: "engineering" },
  { id: "c38", name: "Yuki Tanaka", role: "Software Engineer", email: "yuki.tanaka@mail.com", stageId: "hired", score: 95, appliedAt: "May 10", positionId: "engineering" },
  { id: "c39", name: "Michael O'Connor", role: "Software Engineer", email: "michael.oconnor@mail.com", stageId: "applicant", score: 81, appliedAt: "Jun 9", positionId: "engineering" },
  { id: "c40", name: "Priya Sharma", role: "Software Engineer", email: "priya.sharma@mail.com", stageId: "interviewed", score: 90, appliedAt: "Jun 3", positionId: "engineering" },

  // Support Specialist
  { id: "c7", name: "Aisha Khan", role: "Support Specialist", email: "aisha.khan@mail.com", stageId: "hired", score: 90, appliedAt: "May 20", positionId: "support" },
  { id: "c41", name: "Noah Williams", role: "Support Specialist", email: "noah.williams@mail.com", stageId: "interviewed", score: 83, appliedAt: "Jun 2", positionId: "support" },
  { id: "c42", name: "Laura Mendez", role: "Support Specialist", email: "laura.mendez@mail.com", stageId: "applicant", score: 78, appliedAt: "Jun 7", positionId: "support" },
  { id: "c43", name: "Omar Hassan", role: "Support Specialist", email: "omar.hassan@mail.com", stageId: "interviewed", score: 85, appliedAt: "May 28", positionId: "support" },
  { id: "c44", name: "Jessica Moore", role: "Support Specialist", email: "jessica.moore@mail.com", stageId: "hired", score: 88, appliedAt: "May 16", positionId: "support" },
  { id: "c45", name: "Alex Petrov", role: "Support Specialist", email: "alex.petrov@mail.com", stageId: "applicant", score: 76, appliedAt: "Jun 10", positionId: "support" },
];

export const HRM_OVERVIEW_MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun"] as const;
export type HrmOverviewMonth = (typeof HRM_OVERVIEW_MONTHS)[number];

export const HRM_OVERVIEW_BARS: Record<HrmOverviewMonth, number> = {
  Jan: 820,
  Feb: 910,
  Mar: 980,
  Apr: 1121,
  May: 1050,
  Jun: 1180,
};

export const HRM_OVERVIEW_LINE: Record<HrmOverviewMonth, number> = {
  Jan: 780,
  Feb: 850,
  Mar: 920,
  Apr: 980,
  May: 1010,
  Jun: 1090,
};

export const HRM_OVERVIEW_DELTA: Record<HrmOverviewMonth, { pct: number; up: boolean }> = {
  Jan: { pct: 12.4, up: true },
  Feb: { pct: 8.1, up: true },
  Mar: { pct: 5.6, up: true },
  Apr: { pct: 30.2, up: true },
  May: { pct: -6.3, up: false },
  Jun: { pct: 12.4, up: true },
};

export const HRM_TASK_STATUSES = [
  { id: "in_progress" as const, name: "In Progress", tone: "amber" as const },
  { id: "need_review" as const, name: "Need Review", tone: "sky" as const },
  { id: "done" as const, name: "Done", tone: "green" as const },
];

export const HRM_DAILY_TASKS: HrmDailyTask[] = [
  {
    id: "t1",
    name: "Review AE shortlist — enterprise segment",
    assignedBy: "HR Manager",
    team: [{ name: "Priya" }, { name: "Nico" }, { name: "Anita" }, { name: "Rahul" }],
    status: "in_progress",
  },
  {
    id: "t2",
    name: "Finalize offer letter — Sales Representative",
    assignedBy: "HR Manager",
    team: [{ name: "Priya" }, { name: "Legal" }],
    status: "need_review",
  },
  {
    id: "t3",
    name: "Onboarding checklist — Customer Success",
    assignedBy: "HR Manager",
    team: [{ name: "Anita" }, { name: "IT" }, { name: "Ops" }],
    status: "done",
  },
  {
    id: "t4",
    name: "Schedule panel interview — SDR cohort",
    assignedBy: "HR Manager",
    team: [{ name: "Nico" }, { name: "Priya" }],
    status: "in_progress",
  },
];

export const HRM_SCHEDULE_BASE_DATE = new Date(2026, 5, 6);

export function buildScheduleWeek(weekOffset: number, selectedDate: number): HrmDashboardMonthDay[] {
  const base = new Date(HRM_SCHEDULE_BASE_DATE);
  base.setDate(base.getDate() + weekOffset * 7 - 3);
  const today = HRM_SCHEDULE_BASE_DATE.getDate();
  const weekdays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"] as const;

  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(base);
    d.setDate(base.getDate() + i);
    const date = d.getDate();
    return {
      date,
      weekday: weekdays[d.getDay()],
      isToday: date === today && weekOffset === 0,
    };
  }).map((day) => ({ ...day, isSelected: day.date === selectedDate }));
}

export function formatScheduleMonth(weekOffset: number): string {
  const d = new Date(HRM_SCHEDULE_BASE_DATE);
  d.setDate(d.getDate() + weekOffset * 7);
  return d.toLocaleDateString(undefined, { month: "long", year: "numeric" });
}

export const HRM_SCHEDULE_EVENTS: HrmScheduleEvent[] = [
  { id: "e1", date: 6, time: "08:00", name: "Elena Rodriguez", role: "Account Executive · Final round", bio: "Enterprise SaaS sales · 120% quota · CRM platforms", kind: "interview", meetingUrl: "#meet-elena" },
  { id: "e2", date: 6, time: "12:00", name: "Marcus Chen", role: "Sales Rep · Culture fit", bio: "Mid-market outbound · HubSpot · Series B experience", kind: "interview", meetingUrl: "#meet-marcus" },
  { id: "e3", date: 6, time: "14:00", name: "Weekly HR sync", role: "Meeting · People ops", bio: "Headcount, payroll cut-off, and open roles review", kind: "meeting", meetingUrl: "#meet-hr-sync" },
  { id: "e4", date: 6, time: "15:00", name: "Sofia Patel", role: "Customer Success · Panel", bio: "Onboarding playbooks · NRR · B2B retention", kind: "interview", meetingUrl: "#meet-sofia" },
  { id: "e5", date: 5, time: "10:00", name: "Panel prep", role: "Meeting · Recruitment", bio: "Align scorecards for AE hiring loop", kind: "meeting", meetingUrl: "#meet-prep" },
  { id: "e6", date: 8, time: "11:00", name: "James Okonkwo", role: "SDR · Screening", bio: "Cold outreach · sequencing · CRM lead routing", kind: "interview", meetingUrl: "#meet-james" },
  { id: "e7", date: 8, time: "16:00", name: "Payroll review", role: "Meeting · Finance", bio: "June payroll validation with finance", kind: "meeting", meetingUrl: "#meet-payroll" },
];
