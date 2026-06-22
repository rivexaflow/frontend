"use client";

import { useEffect, useMemo, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

import type { AttendanceMonthCalendar } from "@/features/workspace/data/hrm-attendance-salary-month";
import { cn } from "@/lib/utils/cn";

const PAGE_SIZES = [6, 12, 24] as const;
type PageSize = (typeof PAGE_SIZES)[number];

type Props = {
  monthCalendars: AttendanceMonthCalendar[];
  activeYear?: number;
  activeMonth?: number;
  onSelectMonth: (year: number, month: number) => void;
};

export function AttendanceMonthAnalyticsTable({
  monthCalendars,
  activeYear,
  activeMonth,
  onSelectMonth,
}: Props) {
  const rows = useMemo(() => [...monthCalendars].reverse(), [monthCalendars]);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState<PageSize>(6);

  const totalPages = Math.max(1, Math.ceil(rows.length / pageSize));
  const safePage = Math.min(page, totalPages);

  useEffect(() => {
    setPage(1);
  }, [pageSize, monthCalendars.length]);

  const pageRows = rows.slice((safePage - 1) * pageSize, safePage * pageSize);
  const rangeStart = rows.length === 0 ? 0 : (safePage - 1) * pageSize + 1;
  const rangeEnd = Math.min(safePage * pageSize, rows.length);

  return (
    <section className="rounded-2xl border border-slate-200/90 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <div className="flex flex-col gap-3 border-b border-slate-100 px-5 py-4 sm:flex-row sm:items-center sm:justify-between dark:border-slate-800">
        <div>
          <h2 className="text-sm font-bold text-slate-900 dark:text-white">Month-by-month analytics</h2>
          <p className="mt-1 text-xs text-slate-500">
            Attendance percentage, late count, and off days per calendar month
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <label className="flex items-center gap-2 text-xs text-slate-500">
            Rows per page
            <select
              value={pageSize}
              onChange={(e) => setPageSize(Number(e.target.value) as PageSize)}
              className="h-8 rounded-lg border border-slate-200 bg-white px-2 text-sm outline-none focus:border-[#191970] dark:border-slate-700 dark:bg-slate-950"
            >
              {PAGE_SIZES.map((size) => (
                <option key={size} value={size}>
                  {size}
                </option>
              ))}
            </select>
          </label>
          <span className="text-xs text-slate-500">
            <span className="font-semibold tabular-nums text-slate-700 dark:text-slate-300">
              {rangeStart}–{rangeEnd}
            </span>{" "}
            of {rows.length}
          </span>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[720px] text-left text-sm">
          <thead>
            <tr className="border-b border-slate-100 bg-slate-50 text-xs font-medium text-slate-500 dark:border-slate-800 dark:bg-slate-950/50">
              <th className="px-5 py-3">Month</th>
              <th className="px-5 py-3">Attendance</th>
              <th className="px-5 py-3">Present</th>
              <th className="px-5 py-3">Late</th>
              <th className="px-5 py-3">Absent</th>
              <th className="px-5 py-3">Leave</th>
              <th className="px-5 py-3">Off days</th>
              <th className="px-5 py-3">Hours</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            {pageRows.length === 0 ? (
              <tr>
                <td colSpan={8} className="px-5 py-10 text-center text-sm text-slate-500">
                  No monthly records available.
                </td>
              </tr>
            ) : (
              pageRows.map((cal) => {
                const isActive = cal.year === activeYear && cal.month === activeMonth;
                return (
                  <tr
                    key={`${cal.year}-${cal.month}`}
                    onClick={() => onSelectMonth(cal.year, cal.month)}
                    className={cn(
                      "cursor-pointer transition hover:bg-slate-50 dark:hover:bg-slate-800/50",
                      isActive && "bg-[#191970]/[0.04] dark:bg-blue-950/20",
                    )}
                  >
                    <td className="px-5 py-3 font-medium text-slate-900 dark:text-white">{cal.label}</td>
                    <td className="px-5 py-3">
                      <div className="flex min-w-[100px] items-center gap-2">
                        <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-slate-100">
                          <div
                            className="h-full rounded-full bg-gradient-to-r from-[#191970] to-[#2277ff]"
                            style={{ width: `${cal.summary.attendanceRate}%` }}
                          />
                        </div>
                        <span className="w-10 text-right text-xs font-bold tabular-nums text-[#191970]">
                          {cal.summary.attendanceRate}%
                        </span>
                      </div>
                    </td>
                    <td className="px-5 py-3 tabular-nums text-slate-600">{cal.summary.present}</td>
                    <td className="px-5 py-3 tabular-nums text-amber-700">{cal.summary.late}</td>
                    <td className="px-5 py-3 tabular-nums text-rose-600">{cal.summary.absent}</td>
                    <td className="px-5 py-3 tabular-nums text-[#0056ff]">{cal.summary.onLeave}</td>
                    <td className="px-5 py-3 tabular-nums text-slate-500">{cal.summary.offDays}</td>
                    <td className="px-5 py-3 tabular-nums text-slate-600">{cal.summary.totalHours}h</td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {rows.length > pageSize ? (
        <div className="flex flex-col gap-3 border-t border-slate-100 px-5 py-3 sm:flex-row sm:items-center sm:justify-between dark:border-slate-800">
          <p className="text-xs text-slate-500">
            Page <span className="font-semibold text-slate-700 dark:text-slate-300">{safePage}</span> of{" "}
            <span className="font-semibold text-slate-700 dark:text-slate-300">{totalPages}</span>
            <span className="text-slate-400"> · newest first</span>
          </p>
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => setPage(1)}
              disabled={safePage === 1}
              className="h-8 rounded-lg border border-slate-200 px-2.5 text-xs font-medium text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40 dark:border-slate-700 dark:text-slate-400 dark:hover:bg-slate-800"
            >
              First
            </button>
            <button
              type="button"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={safePage === 1}
              className="inline-flex h-8 items-center gap-1 rounded-lg border border-slate-200 px-2.5 text-xs font-medium text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40 dark:border-slate-700 dark:text-slate-400 dark:hover:bg-slate-800"
            >
              <ChevronLeft className="h-3.5 w-3.5" />
              Prev
            </button>
            <button
              type="button"
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={safePage === totalPages}
              className="inline-flex h-8 items-center gap-1 rounded-lg border border-slate-200 px-2.5 text-xs font-medium text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40 dark:border-slate-700 dark:text-slate-400 dark:hover:bg-slate-800"
            >
              Next
              <ChevronRight className="h-3.5 w-3.5" />
            </button>
            <button
              type="button"
              onClick={() => setPage(totalPages)}
              disabled={safePage === totalPages}
              className="h-8 rounded-lg border border-slate-200 px-2.5 text-xs font-medium text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40 dark:border-slate-700 dark:text-slate-400 dark:hover:bg-slate-800"
            >
              Last
            </button>
          </div>
        </div>
      ) : null}
    </section>
  );
}
