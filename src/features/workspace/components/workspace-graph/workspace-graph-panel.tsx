"use client";

import { useState } from "react";

import { WorkspaceConnectModal } from "@/features/workspace/components/workspace-graph/workspace-connect-modal";
import { CreateWorkspaceModal } from "@/features/workspace/components/workspace-graph/create-workspace-modal";
import { WorkspaceGraphCanvas } from "@/features/workspace/components/workspace-graph/workspace-graph-canvas";
import { WorkspaceGraphDetail } from "@/features/workspace/components/workspace-graph/workspace-graph-detail";
import {
  WorkspaceGraphLegend,
  WorkspaceGraphToolbar,
} from "@/features/workspace/components/workspace-graph/workspace-graph-toolbar";
import { useWorkspaceGraphBootstrap } from "@/features/workspace/hooks/use-workspace-graph";
import type { WorkspaceGraphNode } from "@/types/workspace-graph";
import { workspaceGraphStore } from "@/stores/workspace-graph.store";
import { cn } from "@/lib/utils/cn";

type Props = {
  canManage?: boolean;
  className?: string;
  expanded?: boolean;
};

export function WorkspaceGraphPanel({ canManage = false, className, expanded = false }: Props) {
  useWorkspaceGraphBootstrap();

  const nodes = workspaceGraphStore((s) => s.nodes);
  const edges = workspaceGraphStore((s) => s.edges);
  const focusedNodeId = workspaceGraphStore((s) => s.focusedNodeId);
  const connectMode = workspaceGraphStore((s) => s.connectMode);
  const connectSourceId = workspaceGraphStore((s) => s.connectSourceId);
  const focusNode = workspaceGraphStore((s) => s.focusNode);
  const selectNode = workspaceGraphStore((s) => s.selectNode);
  const addPeerConnection = workspaceGraphStore((s) => s.addPeerConnection);
  const startConnect = workspaceGraphStore((s) => s.startConnect);

  const [connectOpen, setConnectOpen] = useState(false);
  const [createOpen, setCreateOpen] = useState(false);

  const focusedNode = focusedNodeId ? nodes.find((n) => n.id === focusedNodeId) : null;

  const handleNodeClick = (node: WorkspaceGraphNode) => {
    if (connectMode && connectSourceId && connectSourceId !== node.id && !node.isMain) {
      addPeerConnection(connectSourceId, node.id, {
        crossAccess: true,
        sharedDomains: ["employees", "hrm", "crm"],
      });
      focusNode(node.id);
      return;
    }
    focusNode(node.id);
  };

  return (
    <section
      className={cn(
        "relative overflow-hidden rounded-[28px] border border-slate-200/80 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900",
        expanded && "min-h-[640px]",
        className,
      )}
    >
      <WorkspaceGraphToolbar
        canManage={canManage}
        onConnectNew={() => setConnectOpen(true)}
        onCreateNew={() => setCreateOpen(true)}
      />

      <div className={cn("relative bg-slate-50/40 dark:bg-slate-950/30", expanded ? "min-h-[620px]" : "min-h-[580px]")}>
        <WorkspaceGraphCanvas onNodeClick={handleNodeClick} />

        {focusedNode ? (
          <WorkspaceGraphDetail
            node={focusedNode}
            edges={edges}
            allNodes={nodes}
            canManage={canManage}
            onBack={() => {
              selectNode(null);
              focusNode(null);
            }}
            onConnectPeer={(id) => {
              startConnect(id);
              setConnectOpen(true);
            }}
          />
        ) : null}
      </div>

      <WorkspaceGraphLegend />

      <WorkspaceConnectModal open={connectOpen} onClose={() => setConnectOpen(false)} />
      <CreateWorkspaceModal open={createOpen} onClose={() => setCreateOpen(false)} />
    </section>
  );
}
