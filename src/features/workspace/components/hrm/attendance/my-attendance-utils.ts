import type { AttendanceRecord } from "@/types/hrm";
import type { CalendarDayCell } from "@/features/workspace/data/hrm-attendance-salary-month";
import { isWeekend, parseDisplayDate } from "@/features/workspace/data/hrm-attendance-salary-month";

export type MyAttendanceDayKind =
  | "week_off"
  | "absent"
  | "present"
  | "active"
  | "half_day"
  | "on_leave"
  | "late"
  | "remote"
  | "regularized"
  | "future"
  | "empty";

export type MyAttendanceDayDisplay = {
  kind: MyAttendanceDayKind;
  checkIn?: string;
  checkOut?: string;
  durationLabel?: string;
  breakMinutes?: number;
  statusLabel: string;
};

function hashSeed(input: string): number {
  let h = 0;
  for (let i = 0; i < input.length; i++) h = (h * 31 + input.charCodeAt(i)) >>> 0;
  return h;
}

function formatDuration(hours: number | undefined): string | undefined {
  if (hours == null) return undefined;
  const totalMinutes = Math.round(hours * 60);
  const h = Math.floor(totalMinutes / 60);
  const m = totalMinutes % 60;
  return `${h}h ${m}m`;
}

function formatClock12(time24?: string): string | undefined {
  if (!time24) return undefined;
  const [hStr, mStr] = time24.split(":");
  const h = Number(hStr);
  const m = Number(mStr);
  if (Number.isNaN(h) || Number.isNaN(m)) return time24;
  const period = h >= 12 ? "PM" : "AM";
  const hour12 = h % 12 || 12;
  return `${hour12}:${String(m).padStart(2, "0")} ${period}`;
}

function demoBreakMinutes(employeeCode: string, dateLabel: string, status: string): number | undefined {
  if (status === "absent" || status === "on_leave") return undefined;
  const seed = hashSeed(`${employeeCode}-${dateLabel}-break`);
  if (seed % 5 === 0) return undefined;
  return 10 + (seed % 45);
}

const REGULARIZED_DATES = new Set(["Jun 15, 2026"]);

export function resolveMyAttendanceDay(
  cell: CalendarDayCell,
  employeeCode: string,
  isCurrentlyActive: boolean,
): MyAttendanceDayDisplay {
  if (cell.isBeforeJoin) {
    return { kind: "empty", statusLabel: "" };
  }
  if (cell.isFuture) {
    return { kind: "future", statusLabel: "" };
  }
  if (cell.isWeekend && !cell.record) {
    return { kind: "week_off", statusLabel: "Week Off" };
  }
  if (cell.isWeekend && cell.record?.status === "present") {
    return { kind: "week_off", statusLabel: "Week Off" };
  }

  const record = cell.record;
  if (!record) {
    return cell.isWeekend
      ? { kind: "week_off", statusLabel: "Week Off" }
      : { kind: "empty", statusLabel: "" };
  }

  if (REGULARIZED_DATES.has(cell.dateLabel)) {
    return {
      kind: "regularized",
      checkIn: formatClock12(record.checkIn),
      checkOut: formatClock12(record.checkOut),
      durationLabel: formatDuration(record.hoursWorked),
      breakMinutes: demoBreakMinutes(employeeCode, cell.dateLabel, record.status),
      statusLabel: "Regularized",
    };
  }

  if (cell.isToday && isCurrentlyActive) {
    return {
      kind: "active",
      checkIn: formatClock12(record.checkIn),
      durationLabel: formatDuration(record.hoursWorked),
      breakMinutes: demoBreakMinutes(employeeCode, cell.dateLabel, record.status),
      statusLabel: "Active",
    };
  }

  const breakMinutes = demoBreakMinutes(employeeCode, cell.dateLabel, record.status);

  switch (record.status) {
    case "absent":
      return { kind: "absent", statusLabel: "Absent" };
    case "half_day":
      return {
        kind: "half_day",
        checkIn: formatClock12(record.checkIn),
        checkOut: formatClock12(record.checkOut),
        durationLabel: formatDuration(record.hoursWorked),
        breakMinutes,
        statusLabel: "Half Day",
      };
    case "on_leave":
      return { kind: "on_leave", statusLabel: "On Leave" };
    case "late":
      return {
        kind: "late",
        checkIn: formatClock12(record.checkIn),
        checkOut: formatClock12(record.checkOut),
        durationLabel: formatDuration(record.hoursWorked),
        breakMinutes,
        statusLabel: "Present",
      };
    case "remote":
      return {
        kind: "remote",
        checkIn: formatClock12(record.checkIn),
        checkOut: formatClock12(record.checkOut),
        durationLabel: formatDuration(record.hoursWorked),
        breakMinutes,
        statusLabel: "Present",
      };
    default:
      return {
        kind: "present",
        checkIn: formatClock12(record.checkIn),
        checkOut: formatClock12(record.checkOut),
        durationLabel: formatDuration(record.hoursWorked),
        breakMinutes,
        statusLabel: "Present",
      };
  }
}

export function countEarlyLeaveDays(records: AttendanceRecord[]): number {
  return records.filter((r) => {
    if (!r.checkOut || r.status === "absent" || r.status === "on_leave") return false;
    const [h] = r.checkOut.split(":").map(Number);
    return h < 17;
  }).length;
}

export function formatTodayHeading(date = new Date()): string {
  const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  return `${date.getDate()} ${months[date.getMonth()]} ${days[date.getDay()]}`;
}

export function formatTimerFromMs(ms: number): string {
  const totalSeconds = Math.max(0, Math.floor(ms / 1000));
  const h = Math.floor(totalSeconds / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  const s = totalSeconds % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

export function recordsForMonth(
  records: AttendanceRecord[],
  year: number,
  month: number,
): AttendanceRecord[] {
  return records.filter((r) => {
    const d = parseDisplayDate(r.date);
    return d.getFullYear() === year && d.getMonth() === month;
  });
}

/** Re-chunk calendar weeks with Sunday as the first column (reference layout). */
export function rebuildSunFirstWeeks(
  weeks: (CalendarDayCell | null)[][],
  year: number,
  month: number,
): (CalendarDayCell | null)[][] {
  const cellByDay = new Map<number, CalendarDayCell>();
  for (const week of weeks) {
    for (const cell of week) {
      if (cell) cellByDay.set(cell.dayOfMonth, cell);
    }
  }

  const monthEnd = new Date(year, month + 1, 0).getDate();
  const startPad = new Date(year, month, 1).getDay();
  const grid: (CalendarDayCell | null)[] = Array(startPad).fill(null);

  for (let day = 1; day <= monthEnd; day++) {
    grid.push(cellByDay.get(day) ?? null);
  }
  while (grid.length % 7 !== 0) grid.push(null);

  const result: (CalendarDayCell | null)[][] = [];
  for (let i = 0; i < grid.length; i += 7) {
    result.push(grid.slice(i, i + 7));
  }
  return result;
}
