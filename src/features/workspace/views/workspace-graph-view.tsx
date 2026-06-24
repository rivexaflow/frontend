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
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">Workspace graph</h1>
        <p className="mt-1 max-w-3xl text-sm text-slate-500">
          Visual map of your main company, child workspaces, module stacks, and peer connections. Demo data
          is shown until backend APIs are connected.
        </p>
      </div>

      <WorkspaceGraphPanel canManage={canManage} expanded />
    </div>
  );
}
