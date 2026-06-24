import { create } from "zustand";

import { DEMO_WORKSPACE_GRAPH } from "@/features/workspace/data/workspace-graph-demo";
import type { WorkspaceGraphEdge, WorkspaceGraphNode } from "@/types/workspace-graph";

type WorkspaceGraphState = {
  organizationName: string;
  nodes: WorkspaceGraphNode[];
  edges: WorkspaceGraphEdge[];
  selectedNodeId: string | null;
  focusedNodeId: string | null;
  connectMode: boolean;
  connectSourceId: string | null;
  setGraph: (payload: { organizationName: string; nodes: WorkspaceGraphNode[]; edges: WorkspaceGraphEdge[] }) => void;
  selectNode: (id: string | null) => void;
  focusNode: (id: string | null) => void;
  startConnect: (sourceId: string) => void;
  cancelConnect: () => void;
  addPeerConnection: (
    sourceId: string,
    targetId: string,
    options?: { crossAccess?: boolean; sharedDomains?: WorkspaceGraphEdge["sharedDomains"] },
  ) => void;
  removeEdge: (edgeId: string) => void;
};

export const workspaceGraphStore = create<WorkspaceGraphState>((set, get) => ({
  organizationName: DEMO_WORKSPACE_GRAPH.organizationName,
  nodes: DEMO_WORKSPACE_GRAPH.nodes,
  edges: DEMO_WORKSPACE_GRAPH.edges,
  selectedNodeId: null,
  focusedNodeId: null,
  connectMode: false,
  connectSourceId: null,

  setGraph: ({ organizationName, nodes, edges }) =>
    set({ organizationName, nodes, edges }),

  selectNode: (id) => set({ selectedNodeId: id }),

  focusNode: (id) => set({ focusedNodeId: id, selectedNodeId: id }),

  startConnect: (sourceId) =>
    set({ connectMode: true, connectSourceId: sourceId, selectedNodeId: sourceId }),

  cancelConnect: () => set({ connectMode: false, connectSourceId: null }),

  addPeerConnection: (sourceId, targetId, options) => {
    const { edges } = get();
    if (sourceId === targetId) return;
    const exists = edges.some(
      (e) =>
        e.type === "peer" &&
        ((e.sourceId === sourceId && e.targetId === targetId) ||
          (e.sourceId === targetId && e.targetId === sourceId)),
    );
    if (exists) return;

    const edge: WorkspaceGraphEdge = {
      id: `peer_${sourceId}_${targetId}_${Date.now()}`,
      sourceId,
      targetId,
      type: "peer",
      crossAccess: options?.crossAccess ?? true,
      sharedDomains: options?.sharedDomains ?? ["employees", "crm", "hrm"],
      label: "Peer connection",
      createdAt: new Date().toLocaleDateString("en-US", { month: "short", year: "numeric" }),
    };

    set({ edges: [...edges, edge], connectMode: false, connectSourceId: null, selectedNodeId: targetId });
  },

  removeEdge: (edgeId) =>
    set((state) => ({ edges: state.edges.filter((e) => e.id !== edgeId) })),
}));
