"use client";

import { AttendanceStatusBadge } from "@/features/workspace/components/hrm/attendance/attendance-status-badge";
import type { AttendanceRecord } from "@/features/workspace/data/hrm-attendance-demo";
import {
  formatDisplayDate,
  isWeekend,
  type SalaryMonthRange,
} from "@/features/workspace/data/hrm-attendance-salary-month";
import { cn } from "@/lib/utils/cn";

type Props = {
  monthDays: AttendanceRecord[];
  range: SalaryMonthRange;
  reference?: Date;
};

export function AttendanceMonthDayList({ monthDays, range, reference = new Date() }: Props) {
  const dayMap = new Map(monthDays.map((d) => [d.date, d]));

  const rows = [];
  const cursor = new Date(range.start);
  while (cursor <= range.end) {
    rows.push(new Date(cursor));
    cursor.setDate(cursor.getDate() + 1);
  }

  return (
    <div className="overflow-hidden rounded-lg border border-slate-200/90 dark:border-slate-800">
      <div className="grid grid-cols-[1fr_auto_auto_auto] gap-2 border-b border-slate-200 bg-slate-50 px-3 py-2 text-[10px] font-semibold uppercase tracking-wide text-slate-400 dark:border-slate-800 dark:bg-slate-950/50">
        <span>Date</span>
        <span className="hidden w-14 text-right sm:block">In</span>
        <span className="hidden w-14 text-right sm:block">Out</span>
        <span className="w-20 text-right">Status</span>
      </div>
      <ul className="max-h-[min(420px,50vh)] divide-y divide-slate-100 overflow-y-auto dark:divide-slate-800">
        {rows.map((date) => {
          const dateStr = formatDisplayDate(date);
          const record = dayMap.get(dateStr);
          const weekend = isWeekend(date);
          const future = date > reference;
          const today =
            date.getDate() === reference.getDate() &&
            date.getMonth() === reference.getMonth() &&
            date.getFullYear() === reference.getFullYear();

          return (
            <li
              key={dateStr}
              className={cn(
                "grid grid-cols-[1fr_auto_auto_auto] items-center gap-2 px-3 py-2.5 text-sm",
                today && "bg-[#191970]/[0.04] dark:bg-blue-950/20",
                future && "opacity-50",
              )}
            >
              <div className="min-w-0">
                <p className={cn("font-medium", today ? "text-[#191970] dark:text-blue-300" : "text-slate-800 dark:text-slate-200")}>
                  {dateStr}
                  {today ? <span className="ml-1.5 text-[10px] font-bold uppercase text-[#191970]">Today</span> : null}
                </p>
                {weekend ? <p className="text-[10px] text-slate-400">Weekend</p> : null}
              </div>
              <span className="hidden w-14 text-right tabular-nums text-xs text-slate-600 sm:block">
                {future ? "—" : record?.checkIn ?? "—"}
              </span>
              <span className="hidden w-14 text-right tabular-nums text-xs text-slate-600 sm:block">
                {future ? "—" : record?.checkOut ?? "—"}
              </span>
              <div className="flex w-20 justify-end">
                {future ? (
                  <span className="text-[10px] font-medium text-slate-400">Upcoming</span>
                ) : weekend && !record ? (
                  <span className="text-[10px] font-medium text-slate-400">Off</span>
                ) : record ? (
                  <AttendanceStatusBadge status={record.status} className="!px-1.5 !py-0 !text-[9px]" />
                ) : (
                  <span className="text-[10px] font-medium text-slate-400">—</span>
                )}
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
