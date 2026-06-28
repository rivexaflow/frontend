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
      <div className="flex flex-wrap items-center justify-between gap-4 pb-1 border-b border-slate-200/60 dark:border-slate-800">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">Workspace Graph & Topology</h1>
          <p className="mt-1 text-xs font-medium text-slate-500">
            Enterprise multi-workspace topology, hierarchy structure, module stacks, and peer-to-peer data sync connections.
          </p>
        </div>
      </div>

      <WorkspaceGraphPanel canManage={canManage} expanded />
    </div>
  );
}
