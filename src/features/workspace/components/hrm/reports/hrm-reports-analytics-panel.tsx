"use client";

import {
  CrmChartCard,
  CrmDonutChart,
  CrmKpiStrip,
  CrmTrendChart,
  CrmVerticalBarChart,
} from "@/features/workspace/components/crm/reports/crm-analytics-charts";
import { OrgChartStatStrip } from "@/features/workspace/components/hrm/org-chart-stat-strip";
import {
  getHrmReportAnalytics,
  type HrmReportInsight,
} from "@/features/workspace/data/hrm-reports-analytics-demo";
import { HRM_REPORT_CATEGORIES } from "@/features/workspace/data/hrm-reports-demo";
import { AlertCircle, BarChart3, CheckCircle2, Info, TrendingUp } from "lucide-react";
import { cn } from "@/lib/utils/cn";

const DATE_PRESETS = [
  { id: "30d", label: "30 days" },
  { id: "90d", label: "Quarter" },
  { id: "ytd", label: "YTD" },
  { id: "12m", label: "12 months" },
] as const;

type Props = {
  datePreset: (typeof DATE_PRESETS)[number]["id"];
  onDatePresetChange: (id: (typeof DATE_PRESETS)[number]["id"]) => void;
  onGenerateFromInsight?: (category: string) => void;
};

function InsightCard({
  insight,
  onGenerate,
}: {
  insight: HrmReportInsight;
  onGenerate?: () => void;
}) {
  const categoryLabel =
    HRM_REPORT_CATEGORIES.find((c) => c.id === insight.category)?.label ?? insight.category;

  const toneStyles = {
    info: "border-[#2277ff]/20 bg-[#2277ff]/[0.04]",
    success: "border-emerald-200/80 bg-emerald-50/50",
    warning: "border-amber-200/80 bg-amber-50/50",
  };

  const Icon =
    insight.tone === "success" ? CheckCircle2 : insight.tone === "warning" ? AlertCircle : Info;

  const iconColor =
    insight.tone === "success"
      ? "text-emerald-600"
      : insight.tone === "warning"
        ? "text-amber-600"
        : "text-[#2277ff]";

  return (
    <article className={cn("rounded-xl border p-4", toneStyles[insight.tone])}>
      <div className="flex items-start gap-2">
        <Icon className={cn("mt-0.5 h-4 w-4 shrink-0", iconColor)} />
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold text-slate-900">{insight.title}</p>
          <p className="mt-1 text-xs leading-relaxed text-slate-600">{insight.body}</p>
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <span className="rounded-md bg-white/80 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-slate-500 ring-1 ring-slate-200/80">
              {categoryLabel}
            </span>
            {onGenerate ? (
              <button
                type="button"
                onClick={onGenerate}
                className="text-[11px] font-semibold text-[#191970] hover:underline"
              >
                Generate related report →
              </button>
            ) : null}
          </div>
        </div>
      </div>
    </article>
  );
}

export function HrmReportsAnalyticsPanel({
  datePreset,
  onDatePresetChange,
  onGenerateFromInsight,
}: Props) {
  const data = getHrmReportAnalytics();

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="inline-flex rounded-xl border border-slate-200/80 bg-slate-50/80 p-1">
          {DATE_PRESETS.map((p) => (
            <button
              key={p.id}
              type="button"
              onClick={() => onDatePresetChange(p.id)}
              className={cn(
                "rounded-lg px-3.5 py-1.5 text-xs font-semibold transition",
                datePreset === p.id
                  ? "bg-white text-[#191970] shadow-sm"
                  : "text-slate-500 hover:text-slate-700",
              )}
            >
              {p.label}
            </button>
          ))}
        </div>
        <p className="text-xs text-slate-500">
          Workforce metrics · updated from live HR modules
        </p>
      </div>

      <CrmKpiStrip items={data.kpis} />

      <OrgChartStatStrip
        stats={[
          {
            label: "Open roles",
            value: 6,
            hint: "Across departments",
            icon: TrendingUp,
            tone: "blue",
          },
          {
            label: "Payroll (May)",
            value: "₹4.6Cr",
            hint: "Gross run",
            icon: BarChart3,
            tone: "emerald",
          },
          {
            label: "Late arrivals",
            value: 14,
            hint: "This month",
            icon: AlertCircle,
            tone: "amber",
          },
        ]}
      />

      <div className="grid gap-4 lg:grid-cols-2">
        <CrmChartCard title="Headcount trend" subtitle="Active employees · last 6 months" accent>
          <CrmTrendChart data={data.headcountTrend} formatValue={(n) => String(n)} />
        </CrmChartCard>

        <CrmChartCard title="Policy compliance" subtitle="Acknowledgment status · org-wide">
          <CrmDonutChart
            data={data.complianceBreakdown}
            centerLabel="Compliance"
            centerValue="91%"
          />
        </CrmChartCard>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <CrmChartCard title="Attendance by department" subtitle="Compliance % · current month">
          <CrmVerticalBarChart data={data.attendanceByDept} formatValue={(n) => `${n}%`} />
        </CrmChartCard>

        <CrmChartCard title="Leave utilization" subtitle="Days consumed by leave type · YTD">
          <CrmDonutChart data={data.leaveUtilization} centerLabel="Days used" centerValue="90" />
        </CrmChartCard>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <CrmChartCard title="Payroll cost trend" subtitle="Gross payroll · ₹ Crores · 6 months">
          <CrmTrendChart data={data.payrollTrend} formatValue={(n) => `₹${n}`} />
        </CrmChartCard>

        <CrmChartCard title="Monthly attrition rate" subtitle="Exits as % of headcount">
          <CrmTrendChart data={data.attritionTrend} formatValue={(n) => `${n}%`} />
        </CrmChartCard>
      </div>

      <div>
        <h3 className="mb-3 text-sm font-bold text-slate-900">Insights & recommended exports</h3>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {data.insights.map((insight) => (
            <InsightCard
              key={insight.id}
              insight={insight}
              onGenerate={
                onGenerateFromInsight
                  ? () => onGenerateFromInsight(insight.category)
                  : undefined
              }
            />
          ))}
        </div>
      </div>
    </div>
  );
}
