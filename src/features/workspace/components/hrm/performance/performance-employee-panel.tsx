"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Calendar, Target, TrendingUp, X } from "lucide-react";

import {
  CrmChartCard,
  CrmTrendChart,
  CrmVerticalBarChart,
} from "@/features/workspace/components/crm/reports/crm-analytics-charts";
import {
  PerformanceBandBadge,
  PerformanceScoreRing,
  PerformanceStageBar,
} from "@/features/workspace/components/hrm/performance/performance-primitives";
import { StatusPill } from "@/features/workspace/components/hrm/hrm-module-table";
import type { PerformanceEmployee } from "@/features/workspace/data/hrm-performance-demo";
import { initials } from "@/features/workspace/data/hrm-performance-demo";
import { cn } from "@/lib/utils/cn";

type Props = {
  employee: PerformanceEmployee | null;
  teamAvg?: number;
  deptAvg?: number;
  onClose: () => void;
};

export function PerformanceEmployeePanel({ employee, teamAvg, deptAvg, onClose }: Props) {
  const currentMonth = employee?.monthlyHistory[employee.monthlyHistory.length - 1];

  return (
    <AnimatePresence>
      {employee ? (
        <>
          <motion.button
            type="button"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-40 bg-slate-900/30 backdrop-blur-[2px]"
            aria-label="Close performance panel"
          />
          <motion.aside
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 28, stiffness: 320 }}
            className="fixed inset-y-0 right-0 z-50 flex w-full max-w-2xl flex-col border-l border-slate-200/90 bg-white shadow-2xl"
          >
            <div className="border-b border-slate-100 bg-gradient-to-r from-[#191970]/[0.04] to-transparent px-5 py-4">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3">
                  <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#191970] text-sm font-bold text-white">
                    {initials(employee.name)}
                  </span>
                  <div>
                    <h2 className="text-lg font-bold text-slate-900">{employee.name}</h2>
                    <p className="text-sm text-slate-500">{employee.designation}</p>
                    <p className="mt-0.5 text-xs text-slate-400">
                      {employee.departmentName} · {employee.teamName}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={onClose}
                  className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
                  aria-label="Close"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="mt-4 flex flex-wrap items-center gap-4">
                <PerformanceScoreRing score={employee.score} band={employee.band} size={64} />
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wide text-slate-400">Current month</p>
                  <PerformanceBandBadge band={employee.band} />
                  <p className="mt-1 flex items-center gap-1 text-xs font-semibold text-emerald-600">
                    <TrendingUp className="h-3.5 w-3.5" />
                    {employee.trendUp ? "+" : "−"}
                    {employee.trendPct}% vs last month
                  </p>
                </div>
                <PerformanceStageBar
                  stage={employee.stage}
                  progress={employee.stageProgress}
                  band={employee.band}
                />
              </div>
            </div>

            <div className="flex-1 space-y-5 overflow-y-auto p-5">
              <div className="grid gap-3 sm:grid-cols-3">
                <StatTile label="Joined" value={employee.joinedAt} icon={Calendar} />
                <StatTile
                  label="Team avg"
                  value={teamAvg != null ? String(teamAvg) : "—"}
                  hint="vs your score"
                />
                <StatTile
                  label="Dept avg"
                  value={deptAvg != null ? String(deptAvg) : "—"}
                  hint="benchmark"
                />
              </div>

              {currentMonth ? (
                <div className="rounded-xl border border-slate-200/80 bg-slate-50/50 p-4">
                  <p className="text-[10px] font-bold uppercase tracking-wide text-slate-400">This month snapshot</p>
                  <div className="mt-3 grid gap-3 sm:grid-cols-3">
                    <MiniMetric label="Score" value={String(currentMonth.score)} />
                    <MiniMetric
                      label="Goals"
                      value={`${currentMonth.goalsCompleted}/${currentMonth.goalsTotal}`}
                    />
                    <MiniMetric label="Attendance" value={`${currentMonth.attendancePct}%`} />
                  </div>
                </div>
              ) : null}

              <CrmChartCard
                title="Performance since joining"
                subtitle={`${employee.monthlyHistory.length} months · ${employee.joinedAt} to present`}
                accent
              >
                <CrmTrendChart
                  data={employee.monthlyHistory.map((m) => ({
                    label: m.month.split(" ")[0] ?? m.month,
                    value: m.score,
                    color: "#2277ff",
                  }))}
                />
              </CrmChartCard>

              <CrmChartCard title="Monthly scores" subtitle="Bar view from join date">
                <CrmVerticalBarChart
                  data={employee.monthlyHistory.map((m) => ({
                    label: m.month.split(" ")[0] ?? m.month,
                    value: m.score,
                    color: m.score >= 70 ? "#191970" : m.score >= 45 ? "#f59e0b" : "#ef4444",
                  }))}
                  formatValue={(n: number) => String(n)}
                />
              </CrmChartCard>

              <div className="rounded-xl border border-slate-200/80 p-4">
                <div className="mb-3 flex items-center gap-2">
                  <Target className="h-4 w-4 text-[#191970]" />
                  <h3 className="text-sm font-bold text-slate-900">KPIs & goals</h3>
                </div>
                <div className="space-y-3">
                  {employee.kpis.map((kpi) => (
                    <div key={kpi.id}>
                      <div className="flex justify-between text-xs">
                        <span className="font-medium text-slate-600">{kpi.label}</span>
                        <span className="font-bold tabular-nums text-slate-900">
                          {kpi.value}
                          {kpi.unit ?? ""} / {kpi.target}
                          {kpi.unit ?? ""}
                        </span>
                      </div>
                      <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-slate-100">
                        <div
                          className="h-full rounded-full bg-[#2277ff]"
                          style={{ width: `${Math.min(100, (kpi.value / kpi.target) * 100)}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-4 space-y-2 border-t border-slate-100 pt-4">
                  {employee.goals.map((goal) => (
                    <div key={goal.id} className="flex items-start justify-between gap-2 rounded-lg bg-slate-50 px-3 py-2">
                      <div>
                        <p className="text-sm font-medium text-slate-800">{goal.title}</p>
                        <p className="text-[11px] text-slate-400">Due {goal.due}</p>
                      </div>
                      <StatusPill
                        label={goal.status.replace("_", " ")}
                        tone={goal.status === "completed" ? "success" : goal.status === "at_risk" ? "danger" : "warning"}
                      />
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-xl border border-slate-200/80 p-4">
                <h3 className="text-sm font-bold text-slate-900">Review history</h3>
                <div className="mt-3 space-y-3">
                  {employee.reviews.map((review) => (
                    <div key={review.id} className="rounded-lg border border-slate-100 px-3 py-2.5">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-semibold text-slate-800">{review.cycle}</p>
                        <span className="text-sm font-bold text-[#191970]">{review.rating} / 5</span>
                      </div>
                      <p className="mt-1 text-xs text-slate-500">
                        {review.reviewer} · {review.date}
                      </p>
                      <p className="mt-2 text-sm text-slate-600">{review.summary}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </motion.aside>
        </>
      ) : null}
    </AnimatePresence>
  );
}

function StatTile({
  label,
  value,
  hint,
  icon: Icon,
}: {
  label: string;
  value: string;
  hint?: string;
  icon?: React.ElementType;
}) {
  return (
    <div className="rounded-xl border border-slate-200/80 bg-white px-3 py-2.5">
      <p className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wide text-slate-400">
        {Icon ? <Icon className="h-3 w-3" /> : null}
        {label}
      </p>
      <p className="mt-1 text-lg font-bold tabular-nums text-slate-900">{value}</p>
      {hint ? <p className="text-[10px] text-slate-400">{hint}</p> : null}
    </div>
  );
}

function MiniMetric({ label, value }: { label: string; value: string }) {
  return (
    <div className="text-center">
      <p className="text-[10px] font-bold uppercase tracking-wide text-slate-400">{label}</p>
      <p className="text-xl font-bold tabular-nums text-[#191970]">{value}</p>
    </div>
  );
}
