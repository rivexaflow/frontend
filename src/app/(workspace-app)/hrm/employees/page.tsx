import { Suspense } from "react";

import { HrmEmployeesView } from "@/features/workspace/views/hrm-employees-view";

export default function HrmEmployeesPage() {
  return (
    <Suspense>
      <HrmEmployeesView />
    </Suspense>
  );
}
