"use client";

import { useState } from "react";

import { AttendanceAllPanel } from "@/features/workspace/components/hrm/attendance/panels/attendance-all-panel";
import { AttendanceSubPageShell } from "@/features/workspace/components/hrm/attendance/attendance-sub-page-shell";
import { useAttendanceProfiles } from "@/features/workspace/hooks/use-attendance-profiles";
import type { HrmEmployeeRecord } from "@/types/hrm";

export function HrmAttendanceAllView() {
  const data = useAttendanceProfiles();
  const [selectedEmployee, setSelectedEmployee] = useState<HrmEmployeeRecord | null>(null);

  return (
    <AttendanceSubPageShell
      companyId={data.companyId}
      error={data.error}
      loading={data.loading}
      employees={data.employees}
      selectedEmployee={selectedEmployee}
      onSelectProfile={(p) => {
        const emp = data.employees.find((e) => e.id === p.id);
        if (emp) setSelectedEmployee(emp);
      }}
      onClearProfile={() => setSelectedEmployee(null)}
      onRecordsChange={data.reload}
    >
      <AttendanceAllPanel
        profiles={data.profiles}
        todayLabel={data.todayLabel}
        salaryMonthLabel={data.salaryMonthRange.label}
        refreshing={data.refreshing}
        onRefresh={data.refresh}
        onSelect={(p) => {
          const emp = data.employees.find((e) => e.id === p.id);
          if (emp) setSelectedEmployee(emp);
        }}
      />
    </AttendanceSubPageShell>
  );
}
