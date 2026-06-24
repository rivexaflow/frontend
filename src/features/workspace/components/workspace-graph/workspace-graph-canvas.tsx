"use client";

import { useMemo } from "react";

import { WorkspaceGraphNodeCard } from "@/features/workspace/components/workspace-graph/workspace-graph-node-card";
import {
  buildWorkspaceGraphLayout,
  hierarchyBusPath,
  hierarchyChildrenFor,
  peerEdgePath,
  peerLabelPoint,
} from "@/features/workspace/components/workspace-graph/workspace-graph-layout";
import type { WorkspaceGraphNode } from "@/types/workspace-graph";
import { workspaceGraphStore } from "@/stores/workspace-graph.store";

type Props = {
  onNodeClick: (node: WorkspaceGraphNode) => void;
};

export function WorkspaceGraphCanvas({ onNodeClick }: Props) {
  const nodes = workspaceGraphStore((s) => s.nodes);
  const edges = workspaceGraphStore((s) => s.edges);
  const selectedNodeId = workspaceGraphStore((s) => s.selectedNodeId);
  const connectMode = workspaceGraphStore((s) => s.connectMode);
  const connectSourceId = workspaceGraphStore((s) => s.connectSourceId);

  const layout = useMemo(() => buildWorkspaceGraphLayout(nodes, edges), [nodes, edges]);
  const byId = useMemo(() => new Map(layout.nodes.map((n) => [n.id, n])), [layout.nodes]);

  const root = layout.nodes.find((n) => n.isMain || n.parentId === null) ?? layout.nodes[0];
  const hierarchyChildren = root ? hierarchyChildrenFor(root.id, edges, byId) : [];
  const peerEdges = edges.filter((e) => e.type === "peer");

  return (
    <div className="relative overflow-x-auto overflow-y-hidden px-2 py-2">
      <div
        className="relative mx-auto"
        style={{
          width: layout.width,
          height: layout.height,
          minWidth: layout.width,
          backgroundImage:
            "radial-gradient(circle, rgb(148 163 184 / 0.28) 1px, transparent 1px)",
          backgroundSize: "22px 22px",
        }}
      >
        <svg
          className="pointer-events-none absolute inset-0 h-full w-full overflow-visible"
          viewBox={`0 0 ${layout.width} ${layout.height}`}
          aria-hidden
        >
          <defs>
            <marker
              id="graph-arrow-hierarchy"
              markerWidth="7"
              markerHeight="7"
              refX="5.5"
              refY="3.5"
              orient="auto"
            >
              <path d="M0,0 L7,3.5 L0,7 Z" fill="#2277FF" />
            </marker>
            <marker
              id="graph-arrow-peer"
              markerWidth="7"
              markerHeight="7"
              refX="5.5"
              refY="3.5"
              orient="auto"
            >
              <path d="M0,0 L7,3.5 L0,7 Z" fill="#059669" />
            </marker>
          </defs>

          {root && hierarchyChildren.length > 0 ? (
            <g>
              <path
                d={hierarchyBusPath(root, hierarchyChildren, layout.busY)}
                fill="none"
                stroke="#2277FF"
                strokeWidth="2"
                strokeOpacity="0.55"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              {hierarchyChildren.map((child) => (
                <circle
                  key={`bus-${child.id}`}
                  cx={child.x}
                  cy={layout.busY}
                  r="3.5"
                  fill="#2277FF"
                  opacity="0.7"
                />
              ))}
              <circle cx={root.x} cy={layout.busY} r="3.5" fill="#2277FF" opacity="0.7" />
            </g>
          ) : null}

          {peerEdges.map((edge) => {
            const source = byId.get(edge.sourceId);
            const target = byId.get(edge.targetId);
            if (!source || !target) return null;
            const d = peerEdgePath(source, target, layout.peerLaneY);
            const label = peerLabelPoint(source, target, layout.peerLaneY);
            return (
              <g key={edge.id}>
                <path
                  d={d}
                  fill="none"
                  stroke="#059669"
                  strokeWidth="2.25"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  markerEnd="url(#graph-arrow-peer)"
                />
                {edge.crossAccess ? (
                  <>
                    <rect
                      x={label.x - 52}
                      y={label.y - 11}
                      width="104"
                      height="18"
                      rx="9"
                      fill="white"
                      stroke="#a7f3d0"
                    />
                    <text
                      x={label.x}
                      y={label.y + 3}
                      textAnchor="middle"
                      className="fill-emerald-700 text-[10px] font-bold"
                    >
                      shared access
                    </text>
                  </>
                ) : null}
              </g>
            );
          })}
        </svg>

        <p className="pointer-events-none absolute left-1/2 top-3 -translate-x-1/2 text-[10px] font-bold uppercase tracking-[0.22em] text-slate-400">
          Organization root
        </p>

        {layout.nodes.map((node) => (
          <WorkspaceGraphNodeCard
            key={node.id}
            node={node}
            edges={edges}
            selected={selectedNodeId === node.id}
            connectTarget={connectMode && connectSourceId !== node.id && !node.isMain}
            onClick={() => onNodeClick(node)}
            style={{ left: node.x, top: node.y }}
            isRoot={node.isMain === true}
          />
        ))}
      </div>
    </div>
  );
}
