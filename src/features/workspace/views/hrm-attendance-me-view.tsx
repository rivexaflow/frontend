"use client";

import { useMemo } from "react";

import { AttendanceMyPanel } from "@/features/workspace/components/hrm/attendance/panels/attendance-my-panel";
import { AttendanceSubPageShell } from "@/features/workspace/components/hrm/attendance/attendance-sub-page-shell";
import { useAttendanceProfiles } from "@/features/workspace/hooks/use-attendance-profiles";
import { authStore } from "@/stores/auth.store";

export function HrmAttendanceMeView() {
  const data = useAttendanceProfiles();
  const currentUserId = authStore((s) => s.user?.id);

  const myProfile = useMemo(
    () => (currentUserId ? data.profiles.find((p) => p.id === currentUserId) ?? data.profiles[0] ?? null : data.profiles[0] ?? null),
    [currentUserId, data.profiles],
  );

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
      <AttendanceMyPanel
        profile={myProfile}
        salaryMonthLabel={data.salaryMonthRange.label}
        refreshing={data.refreshing}
        onRefresh={data.refresh}
      />
    </AttendanceSubPageShell>
  );
}
