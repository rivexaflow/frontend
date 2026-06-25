"use client";

import { ArrowUpRight, Clock } from "lucide-react";

import { AttendanceStatusBadge } from "@/features/workspace/components/hrm/attendance/attendance-status-badge";
import type { EmployeeAttendanceProfile } from "@/features/workspace/data/hrm-attendance-salary-month";
import { cn } from "@/lib/utils/cn";

type Props = {
  profiles: EmployeeAttendanceProfile[];
  selectedId: string | null;
  onSelect: (profile: EmployeeAttendanceProfile) => void;
};

function initials(name: string) {
  return name
    .split(" ")
    .map((p) => p[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

function CompactAttendanceCard({
  profile,
  selected,
  onSelect,
}: {
  profile: EmployeeAttendanceProfile;
  selected: boolean;
  onSelect: () => void;
}) {
  const { today, salaryMonth } = profile;
  const progress =
    salaryMonth.workingDaysElapsed === 0
      ? 0
      : Math.min(100, Math.round((salaryMonth.payableDays / salaryMonth.workingDaysElapsed) * 100));

  return (
    <button
      type="button"
      onClick={onSelect}
      className={cn(
        "group relative flex w-full flex-col rounded-xl border border-slate-200/80 bg-white p-2.5 text-left shadow-sm transition-all duration-150",
        "hover:border-[#2277FF]/35 hover:shadow-md dark:border-slate-800 dark:bg-slate-900",
        selected && "ring-2 ring-[#191970]/25",
      )}
    >
      <div className="flex items-center gap-2">
        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-[#191970] to-[#2277ff] text-[10px] font-bold text-white">
          {initials(profile.employeeName)}
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5">
            <h3 className="truncate text-xs font-bold text-slate-900 dark:text-white">{profile.employeeName}</h3>
            <AttendanceStatusBadge status={today.status} className="!px-1.5 !py-0 !text-[9px]" />
          </div>
          <p className="truncate text-[10px] text-slate-500">
            {profile.employeeCode} · {profile.department}
          </p>
        </div>
        <ArrowUpRight className="h-3.5 w-3.5 shrink-0 text-slate-300 opacity-0 transition group-hover:opacity-100 group-hover:text-[#2277FF]" />
      </div>

      <div className="mt-2 grid grid-cols-3 gap-1">
        {[
          { label: "In", value: today.checkIn ?? "—" },
          { label: "Out", value: today.checkOut ?? "—" },
          { label: "Hrs", value: today.hoursWorked != null ? `${today.hoursWorked}h` : "—" },
        ].map((item) => (
          <div
            key={item.label}
            className="rounded-md bg-slate-50 px-1.5 py-1 text-center dark:bg-slate-950/50"
          >
            <p className="text-[8px] font-bold uppercase tracking-wide text-slate-400">{item.label}</p>
            <p className="text-[11px] font-bold tabular-nums text-slate-800 dark:text-slate-200">{item.value}</p>
          </div>
        ))}
      </div>

      <div className="mt-2 flex items-center gap-2">
        <div className="h-1 flex-1 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
          <div
            className="h-full rounded-full bg-gradient-to-r from-[#191970] to-[#2277ff]"
            style={{ width: `${progress}%` }}
          />
        </div>
        <span className="shrink-0 text-[10px] font-bold tabular-nums text-[#191970] dark:text-[#2277FF]">
          {salaryMonth.attendanceRate}%
        </span>
      </div>
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
    <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5">
      {profiles.map((profile) => (
        <CompactAttendanceCard
          key={profile.id}
          profile={profile}
          selected={selectedId === profile.id}
          onSelect={() => onSelect(profile)}
        />
      ))}
    </div>
  );
}
