"use client";

import type { AttendanceStatus } from "@/features/workspace/data/hrm-attendance-demo";
import type { AttendanceMonthCalendar, CalendarDayCell } from "@/features/workspace/data/hrm-attendance-salary-month";
import { cn } from "@/lib/utils/cn";

const WEEKDAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

const STATUS_CELL: Record<AttendanceStatus, string> = {
  present: "bg-emerald-500 text-white",
  remote: "bg-sky-500 text-white",
  late: "bg-amber-500 text-white",
  half_day: "bg-orange-500 text-white",
  on_leave: "bg-violet-500 text-white",
  absent: "bg-rose-500 text-white",
};

const STATUS_LABEL: Record<AttendanceStatus, string> = {
  present: "Present",
  remote: "Remote",
  late: "Late",
  half_day: "Half day",
  on_leave: "Leave",
  absent: "Absent",
};

type Props = {
  calendar: AttendanceMonthCalendar;
  compact?: boolean;
  selectedDate?: string | null;
  onSelectDay?: (cell: CalendarDayCell) => void;
};

function DayCell({
  cell,
  compact,
  selected,
  onSelect,
}: {
  cell: CalendarDayCell | null;
  compact?: boolean;
  selected: boolean;
  onSelect?: (cell: CalendarDayCell) => void;
}) {
  if (!cell) {
    return <div className={cn(compact ? "h-8" : "h-10")} />;
  }

  const { record, isBeforeJoin, isFuture, isWeekend, isToday, inSalaryMonth } = cell;
  const status = record?.status;
  const clickable = !isBeforeJoin && !isFuture && onSelect;

  return (
    <button
      type="button"
      disabled={!clickable}
      onClick={() => clickable && onSelect?.(cell)}
      title={
        record
          ? `${cell.dateLabel} · ${STATUS_LABEL[record.status]}${record.checkIn ? ` · ${record.checkIn}` : ""}`
          : cell.dateLabel
      }
      className={cn(
        "relative flex flex-col items-center justify-center rounded-lg border text-center transition",
        compact ? "h-8 text-[10px]" : "h-10 text-xs",
        isBeforeJoin && "border-transparent bg-transparent text-slate-300",
        isFuture && !isBeforeJoin && "border-slate-100 bg-slate-50/50 text-slate-300 dark:border-slate-800 dark:bg-slate-900/30",
        !isBeforeJoin &&
          !isFuture &&
          isWeekend &&
          !status &&
          "border-slate-100 bg-slate-50 text-slate-400 dark:border-slate-800 dark:bg-slate-900/50",
        !isBeforeJoin && !isFuture && status && "border-transparent font-semibold",
        status && STATUS_CELL[status],
        isToday && "ring-2 ring-[#191970] ring-offset-1 dark:ring-offset-slate-950",
        selected && "ring-2 ring-slate-900 ring-offset-1 dark:ring-white dark:ring-offset-slate-950",
        inSalaryMonth && !status && !isWeekend && !isFuture && !isBeforeJoin && "border-dashed border-[#191970]/25",
        clickable && "hover:scale-105 hover:shadow-sm",
        !clickable && "cursor-default",
      )}
    >
      <span>{cell.dayOfMonth}</span>
      {!compact && record?.checkIn ? (
        <span className="text-[8px] font-normal opacity-90">{record.checkIn}</span>
      ) : null}
    </button>
  );
}

export function AttendanceCalendarMonth({ calendar, compact, selectedDate, onSelectDay }: Props) {
  return (
    <div className={cn("rounded-xl border border-slate-200/90 bg-white dark:border-slate-800 dark:bg-slate-900", compact ? "p-3" : "p-4")}>
      <div className={cn("mb-3 flex flex-wrap items-end justify-between gap-2", compact && "mb-2")}>
        <div>
          <h3 className={cn("font-semibold text-slate-900 dark:text-white", compact ? "text-sm" : "text-base")}>
            {calendar.label}
          </h3>
          {!compact ? (
            <p className="text-xs text-slate-500">Salary cycle includes days marked with dashed border</p>
          ) : null}
        </div>
        <div className="flex flex-wrap gap-2 text-center">
          {[
            { label: "Rate", value: `${calendar.summary.attendanceRate}%` },
            { label: "Late", value: calendar.summary.late },
            { label: "Off", value: calendar.summary.offDays },
          ].map((s) => (
            <div key={s.label} className="rounded-md bg-slate-50 px-2 py-1 dark:bg-slate-800">
              <p className="text-[9px] font-semibold uppercase text-slate-400">{s.label}</p>
              <p className="text-xs font-bold tabular-nums text-slate-800 dark:text-slate-200">{s.value}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-7 gap-1">
        {WEEKDAYS.map((d) => (
          <div
            key={d}
            className={cn(
              "text-center font-semibold uppercase text-slate-400",
              compact ? "pb-1 text-[9px]" : "pb-1.5 text-[10px]",
            )}
          >
            {d}
          </div>
        ))}
        {calendar.weeks.flat().map((cell, idx) => (
          <DayCell
            key={cell?.dateLabel ?? `empty-${idx}`}
            cell={cell}
            compact={compact}
            selected={!!cell && cell.dateLabel === selectedDate}
            onSelect={onSelectDay}
          />
        ))}
      </div>
    </div>
  );
}

export function AttendanceCalendarLegend({ className }: { className?: string }) {
  const items: { status: AttendanceStatus; label: string }[] = [
    { status: "present", label: "Present" },
    { status: "remote", label: "Remote" },
    { status: "late", label: "Late" },
    { status: "half_day", label: "Half day" },
    { status: "on_leave", label: "Leave" },
    { status: "absent", label: "Absent" },
  ];

  return (
    <div className={cn("flex flex-wrap items-center gap-3", className)}>
      {items.map((item) => (
        <span key={item.status} className="inline-flex items-center gap-1.5 text-xs text-slate-600 dark:text-slate-400">
          <span className={cn("h-2.5 w-2.5 rounded-sm", STATUS_CELL[item.status])} />
          {item.label}
        </span>
      ))}
      <span className="inline-flex items-center gap-1.5 text-xs text-slate-600 dark:text-slate-400">
        <span className="h-2.5 w-2.5 rounded-sm border border-dashed border-[#191970]/40 bg-white" />
        Salary month day
      </span>
    </div>
  );
}
