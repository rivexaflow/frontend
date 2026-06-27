import { Suspense } from "react";

import { CrmDealsView } from "@/features/workspace/views/crm-deals-view";

export default function DealsPage() {
  return (
    <Suspense>
      <CrmDealsView />
    </Suspense>
  );
}
