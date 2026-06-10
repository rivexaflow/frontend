"use client";

import { ChevronRight, ClipboardList } from "lucide-react";

import { AttendanceSalaryMonthStrip } from "@/features/workspace/components/hrm/attendance/attendance-salary-month-strip";
import { AttendanceStatusBadge } from "@/features/workspace/components/hrm/attendance/attendance-status-badge";
import type { EmployeeAttendanceProfile } from "@/features/workspace/data/hrm-attendance-salary-month";
import { cn } from "@/lib/utils/cn";

type Props = {
  profiles: EmployeeAttendanceProfile[];
  selectedId: string | null;
  onSelect: (profile: EmployeeAttendanceProfile) => void;
};

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

  return (
    <button
      type="button"
      onClick={onSelect}
      className={cn(
        "group flex w-full flex-col rounded-xl border bg-white p-4 text-left shadow-sm transition dark:bg-slate-900",
        selected
          ? "border-[#191970] ring-1 ring-[#191970]/25"
          : "border-slate-200/90 hover:border-slate-300 hover:shadow-md dark:border-slate-800",
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-slate-900 dark:text-white">{profile.employeeName}</p>
          <p className="font-mono text-[11px] text-slate-500">{profile.employeeCode}</p>
        </div>
        <ChevronRight className="h-4 w-4 shrink-0 text-slate-300 group-hover:text-[#191970]" />
      </div>

      <div className="mt-2 flex items-center justify-between gap-2">
        <p className="text-xs text-slate-500">{today.date} · {profile.department}</p>
        <AttendanceStatusBadge status={today.status} className="!px-1.5 !py-0 !text-[9px]" />
      </div>

      <div className="mt-2 flex gap-3 text-[11px] tabular-nums text-slate-600">
        <span>
          <span className="text-slate-400">In </span>
          {today.checkIn ?? "—"}
        </span>
        <span>
          <span className="text-slate-400">Out </span>
          {today.checkOut ?? "—"}
        </span>
        {today.hoursWorked != null ? (
          <span>
            <span className="text-slate-400">Hrs </span>
            {today.hoursWorked}h
          </span>
        ) : null}
      </div>

      <div className="mt-3 border-t border-slate-100 pt-3 dark:border-slate-800">
        <AttendanceSalaryMonthStrip summary={salaryMonth} compact />
      </div>
    </button>
  );
}

export function AttendanceDirectoryGrid({ profiles, selectedId, onSelect }: Props) {
  if (profiles.length === 0) {
    return (
      <div className="px-4 py-12 text-center">
        <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 dark:bg-slate-800">
          <ClipboardList className="h-5 w-5 text-slate-400" />
        </div>
        <p className="mt-3 text-sm font-semibold text-slate-800 dark:text-slate-200">No attendance records match your filters</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-3 bg-slate-50/50 p-3 min-[640px]:grid-cols-2 min-[900px]:grid-cols-3 min-[1280px]:grid-cols-3 dark:bg-slate-950/20">
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
