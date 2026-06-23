"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";

import type { AttendanceStatus } from "@/features/workspace/data/hrm-attendance-demo";
import type { AttendanceMonthCalendar, CalendarDayCell } from "@/features/workspace/data/hrm-attendance-salary-month";
import { cn } from "@/lib/utils/cn";

const WEEKDAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

const STATUS_CELL: Record<AttendanceStatus, string> = {
  present: "bg-emerald-500 text-white shadow-emerald-500/20",
  remote: "bg-sky-500 text-white shadow-sky-500/20",
  late: "bg-amber-500 text-white shadow-amber-500/20",
  half_day: "bg-orange-500 text-white shadow-orange-500/20",
  on_leave: "bg-[#2277ff] text-white shadow-[#2277ff]/20",
  absent: "bg-rose-500 text-white shadow-rose-500/20",
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
  onPrevMonth?: () => void;
  onNextMonth?: () => void;
  canPrev?: boolean;
  canNext?: boolean;
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
    return <div className={cn(compact ? "h-9" : "h-[3.25rem]")} />;
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
        "group relative flex flex-col items-center justify-center rounded-xl border text-center transition-all",
        compact ? "h-9 text-[10px]" : "h-[3.25rem] text-xs",
        isBeforeJoin && "border-transparent bg-transparent text-slate-300",
        isFuture && !isBeforeJoin && "border-slate-100/80 bg-slate-50/60 text-slate-300",
        !isBeforeJoin &&
          !isFuture &&
          isWeekend &&
          !status &&
          "border-slate-100 bg-slate-50/80 text-slate-400",
        !isBeforeJoin && !isFuture && status && "border-transparent font-semibold shadow-sm",
        status && STATUS_CELL[status],
        inSalaryMonth && !status && !isWeekend && !isFuture && !isBeforeJoin && "border-[#2277ff]/20 bg-[#2277ff]/[0.04]",
        isToday && "ring-2 ring-[#191970] ring-offset-2",
        selected && !isToday && "ring-2 ring-[#2277ff] ring-offset-1",
        clickable && "hover:scale-[1.04] hover:shadow-md",
        !clickable && "cursor-default",
      )}
    >
      <span className="font-bold">{cell.dayOfMonth}</span>
      {!compact && record?.checkIn ? (
        <span className="mt-0.5 text-[8px] font-medium opacity-90">{record.checkIn}</span>
      ) : null}
      {status && !compact ? (
        <span className="absolute -right-0.5 -top-0.5 h-1.5 w-1.5 rounded-full bg-white/90 ring-1 ring-black/5" />
      ) : null}
    </button>
  );
}

export function AttendanceCalendarMonth({
  calendar,
  compact,
  selectedDate,
  onSelectDay,
  onPrevMonth,
  onNextMonth,
  canPrev = true,
  canNext = true,
}: Props) {
  return (
    <div
      className={cn(
        "overflow-hidden rounded-2xl border border-slate-200/90 bg-gradient-to-b from-white to-slate-50/50 shadow-sm dark:border-slate-800 dark:from-slate-900 dark:to-slate-950/50",
        compact ? "p-3" : "p-0",
      )}
    >
      <div
        className={cn(
          "flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 bg-gradient-to-r from-[#191970]/[0.04] to-transparent",
          compact ? "mb-2 px-3 py-2" : "px-5 py-4",
        )}
      >
        <div className="flex items-center gap-2">
          {!compact && onPrevMonth ? (
            <button
              type="button"
              onClick={onPrevMonth}
              disabled={!canPrev}
              className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 text-slate-500 transition hover:bg-white disabled:opacity-30"
              aria-label="Previous month"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
          ) : null}
          <div>
            <h3 className={cn("font-bold text-slate-900 dark:text-white", compact ? "text-sm" : "text-base")}>
              {calendar.label}
            </h3>
            {!compact ? (
              <p className="mt-0.5 text-xs text-slate-500">Color-coded attendance heatmap · click a day for details</p>
            ) : null}
          </div>
          {!compact && onNextMonth ? (
            <button
              type="button"
              onClick={onNextMonth}
              disabled={!canNext}
              className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 text-slate-500 transition hover:bg-white disabled:opacity-30"
              aria-label="Next month"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          ) : null}
        </div>

        <div className="flex flex-wrap gap-2">
          {[
            { label: "Rate", value: `${calendar.summary.attendanceRate}%`, tone: "text-[#191970]" },
            { label: "Present", value: calendar.summary.present + calendar.summary.remote, tone: "text-emerald-700" },
            { label: "Late", value: calendar.summary.late, tone: "text-amber-700" },
            { label: "Absent", value: calendar.summary.absent, tone: "text-rose-600" },
          ].map((s) => (
            <div key={s.label} className="rounded-lg border border-slate-200/80 bg-white px-2.5 py-1.5 shadow-sm">
              <p className="text-[9px] font-bold uppercase tracking-wide text-slate-400">{s.label}</p>
              <p className={cn("text-sm font-bold tabular-nums", s.tone)}>{s.value}</p>
            </div>
          ))}
        </div>
      </div>

      <div className={cn(compact ? "px-2 pb-2" : "px-5 py-4")}>
        <div className="grid grid-cols-7 gap-1.5">
          {WEEKDAYS.map((d) => (
            <div
              key={d}
              className={cn(
                "pb-1 text-center text-[10px] font-bold uppercase tracking-wide text-slate-400",
                (d === "Sat" || d === "Sun") && "text-slate-300",
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
    <div className={cn("flex flex-wrap items-center gap-x-4 gap-y-2", className)}>
      {items.map((item) => (
        <span key={item.status} className="inline-flex items-center gap-1.5 text-xs text-slate-600">
          <span className={cn("h-3 w-3 rounded-md shadow-sm", STATUS_CELL[item.status])} />
          {item.label}
        </span>
      ))}
      <span className="inline-flex items-center gap-1.5 text-xs text-slate-600">
        <span className="h-3 w-3 rounded-md border border-[#2277ff]/30 bg-[#2277ff]/10" />
        Salary month day
      </span>
    </div>
  );
}
