"use client";

import { Building2, Crown, Link2, Users, Zap } from "lucide-react";

import {
  GRAPH_NODE_H,
  GRAPH_NODE_W,
} from "@/features/workspace/components/workspace-graph/workspace-graph-layout";
import {
  connectionCount,
  isIsolated,
  peerConnectionsFor,
  workspaceModuleMeta,
} from "@/features/workspace/data/workspace-graph-demo";
import type { WorkspaceGraphEdge, WorkspaceGraphNode } from "@/types/workspace-graph";
import { cn } from "@/lib/utils/cn";

type Props = {
  node: WorkspaceGraphNode;
  edges: WorkspaceGraphEdge[];
  selected?: boolean;
  connectTarget?: boolean;
  isRoot?: boolean;
  onClick: () => void;
  style?: React.CSSProperties;
};

export function WorkspaceGraphNodeCard({
  node,
  edges,
  selected,
  connectTarget,
  isRoot,
  onClick,
  style,
}: Props) {
  const peers = peerConnectionsFor(node.id, edges);
  const isolated = !node.isMain && isIsolated(node.id, edges);
  const links = connectionCount(node.id, edges);
  const hasCrossAccess = peers.some((e) => e.crossAccess);

  return (
    <button
      type="button"
      onClick={onClick}
      style={{ ...style, width: GRAPH_NODE_W, height: GRAPH_NODE_H }}
      className={cn(
        "group absolute z-10 -translate-x-1/2 text-left transition duration-200",
        selected && "z-20",
      )}
    >
      <div
        className={cn(
          "relative flex h-full flex-col overflow-hidden rounded-2xl border bg-white shadow-[0_10px_28px_rgba(15,23,42,0.07)] transition dark:bg-slate-900",
          node.isMain
            ? "border-[#191970]/30 ring-1 ring-[#191970]/10"
            : "border-slate-200/90 dark:border-slate-700",
          selected && "ring-2 ring-[#2277FF]/45 ring-offset-2",
          connectTarget && "ring-2 ring-emerald-400 ring-offset-2",
          "hover:-translate-y-0.5 hover:shadow-[0_18px_36px_rgba(15,23,42,0.11)]",
        )}
      >
        {/* Hierarchy ports */}
        {!isRoot ? (
          <span
            className="absolute left-1/2 top-0 z-10 h-2.5 w-2.5 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white bg-[#2277FF] shadow-sm"
            aria-hidden
          />
        ) : null}
        {isRoot ? (
          <span
            className="absolute bottom-0 left-1/2 z-10 h-2.5 w-2.5 -translate-x-1/2 translate-y-1/2 rounded-full border-2 border-white bg-[#2277FF] shadow-sm"
            aria-hidden
          />
        ) : null}

        {/* Peer ports */}
        {!isRoot ? (
          <>
            <span
              className="absolute left-0 top-1/2 z-10 h-2 w-2 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white bg-emerald-500 shadow-sm"
              aria-hidden
            />
            <span
              className="absolute right-0 top-1/2 z-10 h-2 w-2 -translate-y-1/2 translate-x-1/2 rounded-full border-2 border-white bg-emerald-500 shadow-sm"
              aria-hidden
            />
          </>
        ) : null}

        <div className="border-b border-slate-100 px-3 py-2.5 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <span
              className={cn(
                "flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-[11px] font-bold text-white",
                node.isMain
                  ? "bg-gradient-to-br from-[#191970] to-[#2277FF]"
                  : "bg-gradient-to-br from-slate-700 to-slate-500",
              )}
            >
              {node.name.slice(0, 2).toUpperCase()}
            </span>
            <div className="min-w-0 flex-1">
              <p className="truncate text-[13px] font-bold text-slate-900 dark:text-white">{node.name}</p>
              <p className="truncate text-[10px] font-medium text-slate-500">{node.plan} plan</p>
            </div>
          </div>

          <div className="mt-1.5 flex flex-wrap gap-1">
            {node.isMain ? (
              <span className="inline-flex items-center gap-0.5 rounded border border-[#191970]/15 bg-[#191970]/5 px-1.5 py-0.5 text-[8px] font-bold uppercase tracking-wide text-[#191970]">
                <Crown className="h-2.5 w-2.5" />
                Main
              </span>
            ) : null}
            {hasCrossAccess ? (
              <span className="inline-flex items-center gap-0.5 rounded border border-emerald-200 bg-emerald-50 px-1.5 py-0.5 text-[8px] font-bold uppercase tracking-wide text-emerald-800">
                <Zap className="h-2.5 w-2.5" />
                Cross-access
              </span>
            ) : null}
            {isolated ? (
              <span className="inline-flex items-center gap-0.5 rounded border border-amber-200 bg-amber-50 px-1.5 py-0.5 text-[8px] font-bold uppercase tracking-wide text-amber-800">
                No peer link
              </span>
            ) : null}
          </div>
        </div>

        <div className="flex flex-1 flex-col justify-between px-3 py-2">
          <div className="flex flex-wrap gap-1">
            {node.modules.slice(0, 3).map((mod) => {
              const meta = workspaceModuleMeta(mod);
              return (
                <span
                  key={mod}
                  className={cn("rounded border px-1.5 py-0.5 text-[8px] font-bold", meta.tone)}
                  title={meta.short}
                >
                  {meta.label}
                </span>
              );
            })}
            {node.modules.length > 3 ? (
              <span className="rounded bg-slate-100 px-1.5 py-0.5 text-[8px] font-bold text-slate-600">
                +{node.modules.length - 3}
              </span>
            ) : null}
          </div>

          <div className="grid grid-cols-2 gap-1.5 text-[9px]">
            <div className="rounded-md bg-slate-50 px-2 py-1 dark:bg-slate-800/80">
              <p className="font-medium text-slate-400">Employees</p>
              <p className="mt-0.5 flex items-center gap-1 font-bold text-slate-800 dark:text-slate-100">
                <Users className="h-2.5 w-2.5 text-slate-400" />
                {node.employeeCount}
              </p>
            </div>
            <div className="rounded-md bg-slate-50 px-2 py-1 dark:bg-slate-800/80">
              <p className="font-medium text-slate-400">Links</p>
              <p className="mt-0.5 flex items-center gap-1 font-bold text-slate-800 dark:text-slate-100">
                <Link2 className="h-2.5 w-2.5 text-slate-400" />
                {links}
              </p>
            </div>
          </div>

          {node.region ? (
            <p className="flex items-center gap-1 text-[9px] text-slate-500">
              <Building2 className="h-2.5 w-2.5" />
              {node.region}
            </p>
          ) : null}
        </div>
      </div>
    </button>
  );
}
