import { Suspense } from "react";

import { HrmAttendanceNotClockedInView } from "@/features/workspace/views/hrm-attendance-not-clocked-in-view";

export default function HrmAttendanceNotClockedInPage() {
  return (
    <Suspense>
      <HrmAttendanceNotClockedInView />
    </Suspense>
  );
}
