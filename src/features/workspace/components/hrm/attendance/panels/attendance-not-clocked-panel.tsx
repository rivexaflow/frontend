"use client";

import { Bell, RefreshCw, UserX } from "lucide-react";
import { useMemo } from "react";

import { crm } from "@/features/workspace/components/crm/crm-styles";
import {
  AttendanceDataTable,
  AttendanceEmployeeCell,
  type AttendanceTableColumn,
} from "@/features/workspace/components/hrm/attendance/attendance-data-table";
import { AttendanceStatusBadge } from "@/features/workspace/components/hrm/attendance/attendance-status-badge";
import {
  AttendanceMetricStrip,
  AttendancePanelCard,
} from "@/features/workspace/components/hrm/attendance/attendance-sub-page-primitives";
import type { EmployeeAttendanceProfile } from "@/features/workspace/data/hrm-attendance-salary-month";
import { cn } from "@/lib/utils/cn";
import { Building2, Clock, Users } from "lucide-react";

type Props = {
  profiles: EmployeeAttendanceProfile[];
  refreshing: boolean;
  onRefresh: () => void;
  onSelect: (profile: EmployeeAttendanceProfile) => void;
};

export function AttendanceNotClockedInPanel({
  profiles,
  refreshing,
  onRefresh,
  onSelect,
}: Props) {
  const missing = useMemo(
    () => profiles.filter((p) => !p.today.checkIn && p.today.status !== "on_leave"),
    [profiles],
  );

  const byDept = useMemo(() => {
    const map = new Map<string, number>();
    missing.forEach((p) => map.set(p.department, (map.get(p.department) ?? 0) + 1));
    return [...map.entries()].sort((a, b) => b[1] - a[1]);
  }, [missing]);

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
        render: (p) => <span className="text-xs text-slate-600 dark:text-slate-300">{p.department}</span>,
      },
      {
        key: "location",
        header: "Location",
        sortable: true,
        sortValue: (p) => p.location ?? "",
        className: "hidden md:table-cell",
        headerClassName: "hidden md:table-cell",
        render: (p) => <span className="text-xs text-slate-500">{p.location ?? "—"}</span>,
      },
      {
        key: "expected",
        header: "Expected in",
        sortable: true,
        sortValue: () => "09:00",
        render: () => (
          <span className="inline-flex items-center gap-1 font-mono text-xs font-semibold text-slate-700 dark:text-slate-200">
            <Clock className="h-3 w-3 text-slate-400" />
            09:00
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
        header: "Month rate",
        sortable: true,
        sortValue: (p) => p.salaryMonth.attendanceRate,
        className: "hidden lg:table-cell",
        headerClassName: "hidden lg:table-cell",
        render: (p) => (
          <span className="text-xs font-bold tabular-nums text-[#191970] dark:text-[#2277FF]">
            {p.salaryMonth.attendanceRate}%
          </span>
        ),
      },
    ],
    [],
  );

  return (
    <>
      <AttendanceMetricStrip
        metrics={[
          { label: "Missing", value: missing.length, hint: "No clock-in today", icon: UserX },
          { label: "Workforce", value: profiles.length, hint: "Total active", icon: Users },
          { label: "Shift start", value: "09:00", hint: "Expected check-in", icon: Clock },
          { label: "Departments", value: byDept.length, hint: "With gaps", icon: Building2 },
        ]}
        actions={
          <>
            <button type="button" className={cn(crm.btnPrimarySm, "h-9")}>
              <Bell className="h-3.5 w-3.5" />
              Nudge all
            </button>
            <button type="button" onClick={onRefresh} disabled={refreshing} className={cn(crm.btnSecondarySm, "h-9")}>
              <RefreshCw className={cn("h-3.5 w-3.5", refreshing && "animate-spin")} />
              Refresh
            </button>
          </>
        }
      />
      <div className="grid gap-4 p-4 lg:grid-cols-[minmax(0,1fr)_220px] md:p-5">
        <AttendancePanelCard
          title="Employees awaiting clock-in"
          description="Click a row to open attendance profile"
        >
          <AttendanceDataTable
            rows={missing}
            columns={columns}
            onRowClick={onSelect}
            minWidth={760}
            emptyMessage="Everyone has clocked in for today."
            emptyIcon={<UserX className="h-8 w-8 text-slate-300" />}
            footer={
              missing.length > 0 ? (
                <span>
                  <strong className="font-semibold text-slate-700 dark:text-slate-300">{missing.length}</strong> employees
                  still need to clock in
                </span>
              ) : undefined
            }
          />
        </AttendancePanelCard>
        <AttendancePanelCard title="By department" description="Where gaps remain">
          <ul className="max-h-[360px] space-y-1.5 overflow-y-auto">
            {byDept.map(([dept, count]) => {
              const pct = missing.length ? Math.round((count / missing.length) * 100) : 0;
              return (
                <li key={dept} className="rounded-lg border border-slate-100 bg-slate-50/80 px-3 py-2 dark:border-slate-800 dark:bg-slate-950/40">
                  <div className="flex items-center justify-between gap-2">
                    <span className="truncate text-xs font-medium text-slate-700 dark:text-slate-200">{dept}</span>
                    <span className="shrink-0 rounded-md bg-[#2277FF]/10 px-1.5 py-0.5 text-[10px] font-bold tabular-nums text-[#191970] dark:text-[#2277FF]">
                      {count}
                    </span>
                  </div>
                  <div className="mt-1.5 h-1 overflow-hidden rounded-full bg-slate-200/80 dark:bg-slate-800">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-[#191970] to-[#2277ff]"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </li>
              );
            })}
            {!byDept.length ? <li className="py-8 text-center text-xs text-slate-400">No gaps</li> : null}
          </ul>
        </AttendancePanelCard>
      </div>
    </>
  );
}
