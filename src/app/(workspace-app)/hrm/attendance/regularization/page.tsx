import { Suspense } from "react";

import { HrmAttendanceRegularizationView } from "@/features/workspace/views/hrm-attendance-regularization-view";

export default function HrmAttendanceRegularizationPage() {
  return (
    <Suspense>
      <HrmAttendanceRegularizationView />
    </Suspense>
  );
}
