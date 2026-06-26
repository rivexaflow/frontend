"use client";

import { LogIn, LogOut, RefreshCw, Timer } from "lucide-react";

import { crm } from "@/features/workspace/components/crm/crm-styles";
import { AttendanceCalendarMonth } from "@/features/workspace/components/hrm/attendance/attendance-calendar-month";
import { AttendanceStatusBadge } from "@/features/workspace/components/hrm/attendance/attendance-status-badge";
import {
  AttendanceMetricStrip,
  AttendancePanelCard,
} from "@/features/workspace/components/hrm/attendance/attendance-sub-page-primitives";
import type { EmployeeAttendanceProfile } from "@/features/workspace/data/hrm-attendance-salary-month";
import { cn } from "@/lib/utils/cn";
import { CalendarDays, CheckCircle2, TrendingUp } from "lucide-react";

type Props = {
  profile: EmployeeAttendanceProfile | null;
  salaryMonthLabel: string;
  refreshing: boolean;
  onRefresh: () => void;
};

function formatHours(hours: number | undefined | null) {
  if (hours == null) return "—";
  const h = Math.floor(hours);
  const m = Math.round((hours % 1) * 60);
  return `${h}h ${m}m`;
}

function initials(name: string) {
  return name
    .split(" ")
    .map((p) => p[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

export function AttendanceMyPanel({
  profile,
  salaryMonthLabel,
  refreshing,
  onRefresh,
}: Props) {
  if (!profile) {
    return (
      <div className="px-5 py-20 text-center">
        <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">No employee profile linked</p>
        <p className="mt-1 text-xs text-slate-500">Your account is not mapped to an active employee record.</p>
      </div>
    );
  }

  const { today, salaryMonth, monthCalendars } = profile;
  const activeCalendar = monthCalendars[monthCalendars.length - 1];
  const rate =
    salaryMonth.workingDaysElapsed === 0
      ? 0
      : Math.round((salaryMonth.payableDays / salaryMonth.workingDaysElapsed) * 100);
  const progress = Math.min(100, rate);

  return (
    <>
      <AttendanceMetricStrip
        metrics={[
          { label: "Today", value: formatHours(today.hoursWorked), hint: "Hours worked", icon: Timer },
          { label: "Month rate", value: `${rate}%`, hint: salaryMonthLabel, icon: TrendingUp },
          { label: "Payable", value: salaryMonth.payableDays, hint: "Days this cycle", icon: CheckCircle2 },
          { label: "Late", value: salaryMonth.late, hint: "This salary month", icon: CalendarDays },
        ]}
        actions={
          <button type="button" onClick={onRefresh} disabled={refreshing} className={cn(crm.btnSecondarySm, "h-9")}>
            <RefreshCw className={cn("h-3.5 w-3.5", refreshing && "animate-spin")} />
            Refresh
          </button>
        }
      />

      <div className="border-b border-slate-100 bg-gradient-to-r from-[#191970]/[0.03] via-white to-[#2277FF]/[0.04] px-4 py-4 dark:border-slate-800 dark:from-[#191970]/20 dark:via-slate-950 dark:to-[#2277FF]/10 md:px-5">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-[#191970] to-[#2277ff] text-sm font-bold text-white shadow-md">
              {initials(profile.employeeName)}
            </span>
            <div>
              <p className="text-sm font-bold text-slate-900 dark:text-white">{profile.employeeName}</p>
              <p className="text-xs text-slate-500">
                {profile.department} · {profile.employeeCode}
              </p>
              <div className="mt-1">
                <AttendanceStatusBadge status={today.status} />
              </div>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            {[
              { label: "Check in", value: today.checkIn ?? "—", icon: LogIn },
              { label: "Check out", value: today.checkOut ?? "—", icon: LogOut },
              { label: "Payable days", value: String(salaryMonth.payableDays), icon: CheckCircle2 },
              { label: "Absent", value: String(salaryMonth.absent), icon: CalendarDays },
            ].map((item) => (
              <div
                key={item.label}
                className="rounded-xl border border-slate-200/80 bg-white/80 px-3 py-2 dark:border-slate-800 dark:bg-slate-900/80"
              >
                <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wide text-slate-400">
                  <item.icon className="h-3 w-3 text-[#191970] dark:text-[#2277FF]" />
                  {item.label}
                </div>
                <p className="mt-0.5 font-mono text-sm font-bold text-slate-800 dark:text-white">{item.value}</p>
              </div>
            ))}
          </div>
        </div>
        <div className="mt-4">
          <div className="flex items-center justify-between text-[10px] text-slate-500">
            <span>Salary month progress · {salaryMonthLabel}</span>
            <span className="font-bold text-[#191970] dark:text-[#2277FF]">{rate}%</span>
          </div>
          <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
            <div
              className="h-full rounded-full bg-gradient-to-r from-[#191970] to-[#2277ff]"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      </div>

      <div className="grid gap-4 p-4 lg:grid-cols-[minmax(0,1fr)_260px] md:p-5">
        <AttendancePanelCard title="Salary month calendar" description={`Cycle: ${salaryMonthLabel}`}>
          <AttendanceCalendarMonth calendar={activeCalendar} compact />
        </AttendancePanelCard>
        <AttendancePanelCard title="Month summary" description="Current salary month">
          <dl className="space-y-0 text-xs">
            {[
              { label: "Working days elapsed", value: salaryMonth.workingDaysElapsed },
              { label: "Payable days", value: salaryMonth.payableDays, highlight: true },
              { label: "Present", value: salaryMonth.present },
              { label: "Late arrivals", value: salaryMonth.late },
              { label: "Absent days", value: salaryMonth.absent },
              { label: "Total hours", value: `${salaryMonth.totalHours}h` },
            ].map((row, i, arr) => (
              <div
                key={row.label}
                className={cn(
                  "flex justify-between py-2.5",
                  i < arr.length - 1 && "border-b border-slate-100 dark:border-slate-800",
                )}
              >
                <dt className="text-slate-500">{row.label}</dt>
                <dd
                  className={cn(
                    "font-semibold tabular-nums",
                    row.highlight ? "text-[#191970] dark:text-[#2277FF]" : "text-slate-800 dark:text-white",
                  )}
                >
                  {row.value}
                </dd>
              </div>
            ))}
          </dl>
        </AttendancePanelCard>
      </div>
    </>
  );
}
