import { Suspense } from "react";

import { HrmAttendanceOnBreakView } from "@/features/workspace/views/hrm-attendance-on-break-view";

export default function HrmAttendanceOnBreakPage() {
  return (
    <Suspense>
      <HrmAttendanceOnBreakView />
    </Suspense>
  );
}
