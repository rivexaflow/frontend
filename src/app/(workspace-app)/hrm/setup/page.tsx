import { Suspense } from "react";

import { HrmSetupView } from "@/features/workspace/views/hrm-setup-view";

export default function HrmSetupPage() {
  return (
    <Suspense>
      <HrmSetupView />
    </Suspense>
  );
}
