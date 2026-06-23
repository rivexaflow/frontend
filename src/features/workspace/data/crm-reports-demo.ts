export type CrmReportEntity = "lead" | "deal";

export type CrmReportTab = "general" | "staff" | "pipelines" | "clients";

export type CrmReportKpi = {
  label: string;
  value: string;
  delta?: string;
  deltaUp?: boolean;
};

export type CrmChartPoint = {
  label: string;
  value: number;
  color?: string;
};

export type CrmReportDataset = {
  entity: CrmReportEntity;
  kpis: CrmReportKpi[];
  weeklyConversion: CrmChartPoint[];
  sourceBreakdown: CrmChartPoint[];
  monthlyVolume: Record<string, CrmChartPoint[]>;
  staffPerformance: CrmChartPoint[];
  pipelineVolume: CrmChartPoint[];
  clientBreakdown?: CrmChartPoint[];
};

const WEEKDAY_COLORS = [
  "#191970",
  "#2563eb",
  "#0ea5e9",
  "#10b981",
  "#f59e0b",
  "#8b5cf6",
  "#ec4899",
];

export const CRM_REPORT_TABS: Record<
  CrmReportEntity,
  { id: CrmReportTab; label: string }[]
> = {
  lead: [
    { id: "general", label: "General report" },
    { id: "staff", label: "Staff report" },
    { id: "pipelines", label: "Pipelines report" },
  ],
  deal: [
    { id: "general", label: "General report" },
    { id: "staff", label: "Staff report" },
    { id: "pipelines", label: "Pipelines report" },
    { id: "clients", label: "Clients report" },
  ],
};

export const CRM_REPORT_MONTH_OPTIONS = [
  "Jan 2026",
  "Feb 2026",
  "Mar 2026",
  "Apr 2026",
  "May 2026",
  "Jun 2026",
  "Jul 2026",
  "Aug 2026",
  "Sep 2026",
  "Oct 2026",
  "Nov 2026",
  "Dec 2026",
];

const LEAD_SOURCES: CrmChartPoint[] = [
  { label: "Premium WA", value: 1642, color: "#191970" },
  { label: "Website", value: 412, color: "#2563eb" },
  { label: "Facebook", value: 286, color: "#0ea5e9" },
  { label: "Digital mkt", value: 198, color: "#6366f1" },
  { label: "Referral", value: 156, color: "#10b981" },
  { label: "Webinar", value: 89, color: "#f59e0b" },
  { label: "Partner", value: 67, color: "#8b5cf6" },
  { label: "Event", value: 44, color: "#ec4899" },
];

const LEAD_STAFF: CrmChartPoint[] = [
  { label: "Anil Yadav", value: 68420 },
  { label: "Neha Patidar", value: 4210 },
  { label: "Priya Singh", value: 3890 },
  { label: "James Okon", value: 2100 },
  { label: "Elena Rossi", value: 1840 },
  { label: "Aniket Shukla", value: 920 },
  { label: "Rahul Verma", value: 640 },
];

const LEAD_PIPELINES: CrmChartPoint[] = [
  { label: "Sales", value: 1847, color: "#191970" },
  { label: "Fund follow-up", value: 42, color: "#64748b" },
];

const LEAD_MONTHLY: Record<string, CrmChartPoint[]> = {
  "Jan 2026": [{ label: "Jan 2026", value: 12400 }],
  "Feb 2026": [{ label: "Feb 2026", value: 48200 }],
  "Mar 2026": [{ label: "Mar 2026", value: 62100 }],
  "Apr 2026": [{ label: "Apr 2026", value: 89400 }],
  "May 2026": [{ label: "May 2026", value: 128500 }],
  "Jun 2026": [{ label: "Jun 2026", value: 76200 }],
};

const DEAL_SOURCES: CrmChartPoint[] = [
  { label: "Inbound", value: 48, color: "#191970" },
  { label: "Partner", value: 22, color: "#2563eb" },
  { label: "Referral", value: 18, color: "#10b981" },
  { label: "Outbound", value: 12, color: "#6366f1" },
];

const DEAL_STAFF: CrmChartPoint[] = [
  { label: "Priya Singh", value: 24 },
  { label: "James Okon", value: 18 },
  { label: "Elena Rossi", value: 14 },
  { label: "Aniket Shukla", value: 11 },
  { label: "Neha Patidar", value: 8 },
];

const DEAL_PIPELINES: CrmChartPoint[] = [
  { label: "Enterprise", value: 38, color: "#191970" },
  { label: "SMB", value: 52, color: "#2563eb" },
  { label: "Renewals", value: 24, color: "#10b981" },
];

const DEAL_CLIENTS: CrmChartPoint[] = [
  { label: "NovaPay", value: 12, color: "#191970" },
  { label: "FinEdge", value: 9, color: "#2563eb" },
  { label: "CloudStack", value: 7, color: "#6366f1" },
  { label: "RetailOne", value: 5, color: "#10b981" },
  { label: "HealthBridge", value: 4, color: "#f59e0b" },
];

function buildWeekly(entity: CrmReportEntity): CrmChartPoint[] {
  const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  const values =
    entity === "lead"
      ? [18, 22, 14, 26, 31, 8, 5]
      : [4, 6, 3, 8, 9, 2, 1];
  return days.map((label, i) => ({
    label,
    value: values[i]!,
    color: WEEKDAY_COLORS[i],
  }));
}

function buildMonthly(entity: CrmReportEntity): Record<string, CrmChartPoint[]> {
  if (entity === "lead") return LEAD_MONTHLY;
  return {
    "Jan 2026": [{ label: "Jan 2026", value: 8 }],
    "Feb 2026": [{ label: "Feb 2026", value: 14 }],
    "Mar 2026": [{ label: "Mar 2026", value: 19 }],
    "Apr 2026": [{ label: "Apr 2026", value: 22 }],
    "May 2026": [{ label: "May 2026", value: 28 }],
    "Jun 2026": [{ label: "Jun 2026", value: 16 }],
  };
}

export function getCrmReportDataset(entity: CrmReportEntity): CrmReportDataset {
  if (entity === "lead") {
    return {
      entity,
      kpis: [
        { label: "Total leads", value: "2,894", delta: "+12.4%", deltaUp: true },
        { label: "Qualified", value: "684", delta: "+8.1%", deltaUp: true },
        { label: "Conversion", value: "23.6%", delta: "+1.2 pts", deltaUp: true },
        { label: "Top source", value: "Premium WA", delta: "57% share" },
      ],
      weeklyConversion: buildWeekly("lead"),
      sourceBreakdown: LEAD_SOURCES,
      monthlyVolume: buildMonthly("lead"),
      staffPerformance: LEAD_STAFF,
      pipelineVolume: LEAD_PIPELINES,
    };
  }

  return {
    entity,
    kpis: [
      { label: "Open deals", value: "114", delta: "+6.2%", deltaUp: true },
      { label: "Won this month", value: "28", delta: "+4 deals", deltaUp: true },
      { label: "Pipeline value", value: "₹4.2Cr", delta: "+18%", deltaUp: true },
      { label: "Win rate", value: "31%", delta: "-2 pts", deltaUp: false },
    ],
    weeklyConversion: buildWeekly("deal"),
    sourceBreakdown: DEAL_SOURCES,
    monthlyVolume: buildMonthly("deal"),
    staffPerformance: DEAL_STAFF,
    pipelineVolume: DEAL_PIPELINES,
    clientBreakdown: DEAL_CLIENTS,
  };
}

/** Full-year monthly series for the general report chart */
export function getMonthlySeries(entity: CrmReportEntity): CrmChartPoint[] {
  const months = CRM_REPORT_MONTH_OPTIONS.slice(0, 11);
  if (entity === "lead") {
    const values = [12400, 48200, 62100, 89400, 128500, 76200, 54000, 48000, 41000, 36000, 28000];
    return months.map((label, i) => ({ label, value: values[i] ?? 0 }));
  }
  const values = [8, 14, 19, 22, 28, 16, 12, 10, 9, 8, 7];
  return months.map((label, i) => ({ label, value: values[i] ?? 0 }));
}
