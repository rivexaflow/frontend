"use client";

import { ChevronRight } from "lucide-react";

import { crm } from "@/features/workspace/components/crm/crm-styles";
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

function avatarColor(name: string) {
  const colors = ["bg-[#191970]", "bg-[#2277ff]", "bg-emerald-600", "bg-amber-500", "bg-rose-500"];
  let hash = 0;
  for (let i = 0; i < name.length; i += 1) hash += name.charCodeAt(i);
  return colors[hash % colors.length];
}

export function AttendanceTable({ profiles, selectedId, onSelect }: Props) {
  if (profiles.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-slate-200 py-16 text-center dark:border-slate-700">
        <p className="text-sm font-medium text-slate-600">No attendance records match your filters</p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-xl border border-slate-200/80 shadow-sm dark:border-slate-800">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[1020px] text-left text-sm">
          <thead className="sticky top-0 z-10">
            <tr className={cn(crm.tableHead, "bg-slate-50/95 backdrop-blur-sm dark:bg-slate-950/95")}>
              <th className="px-4 py-3 font-bold">Employee</th>
              <th className="px-4 py-3 font-bold">Department</th>
              <th className="px-4 py-3 font-bold">Today</th>
              <th className="px-4 py-3 font-bold">Check in</th>
              <th className="px-4 py-3 font-bold">Check out</th>
              <th className="px-4 py-3 font-bold">Hours</th>
              <th className="px-4 py-3 font-bold">Status</th>
              <th className="px-4 py-3 font-bold">Salary month</th>
              <th className="px-4 py-3 font-bold">Payable</th>
              <th className="w-10 px-2 py-3" aria-hidden />
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            {profiles.map((profile, i) => {
              const { today, salaryMonth } = profile;
              const selected = selectedId === profile.id;
              const progress =
                salaryMonth.workingDaysElapsed === 0
                  ? 0
                  : Math.min(100, Math.round((salaryMonth.payableDays / salaryMonth.workingDaysElapsed) * 100));

              return (
                <tr
                  key={profile.id}
                  onClick={() => onSelect(profile)}
                  className={cn(
                    crm.tableRow,
                    "cursor-pointer",
                    i % 2 === 1 && "bg-slate-50/50 dark:bg-slate-950/20",
                    selected && "bg-[#191970]/[0.04]",
                  )}
                >
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <span
                        className={cn(
                          "flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-[11px] font-bold text-white shadow-sm",
                          avatarColor(profile.employeeName),
                        )}
                      >
                        {initials(profile.employeeName)}
                      </span>
                      <div className="min-w-0">
                        <p className="font-semibold text-slate-900 dark:text-white">{profile.employeeName}</p>
                        <p className="font-mono text-xs text-slate-500">{profile.employeeCode}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-slate-600">{profile.department}</td>
                  <td className="px-4 py-3 text-slate-600">{today.date}</td>
                  <td className="px-4 py-3 tabular-nums font-medium text-slate-700">{today.checkIn ?? "—"}</td>
                  <td className="px-4 py-3 tabular-nums font-medium text-slate-700">{today.checkOut ?? "—"}</td>
                  <td className="px-4 py-3 tabular-nums text-slate-600">
                    {today.hoursWorked != null ? `${today.hoursWorked}h` : "—"}
                  </td>
                  <td className="px-4 py-3">
                    <AttendanceStatusBadge status={today.status} />
                  </td>
                  <td className="px-4 py-3">
                    <div className="min-w-[120px]">
                      <div className="flex items-baseline justify-between gap-2">
                        <span className="text-xs font-semibold text-[#191970]">{salaryMonth.attendanceRate}%</span>
                        <span className="text-[10px] text-slate-400">{salaryMonth.periodLabel.split("–")[0]?.trim()}</span>
                      </div>
                      <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-slate-100">
                        <div
                          className="h-full rounded-full bg-gradient-to-r from-[#191970] to-[#2277ff]"
                          style={{ width: `${progress}%` }}
                        />
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 tabular-nums text-slate-600">
                    <span className="font-semibold text-slate-800">{salaryMonth.payableDays}</span>
                    <span className="text-slate-400">/{salaryMonth.workingDaysElapsed}</span>
                  </td>
                  <td className="px-2 py-3 text-slate-300">
                    <ChevronRight className="h-4 w-4" />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
