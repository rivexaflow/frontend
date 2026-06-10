import type { AttendanceRecord, AttendanceStatus } from "@/features/workspace/data/hrm-attendance-demo";

export const SALARY_MONTH_CUTOFF_DAY = 27;

const MONTH_SHORT = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

export type SalaryMonthRange = {
  start: Date;
  end: Date;
  label: string;
  cutoffDay: number;
};

export type SalaryMonthSummary = {
  cutoffDay: number;
  periodStart: string;
  periodEnd: string;
  periodLabel: string;
  totalCalendarDays: number;
  daysElapsed: number;
  workingDaysElapsed: number;
  present: number;
  remote: number;
  late: number;
  absent: number;
  halfDay: number;
  onLeave: number;
  totalHours: number;
  payableDays: number;
  attendanceRate: number;
};

export function formatDisplayDate(date: Date): string {
  return `${MONTH_SHORT[date.getMonth()]} ${date.getDate()}, ${date.getFullYear()}`;
}

export function parseDisplayDate(value: string): Date {
  const parsed = new Date(value);
  if (!Number.isNaN(parsed.getTime())) return parsed;
  return new Date();
}

export function getSalaryMonthRange(reference = new Date(), cutoffDay = SALARY_MONTH_CUTOFF_DAY): SalaryMonthRange {
  const year = reference.getFullYear();
  const month = reference.getMonth();
  const day = reference.getDate();

  let start: Date;
  let end: Date;

  if (day >= cutoffDay) {
    start = new Date(year, month, cutoffDay);
    end = new Date(year, month + 1, cutoffDay - 1);
  } else {
    start = new Date(year, month - 1, cutoffDay);
    end = new Date(year, month, cutoffDay - 1);
  }

  const label = `${formatDisplayDate(start)} – ${formatDisplayDate(end)}`;
  return { start, end, label, cutoffDay };
}

export function isWeekend(date: Date): boolean {
  const dow = date.getDay();
  return dow === 0 || dow === 6;
}

export function eachDayInRange(start: Date, end: Date): Date[] {
  const days: Date[] = [];
  const cursor = new Date(start);
  while (cursor <= end) {
    days.push(new Date(cursor));
    cursor.setDate(cursor.getDate() + 1);
  }
  return days;
}

function countWorkingDays(start: Date, end: Date, upTo?: Date): number {
  const limit = upTo && upTo < end ? upTo : end;
  return eachDayInRange(start, limit).filter((d) => !isWeekend(d)).length;
}

function hashSeed(input: string): number {
  let h = 0;
  for (let i = 0; i < input.length; i++) h = (h * 31 + input.charCodeAt(i)) >>> 0;
  return h;
}

const STATUS_POOL: AttendanceStatus[] = ["present", "present", "present", "remote", "late", "half_day", "on_leave", "absent"];

function demoStatusForDay(employeeCode: string, date: Date): AttendanceStatus {
  if (isWeekend(date)) return "present";
  const seed = hashSeed(`${employeeCode}-${date.toISOString().slice(0, 10)}`);
  return STATUS_POOL[seed % STATUS_POOL.length];
}

function demoHours(status: AttendanceStatus, seed: number): number | undefined {
  if (status === "absent" || status === "on_leave") return undefined;
  if (status === "half_day") return 4 + (seed % 2);
  if (status === "late") return 7 + (seed % 3) * 0.2;
  return 7.5 + (seed % 4) * 0.3;
}

function demoCheckIn(status: AttendanceStatus, seed: number): string | undefined {
  if (status === "absent" || status === "on_leave") return undefined;
  const base = status === "late" ? 9 + (seed % 3) : 8 + (seed % 2);
  const mins = 5 + (seed % 50);
  return `${String(base).padStart(2, "0")}:${String(mins).padStart(2, "0")}`;
}

function demoCheckOut(hours: number | undefined, checkIn?: string): string | undefined {
  if (!hours || !checkIn) return undefined;
  const [h, m] = checkIn.split(":").map(Number);
  const totalMins = h * 60 + m + Math.round(hours * 60);
  const oh = Math.floor(totalMins / 60);
  const om = totalMins % 60;
  return `${String(oh).padStart(2, "0")}:${String(om).padStart(2, "0")}`;
}

export function buildMonthDayRecord(
  template: Pick<AttendanceRecord, "employeeName" | "employeeCode" | "department" | "location">,
  date: Date,
  override?: Partial<AttendanceRecord>,
): AttendanceRecord {
  const dateStr = formatDisplayDate(date);
  if (override) {
    return {
      id: `att_${template.employeeCode}_${dateStr.replace(/,?\s/g, "_")}`,
      date: dateStr,
      employeeName: template.employeeName,
      employeeCode: template.employeeCode,
      department: template.department,
      location: template.location,
      status: "present",
      ...override,
    };
  }

  const seed = hashSeed(`${template.employeeCode}-${dateStr}`);
  const status = isWeekend(date) ? ("present" as AttendanceStatus) : demoStatusForDay(template.employeeCode, date);
  const hoursWorked = demoHours(status, seed);
  const checkIn = demoCheckIn(status, seed);
  const checkOut = demoCheckOut(hoursWorked, checkIn);

  return {
    id: `att_${template.employeeCode}_${dateStr.replace(/,?\s/g, "_")}`,
    date: dateStr,
    employeeName: template.employeeName,
    employeeCode: template.employeeCode,
    department: template.department,
    location: template.location,
    status,
    checkIn,
    checkOut,
    hoursWorked,
  };
}

export function computeSalaryMonthSummary(
  monthDays: AttendanceRecord[],
  range: SalaryMonthRange,
  reference = new Date(),
): SalaryMonthSummary {
  const elapsedDays = monthDays.filter((d) => parseDisplayDate(d.date) <= reference);
  const counts = {
    present: 0,
    remote: 0,
    late: 0,
    absent: 0,
    halfDay: 0,
    onLeave: 0,
  };

  let totalHours = 0;
  let payableDays = 0;

  for (const day of elapsedDays) {
    if (isWeekend(parseDisplayDate(day.date))) continue;
    switch (day.status) {
      case "present":
        counts.present++;
        payableDays += 1;
        break;
      case "remote":
        counts.remote++;
        payableDays += 1;
        break;
      case "late":
        counts.late++;
        payableDays += 1;
        break;
      case "half_day":
        counts.halfDay++;
        payableDays += 0.5;
        break;
      case "on_leave":
        counts.onLeave++;
        break;
      case "absent":
        counts.absent++;
        break;
    }
    if (day.hoursWorked) totalHours += day.hoursWorked;
  }

  const workingDaysElapsed = countWorkingDays(range.start, range.end, reference);
  const attendanceRate =
    workingDaysElapsed === 0 ? 0 : Math.round((payableDays / workingDaysElapsed) * 100);

  return {
    cutoffDay: range.cutoffDay,
    periodStart: formatDisplayDate(range.start),
    periodEnd: formatDisplayDate(range.end),
    periodLabel: range.label,
    totalCalendarDays: eachDayInRange(range.start, range.end).length,
    daysElapsed: elapsedDays.length,
    workingDaysElapsed,
    present: counts.present,
    remote: counts.remote,
    late: counts.late,
    absent: counts.absent,
    halfDay: counts.halfDay,
    onLeave: counts.onLeave,
    totalHours: Math.round(totalHours * 10) / 10,
    payableDays: Math.round(payableDays * 10) / 10,
    attendanceRate,
  };
}

export type AttendanceLifetimeAnalytics = {
  totalWorkingDays: number;
  present: number;
  remote: number;
  late: number;
  absent: number;
  halfDay: number;
  onLeave: number;
  offDays: number;
  totalHours: number;
  payableDays: number;
  attendanceRate: number;
  lateRate: number;
};

export type CalendarDayCell = {
  date: Date;
  dateLabel: string;
  dayOfMonth: number;
  isWeekend: boolean;
  isBeforeJoin: boolean;
  isFuture: boolean;
  isToday: boolean;
  inSalaryMonth: boolean;
  record?: AttendanceRecord;
};

export type AttendanceMonthCalendar = {
  year: number;
  month: number;
  label: string;
  salaryMonthLabel: string;
  summary: {
    workingDays: number;
    present: number;
    late: number;
    absent: number;
    onLeave: number;
    halfDay: number;
    remote: number;
    offDays: number;
    totalHours: number;
    attendanceRate: number;
  };
  weeks: (CalendarDayCell | null)[][];
};

export type EmployeeAttendanceProfile = {
  id: string;
  employeeName: string;
  employeeCode: string;
  department: string;
  location: string;
  designation?: string;
  joinedAt: string;
  joinedDate: Date;
  today: AttendanceRecord;
  salaryMonth: SalaryMonthSummary;
  monthDays: AttendanceRecord[];
  lifetime: AttendanceLifetimeAnalytics;
  historyDays: AttendanceRecord[];
  monthCalendars: AttendanceMonthCalendar[];
};

export function parseJoinedAt(value: string): Date {
  const parsed = new Date(value);
  if (!Number.isNaN(parsed.getTime())) {
    return new Date(parsed.getFullYear(), parsed.getMonth(), 1);
  }
  return new Date(2022, 0, 1);
}

export function listMonthsBetween(start: Date, end: Date): { year: number; month: number }[] {
  const months: { year: number; month: number }[] = [];
  const cursor = new Date(start.getFullYear(), start.getMonth(), 1);
  const limit = new Date(end.getFullYear(), end.getMonth(), 1);
  while (cursor <= limit) {
    months.push({ year: cursor.getFullYear(), month: cursor.getMonth() });
    cursor.setMonth(cursor.getMonth() + 1);
  }
  return months;
}

function monthLabel(year: number, month: number): string {
  return `${MONTH_SHORT[month]} ${year}`;
}

function computeDayCounts(records: AttendanceRecord[], joinDate: Date, reference: Date) {
  const counts = {
    present: 0,
    remote: 0,
    late: 0,
    absent: 0,
    halfDay: 0,
    onLeave: 0,
    offDays: 0,
    totalHours: 0,
    payableDays: 0,
    workingDays: 0,
  };

  for (const record of records) {
    const date = parseDisplayDate(record.date);
    if (date < joinDate || date > reference) continue;
    if (isWeekend(date)) {
      counts.offDays++;
      continue;
    }
    counts.workingDays++;
    switch (record.status) {
      case "present":
        counts.present++;
        counts.payableDays += 1;
        break;
      case "remote":
        counts.remote++;
        counts.payableDays += 1;
        break;
      case "late":
        counts.late++;
        counts.payableDays += 1;
        break;
      case "half_day":
        counts.halfDay++;
        counts.payableDays += 0.5;
        break;
      case "on_leave":
        counts.onLeave++;
        break;
      case "absent":
        counts.absent++;
        break;
    }
    if (record.hoursWorked) counts.totalHours += record.hoursWorked;
  }

  const attendanceRate =
    counts.workingDays === 0 ? 0 : Math.round((counts.payableDays / counts.workingDays) * 100);
  const lateRate =
    counts.workingDays === 0 ? 0 : Math.round((counts.late / counts.workingDays) * 100);

  return {
    ...counts,
    totalHours: Math.round(counts.totalHours * 10) / 10,
    payableDays: Math.round(counts.payableDays * 10) / 10,
    attendanceRate,
    lateRate,
  };
}

export function buildHistoryDays(
  template: Pick<AttendanceRecord, "employeeName" | "employeeCode" | "department" | "location">,
  joinDate: Date,
  reference: Date,
  todayOverride?: AttendanceRecord,
): AttendanceRecord[] {
  const start = new Date(joinDate);
  const days = eachDayInRange(start, reference).filter((d) => !isWeekend(d));
  return days.map((date) => {
    const dateStr = formatDisplayDate(date);
    if (todayOverride && todayOverride.date === dateStr) {
      return { ...todayOverride };
    }
    return buildMonthDayRecord(template, date);
  });
}

function isInSalaryMonth(date: Date, reference: Date, cutoffDay: number): boolean {
  const range = getSalaryMonthRange(reference, cutoffDay);
  return date >= range.start && date <= range.end;
}

export function buildMonthCalendar(
  year: number,
  month: number,
  records: AttendanceRecord[],
  joinDate: Date,
  reference: Date,
  cutoffDay = SALARY_MONTH_CUTOFF_DAY,
): AttendanceMonthCalendar {
  const recordMap = new Map(records.map((r) => [r.date, r]));
  const monthStart = new Date(year, month, 1);
  const monthEnd = new Date(year, month + 1, 0);
  const monthRecords = records.filter((r) => {
    const d = parseDisplayDate(r.date);
    return d >= monthStart && d <= monthEnd;
  });

  const summary = computeDayCounts(monthRecords, joinDate, reference);
  const salaryRange = getSalaryMonthRange(reference, cutoffDay);

  const weeks: (CalendarDayCell | null)[][] = [];
  let cursor = new Date(year, month, 1);
  const startPad = (cursor.getDay() + 6) % 7;
  let week: (CalendarDayCell | null)[] = Array(startPad).fill(null);

  while (cursor.getMonth() === month) {
    const date = new Date(cursor);
    const dateLabel = formatDisplayDate(date);
    const isBeforeJoin = date < joinDate;
    const isFuture = date > reference;
    const weekend = isWeekend(date);

    week.push({
      date,
      dateLabel,
      dayOfMonth: date.getDate(),
      isWeekend: weekend,
      isBeforeJoin,
      isFuture,
      isToday:
        date.getDate() === reference.getDate() &&
        date.getMonth() === reference.getMonth() &&
        date.getFullYear() === reference.getFullYear(),
      inSalaryMonth: date >= salaryRange.start && date <= salaryRange.end,
      record: !isBeforeJoin && !isFuture ? recordMap.get(dateLabel) : undefined,
    });

    if (week.length === 7) {
      weeks.push(week);
      week = [];
    }
    cursor.setDate(cursor.getDate() + 1);
  }
  if (week.length > 0) {
    while (week.length < 7) week.push(null);
    weeks.push(week);
  }

  return {
    year,
    month,
    label: monthLabel(year, month),
    salaryMonthLabel: salaryRange.label,
    summary: {
      workingDays: summary.workingDays,
      present: summary.present + summary.remote,
      late: summary.late,
      absent: summary.absent,
      onLeave: summary.onLeave,
      halfDay: summary.halfDay,
      remote: summary.remote,
      offDays: summary.offDays,
      totalHours: summary.totalHours,
      attendanceRate: summary.attendanceRate,
    },
    weeks,
  };
}

export function buildMonthCalendars(
  records: AttendanceRecord[],
  joinDate: Date,
  reference: Date,
  cutoffDay = SALARY_MONTH_CUTOFF_DAY,
): AttendanceMonthCalendar[] {
  return listMonthsBetween(joinDate, reference).map(({ year, month }) =>
    buildMonthCalendar(year, month, records, joinDate, reference, cutoffDay),
  );
}

type ProfileExtras = {
  designation?: string;
  joinedAt?: string;
};

export function buildEmployeeAttendanceProfiles(
  todayRecords: AttendanceRecord[],
  reference = new Date(),
  cutoffDay = SALARY_MONTH_CUTOFF_DAY,
  extrasByCode: Record<string, ProfileExtras> = {},
): EmployeeAttendanceProfile[] {
  const range = getSalaryMonthRange(reference, cutoffDay);
  const allDays = eachDayInRange(range.start, range.end).filter((d) => d <= reference);

  return todayRecords.map((today) => {
    const extras = extrasByCode[today.employeeCode] ?? {};
    const joinedAt = extras.joinedAt ?? "Jan 2022";
    const joinedDate = parseJoinedAt(joinedAt);

    const monthDays = allDays.flatMap((date) => {
      if (isWeekend(date)) return [];
      const dateStr = formatDisplayDate(date);
      if (dateStr === today.date) return [{ ...today, id: today.id }];
      return [buildMonthDayRecord(today, date)];
    });

    const historyDays = buildHistoryDays(today, joinedDate, reference, today);
    const lifetime = computeDayCounts(historyDays, joinedDate, reference);
    const monthCalendars = buildMonthCalendars(historyDays, joinedDate, reference, cutoffDay);

    return {
      id: today.employeeCode,
      employeeName: today.employeeName,
      employeeCode: today.employeeCode,
      department: today.department,
      location: today.location,
      designation: extras.designation,
      joinedAt,
      joinedDate,
      today,
      salaryMonth: computeSalaryMonthSummary(monthDays, range, reference),
      monthDays,
      lifetime: {
        totalWorkingDays: lifetime.workingDays,
        present: lifetime.present,
        remote: lifetime.remote,
        late: lifetime.late,
        absent: lifetime.absent,
        halfDay: lifetime.halfDay,
        onLeave: lifetime.onLeave,
        offDays: lifetime.offDays,
        totalHours: lifetime.totalHours,
        payableDays: lifetime.payableDays,
        attendanceRate: lifetime.attendanceRate,
        lateRate: lifetime.lateRate,
      },
      historyDays,
      monthCalendars,
    };
  });
}
