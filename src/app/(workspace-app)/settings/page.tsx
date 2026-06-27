import { Suspense } from "react";

import { SettingsView } from "@/features/workspace/views/settings-view";

export default function SettingsPage() {
  return (
    <Suspense>
      <SettingsView />
    </Suspense>
  );
}
