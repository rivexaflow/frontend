"use client";

import { Coffee, RefreshCw, Timer, Users } from "lucide-react";
import { useMemo } from "react";

import { crm } from "@/features/workspace/components/crm/crm-styles";
import {
  AttendanceDataTable,
  AttendanceEmployeeCell,
  type AttendanceTableColumn,
} from "@/features/workspace/components/hrm/attendance/attendance-data-table";
import {
  AttendanceMetricStrip,
  AttendancePanelCard,
} from "@/features/workspace/components/hrm/attendance/attendance-sub-page-primitives";
import {
  DEMO_BREAK_SESSIONS,
  type AttendanceBreakSession,
} from "@/features/workspace/data/hrm-attendance-extended-demo";
import type { EmployeeAttendanceProfile } from "@/features/workspace/data/hrm-attendance-salary-month";
import { cn } from "@/lib/utils/cn";

function elapsedMinutes(start: string) {
  const [h, m] = start.split(":").map(Number);
  const now = new Date();
  const startMins = h * 60 + m;
  const nowMins = now.getHours() * 60 + now.getMinutes();
  return Math.max(0, nowMins - startMins);
}

function BreakProgress({ elapsed, max }: { elapsed: number; max: number }) {
  const pct = Math.min(100, Math.round((elapsed / max) * 100));
  const over = elapsed > max;
  return (
    <div className="min-w-[100px]">
      <div className="flex items-baseline justify-between gap-1">
        <span className={cn("text-xs font-bold tabular-nums", over ? "text-[#191970] dark:text-[#2277FF]" : "text-slate-800 dark:text-white")}>
          {elapsed}m
        </span>
        <span className="text-[9px] text-slate-400">/ {max}m</span>
      </div>
      <div className="mt-1 h-1 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
        <div
          className={cn("h-full rounded-full bg-gradient-to-r from-[#191970] to-[#2277ff]", over && "opacity-90")}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

type Props = {
  profiles: EmployeeAttendanceProfile[];
  refreshing: boolean;
  onRefresh: () => void;
};

export function AttendanceOnBreakPanel({ profiles, refreshing, onRefresh }: Props) {
  const liveBreaks = useMemo(() => {
    const fromProfiles = profiles
      .filter((p) => p.today.checkIn && !p.today.checkOut && (p.today.status === "present" || p.today.status === "late"))
      .slice(0, 8)
      .map((p, i) => ({
        id: `live-${p.id}`,
        employeeId: p.id,
        employeeName: p.employeeName,
        department: p.department,
        designation: p.designation,
        breakStartedAt: ["12:30", "15:05", "13:20", "14:10", "12:45", "15:30", "13:00", "14:55"][i % 8],
        breakType: (["Lunch", "Tea", "Personal"] as const)[i % 3],
        maxMinutes: [45, 15, 30][i % 3],
      }));
    return fromProfiles.length ? fromProfiles : DEMO_BREAK_SESSIONS;
  }, [profiles]);

  const avgDuration = liveBreaks.length
    ? Math.round(liveBreaks.reduce((s, b) => s + elapsedMinutes(b.breakStartedAt), 0) / liveBreaks.length)
    : 0;

  const overLimit = liveBreaks.filter((b) => elapsedMinutes(b.breakStartedAt) > b.maxMinutes).length;

  const columns = useMemo<AttendanceTableColumn<AttendanceBreakSession>[]>(
    () => [
      {
        key: "employee",
        header: "Employee",
        sortable: true,
        sortValue: (s) => s.employeeName,
        render: (s) => (
          <AttendanceEmployeeCell name={s.employeeName} subtitle={`${s.department} · ${s.designation ?? "—"}`} />
        ),
      },
      {
        key: "type",
        header: "Break type",
        sortable: true,
        sortValue: (s) => s.breakType,
        render: (s) => (
          <span className="inline-flex items-center gap-1 rounded-md bg-[#2277FF]/10 px-2 py-0.5 text-[10px] font-semibold text-[#191970] dark:text-[#2277FF]">
            <Coffee className="h-3 w-3" />
            {s.breakType}
          </span>
        ),
      },
      {
        key: "started",
        header: "Started at",
        sortable: true,
        sortValue: (s) => s.breakStartedAt,
        render: (s) => (
          <span className="font-mono text-xs font-semibold text-slate-700 dark:text-slate-200">{s.breakStartedAt}</span>
        ),
      },
      {
        key: "duration",
        header: "Duration",
        sortable: true,
        sortValue: (s) => elapsedMinutes(s.breakStartedAt),
        render: (s) => <BreakProgress elapsed={elapsedMinutes(s.breakStartedAt)} max={s.maxMinutes} />,
      },
      {
        key: "limit",
        header: "Policy",
        className: "hidden sm:table-cell",
        headerClassName: "hidden sm:table-cell",
        render: (s) => <span className="text-xs text-slate-500">{s.maxMinutes} min</span>,
      },
    ],
    [],
  );

  return (
    <>
      <AttendanceMetricStrip
        metrics={[
          { label: "On break", value: liveBreaks.length, hint: "Active sessions", icon: Coffee },
          { label: "Avg duration", value: `${avgDuration}m`, hint: "Current breaks", icon: Timer },
          { label: "Over limit", value: overLimit, hint: "Needs attention", icon: Users },
          { label: "Clocked in", value: profiles.filter((p) => p.today.checkIn).length, hint: "Eligible today", icon: Users },
        ]}
        actions={
          <button type="button" onClick={onRefresh} disabled={refreshing} className={cn(crm.btnSecondarySm, "h-9")}>
            <RefreshCw className={cn("h-3.5 w-3.5", refreshing && "animate-spin")} />
            Refresh
          </button>
        }
      />
      <div className="grid gap-4 p-4 lg:grid-cols-[minmax(0,1fr)_240px] md:p-5">
        <AttendancePanelCard title="Active break sessions" description={`${liveBreaks.length} employees on break right now`}>
          <AttendanceDataTable
            rows={liveBreaks}
            columns={columns}
            minWidth={720}
            emptyMessage="No employees are on break."
            emptyIcon={<Coffee className="h-8 w-8 text-slate-300" />}
            footer={
              <span>
                Live tracker · <strong className="font-semibold text-slate-700 dark:text-slate-300">{liveBreaks.length}</strong>{" "}
                active sessions
              </span>
            }
          />
        </AttendancePanelCard>
        <AttendancePanelCard title="Break policy" description="Today's guidelines">
          <ul className="space-y-2.5 text-xs text-slate-600 dark:text-slate-300">
            {[
              { label: "Lunch break", value: "45 min" },
              { label: "Tea break", value: "15 min" },
              { label: "Personal break", value: "30 min" },
              { label: "Grace over-limit", value: "5 min" },
            ].map((item, i, arr) => (
              <li
                key={item.label}
                className={cn(
                  "flex justify-between",
                  i < arr.length - 1 && "border-b border-slate-100 pb-2 dark:border-slate-800",
                )}
              >
                <span>{item.label}</span>
                <span className="font-semibold text-[#191970] dark:text-[#2277FF]">{item.value}</span>
              </li>
            ))}
          </ul>
        </AttendancePanelCard>
      </div>
    </>
  );
}
