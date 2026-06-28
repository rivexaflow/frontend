"use client";

import {
  Building2,
  GitBranch,
  Link2,
  Maximize2,
  Network,
  Plus,
  Unlink,
  Users,
  X,
  Zap,
} from "lucide-react";

import { isIsolated } from "@/features/workspace/data/workspace-graph-demo";
import { workspaceGraphStore } from "@/stores/workspace-graph.store";

type Props = {
  canManage: boolean;
  onConnectNew: () => void;
  onCreateNew?: () => void;
  onExpand?: () => void;
};

export function WorkspaceGraphToolbar({ canManage, onConnectNew, onCreateNew, onExpand }: Props) {
  const organizationName = workspaceGraphStore((s) => s.organizationName);
  const nodes = workspaceGraphStore((s) => s.nodes);
  const edges = workspaceGraphStore((s) => s.edges);
  const connectMode = workspaceGraphStore((s) => s.connectMode);
  const cancelConnect = workspaceGraphStore((s) => s.cancelConnect);

  const peerCount = edges.filter((e) => e.type === "peer").length;
  const isolated = nodes.filter((n) => !n.isMain && isIsolated(n.id, edges)).length;
  const totalEmployees = nodes.reduce((sum, n) => sum + (n.employeeCount || 0), 0);

  return (
    <div className="flex flex-col gap-3 border-b border-slate-200/80 bg-white/90 px-4 py-4 dark:border-slate-800 dark:bg-slate-900/90 sm:flex-row sm:items-center sm:justify-between">
      <div className="min-w-0">
        <div className="flex items-center gap-2">
          <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-[#191970] to-[#2277FF] text-white shadow-md shadow-[#2277FF]/20">
            <Network className="h-4 w-4" />
          </span>
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-white">Workspace Graph & Connectivity</h2>
            <p className="text-xs font-medium text-slate-500">{organizationName} · Active Node Topology</p>
          </div>
        </div>
        <div className="mt-3 flex flex-wrap gap-2">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-[11px] font-semibold text-slate-600 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300">
            <Building2 className="h-3 w-3 text-[#2277FF]" />
            {nodes.length} workspaces
          </span>
          <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-[11px] font-semibold text-emerald-800">
            <Link2 className="h-3 w-3" />
            {peerCount} peer links
          </span>
          <span className="inline-flex items-center gap-1.5 rounded-full border border-indigo-200 bg-indigo-50 px-2.5 py-1 text-[11px] font-semibold text-indigo-800">
            <Users className="h-3 w-3" />
            {totalEmployees} workforce total
          </span>
          {isolated > 0 ? (
            <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-200 bg-amber-50 px-2.5 py-1 text-[11px] font-semibold text-amber-800">
              <Unlink className="h-3 w-3" />
              {isolated} without peer link
            </span>
          ) : null}
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        {connectMode ? (
          <button
            type="button"
            onClick={cancelConnect}
            className="inline-flex items-center gap-1.5 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-xs font-bold text-amber-900"
          >
            <X className="h-3.5 w-3.5" />
            Cancel linking
          </button>
        ) : null}
        {canManage && onCreateNew ? (
          <button
            type="button"
            onClick={onCreateNew}
            className="inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-[#191970] to-[#2277FF] px-3.5 py-2 text-xs font-bold text-white shadow-md shadow-[#2277FF]/20 hover:opacity-95 transition-all"
          >
            <Plus className="h-3.5 w-3.5" />
            Add Workspace Branch
          </button>
        ) : null}
        {canManage ? (
          <button
            type="button"
            onClick={onConnectNew}
            className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-[#191970] shadow-sm hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-indigo-300 transition"
          >
            <GitBranch className="h-3.5 w-3.5" />
            Connect Workspaces
          </button>
        ) : null}
        {onExpand ? (
          <button
            type="button"
            onClick={onExpand}
            className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-700 shadow-sm transition hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
          >
            <Maximize2 className="h-3.5 w-3.5" />
            Full view
          </button>
        ) : null}
      </div>
    </div>
  );
}

export function WorkspaceGraphLegend() {
  return (
    <div className="flex flex-wrap items-center gap-4 border-t border-slate-100 px-4 py-3 text-[11px] text-slate-500 dark:border-slate-800">
      <span className="inline-flex items-center gap-2">
        <span className="h-0.5 w-8 rounded-full bg-[#2277FF]" />
        Hierarchy
      </span>
      <span className="inline-flex items-center gap-2">
        <span className="h-0.5 w-8 rounded-full bg-emerald-500" />
        Peer connection
      </span>
      <span className="inline-flex items-center gap-2">
        <Zap className="h-3.5 w-3.5 text-emerald-600" />
        Cross-access enabled
      </span>
      <span className="inline-flex items-center gap-2">
        <Users className="h-3.5 w-3.5 text-slate-400" />
        Click a workspace card for full details
      </span>
    </div>
  );
}
