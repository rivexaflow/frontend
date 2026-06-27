import { Suspense } from "react";

import { CrmLeadsView } from "@/features/workspace/views/crm-leads-view";

export default function LeadsPage() {
  return (
    <Suspense>
      <CrmLeadsView />
    </Suspense>
  );
}
