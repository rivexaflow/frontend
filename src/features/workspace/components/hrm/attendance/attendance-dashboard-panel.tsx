"use client";

import { motion } from "framer-motion";
import {
  AlertCircle,
  CalendarDays,
  CheckCircle2,
  ChevronRight,
  Clock,
  Loader2,
  RefreshCw,
  Search,
  Settings2,
  Timer,
  TrendingUp,
  UserMinus,
  Users,
} from "lucide-react";
import { useMemo, useState } from "react";

import { crm } from "@/features/workspace/components/crm/crm-styles";
import { AttendanceStatusBadge } from "@/features/workspace/components/hrm/attendance/attendance-status-badge";
import {
  ATTENDANCE_STATUSES,
  type AttendanceStatus,
} from "@/features/workspace/data/hrm-attendance-demo";
import {
  formatDisplayDate,
  type EmployeeAttendanceProfile,
} from "@/features/workspace/data/hrm-attendance-salary-month";
import { cn } from "@/lib/utils/cn";

type BreakdownSegment = {
  key: string;
  label: string;
  value: number;
  color: string;
  gradient: string;
  track: string;
};

function formatAvgHours(profiles: EmployeeAttendanceProfile[]): string {
  const withHours = profiles.filter((p) => (p.today.hoursWorked ?? 0) > 0);
  if (!withHours.length) return "0m";
  const avg = withHours.reduce((s, p) => s + (p.today.hoursWorked ?? 0), 0) / withHours.length;
  const h = Math.floor(avg);
  const m = Math.round((avg - h) * 60);
  if (h > 0) return `${h}h ${m}m`;
  return `${m}m`;
}

function formatHoursWorked(hours: number | undefined | null) {
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

const BRAND_SEGMENT_COLORS = [
  "#191970",
  "#2277FF",
  "#3d4fa8",
  "#4d8fff",
  "#6b7bc4",
  "#8eb4ff",
] as const;

function avatarTone(name: string) {
  const tones = [
    "from-[#191970] to-[#2277ff]",
    "from-[#191970] to-[#3d5fd4]",
    "from-[#1a2d8f] to-[#2277ff]",
    "from-[#191970]/90 to-[#4d8fff]",
  ];
  let hash = 0;
  for (let i = 0; i < name.length; i += 1) hash += name.charCodeAt(i);
  return tones[hash % tones.length];
}

function pct(value: number, total: number) {
  if (!total) return 0;
  return Math.round((value / total) * 100);
}

function DonutChart({ segments, total }: { segments: BreakdownSegment[]; total: number }) {
  const radius = 40;
  const circumference = 2 * Math.PI * radius;
  let offset = 0;
  const gap = 3;

  return (
    <div className="relative mx-auto h-[11.5rem] w-[11.5rem]">
      <div className="absolute inset-3 rounded-full bg-gradient-to-br from-slate-50 to-white shadow-inner dark:from-slate-900 dark:to-slate-950" />
      <svg viewBox="0 0 100 100" className="relative h-full w-full -rotate-90">
        <defs>
          {segments.map((seg) => (
            <linearGradient key={`grad-${seg.key}`} id={`donut-${seg.key}`} x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor={seg.color} stopOpacity="1" />
              <stop offset="100%" stopColor={seg.color} stopOpacity="0.65" />
            </linearGradient>
          ))}
        </defs>
        <circle
          cx="50"
          cy="50"
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth="11"
          className="text-slate-100/90 dark:text-slate-800/80"
        />
        {segments.map((seg) => {
          if (seg.value <= 0 || total <= 0) return null;
          const dash = Math.max(0, (seg.value / total) * circumference - gap);
          const circle = (
            <circle
              key={seg.key}
              cx="50"
              cy="50"
              r={radius}
              fill="none"
              stroke={`url(#donut-${seg.key})`}
              strokeWidth="11"
              strokeDasharray={`${dash} ${circumference - dash}`}
              strokeDashoffset={-offset}
              strokeLinecap="round"
              className="transition-all duration-700 ease-out"
            />
          );
          offset += dash + gap;
          return circle;
        })}
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-[10px] font-bold uppercase tracking-[0.14em] text-slate-400">Workforce</span>
        <span className="text-3xl font-bold tabular-nums tracking-tight text-slate-900 dark:text-white">{total}</span>
        <span className="text-[10px] font-medium text-slate-500">tracked today</span>
      </div>
    </div>
  );
}

type Props = {
  profiles: EmployeeAttendanceProfile[];
  loading: boolean;
  refreshing: boolean;
  referenceDate: Date;
  statusFilter: AttendanceStatus | "";
  onStatusFilterChange: (status: AttendanceStatus | "") => void;
  onRefresh: () => void;
  onSelect: (profile: EmployeeAttendanceProfile) => void;
};

export function AttendanceDashboardPanel({
  profiles,
  loading,
  refreshing,
  referenceDate,
  statusFilter,
  onStatusFilterChange,
  onRefresh,
  onSelect,
}: Props) {
  const [search, setSearch] = useState("");

  const presentCount = profiles.filter(
    (p) => p.today.status === "present" || p.today.status === "remote",
  ).length;
  const lateCount = profiles.filter((p) => p.today.status === "late").length;
  const halfDayCount = profiles.filter((p) => p.today.status === "half_day").length;
  const notClockedCount = profiles.filter((p) => !p.today.checkIn && p.today.status !== "on_leave").length;
  const absentCount = profiles.filter((p) => p.today.status === "absent").length;
  const onLeaveCount = profiles.filter((p) => p.today.status === "on_leave").length;
  const avgHours = formatAvgHours(profiles);
  const total = profiles.length;
  const attendanceRate = pct(presentCount + lateCount, total);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return profiles.filter((p) => {
      if (statusFilter && p.today.status !== statusFilter) return false;
      if (!q) return true;
      const hay = `${p.employeeName} ${p.employeeCode} ${p.department} ${p.designation ?? ""}`.toLowerCase();
      return hay.includes(q);
    });
  }, [profiles, statusFilter, search]);

  const breakdownDefs = [
    { key: "present", label: "Present", value: presentCount },
    { key: "late", label: "Late", value: lateCount },
    { key: "half", label: "Half day", value: halfDayCount },
    { key: "not-in", label: "Not clocked in", value: notClockedCount },
    { key: "absent", label: "Absent", value: absentCount },
    { key: "leave", label: "On leave", value: onLeaveCount },
  ].filter((s) => s.value > 0);

  const breakdown: BreakdownSegment[] = breakdownDefs.map((seg, index) => {
    const color = BRAND_SEGMENT_COLORS[index % BRAND_SEGMENT_COLORS.length];
    const isDark = index % 2 === 0;
    return {
      ...seg,
      color,
      gradient: isDark ? "from-[#191970] to-[#3d5fd4]" : "from-[#3d5fd4] to-[#2277ff]",
      track: isDark ? "bg-[#191970]" : "bg-[#2277FF]",
    };
  });

  const breakdownTotal = breakdown.reduce((s, seg) => s + seg.value, 0) || total;

  const brandKpiStyle = {
    ring: "ring-[#191970]/10 dark:ring-[#2277FF]/15",
    iconWrap: "bg-gradient-to-br from-[#191970]/12 to-[#2277ff]/10 text-[#191970] dark:text-[#2277FF]",
    valueColor: "text-[#191970] dark:text-[#2277FF]",
    bar: "bg-gradient-to-r from-[#191970] to-[#2277ff]",
  };

  const kpis = [
    {
      label: "Present",
      value: presentCount,
      share: pct(presentCount, total),
      hint: "On-site & remote",
      icon: CheckCircle2,
      ...brandKpiStyle,
    },
    {
      label: "Late arrivals",
      value: lateCount,
      share: pct(lateCount, total),
      hint: "After grace period",
      icon: Clock,
      ...brandKpiStyle,
    },
    {
      label: "Half day",
      value: halfDayCount,
      share: pct(halfDayCount, total),
      hint: "Partial shift",
      icon: UserMinus,
      ...brandKpiStyle,
    },
    {
      label: "Avg. hours",
      value: avgHours,
      share: attendanceRate,
      hint: "Active records today",
      icon: TrendingUp,
      ...brandKpiStyle,
    },
  ];

  const quickFilters: { id: AttendanceStatus | ""; label: string; count?: number }[] = [
    { id: "", label: "All", count: total },
    { id: "present", label: "Present", count: presentCount },
    { id: "late", label: "Late", count: lateCount },
    { id: "absent", label: "Absent", count: absentCount },
    { id: "half_day", label: "Half day", count: halfDayCount },
  ];

  return (
    <div className="space-y-5 p-4 md:p-5">
      <div className="relative overflow-hidden rounded-2xl border border-slate-200/70 bg-gradient-to-r from-[#191970]/[0.03] via-white to-[#2277FF]/[0.04] p-4 shadow-sm dark:border-slate-800 dark:from-[#191970]/20 dark:via-slate-950 dark:to-[#2277FF]/10 md:p-5">
        <div className="pointer-events-none absolute -right-12 -top-12 h-40 w-40 rounded-full bg-[#2277FF]/10 blur-3xl" />
        <div className="relative flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex min-w-0 items-start gap-3">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-[#191970] to-[#2277ff] text-white shadow-lg shadow-[#191970]/20">
              <Users className="h-5 w-5" />
            </span>
            <div className="min-w-0">
              <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-[#2277FF]">Today&apos;s pulse</p>
              <h2 className="text-lg font-bold tracking-tight text-slate-900 dark:text-white">
                {formatDisplayDate(referenceDate)}
              </h2>
              <p className="mt-0.5 text-xs text-slate-500">
                <span className="font-semibold text-[#191970] dark:text-[#2277FF]">{attendanceRate}%</span> attendance
                rate across <span className="font-semibold text-slate-700 dark:text-slate-300">{total}</span> employees
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <label className="relative">
              <CalendarDays className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
              <input
                type="date"
                defaultValue={referenceDate.toISOString().slice(0, 10)}
                className={cn(crm.inputSm, "h-9 min-w-[10rem] bg-white/90 pl-8 dark:bg-slate-900/90")}
              />
            </label>
            <select
              value={statusFilter}
              onChange={(e) => onStatusFilterChange(e.target.value as AttendanceStatus | "")}
              className={cn(crm.select, "h-9 min-w-[9.5rem] bg-white/90 dark:bg-slate-900/90")}
              aria-label="Filter by status"
            >
              <option value="">All statuses</option>
              {ATTENDANCE_STATUSES.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.label}
                </option>
              ))}
            </select>
            <span className="inline-flex items-center gap-1.5 rounded-full border border-[#2277FF]/25 bg-[#2277FF]/10 px-2.5 py-1.5 text-[10px] font-semibold text-[#191970] dark:border-[#2277FF]/30 dark:bg-[#2277FF]/15 dark:text-[#2277FF]">
              <span className="relative flex h-1.5 w-1.5">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#2277FF] opacity-75" />
                <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-[#2277FF]" />
              </span>
              Live
            </span>
            <button
              type="button"
              onClick={onRefresh}
              disabled={refreshing}
              className={cn(crm.btnSecondarySm, "h-9 bg-white/90 dark:bg-slate-900/90")}
            >
              <RefreshCw className={cn("h-3.5 w-3.5", refreshing && "animate-spin")} />
              Refresh
            </button>
          </div>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {kpis.map((kpi, index) => (
          <motion.div
            key={kpi.label}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05, duration: 0.35 }}
            className={cn(
              "group relative overflow-hidden rounded-2xl border border-slate-200/80 bg-white p-4 shadow-[0_2px_12px_rgba(15,23,42,0.04)] transition hover:-translate-y-0.5 hover:shadow-md dark:border-slate-800 dark:bg-slate-900",
              kpi.ring,
              "ring-1 ring-inset",
            )}
          >
            <div className={cn("absolute inset-x-0 top-0 h-0.5 opacity-90", kpi.bar)} />
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-slate-400">{kpi.label}</p>
                <div className="mt-1.5 flex items-end gap-2">
                  <p className={cn("text-2xl font-bold tabular-nums leading-none", kpi.valueColor)}>{kpi.value}</p>
                  <span className="mb-0.5 rounded-md bg-slate-100 px-1.5 py-0.5 text-[10px] font-bold tabular-nums text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                    {kpi.share}%
                  </span>
                </div>
                <p className="mt-1 text-[11px] text-slate-500">{kpi.hint}</p>
              </div>
              <span
                className={cn(
                  "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl shadow-sm transition group-hover:scale-105",
                  kpi.iconWrap,
                )}
              >
                <kpi.icon className="h-4 w-4" />
              </span>
            </div>
            <div className="mt-3 h-1 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
              <div
                className={cn("h-full rounded-full transition-all duration-700", kpi.bar)}
                style={{ width: `${Math.min(100, kpi.share)}%` }}
              />
            </div>
          </motion.div>
        ))}
      </div>

      <div className="grid gap-4 xl:grid-cols-[minmax(0,300px)_minmax(0,1fr)]">
        <motion.div
          initial={{ opacity: 0, x: -8 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.15 }}
          className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-[0_2px_12px_rgba(15,23,42,0.04)] dark:border-slate-800 dark:bg-slate-900"
        >
          <div className="border-b border-slate-100 bg-slate-50/50 px-4 py-3 dark:border-slate-800 dark:bg-slate-950/30">
            <h3 className="text-sm font-semibold text-slate-900 dark:text-white">Status breakdown</h3>
            <p className="text-[11px] text-slate-500">Distribution across today&apos;s workforce</p>
          </div>
          <div className="p-4">
            {loading ? (
              <div className="flex h-48 items-center justify-center">
                <Loader2 className="h-5 w-5 animate-spin text-slate-400" />
              </div>
            ) : (
              <DonutChart segments={breakdown} total={breakdownTotal} />
            )}
            <ul className="mt-4 space-y-2.5">
              {breakdown.map((seg) => (
                <li key={seg.key}>
                  <div className="mb-1 flex items-center justify-between text-xs">
                    <span className="flex items-center gap-2 font-medium text-slate-600 dark:text-slate-300">
                      <span className={cn("h-2 w-2 rounded-full", seg.track)} />
                      {seg.label}
                    </span>
                    <span className="font-bold tabular-nums text-slate-800 dark:text-slate-100">
                      {seg.value}
                      <span className="ml-1 text-[10px] font-medium text-slate-400">
                        ({pct(seg.value, breakdownTotal)}%)
                      </span>
                    </span>
                  </div>
                  <div className="h-1.5 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
                    <div
                      className={cn("h-full rounded-full bg-gradient-to-r transition-all duration-700", seg.gradient)}
                      style={{ width: `${pct(seg.value, breakdownTotal)}%` }}
                    />
                  </div>
                </li>
              ))}
              {!loading && breakdown.length === 0 ? (
                <li className="py-6 text-center text-xs text-slate-400">No attendance data for today</li>
              ) : null}
            </ul>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 8 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-[0_2px_12px_rgba(15,23,42,0.04)] dark:border-slate-800 dark:bg-slate-900"
        >
          <div className="space-y-3 border-b border-slate-100 px-4 py-3 dark:border-slate-800">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <h3 className="text-sm font-semibold text-slate-900 dark:text-white">Employee attendance</h3>
                <p className="text-[11px] text-slate-500">{filtered.length} of {total} shown</p>
              </div>
              <button type="button" className={crm.btnSecondarySm} aria-label="Column settings">
                <Settings2 className="h-3.5 w-3.5" />
                Columns
              </button>
            </div>

            <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
              <div className="relative min-w-0 flex-1">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
                <input
                  type="search"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search employee…"
                  className={cn(crm.inputSm, "w-full bg-slate-50/80 pl-8 dark:bg-slate-950/50")}
                />
              </div>
              <div className="flex flex-wrap gap-1">
                {quickFilters.map((f) => {
                  const active = statusFilter === f.id;
                  return (
                    <button
                      key={f.id || "all"}
                      type="button"
                      onClick={() => onStatusFilterChange(f.id)}
                      className={cn(
                        "inline-flex items-center gap-1 rounded-lg px-2 py-1 text-[10px] font-semibold transition",
                        active
                          ? "bg-[#191970] text-white shadow-sm"
                          : "bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700",
                      )}
                    >
                      {f.label}
                      {f.count != null ? (
                        <span
                          className={cn(
                            "rounded px-1 tabular-nums",
                            active ? "bg-white/20" : "bg-white/70 dark:bg-slate-900/50",
                          )}
                        >
                          {f.count}
                        </span>
                      ) : null}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {loading ? (
            <div className="flex items-center justify-center gap-2 py-24 text-sm text-slate-500">
              <Loader2 className="h-4 w-4 animate-spin" />
              Loading attendance…
            </div>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-2 py-20 text-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 dark:bg-slate-800">
                <AlertCircle className="h-6 w-6 text-slate-400" />
              </div>
              <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">No records for this day</p>
              <p className="max-w-xs text-xs text-slate-500">Adjust filters or check back after employees clock in.</p>
            </div>
          ) : (
            <div className="max-h-[28rem] overflow-auto">
              <table className="w-full min-w-[760px] text-left text-sm">
                <thead className="sticky top-0 z-10">
                  <tr className={cn(crm.tableHead, "bg-slate-50/95 backdrop-blur-sm dark:bg-slate-950/95")}>
                    <th className="px-4 py-2.5">Employee</th>
                    <th className="px-4 py-2.5">Designation</th>
                    <th className="px-4 py-2.5">Clock in</th>
                    <th className="px-4 py-2.5">Clock out</th>
                    <th className="px-4 py-2.5">Hours</th>
                    <th className="px-4 py-2.5">Status</th>
                    <th className="w-8 px-2 py-2.5" aria-hidden />
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {filtered.map((profile) => (
                    <tr
                      key={profile.id}
                      onClick={() => onSelect(profile)}
                      className="group cursor-pointer transition hover:bg-[#191970]/[0.03] dark:hover:bg-[#2277FF]/10"
                    >
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2.5">
                          <span
                            className={cn(
                              "flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br text-[10px] font-bold text-white shadow-sm",
                              avatarTone(profile.employeeName),
                            )}
                          >
                            {initials(profile.employeeName)}
                          </span>
                          <div className="min-w-0">
                            <p className="truncate font-semibold text-slate-900 dark:text-white">
                              {profile.employeeName}
                            </p>
                            <p className="truncate text-[11px] text-slate-500">{profile.department}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-slate-600 dark:text-slate-300">
                        {profile.designation ?? "—"}
                      </td>
                      <td className="px-4 py-3">
                        <span className="inline-flex rounded-md bg-slate-100 px-2 py-0.5 font-mono text-[11px] text-slate-700 dark:bg-slate-800 dark:text-slate-200">
                          {profile.today.checkIn ?? "—"}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className="inline-flex rounded-md bg-slate-100 px-2 py-0.5 font-mono text-[11px] text-slate-700 dark:bg-slate-800 dark:text-slate-200">
                          {profile.today.checkOut ?? "—"}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className="inline-flex items-center gap-1 text-xs font-semibold text-slate-700 dark:text-slate-200">
                          <Timer className="h-3 w-3 text-slate-400" />
                          {formatHoursWorked(profile.today.hoursWorked)}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <AttendanceStatusBadge status={profile.today.status} />
                      </td>
                      <td className="px-2 py-3 text-slate-300 transition group-hover:text-[#191970] dark:group-hover:text-[#2277FF]">
                        <ChevronRight className="h-4 w-4" />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
