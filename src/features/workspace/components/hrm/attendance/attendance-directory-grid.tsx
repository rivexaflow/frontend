"use client";

import { ArrowUpRight, Building2, Clock, MapPin } from "lucide-react";

import { AttendanceStatusBadge } from "@/features/workspace/components/hrm/attendance/attendance-status-badge";
import type { EmployeeAttendanceProfile } from "@/features/workspace/data/hrm-attendance-salary-month";
import { cn } from "@/lib/utils/cn";

type Props = {
  profiles: EmployeeAttendanceProfile[];
  selectedId: string | null;
  onSelect: (profile: EmployeeAttendanceProfile) => void;
};

const CARD_PALETTES = [
  {
    surface: "from-[#eef2ff] via-white to-[#f8faff]",
    border: "border-[#c7d2fe]/70 hover:border-[#2277ff]/40",
    accent: "text-[#191970]",
    avatar: "from-[#191970] to-[#2277ff]",
    glow: "bg-[#2277ff]/10",
  },
  {
    surface: "from-[#f0f9ff] via-white to-[#f8fcff]",
    border: "border-[#bae6fd]/70 hover:border-[#0056ff]/40",
    accent: "text-[#0056ff]",
    avatar: "from-[#2277ff] to-[#0056ff]",
    glow: "bg-[#0056ff]/10",
  },
  {
    surface: "from-[#ecfdf5] via-white to-[#f4fdf8]",
    border: "border-[#a7f3d0]/70 hover:border-emerald-400/40",
    accent: "text-emerald-800",
    avatar: "from-emerald-600 to-teal-500",
    glow: "bg-emerald-400/10",
  },
] as const;

function paletteForId(id: string) {
  let hash = 0;
  for (let i = 0; i < id.length; i += 1) hash = (hash + id.charCodeAt(i) * (i + 1)) % CARD_PALETTES.length;
  return CARD_PALETTES[hash];
}

function initials(name: string) {
  return name
    .split(" ")
    .map((p) => p[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

function AttendanceCard({
  profile,
  selected,
  onSelect,
}: {
  profile: EmployeeAttendanceProfile;
  selected: boolean;
  onSelect: () => void;
}) {
  const { today, salaryMonth } = profile;
  const palette = paletteForId(profile.id);
  const progress =
    salaryMonth.workingDaysElapsed === 0
      ? 0
      : Math.min(100, Math.round((salaryMonth.payableDays / salaryMonth.workingDaysElapsed) * 100));

  return (
    <button
      type="button"
      onClick={onSelect}
      className={cn(
        "group relative flex w-full max-w-[420px] flex-col overflow-hidden rounded-2xl border bg-gradient-to-br p-4 text-left shadow-sm transition-all duration-200",
        palette.surface,
        palette.border,
        selected && "ring-2 ring-[#191970]/30 shadow-md",
        "hover:-translate-y-0.5 hover:shadow-md",
      )}
    >
      <div className={cn("pointer-events-none absolute -right-8 -top-8 h-28 w-28 rounded-full", palette.glow)} />

      <div className="relative flex items-start gap-3">
        <span
          className={cn(
            "flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br text-sm font-bold text-white shadow-md",
            palette.avatar,
          )}
        >
          {initials(profile.employeeName)}
        </span>
        <div className="min-w-0 flex-1">
          <h3 className={cn("truncate text-sm font-bold tracking-tight", palette.accent)}>{profile.employeeName}</h3>
          <p className="font-mono text-[11px] text-slate-500">{profile.employeeCode}</p>
          <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
            <span className="inline-flex items-center gap-1 text-[10px] text-slate-500">
              <Building2 className="h-3 w-3" />
              {profile.department}
            </span>
            {profile.location ? (
              <span className="inline-flex items-center gap-1 text-[10px] text-slate-400">
                <MapPin className="h-3 w-3" />
                {profile.location}
              </span>
            ) : null}
          </div>
        </div>
        <AttendanceStatusBadge status={today.status} className="shrink-0 !px-2 !py-0.5 !text-[10px]" />
      </div>

      <div className="relative mt-3 grid grid-cols-3 gap-2">
        {[
          { label: "Check in", value: today.checkIn ?? "—" },
          { label: "Check out", value: today.checkOut ?? "—" },
          { label: "Hours", value: today.hoursWorked != null ? `${today.hoursWorked}h` : "—" },
        ].map((item) => (
          <div key={item.label} className="rounded-lg bg-white/80 px-2 py-2 ring-1 ring-slate-200/60 backdrop-blur-sm">
            <p className="text-[9px] font-bold uppercase tracking-wide text-slate-400">{item.label}</p>
            <p className="mt-0.5 text-sm font-bold tabular-nums text-slate-900">{item.value}</p>
          </div>
        ))}
      </div>

      <div className="relative mt-3 rounded-xl border border-slate-200/60 bg-white/70 p-3 backdrop-blur-sm">
        <div className="flex items-center justify-between gap-2">
          <div>
            <p className="text-[9px] font-bold uppercase tracking-wide text-slate-400">Salary month</p>
            <p className="mt-0.5 text-xs font-semibold text-slate-700">{salaryMonth.periodLabel}</p>
          </div>
          <div className="text-right">
            <p className="text-lg font-bold tabular-nums text-[#191970]">{salaryMonth.attendanceRate}%</p>
            <p className="text-[10px] text-slate-400">
              {salaryMonth.payableDays}/{salaryMonth.workingDaysElapsed} days
            </p>
          </div>
        </div>
        <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-slate-100">
          <div className="h-full rounded-full bg-gradient-to-r from-[#191970] to-[#2277ff]" style={{ width: `${progress}%` }} />
        </div>
        <div className="mt-2 flex justify-between text-[10px] text-slate-500">
          <span className="inline-flex items-center gap-1">
            <Clock className="h-3 w-3" />
            {today.date}
          </span>
          <span>{salaryMonth.totalHours}h logged</span>
        </div>
      </div>

      <span className="relative mt-3 inline-flex items-center gap-1 text-[11px] font-semibold text-[#2277ff] opacity-0 transition group-hover:opacity-100">
        View attendance profile
        <ArrowUpRight className="h-3 w-3" />
      </span>
    </button>
  );
}

export function AttendanceDirectoryGrid({ profiles, selectedId, onSelect }: Props) {
  if (profiles.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-slate-200 py-16 text-center dark:border-slate-700">
        <Clock className="mx-auto h-8 w-8 text-slate-300" />
        <p className="mt-3 text-sm font-medium text-slate-600">No attendance records match your filters</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
      {profiles.map((profile) => (
        <AttendanceCard
          key={profile.id}
          profile={profile}
          selected={selectedId === profile.id}
          onSelect={() => onSelect(profile)}
        />
      ))}
    </div>
  );
}
