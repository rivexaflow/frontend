"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  AlertTriangle,
  CheckCircle2,
  Clock,
  Coffee,
  IndianRupee,
  Leaf,
  LogIn,
  LogOut,
  PauseCircle,
  RefreshCw,
} from "lucide-react";

import { crm } from "@/features/workspace/components/crm/crm-styles";
import { AttendanceStatusBadge } from "@/features/workspace/components/hrm/attendance/attendance-status-badge";
import { MyAttendanceCalendar } from "@/features/workspace/components/hrm/attendance/my-attendance-calendar";
import {
  countEarlyLeaveDays,
  formatTimerFromMs,
  formatTodayHeading,
  recordsForMonth,
} from "@/features/workspace/components/hrm/attendance/my-attendance-utils";
import { DEMO_REGULARIZATION_REQUESTS } from "@/features/workspace/data/hrm-attendance-extended-demo";
import type { EmployeeAttendanceProfile } from "@/features/workspace/data/hrm-attendance-salary-month";
import { useAttendanceClock } from "@/features/workspace/hooks/use-attendance-clock";
import { workspacePaths } from "@/lib/workspace/paths";
import { cn } from "@/lib/utils/cn";

type Props = {
  profile: EmployeeAttendanceProfile | null;
  salaryMonthLabel: string;
  refreshing: boolean;
  onRefresh: () => void;
};

type PanelTab = "calendar" | "leaves" | "history" | "regularization";
type BreakPhase = "idle" | "on_break";

function initials(name: string) {
  return name
    .split(" ")
    .map((p) => p[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

function formatClockTime(iso: string | null | undefined): string | undefined {
  if (!iso) return undefined;
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return undefined;
  return d.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: true });
}

export function AttendanceMyPanel({
  profile,
  salaryMonthLabel,
  refreshing,
  onRefresh,
}: Props) {
  const { clockStatus, loadingClock, handleClockAction } = useAttendanceClock();
  const [tab, setTab] = useState<PanelTab>("calendar");
  const [breakPhase, setBreakPhase] = useState<BreakPhase>("idle");
  const [breakStartedAt, setBreakStartedAt] = useState<number | null>(null);
  const [totalBreakMs, setTotalBreakMs] = useState(0);
  const [tick, setTick] = useState(0);

  const isClockedIn = Boolean(clockStatus?.isClockedIn && !clockStatus?.isClockedOut);
  const isDone = Boolean(clockStatus?.isClockedIn && clockStatus?.isClockedOut);

  useEffect(() => {
    const id = window.setInterval(() => setTick((t) => t + 1), 1000);
    return () => window.clearInterval(id);
  }, []);

  const workingMs = useMemo(() => {
    if (!clockStatus?.checkIn) return 0;
    const start = new Date(clockStatus.checkIn).getTime();
    if (Number.isNaN(start)) return 0;
    const end =
      clockStatus.checkOut && clockStatus.isClockedOut
        ? new Date(clockStatus.checkOut).getTime()
        : Date.now();
    let elapsed = Math.max(0, end - start - totalBreakMs);
    if (breakPhase === "on_break" && breakStartedAt) {
      elapsed -= Date.now() - breakStartedAt;
    }
    return Math.max(0, elapsed);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [clockStatus, totalBreakMs, breakPhase, breakStartedAt, tick]);

  const breakMs = useMemo(() => {
    let ms = totalBreakMs;
    if (breakPhase === "on_break" && breakStartedAt) {
      ms += Date.now() - breakStartedAt;
    }
    return ms;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [totalBreakMs, breakPhase, breakStartedAt, tick]);

  const timeline = useMemo(
    () => ({
      in: formatClockTime(clockStatus?.checkIn) ?? "—",
      break: breakPhase === "on_break" ? formatClockTime(new Date(breakStartedAt ?? Date.now()).toISOString()) : "—",
      resume:
        breakPhase === "idle" && totalBreakMs > 0 && isClockedIn
          ? formatClockTime(new Date().toISOString())
          : "—",
      out: formatClockTime(clockStatus?.checkOut) ?? "—",
    }),
    [clockStatus, breakPhase, breakStartedAt, totalBreakMs, isClockedIn],
  );

  if (!profile) {
    return (
      <div className="px-5 py-20 text-center">
        <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">No employee profile linked</p>
        <p className="mt-1 text-xs text-slate-500">Your account is not mapped to an active employee record.</p>
      </div>
    );
  }

  const { salaryMonth, monthCalendars, historyDays } = profile;
  const currentCalendar = monthCalendars[monthCalendars.length - 1];
  const monthRecords = currentCalendar
    ? recordsForMonth(historyDays, currentCalendar.year, currentCalendar.month)
    : [];
  const earlyLeave = countEarlyLeaveDays(monthRecords);
  const fines = salaryMonth.late * 0;

  const myRegularizations = DEMO_REGULARIZATION_REQUESTS.filter(
    (r) => r.employeeName === profile.employeeName,
  );
  const leaveDays = historyDays.filter((r) => r.status === "on_leave").slice(0, 8);

  const clockCards = [
    {
      id: "in",
      label: "Clock In",
      icon: LogIn,
      enabled: !isClockedIn && !isDone,
      active: !isClockedIn && !isDone,
      onClick: () => void handleClockAction(),
    },
    {
      id: "break-start",
      label: "Break Start",
      icon: Coffee,
      enabled: isClockedIn && breakPhase === "idle",
      active: breakPhase === "on_break",
      onClick: () => {
        if (!isClockedIn || breakPhase !== "idle") return;
        setBreakPhase("on_break");
        setBreakStartedAt(Date.now());
      },
    },
    {
      id: "break-end",
      label: "Break End",
      icon: PauseCircle,
      enabled: isClockedIn && breakPhase === "on_break",
      active: false,
      onClick: () => {
        if (breakPhase !== "on_break" || !breakStartedAt) return;
        setTotalBreakMs((prev) => prev + (Date.now() - breakStartedAt));
        setBreakPhase("idle");
        setBreakStartedAt(null);
      },
    },
    {
      id: "out",
      label: "Clock Out",
      icon: LogOut,
      enabled: isClockedIn && breakPhase === "idle",
      active: isDone,
      onClick: () => void handleClockAction(),
    },
  ] as const;

  const tabs: { id: PanelTab; label: string }[] = [
    { id: "calendar", label: "Calendar" },
    { id: "leaves", label: "Leaves" },
    { id: "history", label: "History" },
    { id: "regularization", label: "Regularization" },
  ];

  return (
    <div className="space-y-4 p-4 md:p-5">
      {/* Profile header */}
      <div className="flex flex-col gap-4 rounded-2xl border border-slate-200/90 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <span className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-[#191970] to-[#2277FF] text-sm font-bold text-white shadow-md">
            {initials(profile.employeeName)}
          </span>
          <div>
            <p className="text-base font-bold text-slate-900 dark:text-white">{profile.employeeName}</p>
            <p className="text-xs text-slate-500">{formatTodayHeading()}</p>
            <div className="mt-1">
              <AttendanceStatusBadge status={profile.today.status} />
            </div>
          </div>
        </div>
        <Link
          href={workspacePaths.hrmLeave}
          className="inline-flex items-center justify-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-2.5 text-sm font-semibold text-emerald-700 transition hover:bg-emerald-100 dark:border-emerald-900/50 dark:bg-emerald-950/30 dark:text-emerald-300"
        >
          <Leaf className="h-4 w-4" />
          Apply Leave
        </Link>
      </div>

      {/* Clock action cards */}
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {clockCards.map((card) => (
          <button
            key={card.id}
            type="button"
            disabled={!card.enabled || loadingClock}
            onClick={card.onClick}
            className={cn(
              "flex flex-col items-center gap-2 rounded-2xl border px-4 py-5 text-center transition",
              card.active
                ? "border-[#191970]/30 bg-[#191970]/5 shadow-sm dark:border-[#2277FF]/40 dark:bg-[#2277FF]/10"
                : card.enabled
                  ? "border-slate-200 bg-white hover:border-[#191970]/20 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:hover:bg-slate-800"
                  : "cursor-not-allowed border-slate-100 bg-slate-50 text-slate-300 dark:border-slate-800 dark:bg-slate-950/50",
            )}
          >
            <span
              className={cn(
                "flex h-11 w-11 items-center justify-center rounded-xl",
                card.active
                  ? "bg-[#191970] text-white dark:bg-[#2277FF]"
                  : card.enabled
                    ? "bg-slate-100 text-slate-500 dark:bg-slate-800"
                    : "bg-slate-100 text-slate-300",
              )}
            >
              <card.icon className="h-5 w-5" />
            </span>
            <span className={cn("text-sm font-semibold", card.enabled ? "text-slate-800 dark:text-white" : "text-slate-300")}>
              {card.label}
            </span>
          </button>
        ))}
      </div>

      {/* Timers */}
      <div className="rounded-2xl border border-slate-200/90 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900 md:p-5">
        <div className="grid gap-4 md:grid-cols-2">
          <div className="rounded-xl border border-emerald-100 bg-emerald-50/50 px-4 py-3 dark:border-emerald-900/40 dark:bg-emerald-950/20">
            <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-emerald-700 dark:text-emerald-300">
              Working time
            </p>
            <p className="mt-1 font-mono text-3xl font-bold tabular-nums text-emerald-700 dark:text-emerald-300">
              {formatTimerFromMs(workingMs)}
            </p>
          </div>
          <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 dark:border-slate-700 dark:bg-slate-950/40">
            <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-slate-500">Break time</p>
            <p className="mt-1 font-mono text-3xl font-bold tabular-nums text-slate-700 dark:text-slate-200">
              {formatTimerFromMs(breakMs)}
            </p>
          </div>
        </div>

        <div className="mt-4 grid grid-cols-4 gap-2 border-t border-slate-100 pt-4 dark:border-slate-800">
          {(
            [
              ["IN", timeline.in],
              ["BREAK", timeline.break],
              ["RESUME", timeline.resume],
              ["OUT", timeline.out],
            ] as const
          ).map(([label, value]) => (
            <div key={label} className="text-center">
              <p className="text-[10px] font-bold uppercase tracking-wide text-slate-400">{label}</p>
              <p className="mt-1 text-xs font-semibold tabular-nums text-slate-700 dark:text-slate-200">{value}</p>
            </div>
          ))}
        </div>

        <p className="mt-4 text-center text-xs text-slate-400">
          {!isClockedIn && !isDone
            ? "Tap Clock In to start your day"
            : breakPhase === "on_break"
              ? "You are on break — tap Break End to resume"
              : isDone
                ? "You have clocked out for today"
                : "Your workday is in progress"}
        </p>
      </div>

      {/* Monthly stats */}
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {[
          {
            label: "Present",
            value: salaryMonth.present + salaryMonth.remote,
            hint: "This month",
            icon: CheckCircle2,
            tone: "text-emerald-600",
            bg: "bg-emerald-50 dark:bg-emerald-950/30",
          },
          {
            label: "Late",
            value: salaryMonth.late,
            hint: "This month",
            icon: AlertTriangle,
            tone: "text-amber-600",
            bg: "bg-amber-50 dark:bg-amber-950/30",
          },
          {
            label: "Early leave",
            value: earlyLeave,
            hint: "This month",
            icon: Clock,
            tone: "text-[#2277FF]",
            bg: "bg-[#2277FF]/10 dark:bg-[#2277FF]/15",
          },
          {
            label: "Fines",
            value: `₹${fines}`,
            hint: "This month",
            icon: IndianRupee,
            tone: "text-rose-600",
            bg: "bg-rose-50 dark:bg-rose-950/30",
          },
        ].map((stat) => (
          <div
            key={stat.label}
            className="flex items-center gap-3 rounded-2xl border border-slate-200/90 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900"
          >
            <span className={cn("flex h-10 w-10 items-center justify-center rounded-xl", stat.bg, stat.tone)}>
              <stat.icon className="h-5 w-5" />
            </span>
            <div>
              <p className="text-lg font-bold tabular-nums text-slate-900 dark:text-white">{stat.value}</p>
              <p className="text-xs font-semibold text-slate-700 dark:text-slate-200">{stat.label}</p>
              <p className="text-[10px] text-slate-400">{stat.hint}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="overflow-hidden rounded-2xl border border-slate-200/90 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div className="flex flex-wrap gap-1 border-b border-slate-100 bg-slate-50/70 p-1.5 dark:border-slate-800 dark:bg-slate-950/40">
          {tabs.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => setTab(item.id)}
              className={cn(
                "rounded-lg px-4 py-2 text-xs font-semibold transition",
                tab === item.id
                  ? "bg-[#191970] text-white shadow-sm dark:bg-[#2277FF]"
                  : "text-slate-600 hover:bg-white dark:text-slate-300 dark:hover:bg-slate-900",
              )}
            >
              {item.label}
            </button>
          ))}
          <div className="ml-auto flex items-center pr-1">
            <button
              type="button"
              onClick={onRefresh}
              disabled={refreshing}
              className={cn(crm.btnSecondarySm, "h-8")}
            >
              <RefreshCw className={cn("h-3.5 w-3.5", refreshing && "animate-spin")} />
              Refresh
            </button>
          </div>
        </div>

        <div className="p-4">
          {tab === "calendar" ? (
            <MyAttendanceCalendar
              calendars={monthCalendars}
              employeeCode={profile.employeeCode}
              isCurrentlyActive={isClockedIn}
            />
          ) : null}

          {tab === "leaves" ? (
            <div className="space-y-2">
              {leaveDays.length === 0 ? (
                <p className="py-8 text-center text-sm text-slate-500">No leave days recorded this cycle.</p>
              ) : (
                leaveDays.map((day) => (
                  <div
                    key={day.id}
                    className="flex items-center justify-between rounded-xl border border-violet-100 bg-violet-50/50 px-4 py-3 dark:border-violet-900/40 dark:bg-violet-950/20"
                  >
                    <div className="flex items-center gap-2">
                      <Leaf className="h-4 w-4 text-violet-600" />
                      <div>
                        <p className="text-sm font-semibold text-slate-800 dark:text-white">{day.date}</p>
                        <p className="text-xs text-slate-500">On leave</p>
                      </div>
                    </div>
                    <AttendanceStatusBadge status="on_leave" />
                  </div>
                ))
              )}
            </div>
          ) : null}

          {tab === "history" ? (
            <div className="overflow-hidden rounded-xl border border-slate-200 dark:border-slate-800">
              <div className="grid grid-cols-[1fr_auto_auto_auto] gap-2 border-b border-slate-100 bg-slate-50 px-3 py-2 text-[10px] font-bold uppercase tracking-wide text-slate-400 dark:border-slate-800 dark:bg-slate-950/50">
                <span>Date</span>
                <span className="w-16 text-right">In</span>
                <span className="w-16 text-right">Out</span>
                <span className="w-20 text-right">Status</span>
              </div>
              <ul className="max-h-[420px] divide-y divide-slate-100 overflow-y-auto dark:divide-slate-800">
                {monthRecords
                  .slice()
                  .reverse()
                  .map((row) => (
                    <li
                      key={row.id}
                      className="grid grid-cols-[1fr_auto_auto_auto] items-center gap-2 px-3 py-2.5 text-sm"
                    >
                      <span className="font-medium text-slate-800 dark:text-slate-100">{row.date}</span>
                      <span className="w-16 text-right font-mono text-xs text-slate-500">{row.checkIn ?? "—"}</span>
                      <span className="w-16 text-right font-mono text-xs text-slate-500">{row.checkOut ?? "—"}</span>
                      <span className="w-20 text-right">
                        <AttendanceStatusBadge status={row.status} />
                      </span>
                    </li>
                  ))}
              </ul>
            </div>
          ) : null}

          {tab === "regularization" ? (
            <div className="space-y-2">
              {myRegularizations.length === 0 ? (
                <div className="py-8 text-center">
                  <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">No regularization requests</p>
                  <p className="mt-1 text-xs text-slate-500">
                    Submit a request from the{" "}
                    <Link href={workspacePaths.hrmAttendanceRegularization} className="font-semibold text-[#191970] dark:text-[#2277FF]">
                      Regularization
                    </Link>{" "}
                    page.
                  </p>
                </div>
              ) : (
                myRegularizations.map((req) => (
                  <div
                    key={req.id}
                    className="rounded-xl border border-slate-200 px-4 py-3 dark:border-slate-700"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-sm font-semibold text-slate-800 dark:text-white">{req.date}</p>
                      <span
                        className={cn(
                          "rounded-full px-2 py-0.5 text-[10px] font-bold uppercase",
                          req.status === "approved" && "bg-emerald-100 text-emerald-700",
                          req.status === "pending" && "bg-amber-100 text-amber-700",
                          req.status === "rejected" && "bg-rose-100 text-rose-700",
                        )}
                      >
                        {req.status}
                      </span>
                    </div>
                    <p className="mt-1 text-xs text-slate-500">
                      {req.requestedCheckIn} → {req.requestedCheckOut}
                    </p>
                    <p className="mt-1 text-xs text-slate-600 dark:text-slate-300">{req.reason}</p>
                  </div>
                ))
              )}
            </div>
          ) : null}
        </div>
      </div>

      <p className="text-center text-[10px] text-slate-400">Salary month · {salaryMonthLabel}</p>
    </div>
  );
}
