"use client";

import { RoleDashboard } from "@/features/workspace/components/dashboard/role-dashboard";
import { authStore } from "@/stores/auth.store";
import { appConfig } from "@/config/app";

export default function DashboardPage() {
  const workspaceSlug =
    authStore((s) => s.user?.workspaceSlug) ?? appConfig.defaultWorkspaceSlug;

  return <RoleDashboard workspaceSlug={workspaceSlug} />;
}
