"use client";

import { useMemo, useState } from "react";
import { ChevronLeft, ChevronRight, Clock, LogIn, LogOut, Plane } from "lucide-react";

import type { AttendanceMonthCalendar } from "@/features/workspace/data/hrm-attendance-salary-month";
import type { CalendarDayCell } from "@/features/workspace/data/hrm-attendance-salary-month";
import {
  rebuildSunFirstWeeks,
  resolveMyAttendanceDay,
  type MyAttendanceDayDisplay,
} from "@/features/workspace/components/hrm/attendance/my-attendance-utils";
import { cn } from "@/lib/utils/cn";

const WEEKDAYS = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];

const STATUS_DOT: Record<string, string> = {
  Present: "bg-emerald-500",
  Active: "bg-[#2277FF]",
  "Half Day": "bg-amber-400",
  Absent: "bg-rose-500",
  "On Leave": "bg-violet-500",
  "Week Off": "bg-slate-300",
  Regularized: "bg-orange-500",
};

const STATUS_TEXT: Record<string, string> = {
  Present: "text-emerald-700",
  Active: "text-[#2277FF]",
  "Half Day": "text-amber-700",
  Absent: "text-rose-600",
  "On Leave": "text-violet-600",
  "Week Off": "text-slate-400",
  Regularized: "text-orange-600",
};

function CalendarDay({
  cell,
  display,
}: {
  cell: CalendarDayCell | null;
  display: MyAttendanceDayDisplay | null;
}) {
  if (!cell) {
    return <div className="min-h-[88px] border border-transparent" />;
  }

  const isToday = cell.isToday;
  const isEmpty = display?.kind === "empty" || display?.kind === "future";

  return (
    <div
      className={cn(
        "relative min-h-[88px] border border-slate-100 bg-white p-2 transition dark:border-slate-800 dark:bg-slate-900",
        isToday && "ring-2 ring-[#191970] ring-offset-1 dark:ring-[#2277FF]",
        display?.kind === "week_off" && "bg-slate-50/80 dark:bg-slate-950/40",
      )}
    >
      <div className="flex items-start justify-between gap-1">
        <span
          className={cn(
            "text-xs font-bold tabular-nums",
            isToday ? "text-[#191970] dark:text-[#2277FF]" : "text-slate-700 dark:text-slate-200",
          )}
        >
          {cell.dayOfMonth}
        </span>
        {display?.breakMinutes ? (
          <span className="inline-flex items-center gap-0.5 rounded-md bg-amber-50 px-1 py-0.5 text-[9px] font-semibold text-amber-700 dark:bg-amber-950/40 dark:text-amber-300">
            <Clock className="h-2.5 w-2.5" />
            {display.breakMinutes}m
          </span>
        ) : null}
      </div>

      {display?.kind === "absent" ? (
        <div className="mt-2 flex flex-col items-center gap-1">
          <Plane className="h-4 w-4 text-rose-300" />
          <StatusPill label={display.statusLabel} />
        </div>
      ) : null}

      {display && !isEmpty && display.kind !== "absent" && display.kind !== "week_off" ? (
        <div className="mt-1.5 space-y-0.5">
          {display.checkIn ? (
            <p className="flex items-center gap-1 text-[10px] text-slate-600 dark:text-slate-300">
              <LogIn className="h-2.5 w-2.5 text-emerald-600" />
              {display.checkIn}
            </p>
          ) : null}
          {display.checkOut ? (
            <p className="flex items-center gap-1 text-[10px] text-slate-600 dark:text-slate-300">
              <LogOut className="h-2.5 w-2.5 text-rose-500" />
              {display.checkOut}
            </p>
          ) : null}
          <StatusPill label={display.statusLabel} />
          {display.durationLabel ? (
            <p className="text-right text-[10px] font-semibold tabular-nums text-slate-500">{display.durationLabel}</p>
          ) : null}
        </div>
      ) : null}

      {display?.kind === "week_off" ? (
        <div className="mt-3">
          <StatusPill label={display.statusLabel} />
        </div>
      ) : null}
    </div>
  );
}

function StatusPill({ label }: { label: string }) {
  const dot = STATUS_DOT[label] ?? "bg-slate-300";
  const text = STATUS_TEXT[label] ?? "text-slate-500";
  return (
    <p className={cn("flex items-center gap-1 text-[10px] font-semibold", text)}>
      <span className={cn("h-1.5 w-1.5 rounded-full", dot)} />
      {label}
    </p>
  );
}

type Props = {
  calendars: AttendanceMonthCalendar[];
  employeeCode: string;
  isCurrentlyActive: boolean;
  reference?: Date;
};

export function MyAttendanceCalendar({
  calendars,
  employeeCode,
  isCurrentlyActive,
  reference = new Date(),
}: Props) {
  const defaultIndex = Math.max(0, calendars.length - 1);
  const [index, setIndex] = useState(defaultIndex);

  const calendar = calendars[index] ?? calendars[calendars.length - 1];
  const canPrev = index > 0;
  const canNext = index < calendars.length - 1;

  const sunWeeks = useMemo(() => {
    if (!calendar) return [];
    return rebuildSunFirstWeeks(calendar.weeks, calendar.year, calendar.month);
  }, [calendar]);

  const displayMap = useMemo(() => {
    if (!calendar) return new Map<string, MyAttendanceDayDisplay>();
    const map = new Map<string, MyAttendanceDayDisplay>();
    for (const week of sunWeeks) {
      for (const cell of week) {
        if (!cell) continue;
        map.set(cell.dateLabel, resolveMyAttendanceDay(cell, employeeCode, isCurrentlyActive));
      }
    }
    return map;
  }, [calendar, sunWeeks, employeeCode, isCurrentlyActive]);

  if (!calendar) return null;

  const goToday = () => {
    const todayIdx = calendars.findIndex(
      (c) => c.year === reference.getFullYear() && c.month === reference.getMonth(),
    );
    if (todayIdx >= 0) setIndex(todayIdx);
  };

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200/90 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 px-4 py-3 dark:border-slate-800">
        <div className="flex items-center gap-2">
          <button
            type="button"
            disabled={!canPrev}
            onClick={() => setIndex((i) => Math.max(0, i - 1))}
            className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 text-slate-500 transition hover:bg-slate-50 disabled:opacity-30 dark:border-slate-700"
            aria-label="Previous month"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <h3 className="min-w-[120px] text-center text-sm font-bold text-slate-900 dark:text-white">
            {calendar.label}
          </h3>
          <button
            type="button"
            disabled={!canNext}
            onClick={() => setIndex((i) => Math.min(calendars.length - 1, i + 1))}
            className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 text-slate-500 transition hover:bg-slate-50 disabled:opacity-30 dark:border-slate-700"
            aria-label="Next month"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
        <button
          type="button"
          onClick={goToday}
          className="rounded-lg border border-[#191970]/20 bg-[#191970]/5 px-3 py-1.5 text-xs font-semibold text-[#191970] transition hover:bg-[#191970]/10 dark:border-[#2277FF]/30 dark:bg-[#2277FF]/10 dark:text-[#2277FF]"
        >
          Today
        </button>
      </div>

      <div className="grid grid-cols-7 border-b border-slate-100 bg-slate-50/80 dark:border-slate-800 dark:bg-slate-950/50">
        {WEEKDAYS.map((day) => (
          <div
            key={day}
            className="border-r border-slate-100 px-2 py-2 text-center text-[10px] font-bold tracking-wide text-slate-400 last:border-r-0 dark:border-slate-800"
          >
            {day}
          </div>
        ))}
      </div>

      <div className="divide-y divide-slate-100 dark:divide-slate-800">
        {sunWeeks.map((week, weekIdx) => (
          <div key={weekIdx} className="grid grid-cols-7">
            {week.map((cell, cellIdx) => (
              <CalendarDay
                key={cell?.dateLabel ?? `empty-${weekIdx}-${cellIdx}`}
                cell={cell}
                display={cell ? displayMap.get(cell.dateLabel) ?? null : null}
              />
            ))}
          </div>
        ))}
      </div>

      <div className="flex flex-wrap items-center gap-x-4 gap-y-2 border-t border-slate-100 px-4 py-3 dark:border-slate-800">
        {[
          { label: "Present", dot: "bg-emerald-500" },
          { label: "Active", dot: "bg-[#2277FF]" },
          { label: "Half Day", dot: "bg-amber-400" },
          { label: "Absent", dot: "bg-rose-500" },
          { label: "On Leave", dot: "bg-violet-500" },
          { label: "Week Off", dot: "bg-slate-300" },
          { label: "Regularization", dot: "bg-orange-500" },
        ].map((item) => (
          <span key={item.label} className="inline-flex items-center gap-1.5 text-[11px] text-slate-600 dark:text-slate-300">
            <span className={cn("h-2 w-2 rounded-full", item.dot)} />
            {item.label}
          </span>
        ))}
        <span className="inline-flex items-center gap-1.5 text-[11px] text-slate-600 dark:text-slate-300">
          <Clock className="h-3 w-3 text-amber-600" />
          Break time
        </span>
      </div>
    </div>
  );
}
