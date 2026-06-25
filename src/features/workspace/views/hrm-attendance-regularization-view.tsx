"use client";

import { AttendanceRegularizationPanel } from "@/features/workspace/components/hrm/attendance/panels/attendance-regularization-panel";
import { AttendanceSubPageShell } from "@/features/workspace/components/hrm/attendance/attendance-sub-page-shell";
import { useAttendanceProfiles } from "@/features/workspace/hooks/use-attendance-profiles";

export function HrmAttendanceRegularizationView() {
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
      <AttendanceRegularizationPanel
        refreshing={data.refreshing}
        onRefresh={data.refresh}
      />
    </AttendanceSubPageShell>
  );
}
