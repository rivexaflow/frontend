import type { AttendanceRecord } from "@/types/hrm";
import {
  buildMonthCalendars,
  computeSalaryMonthSummary,
  formatDisplayDate,
  getSalaryMonthRange,
  isWeekend,
  parseDisplayDate,
  parseJoinedAt,
  SALARY_MONTH_CUTOFF_DAY,
  type EmployeeAttendanceProfile,
} from "@/features/workspace/data/hrm-attendance-salary-month";

type EmployeeMeta = {
  id: string;
  name: string;
  employeeCode: string;
  department: string;
  location: string;
  designation?: string;
  joinedAt: string;
};

function computeLifetime(records: AttendanceRecord[], joinDate: Date, reference: Date) {
  const counts = {
    workingDays: 0,
    present: 0,
    remote: 0,
    late: 0,
    absent: 0,
    halfDay: 0,
    onLeave: 0,
    offDays: 0,
    totalHours: 0,
    payableDays: 0,
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
  const lateRate = counts.workingDays === 0 ? 0 : Math.round((counts.late / counts.workingDays) * 100);

  return {
    totalWorkingDays: counts.workingDays,
    present: counts.present,
    remote: counts.remote,
    late: counts.late,
    absent: counts.absent,
    halfDay: counts.halfDay,
    onLeave: counts.onLeave,
    offDays: counts.offDays,
    totalHours: Math.round(counts.totalHours * 10) / 10,
    payableDays: Math.round(counts.payableDays * 10) / 10,
    attendanceRate,
    lateRate,
  };
}

export function buildEmployeeAttendanceProfileFromRecords(
  employee: EmployeeMeta,
  records: AttendanceRecord[],
  reference = new Date(),
  cutoffDay = SALARY_MONTH_CUTOFF_DAY,
): EmployeeAttendanceProfile {
  const joinedDate = parseJoinedAt(employee.joinedAt);
  const todayStr = formatDisplayDate(reference);
  const historyDays = records.filter((r) => {
    const d = parseDisplayDate(r.date);
    return d >= joinedDate && d <= reference;
  });

  const today =
    historyDays.find((r) => r.date === todayStr) ??
    ({
      id: `att_${employee.employeeCode}_today`,
      date: todayStr,
      employeeId: employee.id,
      employeeName: employee.name,
      employeeCode: employee.employeeCode,
      department: employee.department,
      location: employee.location,
      status: "absent",
    } satisfies AttendanceRecord);

  const range = getSalaryMonthRange(reference, cutoffDay);
  const monthDays = historyDays.filter((r) => {
    const d = parseDisplayDate(r.date);
    return d >= range.start && d <= range.end && d <= reference && !isWeekend(d);
  });

  return {
    id: employee.id,
    employeeName: employee.name,
    employeeCode: employee.employeeCode,
    department: employee.department,
    location: employee.location,
    designation: employee.designation,
    joinedAt: employee.joinedAt,
    joinedDate,
    today,
    salaryMonth: computeSalaryMonthSummary(monthDays, range, reference),
    monthDays,
    lifetime: computeLifetime(historyDays, joinedDate, reference),
    historyDays,
    monthCalendars: buildMonthCalendars(historyDays, joinedDate, reference, cutoffDay),
  };
}

export function toIsoDateOnly(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}
