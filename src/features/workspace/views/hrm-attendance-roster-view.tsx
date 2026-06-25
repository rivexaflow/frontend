"use client";

import { AttendanceRosterPanel } from "@/features/workspace/components/hrm/attendance/panels/attendance-roster-panel";
import { AttendanceSubPageShell } from "@/features/workspace/components/hrm/attendance/attendance-sub-page-shell";
import { useAttendanceProfiles } from "@/features/workspace/hooks/use-attendance-profiles";

export function HrmAttendanceRosterView() {
  const data = useAttendanceProfiles();

  return (
    <AttendanceSubPageShell
      companyId={data.companyId}
      error={data.error}
      loading={data.loading}
      employees={data.employees}
      selectedEmployee={null}
      onSelectProfile={() => {}}
      onClearProfile={() => {}}
      onRecordsChange={data.reload}
    >
      <AttendanceRosterPanel profiles={data.profiles} />
    </AttendanceSubPageShell>
  );
}
