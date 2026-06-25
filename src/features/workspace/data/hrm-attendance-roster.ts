import type { AttendanceStatus } from "@/features/workspace/data/hrm-attendance-demo";
import {
  buildMonthCalendar,
  type AttendanceMonthCalendar,
  type CalendarDayCell,
  type EmployeeAttendanceProfile,
} from "@/features/workspace/data/hrm-attendance-salary-month";

/** Attendance roster uses only three codes: Present, Absent, Weekend. */
export type RosterCode = "P" | "A" | "W";

export type RosterLegendItem = {
  code: RosterCode;
  label: string;
  description: string;
  cellClass: string;
  legendClass: string;
};

export const ROSTER_LEGEND: RosterLegendItem[] = [
  {
    code: "P",
    label: "Present",
    description: "Employee was present",
    cellClass: "bg-blue-900 text-white",
    legendClass: "bg-[#2277FF]",
  },
  {
    code: "A",
    label: "Absent",
    description: "No attendance recorded",
    cellClass: "bg-rose-500 text-white",
    legendClass: "bg-rose-500",
  },
  {
    code: "W",
    label: "Weekend",
    description: "Weekly off / non-working day",
    cellClass: "bg-slate-200 text-slate-500 dark:bg-slate-600 dark:text-slate-200",
    legendClass: "bg-slate-300 dark:bg-slate-500",
  },
];

const LEGEND_MAP = Object.fromEntries(ROSTER_LEGEND.map((l) => [l.code, l])) as Record<
  RosterCode,
  RosterLegendItem
>;

export type RosterDayCell = {
  day: number;
  weekday: string;
  code: RosterCode | null;
  title: string;
};

export type RosterEmployeeRow = {
  employeeId: string;
  employeeName: string;
  designation?: string;
  department: string;
  days: RosterDayCell[];
  totals: { P: number; A: number; W: number };
};

const WEEKDAY_LETTERS = ["S", "M", "T", "W", "T", "F", "S"] as const;

function statusToCode(status: AttendanceStatus): RosterCode {
  switch (status) {
    case "present":
    case "remote":
    case "late":
    case "half_day":
      return "P";
    case "absent":
    case "on_leave":
      return "A";
    default:
      return "A";
  }
}

function demoWeekdayCode(employeeId: string, day: number, month: number, year: number): RosterCode {
  let hash = day * 31 + month * 367 + year;
  for (let i = 0; i < employeeId.length; i += 1) hash += employeeId.charCodeAt(i) * (i + 3);
  return Math.abs(hash) % 100 < 62 ? "P" : "A";
}

function cellToRosterCode(cell: CalendarDayCell, employeeId: string): RosterCode | null {
  if (cell.isBeforeJoin || cell.isFuture) return null;
  if (cell.isWeekend) return "W";
  if (cell.record) return statusToCode(cell.record.status);
  return demoWeekdayCode(employeeId, cell.dayOfMonth, cell.date.getMonth(), cell.date.getFullYear());
}

function flattenCalendarDays(calendar: AttendanceMonthCalendar): CalendarDayCell[] {
  const map = new Map<number, CalendarDayCell>();
  for (const week of calendar.weeks) {
    for (const cell of week) {
      if (cell) map.set(cell.dayOfMonth, cell);
    }
  }
  const daysInMonth = new Date(calendar.year, calendar.month + 1, 0).getDate();
  const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  return Array.from({ length: daysInMonth }, (_, i) => {
    const day = i + 1;
    const existing = map.get(day);
    if (existing) return existing;
    const date = new Date(calendar.year, calendar.month, day);
    return {
      date,
      dateLabel: `${monthNames[calendar.month]} ${day}, ${calendar.year}`,
      dayOfMonth: day,
      isWeekend: date.getDay() === 0 || date.getDay() === 6,
      isBeforeJoin: false,
      isFuture: false,
      isToday: false,
      inSalaryMonth: false,
    } satisfies CalendarDayCell;
  });
}

export function buildRosterRows(
  profiles: EmployeeAttendanceProfile[],
  year: number,
  month: number,
): { rows: RosterEmployeeRow[]; monthLabel: string } {
  const monthLabel = new Date(year, month, 1).toLocaleString("en-US", {
    month: "long",
    year: "numeric",
  });

  const rows = profiles.map((profile) => {
    const monthEnd = new Date(year, month + 1, 0);
    const calendar: AttendanceMonthCalendar =
      profile.monthCalendars.find((c) => c.year === year && c.month === month) ??
      buildMonthCalendar(year, month, profile.historyDays, profile.joinedDate, monthEnd);

    const cells = flattenCalendarDays(calendar);
    const days: RosterDayCell[] = cells.map((cell) => {
      const code = cellToRosterCode(cell, profile.id);
      const legend = code ? LEGEND_MAP[code] : null;
      const detail = cell.record?.checkIn
        ? `${legend?.label ?? ""} · ${cell.record.checkIn}${cell.record.checkOut ? ` – ${cell.record.checkOut}` : ""}`
        : (legend?.description ?? "");
      return {
        day: cell.dayOfMonth,
        weekday: WEEKDAY_LETTERS[cell.date.getDay()],
        code,
        title: code ? `${cell.dateLabel} · ${detail}` : cell.dateLabel,
      };
    });

    const totals = { P: 0, A: 0, W: 0 };
    for (const d of days) {
      if (d.code === "P") totals.P += 1;
      if (d.code === "A") totals.A += 1;
      if (d.code === "W") totals.W += 1;
    }

    return {
      employeeId: profile.id,
      employeeName: profile.employeeName,
      designation: profile.designation,
      department: profile.department,
      days,
      totals,
    };
  });

  return { rows, monthLabel };
}

export function rosterLegendFor(code: RosterCode): RosterLegendItem {
  return LEGEND_MAP[code];
}

export function exportRosterCsv(rows: RosterEmployeeRow[], monthLabel: string) {
  if (!rows.length) return;
  const header = [
    "Employee",
    "Designation",
    "Department",
    ...rows[0].days.map((d) => String(d.day)),
    "P",
    "A",
    "W",
  ];
  const body = rows.map((row) => [
    row.employeeName,
    row.designation ?? "",
    row.department,
    ...row.days.map((d) => d.code ?? ""),
    String(row.totals.P),
    String(row.totals.A),
    String(row.totals.W),
  ]);
  const csv = [header, ...body]
    .map((line) => line.map((v) => `"${String(v).replace(/"/g, '""')}"`).join(","))
    .join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `attendance-roster-${monthLabel.replace(/\s+/g, "-").toLowerCase()}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}
