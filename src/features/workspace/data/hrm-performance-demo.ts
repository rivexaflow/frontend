import type { CrmChartPoint } from "@/features/workspace/data/crm-reports-demo";

export type PerformanceBand = "good" | "medium" | "low";
export type PerformanceStage = "onboarding" | "ramping" | "performing" | "high_impact";

export type PerformanceMonthlyRecord = {
  month: string;
  score: number;
  goalsCompleted: number;
  goalsTotal: number;
  attendancePct: number;
};

export type PerformanceKpi = {
  id: string;
  label: string;
  value: number;
  target: number;
  unit?: string;
};

export type PerformanceGoal = {
  id: string;
  title: string;
  progress: number;
  due: string;
  status: "on_track" | "at_risk" | "completed";
};

export type PerformanceReview = {
  id: string;
  cycle: string;
  rating: number;
  reviewer: string;
  date: string;
  summary: string;
};

export type PerformanceEmployee = {
  id: string;
  name: string;
  designation: string;
  departmentId: string;
  departmentName: string;
  teamId: string;
  teamName: string;
  joinedAt: string;
  score: number;
  trendPct: number;
  trendUp: boolean;
  sparkline: number[];
  stage: PerformanceStage;
  stageProgress: number;
  band: PerformanceBand;
  monthlyHistory: PerformanceMonthlyRecord[];
  kpis: PerformanceKpi[];
  goals: PerformanceGoal[];
  reviews: PerformanceReview[];
};

export type PerformanceTeam = {
  id: string;
  name: string;
  departmentId: string;
  leaderId: string;
  leaderName: string;
  memberCount: number;
  avgScore: number;
  trendPct: number;
  trendUp: boolean;
  sparkline: number[];
  stage: PerformanceStage;
  stageProgress: number;
  band: PerformanceBand;
};

export type PerformanceDepartment = {
  id: string;
  name: string;
  headId: string;
  headName: string;
  teamCount: number;
  memberCount: number;
  avgScore: number;
  trendPct: number;
  trendUp: boolean;
  sparkline: number[];
  stage: PerformanceStage;
  stageProgress: number;
  band: PerformanceBand;
};

export const PERFORMANCE_STAGES: { id: PerformanceStage; label: string }[] = [
  { id: "onboarding", label: "Onboarding" },
  { id: "ramping", label: "Ramping" },
  { id: "performing", label: "Performing" },
  { id: "high_impact", label: "High impact" },
];

export const PERFORMANCE_BAND_LABEL: Record<PerformanceBand, string> = {
  good: "Good",
  medium: "Medium",
  low: "Low",
};

function bandFromScore(score: number): PerformanceBand {
  if (score >= 70) return "good";
  if (score >= 45) return "medium";
  return "low";
}

function stageFromScore(score: number, tenureMonths: number): PerformanceStage {
  if (tenureMonths <= 3) return "onboarding";
  if (tenureMonths <= 8) return "ramping";
  if (score >= 80) return "high_impact";
  return "performing";
}

function stageProgressFromScore(score: number): number {
  return Math.min(5, Math.max(1, Math.round(score / 20)));
}

function buildMonthlyHistory(joinMonth: number, joinYear: number, baseScore: number): PerformanceMonthlyRecord[] {
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const now = new Date(2026, 5, 20); // Jun 2026
  const records: PerformanceMonthlyRecord[] = [];
  let cursor = new Date(joinYear, joinMonth, 1);
  let drift = baseScore - 12;

  while (cursor <= now) {
    const label = `${months[cursor.getMonth()]} ${cursor.getFullYear()}`;
    drift += (baseScore - drift) * 0.18 + (Math.sin(cursor.getMonth()) * 3);
    const score = Math.round(Math.min(98, Math.max(22, drift)));
    records.push({
      month: label,
      score,
      goalsCompleted: Math.round((score / 100) * 4),
      goalsTotal: 4,
      attendancePct: Math.round(88 + (score / 100) * 10),
    });
    cursor = new Date(cursor.getFullYear(), cursor.getMonth() + 1, 1);
  }
  return records;
}

export const DEMO_PERFORMANCE_DEPARTMENTS: PerformanceDepartment[] = [
  {
    id: "dept_revenue",
    name: "Revenue",
    headId: "emp_1",
    headName: "Anil Yadav",
    teamCount: 3,
    memberCount: 5,
    avgScore: 78,
    trendPct: 12,
    trendUp: true,
    sparkline: [62, 68, 71, 74, 76, 78, 80],
    stage: "performing",
    stageProgress: 4,
    band: "good",
  },
  {
    id: "dept_compliance",
    name: "Compliance",
    headId: "emp_2",
    headName: "Marcus Webb",
    teamCount: 2,
    memberCount: 2,
    avgScore: 71,
    trendPct: 6,
    trendUp: true,
    sparkline: [58, 62, 65, 67, 69, 70, 71],
    stage: "performing",
    stageProgress: 4,
    band: "good",
  },
  {
    id: "dept_hr",
    name: "Human Resources",
    headId: "emp_3",
    headName: "Sarah Chen",
    teamCount: 2,
    memberCount: 4,
    avgScore: 68,
    trendPct: 4,
    trendUp: true,
    sparkline: [55, 58, 61, 63, 65, 67, 68],
    stage: "performing",
    stageProgress: 3,
    band: "medium",
  },
  {
    id: "dept_finance",
    name: "Finance",
    headId: "emp_9",
    headName: "David Kim",
    teamCount: 1,
    memberCount: 1,
    avgScore: 82,
    trendPct: 8,
    trendUp: true,
    sparkline: [70, 74, 76, 78, 80, 81, 82],
    stage: "high_impact",
    stageProgress: 5,
    band: "good",
  },
];

export const DEMO_PERFORMANCE_TEAMS: PerformanceTeam[] = [
  {
    id: "team_enterprise",
    name: "Enterprise Sales",
    departmentId: "dept_revenue",
    leaderId: "emp_1",
    leaderName: "Anil Yadav",
    memberCount: 2,
    avgScore: 85,
    trendPct: 14,
    trendUp: true,
    sparkline: [68, 72, 76, 80, 82, 84, 85],
    stage: "high_impact",
    stageProgress: 5,
    band: "good",
  },
  {
    id: "team_midmarket",
    name: "Mid-Market",
    departmentId: "dept_revenue",
    leaderId: "emp_11",
    leaderName: "Rajesh Iyer",
    memberCount: 2,
    avgScore: 72,
    trendPct: 5,
    trendUp: true,
    sparkline: [58, 62, 65, 68, 70, 71, 72],
    stage: "performing",
    stageProgress: 4,
    band: "good",
  },
  {
    id: "team_apac",
    name: "APAC Growth",
    departmentId: "dept_revenue",
    leaderId: "emp_4",
    leaderName: "Elena Rossi",
    memberCount: 1,
    avgScore: 76,
    trendPct: 9,
    trendUp: true,
    sparkline: [60, 64, 68, 71, 73, 75, 76],
    stage: "performing",
    stageProgress: 4,
    band: "good",
  },
  {
    id: "team_kyc",
    name: "KYC Operations",
    departmentId: "dept_compliance",
    leaderId: "emp_2",
    leaderName: "Marcus Webb",
    memberCount: 1,
    avgScore: 74,
    trendPct: 7,
    trendUp: true,
    sparkline: [60, 63, 66, 69, 71, 73, 74],
    stage: "performing",
    stageProgress: 4,
    band: "good",
  },
  {
    id: "team_regulatory",
    name: "Regulatory Affairs",
    departmentId: "dept_compliance",
    leaderId: "emp_5",
    leaderName: "James Okonkwo",
    memberCount: 1,
    avgScore: 68,
    trendPct: 3,
    trendUp: true,
    sparkline: [55, 58, 60, 63, 65, 67, 68],
    stage: "performing",
    stageProgress: 3,
    band: "medium",
  },
  {
    id: "team_hr_ops",
    name: "HR Operations",
    departmentId: "dept_hr",
    leaderId: "emp_3",
    leaderName: "Sarah Chen",
    memberCount: 2,
    avgScore: 70,
    trendPct: 5,
    trendUp: true,
    sparkline: [56, 60, 63, 66, 68, 69, 70],
    stage: "performing",
    stageProgress: 4,
    band: "good",
  },
  {
    id: "team_talent",
    name: "Talent & People Ops",
    departmentId: "dept_hr",
    leaderId: "emp_8",
    leaderName: "Lena Fischer",
    memberCount: 2,
    avgScore: 58,
    trendPct: 2,
    trendUp: false,
    sparkline: [52, 54, 55, 56, 57, 58, 58],
    stage: "ramping",
    stageProgress: 3,
    band: "medium",
  },
  {
    id: "team_fpna",
    name: "FP&A",
    departmentId: "dept_finance",
    leaderId: "emp_9",
    leaderName: "David Kim",
    memberCount: 1,
    avgScore: 82,
    trendPct: 8,
    trendUp: true,
    sparkline: [70, 74, 76, 78, 80, 81, 82],
    stage: "high_impact",
    stageProgress: 5,
    band: "good",
  },
];

function emp(
  id: string,
  name: string,
  designation: string,
  departmentId: string,
  departmentName: string,
  teamId: string,
  teamName: string,
  joinedAt: string,
  joinMonth: number,
  joinYear: number,
  baseScore: number,
  trendPct: number,
  trendUp: boolean,
): PerformanceEmployee {
  const monthlyHistory = buildMonthlyHistory(joinMonth, joinYear, baseScore);
  const score = monthlyHistory[monthlyHistory.length - 1]?.score ?? baseScore;
  const tenureMonths = monthlyHistory.length;
  const sparkline = monthlyHistory.slice(-7).map((m) => m.score);
  while (sparkline.length < 7) sparkline.unshift(sparkline[0] ?? baseScore);

  return {
    id,
    name,
    designation,
    departmentId,
    departmentName,
    teamId,
    teamName,
    joinedAt,
    score,
    trendPct,
    trendUp,
    sparkline,
    stage: stageFromScore(score, tenureMonths),
    stageProgress: stageProgressFromScore(score),
    band: bandFromScore(score),
    monthlyHistory,
    kpis: [
      { id: "k1", label: "Goal completion", value: Math.round((score / 100) * 4), target: 4 },
      { id: "k2", label: "Attendance", value: Math.round(88 + (score / 100) * 10), target: 95, unit: "%" },
      { id: "k3", label: "Peer feedback", value: +(3 + score / 40).toFixed(1), target: 4.5 },
    ],
    goals: [
      {
        id: "g1",
        title: "Complete quarterly OKR review",
        progress: Math.min(100, score + 5),
        due: "Jun 30, 2026",
        status: score >= 70 ? "on_track" : "at_risk",
      },
      {
        id: "g2",
        title: "Cross-team collaboration milestone",
        progress: Math.min(100, score - 8),
        due: "Jul 15, 2026",
        status: score >= 60 ? "on_track" : "at_risk",
      },
    ],
    reviews: [
      {
        id: "r1",
        cycle: "FY 2026 H1",
        rating: +(3 + score / 35).toFixed(1),
        reviewer: "Manager",
        date: "May 2026",
        summary: score >= 70 ? "Strong delivery and consistent growth." : "Needs focused coaching on priorities.",
      },
    ],
  };
}

export const DEMO_PERFORMANCE_EMPLOYEES: PerformanceEmployee[] = [
  emp("emp_1", "Anil Yadav", "Head of Sales", "dept_revenue", "Revenue", "team_enterprise", "Enterprise Sales", "Mar 2020", 2, 2020, 88, 12, true),
  emp("emp_4", "Elena Rossi", "Deal Executive", "dept_revenue", "Revenue", "team_apac", "APAC Growth", "Jun 2024", 5, 2024, 76, 9, true),
  emp("emp_6", "Amira Hassan", "Sales Executive", "dept_revenue", "Revenue", "team_midmarket", "Mid-Market", "Apr 2026", 3, 2026, 52, 4, true),
  emp("emp_11", "Rajesh Iyer", "Senior Sales Executive", "dept_revenue", "Revenue", "team_midmarket", "Mid-Market", "Jul 2021", 6, 2021, 72, 5, true),
  emp("emp_2", "Marcus Webb", "Head of Compliance", "dept_compliance", "Compliance", "team_kyc", "KYC Operations", "Jun 2021", 5, 2021, 78, 8, true),
  emp("emp_5", "James Okonkwo", "KYC Executive", "dept_compliance", "Compliance", "team_regulatory", "Regulatory Affairs", "Aug 2023", 7, 2023, 68, 3, true),
  emp("emp_3", "Sarah Chen", "HR Manager", "dept_hr", "Human Resources", "team_hr_ops", "HR Operations", "Feb 2022", 1, 2022, 82, 7, true),
  emp("emp_7", "Noah Patel", "Payroll Specialist", "dept_hr", "Human Resources", "team_hr_ops", "HR Operations", "Nov 2022", 10, 2022, 74, 6, true),
  emp("emp_8", "Lena Fischer", "People Operations Analyst", "dept_hr", "Human Resources", "team_talent", "Talent & People Ops", "Jan 2025", 0, 2025, 62, 2, false),
  emp("emp_10", "Sofia Alvarez", "HR Intern", "dept_hr", "Human Resources", "team_talent", "Talent & People Ops", "May 2026", 4, 2026, 48, 1, false),
  emp("emp_9", "David Kim", "Finance Controller", "dept_finance", "Finance", "team_fpna", "FP&A", "Sep 2020", 8, 2020, 82, 8, true),
];

export function getPerformanceStats(employees: PerformanceEmployee[]) {
  const active = employees.filter((e) => e.score > 0);
  const avgScore = active.length
    ? Math.round(active.reduce((s, e) => s + e.score, 0) / active.length)
    : 0;
  const onTrack = active.filter((e) => e.band === "good").length;
  const atRisk = active.filter((e) => e.band === "low").length;
  const reviewsDue = active.filter((e) => e.reviews.some((r) => r.cycle === "FY 2026 H1")).length;
  return { total: active.length, avgScore, onTrack, atRisk, reviewsDue };
}

export function getTeamsForDepartment(deptId: string, teams = DEMO_PERFORMANCE_TEAMS) {
  return teams.filter((t) => t.departmentId === deptId);
}

export function getEmployeesForTeam(teamId: string, employees = DEMO_PERFORMANCE_EMPLOYEES) {
  return employees.filter((e) => e.teamId === teamId);
}

export function getEmployeesForDepartment(deptId: string, employees = DEMO_PERFORMANCE_EMPLOYEES) {
  return employees.filter((e) => e.departmentId === deptId);
}

export function getTopBottomPerformers(employees: PerformanceEmployee[]) {
  if (employees.length === 0) return { top: null, bottom: null };
  const sorted = [...employees].sort((a, b) => b.score - a.score);
  return { top: sorted[0] ?? null, bottom: sorted[sorted.length - 1] ?? null };
}

export function getDepartmentAnalytics(): CrmChartPoint[] {
  return DEMO_PERFORMANCE_DEPARTMENTS.map((d) => ({
    label: d.name.split(" ")[0] ?? d.name,
    value: d.avgScore,
    color: d.band === "good" ? "#191970" : d.band === "medium" ? "#f59e0b" : "#ef4444",
  }));
}

export function getScoreDistribution(employees = DEMO_PERFORMANCE_EMPLOYEES): CrmChartPoint[] {
  const good = employees.filter((e) => e.band === "good").length;
  const medium = employees.filter((e) => e.band === "medium").length;
  const low = employees.filter((e) => e.band === "low").length;
  return [
    { label: "Good", value: good, color: "#10b981" },
    { label: "Medium", value: medium, color: "#f59e0b" },
    { label: "Low", value: low, color: "#ef4444" },
  ];
}

export function getOrgTrend(): CrmChartPoint[] {
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun"];
  const base = [64, 66, 68, 69, 71, 73];
  return months.map((label, i) => ({ label, value: base[i] ?? 70, color: "#2277ff" }));
}

export function initials(name: string) {
  return name
    .split(" ")
    .map((p) => p[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}
