"use client";

import { Users } from "lucide-react";
import { useMemo, useState } from "react";

import { AttendanceDirectoryGrid } from "@/features/workspace/components/hrm/attendance/attendance-directory-grid";
import {
  AttendanceDirectoryToolbar,
  type AttendanceFilters,
} from "@/features/workspace/components/hrm/attendance/attendance-directory-toolbar";
import { AttendanceMetricStrip } from "@/features/workspace/components/hrm/attendance/attendance-sub-page-primitives";
import { AttendanceTable } from "@/features/workspace/components/hrm/attendance/attendance-table";
import type { HrmViewMode } from "@/features/workspace/components/hrm/hrm-directory-view-toggle";
import type { EmployeeAttendanceProfile } from "@/features/workspace/data/hrm-attendance-salary-month";
import { CheckCircle2, Clock, UserX } from "lucide-react";

const EMPTY_FILTERS: AttendanceFilters = { query: "", department: "", status: "" };

type Props = {
  profiles: EmployeeAttendanceProfile[];
  todayLabel: string;
  salaryMonthLabel: string;
  refreshing: boolean;
  onRefresh: () => void;
  onSelect: (profile: EmployeeAttendanceProfile) => void;
};

export function AttendanceAllPanel({
  profiles,
  todayLabel,
  salaryMonthLabel,
  refreshing,
  onRefresh,
  onSelect,
}: Props) {
  const [filters, setFilters] = useState<AttendanceFilters>(EMPTY_FILTERS);
  const [viewMode, setViewMode] = useState<HrmViewMode>("grid");

  const departments = useMemo(
    () => [...new Set(profiles.map((p) => p.department))].sort(),
    [profiles],
  );

  const filtered = useMemo(() => {
    const q = filters.query.trim().toLowerCase();
    return profiles.filter((p) => {
      if (filters.department && p.department !== filters.department) return false;
      if (filters.status && p.today.status !== filters.status) return false;
      if (q) {
        const hay = `${p.employeeName} ${p.employeeCode} ${p.department}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
  }, [profiles, filters]);

  const present = profiles.filter((p) => p.today.status === "present" || p.today.status === "remote").length;
  const late = profiles.filter((p) => p.today.status === "late").length;
  const notIn = profiles.filter((p) => !p.today.checkIn && p.today.status !== "on_leave").length;

  return (
    <>
      <AttendanceMetricStrip
        metrics={[
          { label: "Total", value: profiles.length, hint: "Active employees", icon: Users },
          { label: "Present", value: present, hint: "On-site & remote", icon: CheckCircle2 },
          { label: "Late", value: late, hint: "After grace", icon: Clock },
          { label: "Not in", value: notIn, hint: "Awaiting clock-in", icon: UserX },
        ]}
      />
      <AttendanceDirectoryToolbar
        filters={filters}
        onChange={setFilters}
        departments={departments}
        resultCount={filtered.length}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        salaryMonthLabel={salaryMonthLabel}
        todayLabel={todayLabel}
        onRefresh={onRefresh}
        refreshing={refreshing}
      />
      <div className="p-3 md:p-4">
        {viewMode === "grid" ? (
          <AttendanceDirectoryGrid profiles={filtered} selectedId={null} onSelect={onSelect} />
        ) : (
          <AttendanceTable profiles={filtered} selectedId={null} onSelect={onSelect} />
        )}
      </div>
    </>
  );
}
