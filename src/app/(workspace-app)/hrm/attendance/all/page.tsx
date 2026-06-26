import { Suspense } from "react";

import { HrmAttendanceAllView } from "@/features/workspace/views/hrm-attendance-all-view";

export default function HrmAttendanceAllPage() {
  return (
    <Suspense>
      <HrmAttendanceAllView />
    </Suspense>
  );
}
