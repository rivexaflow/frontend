import { Suspense } from "react";

import { HrmAttendanceMeView } from "@/features/workspace/views/hrm-attendance-me-view";

export default function HrmAttendanceMePage() {
  return (
    <Suspense>
      <HrmAttendanceMeView />
    </Suspense>
  );
}
