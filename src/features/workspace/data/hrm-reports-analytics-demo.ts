import type { CrmChartPoint } from "@/features/workspace/data/crm-reports-demo";
import type { HrmReportCategory } from "@/types/hrm";

export type HrmAnalyticsKpi = {
  label: string;
  value: string;
  delta?: string;
  deltaUp?: boolean;
};

export type HrmReportInsight = {
  id: string;
  title: string;
  body: string;
  tone: "info" | "success" | "warning";
  category: HrmReportCategory;
};

export function getHrmReportAnalytics() {
  const headcountTrend: CrmChartPoint[] = [
    { label: "Jan", value: 112, color: "#191970" },
    { label: "Feb", value: 115, color: "#191970" },
    { label: "Mar", value: 118, color: "#191970" },
    { label: "Apr", value: 121, color: "#2277ff" },
    { label: "May", value: 124, color: "#2277ff" },
    { label: "Jun", value: 126, color: "#0056ff" },
  ];

  const attendanceByDept: CrmChartPoint[] = [
    { label: "Engineering", value: 96, color: "#191970" },
    { label: "Revenue", value: 93, color: "#2277ff" },
    { label: "Operations", value: 91, color: "#0056ff" },
    { label: "HR", value: 98, color: "#10b981" },
    { label: "Finance", value: 94, color: "#f59e0b" },
  ];

  const leaveUtilization: CrmChartPoint[] = [
    { label: "Annual", value: 42, color: "#191970" },
    { label: "Sick", value: 18, color: "#2277ff" },
    { label: "Casual", value: 24, color: "#0056ff" },
    { label: "Unpaid", value: 6, color: "#94a3b8" },
  ];

  const payrollTrend: CrmChartPoint[] = [
    { label: "Jan", value: 42, color: "#191970" },
    { label: "Feb", value: 43, color: "#191970" },
    { label: "Mar", value: 44, color: "#2277ff" },
    { label: "Apr", value: 45, color: "#2277ff" },
    { label: "May", value: 46, color: "#0056ff" },
    { label: "Jun", value: 47, color: "#0056ff" },
  ];

  const complianceBreakdown: CrmChartPoint[] = [
    { label: "Acknowledged", value: 91, color: "#10b981" },
    { label: "Pending", value: 6, color: "#f59e0b" },
    { label: "Overdue", value: 3, color: "#f43f5e" },
  ];

  const attritionTrend: CrmChartPoint[] = [
    { label: "Jan", value: 1.2, color: "#191970" },
    { label: "Feb", value: 0.8, color: "#191970" },
    { label: "Mar", value: 1.5, color: "#2277ff" },
    { label: "Apr", value: 0.9, color: "#2277ff" },
    { label: "May", value: 0.6, color: "#10b981" },
    { label: "Jun", value: 0.8, color: "#0056ff" },
  ];

  const kpis: HrmAnalyticsKpi[] = [
    { label: "Active headcount", value: "124", delta: "+8 vs last month", deltaUp: true },
    { label: "Avg attendance", value: "94.2%", delta: "+1.1 pts", deltaUp: true },
    { label: "Attrition (YTD)", value: "4.8%", delta: "−0.6 pts", deltaUp: true },
    { label: "Policy compliance", value: "91%", delta: "+3 pts", deltaUp: true },
  ];

  const insights: HrmReportInsight[] = [
    {
      id: "ins_1",
      title: "Operations attendance dipped",
      body: "Operations team attendance fell to 91% in May — 3 pts below org average. Consider roster review.",
      tone: "warning",
      category: "attendance",
    },
    {
      id: "ins_2",
      title: "Headcount growth on track",
      body: "Net +12 hires in Q2 with 3 open roles in Revenue. Headcount report ready for board pack.",
      tone: "success",
      category: "headcount",
    },
    {
      id: "ins_3",
      title: "28 policy acks pending",
      body: "Annual leave policy has the highest overdue count. Send reminders from Compliance reports.",
      tone: "info",
      category: "compliance",
    },
  ];

  return {
    kpis,
    headcountTrend,
    attendanceByDept,
    leaveUtilization,
    payrollTrend,
    complianceBreakdown,
    attritionTrend,
    insights,
  };
}

export const REPORT_PERIOD_PRESETS = [
  { id: "current_month", label: "Current month", value: "May 2026" },
  { id: "last_month", label: "Last month", value: "Apr 2026" },
  { id: "qtd", label: "Quarter to date", value: "Q2 2026 (Apr–Jun)" },
  { id: "ytd", label: "Year to date", value: "YTD 2026" },
  { id: "custom", label: "Custom period", value: "" },
] as const;

export type ReportPeriodPresetId = (typeof REPORT_PERIOD_PRESETS)[number]["id"];
