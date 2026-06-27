import { Suspense } from "react";

import { HrmPayrollView } from "@/features/workspace/views/hrm-payroll-view";

export default function HrmPayrollPage() {
  return (
    <Suspense>
      <HrmPayrollView />
    </Suspense>
  );
}
