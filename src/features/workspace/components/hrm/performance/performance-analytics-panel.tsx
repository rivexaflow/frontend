"use client";

import {
  CrmChartCard,
  CrmDonutChart,
  CrmTrendChart,
  CrmVerticalBarChart,
} from "@/features/workspace/components/crm/reports/crm-analytics-charts";
import { OrgChartStatStrip } from "@/features/workspace/components/hrm/org-chart-stat-strip";
import {
  DEMO_PERFORMANCE_DEPARTMENTS,
  DEMO_PERFORMANCE_EMPLOYEES,
  getDepartmentAnalytics,
  getOrgTrend,
  getPerformanceStats,
  getScoreDistribution,
  getTopBottomPerformers,
} from "@/features/workspace/data/hrm-performance-demo";
import { Award, BarChart3, Target, Users } from "lucide-react";

export function PerformanceAnalyticsPanel() {
  const stats = getPerformanceStats(DEMO_PERFORMANCE_EMPLOYEES);
  const { top, bottom } = getTopBottomPerformers(DEMO_PERFORMANCE_EMPLOYEES);
  const deptChart = getDepartmentAnalytics();
  const distribution = getScoreDistribution();
  const orgTrend = getOrgTrend();

  return (
    <div className="space-y-4">
      <OrgChartStatStrip
        stats={[
          { label: "Org avg score", value: stats.avgScore, hint: "All employees", icon: BarChart3, tone: "blue" },
          { label: "On track", value: stats.onTrack, hint: "Good band", icon: Target, tone: "emerald" },
          { label: "Needs support", value: stats.atRisk, hint: "Low band", icon: Users, tone: "amber" },
        ]}
      />

      <div className="grid gap-4 lg:grid-cols-2">
        <CrmChartCard title="Org performance trend" subtitle="Average score · last 6 months" accent>
          <CrmTrendChart data={orgTrend} formatValue={(n) => String(n)} />
        </CrmChartCard>

        <CrmChartCard title="Score distribution" subtitle="Employees by performance band">
          <CrmDonutChart
            data={distribution}
            centerLabel="Employees"
            centerValue={String(stats.total)}
          />
        </CrmChartCard>
      </div>

      <CrmChartCard title="Department comparison" subtitle="Average score by department">
        <CrmVerticalBarChart data={deptChart} formatValue={(n: number) => String(n)} />
      </CrmChartCard>

      <div className="grid gap-4 sm:grid-cols-2">
        {top ? (
          <div className="rounded-xl border border-emerald-200/80 bg-emerald-50/50 p-4">
            <p className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wide text-emerald-700">
              <Award className="h-3.5 w-3.5" />
              Organization top performer
            </p>
            <p className="mt-2 text-lg font-bold text-slate-900">{top.name}</p>
            <p className="text-sm text-slate-500">
              {top.designation} · {top.departmentName}
            </p>
            <p className="mt-2 text-2xl font-bold tabular-nums text-emerald-700">{top.score}</p>
          </div>
        ) : null}
        {bottom && top && bottom.id !== top.id ? (
          <div className="rounded-xl border border-rose-200/80 bg-rose-50/50 p-4">
            <p className="text-[10px] font-bold uppercase tracking-wide text-rose-600">Needs coaching focus</p>
            <p className="mt-2 text-lg font-bold text-slate-900">{bottom.name}</p>
            <p className="text-sm text-slate-500">
              {bottom.designation} · {bottom.departmentName}
            </p>
            <p className="mt-2 text-2xl font-bold tabular-nums text-rose-600">{bottom.score}</p>
          </div>
        ) : null}
      </div>

      <div className="rounded-xl border border-[#2277ff]/15 bg-[#2277ff]/[0.04] px-4 py-3 text-sm text-slate-600">
        <strong className="font-semibold text-slate-800">{DEMO_PERFORMANCE_DEPARTMENTS.length} departments</strong>{" "}
        tracked across {stats.total} employees. Drill into any department from the Overview tab to see team and
        individual performance.
      </div>
    </div>
  );
}
