"use client";

import { useEffect, useMemo, useState } from "react";
import {
  ArrowLeft,
  Building2,
  Calendar,
  Clock,
  Loader2,
  LogIn,
  LogOut,
  MapPin,
  TrendingUp,
  User,
} from "lucide-react";

import {
  AttendanceCalendarLegend,
  AttendanceCalendarMonth,
} from "@/features/workspace/components/hrm/attendance/attendance-calendar-month";
import { AttendanceMonthAnalyticsTable } from "@/features/workspace/components/hrm/attendance/attendance-month-analytics-table";
import { AttendanceSalaryMonthStrip } from "@/features/workspace/components/hrm/attendance/attendance-salary-month-strip";
import { AttendanceStatusBadge } from "@/features/workspace/components/hrm/attendance/attendance-status-badge";
import type {
  CalendarDayCell,
  EmployeeAttendanceProfile,
} from "@/features/workspace/data/hrm-attendance-salary-month";
import {
  buildEmployeeAttendanceProfileFromRecords,
  toIsoDateOnly,
} from "@/lib/hrm/build-attendance-profile";
import {
  checkInHrAttendance,
  checkOutHrAttendance,
  correctHrAttendance,
  fetchHrAttendanceLogs,
} from "@/lib/api/hrm";
import type { HrmEmployeeRecord } from "@/types/hrm";
import { cn } from "@/lib/utils/cn";

type Props = {
  companyId: string;
  employee: HrmEmployeeRecord;
  onBack: () => void;
  onRecordsChange?: () => void;
};

function MetricCard({
  label,
  value,
  sub,
  tone = "default",
}: {
  label: string;
  value: string | number;
  sub?: string;
  tone?: "default" | "navy" | "amber" | "rose" | "emerald";
}) {
  const tones = {
    default: "border-slate-200/90 bg-white dark:border-slate-800 dark:bg-slate-900",
    navy: "border-[#191970]/20 bg-[#191970]/[0.03] dark:bg-blue-950/20",
    amber: "border-amber-200/80 bg-amber-50/50 dark:border-amber-900/40 dark:bg-amber-950/20",
    rose: "border-rose-200/80 bg-rose-50/50 dark:border-rose-900/40 dark:bg-rose-950/20",
    emerald: "border-emerald-200/80 bg-emerald-50/50 dark:border-emerald-900/40 dark:bg-emerald-950/20",
  };

  return (
    <div className={cn("rounded-xl border p-4 shadow-sm", tones[tone])}>
      <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-slate-400">{label}</p>
      <p className="mt-1 text-2xl font-bold tabular-nums text-slate-900 dark:text-white">{value}</p>
      {sub ? <p className="mt-1 text-xs text-slate-500">{sub}</p> : null}
    </div>
  );
}

export function AttendanceEmployeeProfileView({ companyId, employee, onBack, onRecordsChange }: Props) {
  const [profile, setProfile] = useState<EmployeeAttendanceProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeMonthIdx, setActiveMonthIdx] = useState(0);
  const [selectedDay, setSelectedDay] = useState<CalendarDayCell | null>(null);

  const loadProfile = async () => {
    setLoading(true);
    setError(null);
    try {
      const todayIso = toIsoDateOnly(new Date());
      const joinIso = toIsoDateOnly(new Date(employee.joinedAt !== "—" ? employee.joinedAt : "Jan 2022"));
      const fallback = {
        employeeId: employee.id,
        employeeName: employee.name,
        employeeCode: employee.employeeCode,
        department: employee.department,
        location: employee.location,
      };
      const logs = await fetchHrAttendanceLogs(
        companyId,
        employee.id,
        { from: joinIso, to: todayIso },
        fallback,
      );
      const built = buildEmployeeAttendanceProfileFromRecords(
        {
          id: employee.id,
          name: employee.name,
          employeeCode: employee.employeeCode,
          department: employee.department,
          location: employee.location,
          designation: employee.designation,
          joinedAt: employee.joinedAt,
        },
        logs,
      );
      setProfile(built);
      setActiveMonthIdx(Math.max(0, built.monthCalendars.length - 1));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not load attendance profile.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadProfile();
  }, [companyId, employee.id]);

  const handleCheckIn = async () => {
    setActionLoading(true);
    try {
      await checkInHrAttendance(companyId, { employeeId: employee.id });
      await loadProfile();
      onRecordsChange?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Check-in failed.");
    } finally {
      setActionLoading(false);
    }
  };

  const handleCheckOut = async () => {
    setActionLoading(true);
    try {
      await checkOutHrAttendance(companyId, { employeeId: employee.id });
      await loadProfile();
      onRecordsChange?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Check-out failed.");
    } finally {
      setActionLoading(false);
    }
  };

  const handleCorrectToday = async () => {
    if (!profile?.today.id) return;
    setActionLoading(true);
    try {
      await correctHrAttendance(companyId, profile.today.id, { status: "present" });
      await loadProfile();
      onRecordsChange?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not correct attendance.");
    } finally {
      setActionLoading(false);
    }
  };

  if (loading || !profile) {
    return (
      <div className="flex min-h-[320px] items-center justify-center gap-2 text-sm text-slate-500">
        <Loader2 className="h-5 w-5 animate-spin" />
        Loading attendance profile…
      </div>
    );
  }

  const { today, salaryMonth, lifetime, monthCalendars } = profile;

  const activeCalendar = monthCalendars[activeMonthIdx] ?? monthCalendars[monthCalendars.length - 1];

  const selectedRecord = useMemo(() => {
    if (!selectedDay?.record) return null;
    return selectedDay.record;
  }, [selectedDay]);

  return (
    <div className="pb-10">
      <button
        type="button"
        onClick={onBack}
        className="mb-4 inline-flex items-center gap-2 text-sm font-semibold text-slate-600 transition hover:text-[#191970] dark:text-slate-400 dark:hover:text-blue-300"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to attendance directory
      </button>

      {error ? (
        <div className="mb-4 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800">{error}</div>
      ) : null}

      <header className="mb-6 overflow-hidden rounded-2xl border border-slate-200/90 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div className="border-b border-slate-100 bg-gradient-to-r from-[#191970]/[0.06] to-transparent px-6 py-5 dark:border-slate-800">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="flex min-w-0 items-start gap-4">
              <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-[#191970] text-lg font-bold text-white">
                {profile.employeeName
                  .split(" ")
                  .map((p) => p[0])
                  .join("")
                  .slice(0, 2)
                  .toUpperCase()}
              </span>
              <div className="min-w-0">
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Employee attendance profile</p>
                <h1 className="mt-0.5 text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
                  {profile.employeeName}
                </h1>
                <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
                  {profile.designation ?? "Employee"} · {profile.employeeCode}
                </p>
                <div className="mt-3 flex flex-wrap gap-3 text-xs text-slate-500">
                  <span className="inline-flex items-center gap-1.5">
                    <Building2 className="h-3.5 w-3.5" />
                    {profile.department}
                  </span>
                  <span className="inline-flex items-center gap-1.5">
                    <MapPin className="h-3.5 w-3.5" />
                    {profile.location}
                  </span>
                  <span className="inline-flex items-center gap-1.5">
                    <User className="h-3.5 w-3.5" />
                    Joined {profile.joinedAt}
                  </span>
                </div>
              </div>
            </div>
            <div className="rounded-xl border border-slate-200/90 bg-white px-4 py-3 text-right dark:border-slate-700 dark:bg-slate-950">
              <p className="text-[10px] font-bold uppercase tracking-wide text-slate-400">Today</p>
              <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">{today.date}</p>
              <div className="mt-2 flex justify-end">
                <AttendanceStatusBadge status={today.status} />
              </div>
            </div>
          </div>
        </div>

        <div className="grid gap-3 p-4 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-8">
          <MetricCard label="Attendance rate" value={`${lifetime.attendanceRate}%`} sub="Since joining" tone="navy" />
          <MetricCard label="Payable days" value={lifetime.payableDays} sub={`of ${lifetime.totalWorkingDays} working days`} tone="emerald" />
          <MetricCard label="Late arrivals" value={lifetime.late} sub={`${lifetime.lateRate}% of working days`} tone="amber" />
          <MetricCard label="Days off" value={lifetime.offDays} sub="Weekends & non-working" />
          <MetricCard label="Absent" value={lifetime.absent} sub="Unexcused absence" tone="rose" />
          <MetricCard label="On leave" value={lifetime.onLeave} sub="Approved leave" />
          <MetricCard label="Total hours" value={`${lifetime.totalHours}h`} sub="Logged since join" />
          <MetricCard
            label="Salary month"
            value={`${salaryMonth.attendanceRate}%`}
            sub={salaryMonth.periodLabel}
            tone="navy"
          />
        </div>
      </header>

      <div className="grid gap-6 xl:grid-cols-[1fr_320px]">
        <div className="space-y-6">
          <section className="rounded-2xl border border-slate-200/90 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="text-sm font-bold text-slate-900 dark:text-white">Monthly attendance calendar</h2>
                <p className="mt-1 text-xs text-slate-500">
                  Full history from {profile.joinedAt} · {monthCalendars.length} months tracked
                </p>
              </div>
              <select
                value={activeMonthIdx}
                onChange={(e) => {
                  setActiveMonthIdx(Number(e.target.value));
                  setSelectedDay(null);
                }}
                className="h-9 rounded-lg border border-slate-200 bg-white px-3 text-sm outline-none focus:border-[#191970] dark:border-slate-700 dark:bg-slate-950"
              >
                {monthCalendars.map((cal, idx) => (
                  <option key={`${cal.year}-${cal.month}`} value={idx}>
                    {cal.label} · {cal.summary.attendanceRate}% · {cal.summary.late} late
                  </option>
                ))}
              </select>
            </div>

            {activeCalendar ? (
              <AttendanceCalendarMonth
                calendar={activeCalendar}
                selectedDate={selectedDay?.dateLabel ?? null}
                onSelectDay={setSelectedDay}
              />
            ) : null}

            <AttendanceCalendarLegend className="mt-4 border-t border-slate-100 pt-4 dark:border-slate-800" />
          </section>

          <AttendanceMonthAnalyticsTable
            monthCalendars={monthCalendars}
            activeYear={activeCalendar?.year}
            activeMonth={activeCalendar?.month}
            onSelectMonth={(year, month) => {
              const idx = monthCalendars.findIndex((m) => m.year === year && m.month === month);
              if (idx >= 0) {
                setActiveMonthIdx(idx);
                setSelectedDay(null);
              }
            }}
          />

          <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {monthCalendars
              .slice(-6)
              .reverse()
              .map((cal) => (
                <AttendanceCalendarMonth key={`${cal.year}-${cal.month}`} calendar={cal} compact />
              ))}
          </section>
        </div>

        <aside className="space-y-4">
          <section className="rounded-2xl border border-slate-200/90 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <h2 className="text-sm font-bold text-slate-900 dark:text-white">Today&apos;s clock-in</h2>
            <div className="mt-3 flex flex-wrap gap-2">
              <button
                type="button"
                onClick={handleCheckIn}
                disabled={actionLoading}
                className="inline-flex h-9 items-center gap-1.5 rounded-lg bg-[#191970] px-3 text-xs font-semibold text-white disabled:opacity-50"
              >
                <LogIn className="h-3.5 w-3.5" />
                Check in
              </button>
              <button
                type="button"
                onClick={handleCheckOut}
                disabled={actionLoading}
                className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-slate-200 px-3 text-xs font-semibold text-slate-700 disabled:opacity-50"
              >
                <LogOut className="h-3.5 w-3.5" />
                Check out
              </button>
              <button
                type="button"
                onClick={handleCorrectToday}
                disabled={actionLoading}
                className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-slate-200 px-3 text-xs font-semibold text-slate-700 disabled:opacity-50"
              >
                Mark present
              </button>
            </div>
            <div className="mt-4 space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-slate-500">Check in</span>
                <span className="font-medium tabular-nums text-slate-900 dark:text-white">{today.checkIn ?? "—"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Check out</span>
                <span className="font-medium tabular-nums text-slate-900 dark:text-white">{today.checkOut ?? "—"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Hours</span>
                <span className="font-medium tabular-nums text-slate-900 dark:text-white">
                  {today.hoursWorked != null ? `${today.hoursWorked}h` : "—"}
                </span>
              </div>
            </div>
          </section>

          <section className="rounded-2xl border border-slate-200/90 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <div className="mb-3 flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-[#191970]" />
              <h2 className="text-sm font-bold text-slate-900 dark:text-white">Current salary month</h2>
            </div>
            <AttendanceSalaryMonthStrip summary={salaryMonth} />
          </section>

          <section className="rounded-2xl border border-slate-200/90 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <h2 className="text-sm font-bold text-slate-900 dark:text-white">
              {selectedDay ? "Selected day" : "Day details"}
            </h2>
            {selectedRecord ? (
              <div className="mt-4 space-y-3 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">{selectedDay?.dateLabel}</span>
                  <AttendanceStatusBadge status={selectedRecord.status} />
                </div>
                <div className="flex justify-between">
                  <span className="inline-flex items-center gap-1.5 text-slate-500">
                    <Clock className="h-3.5 w-3.5" />
                    Check in
                  </span>
                  <span className="font-medium tabular-nums">{selectedRecord.checkIn ?? "—"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Check out</span>
                  <span className="font-medium tabular-nums">{selectedRecord.checkOut ?? "—"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Hours</span>
                  <span className="font-medium tabular-nums">
                    {selectedRecord.hoursWorked != null ? `${selectedRecord.hoursWorked}h` : "—"}
                  </span>
                </div>
              </div>
            ) : (
              <p className="mt-3 text-xs text-slate-500">Click any day on the calendar to inspect check-in details.</p>
            )}
          </section>

          <section className="rounded-2xl border border-dashed border-slate-200 bg-slate-50/60 p-4 dark:border-slate-700 dark:bg-slate-950/40">
            <div className="flex items-start gap-2 text-xs text-slate-500">
              <Calendar className="mt-0.5 h-4 w-4 shrink-0 text-slate-400" />
              <p>
                Salary months run <strong className="text-slate-700 dark:text-slate-300">27th → 26th</strong>. Calendar
                months show full attendance from join date ({profile.joinedAt}) with weekend off-days excluded from
                working-day calculations.
              </p>
            </div>
          </section>
        </aside>
      </div>
    </div>
  );
}
