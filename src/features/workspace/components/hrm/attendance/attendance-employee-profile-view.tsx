"use client";

import { useEffect, useMemo, useState } from "react";
import {
  ArrowLeft,
  Building2,
  Calendar,
  CalendarDays,
  Clock,
  Loader2,
  LogIn,
  LogOut,
  MapPin,
  TrendingUp,
  User,
  UserCheck,
} from "lucide-react";

import { CrmShell } from "@/features/workspace/components/crm/crm-panel";
import {
  AttendanceCalendarLegend,
  AttendanceCalendarMonth,
} from "@/features/workspace/components/hrm/attendance/attendance-calendar-month";
import { AttendanceMonthAnalyticsTable } from "@/features/workspace/components/hrm/attendance/attendance-month-analytics-table";
import { AttendanceSalaryMonthStrip } from "@/features/workspace/components/hrm/attendance/attendance-salary-month-strip";
import { AttendanceStatStrip } from "@/features/workspace/components/hrm/attendance/attendance-stat-strip";
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

  const selectedRecord = useMemo(() => {
    if (!selectedDay?.record) return null;
    return selectedDay.record;
  }, [selectedDay]);

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

  return (
    <div className="pb-10">
      <button
        type="button"
        onClick={onBack}
        className="mb-4 inline-flex items-center gap-2 text-sm font-semibold text-slate-600 transition hover:text-[#191970]"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to attendance directory
      </button>

      {error ? (
        <div className="mb-4 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800">{error}</div>
      ) : null}

      <CrmShell>
        <div className="overflow-hidden rounded-t-2xl border-b border-[#12124a]/20 bg-gradient-to-r from-[#191970] via-[#1e1e7a] to-[#252580] px-5 py-5">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="flex min-w-0 items-start gap-4">
              <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-white/15 text-lg font-bold text-white ring-1 ring-white/20 backdrop-blur-sm">
                {profile.employeeName
                  .split(" ")
                  .map((p) => p[0])
                  .join("")
                  .slice(0, 2)
                  .toUpperCase()}
              </span>
              <div className="min-w-0">
                <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-indigo-200/80">Attendance profile</p>
                <h1 className="mt-0.5 text-xl font-bold tracking-tight text-white sm:text-2xl">{profile.employeeName}</h1>
                <p className="mt-1 text-sm text-indigo-100/80">
                  {profile.designation ?? "Employee"} · {profile.employeeCode}
                </p>
                <div className="mt-2 flex flex-wrap gap-3 text-xs text-indigo-200/70">
                  <span className="inline-flex items-center gap-1">
                    <Building2 className="h-3.5 w-3.5" />
                    {profile.department}
                  </span>
                  <span className="inline-flex items-center gap-1">
                    <MapPin className="h-3.5 w-3.5" />
                    {profile.location}
                  </span>
                  <span className="inline-flex items-center gap-1">
                    <User className="h-3.5 w-3.5" />
                    Joined {profile.joinedAt}
                  </span>
                </div>
              </div>
            </div>
            <div className="rounded-xl bg-white/10 px-4 py-3 ring-1 ring-white/15 backdrop-blur-sm">
              <p className="text-[10px] font-bold uppercase tracking-wide text-indigo-200/70">Today</p>
              <p className="text-sm font-semibold text-white">{today.date}</p>
              <div className="mt-2">
                <AttendanceStatusBadge status={today.status} className="!bg-white/20 !text-white !ring-white/25" />
              </div>
            </div>
          </div>
        </div>

        <div className="border-b border-slate-100 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
          <AttendanceStatStrip
            stats={[
              { label: "Rate", value: `${lifetime.attendanceRate}%`, hint: "Since joining", icon: TrendingUp, tone: "blue" },
              { label: "Payable", value: lifetime.payableDays, hint: `${lifetime.totalWorkingDays} working days`, icon: UserCheck, tone: "emerald" },
              { label: "Late", value: lifetime.late, hint: `${lifetime.lateRate}% of days`, icon: Clock, tone: "amber" },
              { label: "Off days", value: lifetime.offDays, hint: "Weekends", icon: CalendarDays, tone: "sky" },
              { label: "Absent", value: lifetime.absent, hint: "Unexcused", icon: User, tone: "rose" },
              { label: "Leave", value: lifetime.onLeave, hint: "Approved", icon: Calendar, tone: "sky" },
              { label: "Hours", value: `${lifetime.totalHours}h`, hint: "Logged", icon: Clock, tone: "blue" },
              { label: "Salary mo.", value: `${salaryMonth.attendanceRate}%`, hint: salaryMonth.periodLabel, icon: TrendingUp, tone: "emerald" },
            ]}
          />
        </div>

        <div className="grid gap-0 xl:grid-cols-[1fr_300px]">
          <div className="space-y-0 border-r border-slate-100 dark:border-slate-800">
            <div className="p-4 md:p-5">
              {activeCalendar ? (
                <AttendanceCalendarMonth
                  calendar={activeCalendar}
                  selectedDate={selectedDay?.dateLabel ?? null}
                  onSelectDay={setSelectedDay}
                  onPrevMonth={() => {
                    setActiveMonthIdx((i) => Math.max(0, i - 1));
                    setSelectedDay(null);
                  }}
                  onNextMonth={() => {
                    setActiveMonthIdx((i) => Math.min(monthCalendars.length - 1, i + 1));
                    setSelectedDay(null);
                  }}
                  canPrev={activeMonthIdx > 0}
                  canNext={activeMonthIdx < monthCalendars.length - 1}
                />
              ) : null}
              <AttendanceCalendarLegend className="mt-4" />
            </div>

            <div className="border-t border-slate-100 p-4 md:p-5 dark:border-slate-800">
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
            </div>
          </div>

          <aside className="space-y-4 bg-slate-50/40 p-4 dark:bg-slate-950/20">
            <section className="overflow-hidden rounded-2xl border border-slate-200/90 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
              <div className="border-b border-slate-100 bg-gradient-to-r from-[#191970]/[0.05] to-transparent px-4 py-3 dark:border-slate-800">
                <h2 className="text-sm font-bold text-slate-900 dark:text-white">Today&apos;s clock-in</h2>
                <p className="mt-0.5 text-xs text-slate-500">{today.date}</p>
              </div>
              <div className="p-4">
                <div className="grid grid-cols-1 gap-2 sm:grid-cols-3 xl:grid-cols-1">
                  <button
                    type="button"
                    onClick={handleCheckIn}
                    disabled={actionLoading}
                    className="inline-flex h-10 items-center justify-center gap-1.5 rounded-xl bg-[#191970] text-xs font-semibold text-white shadow-sm hover:bg-[#12124a] disabled:opacity-50"
                  >
                    <LogIn className="h-4 w-4" />
                    Check in
                  </button>
                  <button
                    type="button"
                    onClick={handleCheckOut}
                    disabled={actionLoading}
                    className="inline-flex h-10 items-center justify-center gap-1.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-50"
                  >
                    <LogOut className="h-4 w-4" />
                    Check out
                  </button>
                  <button
                    type="button"
                    onClick={handleCorrectToday}
                    disabled={actionLoading}
                    className="inline-flex h-10 items-center justify-center gap-1.5 rounded-xl border border-emerald-200 bg-emerald-50 text-xs font-semibold text-emerald-800 hover:bg-emerald-100 disabled:opacity-50"
                  >
                    Mark present
                  </button>
                </div>
                <div className="mt-4 grid grid-cols-3 gap-2">
                  {[
                    { label: "In", value: today.checkIn ?? "—" },
                    { label: "Out", value: today.checkOut ?? "—" },
                    { label: "Hrs", value: today.hoursWorked != null ? `${today.hoursWorked}h` : "—" },
                  ].map((row) => (
                    <div key={row.label} className="rounded-lg bg-slate-50 px-2 py-2 text-center dark:bg-slate-950">
                      <p className="text-[9px] font-bold uppercase text-slate-400">{row.label}</p>
                      <p className="mt-0.5 text-sm font-bold tabular-nums text-slate-900 dark:text-white">{row.value}</p>
                    </div>
                  ))}
                </div>
              </div>
            </section>

            <section className="rounded-2xl border border-slate-200/90 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
              <div className="mb-3 flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-[#191970]" />
                <h2 className="text-sm font-bold text-slate-900 dark:text-white">Current salary month</h2>
              </div>
              <AttendanceSalaryMonthStrip summary={salaryMonth} />
            </section>

            <section
              className={cn(
                "rounded-2xl border p-4 shadow-sm transition",
                selectedRecord
                  ? "border-[#2277ff]/30 bg-[#2277ff]/[0.04]"
                  : "border-slate-200/90 bg-white dark:border-slate-800 dark:bg-slate-900",
              )}
            >
              <h2 className="text-sm font-bold text-slate-900 dark:text-white">
                {selectedDay ? selectedDay.dateLabel : "Day details"}
              </h2>
              {selectedRecord ? (
                <div className="mt-4 space-y-3 text-sm">
                  <div className="flex items-center justify-between">
                    <AttendanceStatusBadge status={selectedRecord.status} />
                    {selectedRecord.hoursWorked != null ? (
                      <span className="text-xs font-semibold text-slate-500">{selectedRecord.hoursWorked}h logged</span>
                    ) : null}
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="rounded-lg bg-white/80 px-3 py-2 ring-1 ring-slate-200/60">
                      <p className="text-[10px] font-bold uppercase text-slate-400">Check in</p>
                      <p className="font-bold tabular-nums text-slate-900">{selectedRecord.checkIn ?? "—"}</p>
                    </div>
                    <div className="rounded-lg bg-white/80 px-3 py-2 ring-1 ring-slate-200/60">
                      <p className="text-[10px] font-bold uppercase text-slate-400">Check out</p>
                      <p className="font-bold tabular-nums text-slate-900">{selectedRecord.checkOut ?? "—"}</p>
                    </div>
                  </div>
                </div>
              ) : (
                <p className="mt-3 text-xs leading-relaxed text-slate-500">
                  Select any day on the calendar heatmap to inspect check-in times and status.
                </p>
              )}
            </section>

            <div className="rounded-xl border border-dashed border-slate-200 bg-white/60 p-3 text-xs leading-relaxed text-slate-500 dark:border-slate-700">
              <Calendar className="mb-1.5 h-4 w-4 text-slate-400" />
              Salary months run <strong className="text-slate-700">27th → 26th</strong>. Blue-tinted days fall inside
              the active salary cycle.
            </div>
          </aside>
        </div>
      </CrmShell>
    </div>
  );
}
