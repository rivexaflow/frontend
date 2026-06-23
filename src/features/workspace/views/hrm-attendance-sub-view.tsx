"use client";

import { AttendanceSubNav } from "@/features/workspace/components/hrm/attendance/attendance-sub-nav";
import { HrmPageHeader, HrmPanel } from "@/features/workspace/components/hrm/hrm-page-header";

export function HrmAttendanceSubView({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div className="pb-10">
      <HrmPageHeader module="People · HRM · Attendance" title={title} description={description} />
      <AttendanceSubNav />
      <HrmPanel title="Coming online" description="This view connects to live clock events when the attendance API exposes break, roster, and regularization endpoints.">
        <p className="text-sm text-slate-600 dark:text-slate-400">
          Use <strong>All employees</strong> for today&apos;s directory with API-backed attendance logs. Other tabs will populate automatically as endpoints ship — no UI rework required.
        </p>
      </HrmPanel>
    </div>
  );
}
