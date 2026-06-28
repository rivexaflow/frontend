"use client";

import { WorkspaceGraphPanel } from "@/features/workspace/components/workspace-graph/workspace-graph-panel";
import { authStore } from "@/stores/auth.store";
import { effectiveNavRole } from "@/types/auth";

export function WorkspaceGraphView() {
  const user = authStore((s) => s.user);
  const navRole = effectiveNavRole(user);
  const canManage =
    navRole === "ADMIN" ||
    navRole === "SUPER_ADMIN" ||
    user?.profileRole === "owner" ||
    user?.profileRole === "manager";

  return (
    <div className="space-y-4">
      <WorkspaceGraphPanel canManage={canManage} expanded />
    </div>
  );
}
