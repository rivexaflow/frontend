import { Suspense } from "react";

import { HrmAttendanceRosterView } from "@/features/workspace/views/hrm-attendance-roster-view";

export default function HrmAttendanceRosterPage() {
  return (
    <Suspense>
      <HrmAttendanceRosterView />
    </Suspense>
  );
}
