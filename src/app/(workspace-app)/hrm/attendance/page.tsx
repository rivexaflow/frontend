import { Suspense } from "react";

import { HrmAttendanceView } from "@/features/workspace/views/hrm-attendance-view";

export default function HrmAttendancePage() {
  return (
    <Suspense>
      <HrmAttendanceView />
    </Suspense>
  );
}
