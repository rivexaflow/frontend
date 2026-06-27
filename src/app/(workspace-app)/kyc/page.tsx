import { Suspense } from "react";

import { KycCenterView } from "@/features/workspace/views/kyc-center-view";

export default function KycPage() {
  return (
    <Suspense>
      <KycCenterView />
    </Suspense>
  );
}
