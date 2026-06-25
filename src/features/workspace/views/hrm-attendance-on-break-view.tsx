"use client";

import { AttendanceOnBreakPanel } from "@/features/workspace/components/hrm/attendance/panels/attendance-on-break-panel";
import { AttendanceSubPageShell } from "@/features/workspace/components/hrm/attendance/attendance-sub-page-shell";
import { useAttendanceProfiles } from "@/features/workspace/hooks/use-attendance-profiles";

export function HrmAttendanceOnBreakView() {
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
      <AttendanceOnBreakPanel
        profiles={data.profiles}
        refreshing={data.refreshing}
        onRefresh={data.refresh}
      />
    </AttendanceSubPageShell>
  );
}
