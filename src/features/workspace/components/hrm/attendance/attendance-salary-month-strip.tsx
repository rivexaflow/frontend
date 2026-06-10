"use client";

import type { SalaryMonthSummary } from "@/features/workspace/data/hrm-attendance-salary-month";
import { cn } from "@/lib/utils/cn";

type Props = {
  summary: SalaryMonthSummary;
  compact?: boolean;
  className?: string;
};

export function AttendanceSalaryMonthStrip({ summary, compact, className }: Props) {
  const progress =
    summary.workingDaysElapsed === 0
      ? 0
      : Math.min(100, Math.round((summary.payableDays / summary.workingDaysElapsed) * 100));

  if (compact) {
    return (
      <div className={cn("space-y-1.5", className)}>
        <div className="flex items-center justify-between gap-2 text-[10px]">
          <span className="font-semibold uppercase tracking-wide text-slate-400">Salary month</span>
          <span className="tabular-nums text-slate-500">
            {summary.payableDays}/{summary.workingDaysElapsed} payable
          </span>
        </div>
        <div className="h-1.5 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
          <div
            className="h-full rounded-full bg-[#191970] transition-all"
            style={{ width: `${progress}%` }}
          />
        </div>
        <p className="truncate text-[10px] text-slate-500">{summary.periodLabel}</p>
      </div>
    );
  }

  return (
    <div className={cn("rounded-lg border border-slate-200/90 bg-slate-50/60 p-3 dark:border-slate-800 dark:bg-slate-950/40", className)}>
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-slate-400">Salary month</p>
          <p className="mt-0.5 text-xs font-medium text-slate-700 dark:text-slate-300">{summary.periodLabel}</p>
          <p className="mt-0.5 text-[10px] text-slate-500">Cutoff day {summary.cutoffDay} · {summary.cutoffDay} to {summary.cutoffDay - 1}</p>
        </div>
        <div className="text-right">
          <p className="text-lg font-bold tabular-nums text-[#191970] dark:text-blue-300">{summary.attendanceRate}%</p>
          <p className="text-[10px] text-slate-500">attendance</p>
        </div>
      </div>

      <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-200/80 dark:bg-slate-800">
        <div className="h-full rounded-full bg-[#191970]" style={{ width: `${progress}%` }} />
      </div>

      <div className="mt-3 grid grid-cols-4 gap-2 text-center">
        {[
          { label: "Present", value: summary.present + summary.remote },
          { label: "Late", value: summary.late },
          { label: "Leave", value: summary.onLeave },
          { label: "Absent", value: summary.absent },
        ].map((item) => (
          <div key={item.label} className="rounded-md bg-white px-1 py-1.5 dark:bg-slate-900">
            <p className="text-sm font-bold tabular-nums text-slate-900 dark:text-white">{item.value}</p>
            <p className="text-[9px] font-medium uppercase text-slate-400">{item.label}</p>
          </div>
        ))}
      </div>

      <p className="mt-2 text-center text-[11px] text-slate-500">
        <span className="font-semibold text-slate-700 dark:text-slate-300">{summary.payableDays}</span> payable days ·{" "}
        <span className="font-semibold text-slate-700 dark:text-slate-300">{summary.totalHours}h</span> logged
      </p>
    </div>
  );
}
