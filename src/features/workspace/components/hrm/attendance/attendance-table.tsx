"use client";

import { ChevronRight } from "lucide-react";

import { AttendanceStatusBadge } from "@/features/workspace/components/hrm/attendance/attendance-status-badge";
import type { EmployeeAttendanceProfile } from "@/features/workspace/data/hrm-attendance-salary-month";
import { cn } from "@/lib/utils/cn";

type Props = {
  profiles: EmployeeAttendanceProfile[];
  selectedId: string | null;
  onSelect: (profile: EmployeeAttendanceProfile) => void;
};

export function AttendanceTable({ profiles, selectedId, onSelect }: Props) {
  if (profiles.length === 0) {
    return (
      <div className="px-4 py-16 text-center">
        <p className="text-sm font-medium text-slate-700 dark:text-slate-300">No attendance records match your filters</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[980px] text-left text-sm">
        <thead>
          <tr className="border-b border-slate-200 bg-slate-50 text-xs font-medium text-slate-500 dark:border-slate-800 dark:bg-slate-950/50">
            <th className="px-4 py-3">Employee</th>
            <th className="px-4 py-3">Today</th>
            <th className="hidden px-4 py-3 sm:table-cell">Check in</th>
            <th className="hidden px-4 py-3 sm:table-cell">Check out</th>
            <th className="hidden px-4 py-3 md:table-cell">Hours</th>
            <th className="px-4 py-3">Today status</th>
            <th className="hidden px-4 py-3 lg:table-cell">Salary month</th>
            <th className="hidden px-4 py-3 xl:table-cell">Payable days</th>
            <th className="hidden px-4 py-3 xl:table-cell">Month hours</th>
            <th className="w-10 px-2 py-3" aria-hidden />
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
          {profiles.map((profile) => {
            const { today, salaryMonth } = profile;
            const selected = selectedId === profile.id;
            return (
              <tr
                key={profile.id}
                onClick={() => onSelect(profile)}
                className={cn(
                  "cursor-pointer transition-colors hover:bg-slate-50 dark:hover:bg-slate-800/50",
                  selected && "bg-[#191970]/[0.04] dark:bg-blue-950/20",
                )}
              >
                <td className="px-4 py-3">
                  <p className="font-medium text-slate-900 dark:text-white">{profile.employeeName}</p>
                  <p className="font-mono text-xs text-slate-500">{profile.employeeCode}</p>
                  <p className="hidden text-xs text-slate-400 lg:block">{profile.department}</p>
                </td>
                <td className="px-4 py-3 text-slate-600">{today.date}</td>
                <td className="hidden px-4 py-3 tabular-nums text-slate-600 sm:table-cell">{today.checkIn ?? "—"}</td>
                <td className="hidden px-4 py-3 tabular-nums text-slate-600 sm:table-cell">{today.checkOut ?? "—"}</td>
                <td className="hidden px-4 py-3 tabular-nums text-slate-600 md:table-cell">
                  {today.hoursWorked != null ? `${today.hoursWorked}h` : "—"}
                </td>
                <td className="px-4 py-3">
                  <AttendanceStatusBadge status={today.status} />
                </td>
                <td className="hidden px-4 py-3 lg:table-cell">
                  <p className="text-xs font-medium text-slate-700 dark:text-slate-300">{salaryMonth.periodLabel}</p>
                  <p className="text-[11px] text-slate-500">{salaryMonth.attendanceRate}% attendance</p>
                </td>
                <td className="hidden px-4 py-3 tabular-nums text-slate-600 xl:table-cell">
                  {salaryMonth.payableDays}/{salaryMonth.workingDaysElapsed}
                </td>
                <td className="hidden px-4 py-3 tabular-nums text-slate-600 xl:table-cell">{salaryMonth.totalHours}h</td>
                <td className="px-2 py-3 text-slate-300">
                  <ChevronRight className="h-4 w-4" />
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
