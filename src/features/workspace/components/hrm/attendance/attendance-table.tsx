"use client";

import { ChevronRight } from "lucide-react";
import { useMemo } from "react";

import { AttendanceStatusBadge } from "@/features/workspace/components/hrm/attendance/attendance-status-badge";
import {
  AttendanceDataTable,
  AttendanceEmployeeCell,
  type AttendanceTableColumn,
} from "@/features/workspace/components/hrm/attendance/attendance-data-table";
import type { EmployeeAttendanceProfile } from "@/features/workspace/data/hrm-attendance-salary-month";

type Props = {
  profiles: EmployeeAttendanceProfile[];
  selectedId: string | null;
  onSelect: (profile: EmployeeAttendanceProfile) => void;
};

export function AttendanceTable({ profiles, selectedId, onSelect }: Props) {
  const columns = useMemo<AttendanceTableColumn<EmployeeAttendanceProfile>[]>(
    () => [
      {
        key: "employee",
        header: "Employee",
        sortable: true,
        sortValue: (p) => p.employeeName,
        render: (p) => (
          <AttendanceEmployeeCell name={p.employeeName} code={p.employeeCode} subtitle={p.designation} />
        ),
      },
      {
        key: "department",
        header: "Department",
        sortable: true,
        sortValue: (p) => p.department,
        className: "hidden md:table-cell",
        headerClassName: "hidden md:table-cell",
        render: (p) => <span className="text-xs text-slate-600 dark:text-slate-300">{p.department}</span>,
      },
      {
        key: "checkIn",
        header: "Check in",
        sortable: true,
        sortValue: (p) => p.today.checkIn ?? "",
        render: (p) => (
          <span className="font-mono text-xs font-semibold tabular-nums text-slate-800 dark:text-slate-200">
            {p.today.checkIn ?? "—"}
          </span>
        ),
      },
      {
        key: "checkOut",
        header: "Check out",
        sortable: true,
        sortValue: (p) => p.today.checkOut ?? "",
        className: "hidden sm:table-cell",
        headerClassName: "hidden sm:table-cell",
        render: (p) => (
          <span className="font-mono text-xs tabular-nums text-slate-600 dark:text-slate-300">
            {p.today.checkOut ?? "—"}
          </span>
        ),
      },
      {
        key: "hours",
        header: "Hours",
        sortable: true,
        sortValue: (p) => p.today.hoursWorked ?? -1,
        className: "hidden lg:table-cell",
        headerClassName: "hidden lg:table-cell",
        render: (p) => (
          <span className="text-xs tabular-nums text-slate-600">
            {p.today.hoursWorked != null ? `${p.today.hoursWorked}h` : "—"}
          </span>
        ),
      },
      {
        key: "status",
        header: "Status",
        sortable: true,
        sortValue: (p) => p.today.status,
        render: (p) => <AttendanceStatusBadge status={p.today.status} className="!text-[9px]" />,
      },
      {
        key: "month",
        header: "Salary month",
        sortable: true,
        sortValue: (p) => p.salaryMonth.attendanceRate,
        className: "min-w-[110px]",
        render: (p) => {
          const progress =
            p.salaryMonth.workingDaysElapsed === 0
              ? 0
              : Math.min(100, Math.round((p.salaryMonth.payableDays / p.salaryMonth.workingDaysElapsed) * 100));
          return (
            <div>
              <div className="flex items-baseline justify-between gap-1">
                <span className="text-xs font-bold text-[#191970] dark:text-[#2277FF]">{p.salaryMonth.attendanceRate}%</span>
                <span className="text-[9px] text-slate-400">
                  {p.salaryMonth.payableDays}/{p.salaryMonth.workingDaysElapsed}
                </span>
              </div>
              <div className="mt-1 h-1 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-[#191970] to-[#2277ff]"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          );
        },
      },
      {
        key: "action",
        header: "",
        className: "w-8",
        render: () => <ChevronRight className="h-4 w-4 text-slate-300" />,
      },
    ],
    [],
  );

  return (
    <AttendanceDataTable
      rows={profiles}
      columns={columns}
      selectedId={selectedId}
      onRowClick={onSelect}
      minWidth={980}
      footer={
        <span>
          Showing <strong className="font-semibold text-slate-700 dark:text-slate-300">{profiles.length}</strong>{" "}
          employees · Click a row to open profile
        </span>
      }
    />
  );
}
