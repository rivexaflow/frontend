import type { WorkspaceGraphEdge, WorkspaceGraphNode } from "@/types/workspace-graph";

export const GRAPH_NODE_W = 232;
export const GRAPH_NODE_H = 188;

const ROOT_LABEL_H = 28;
const ROW_GAP = 88;
const CHILD_GAP = 64;
const PEER_LANE_GAP = 44;
const CANVAS_PAD_X = 80;
const CANVAS_PAD_BOTTOM = 48;

export type GraphLayoutNode = WorkspaceGraphNode & {
  x: number;
  y: number;
};

export type GraphPoint = { x: number; y: number };

export type GraphLayout = {
  width: number;
  height: number;
  nodes: GraphLayoutNode[];
  busY: number;
  peerLaneY: number;
};

export function buildWorkspaceGraphLayout(
  nodes: WorkspaceGraphNode[],
  edges: WorkspaceGraphEdge[],
): GraphLayout {
  const root = nodes.find((n) => n.isMain || n.parentId === null) ?? nodes[0];
  const children = nodes.filter((n) => n.id !== root?.id);
  const childCount = Math.max(children.length, 1);

  const childrenSpan =
    childCount * GRAPH_NODE_W + Math.max(0, childCount - 1) * CHILD_GAP;
  const width = Math.max(1040, childrenSpan + CANVAS_PAD_X * 2);

  const rootY = ROOT_LABEL_H + 12;
  const childY = rootY + GRAPH_NODE_H + ROW_GAP;
  const peerLaneY = childY + GRAPH_NODE_H + PEER_LANE_GAP;
  const height = peerLaneY + CANVAS_PAD_BOTTOM;

  const laidOut: GraphLayoutNode[] = [];
  const busY = rootY + GRAPH_NODE_H + ROW_GAP / 2;

  if (root) {
    laidOut.push({ ...root, x: width / 2, y: rootY });
  }

  const rowStart = width / 2 - childrenSpan / 2 + GRAPH_NODE_W / 2;
  children.forEach((child, index) => {
    laidOut.push({
      ...child,
      x: rowStart + index * (GRAPH_NODE_W + CHILD_GAP),
      y: childY,
    });
  });

  void edges;

  return { width, height, nodes: laidOut, busY, peerLaneY };
}

/** Node `x`/`y` are center-top anchor (card uses -translate-x-1/2). */
export function nodeAnchors(node: GraphLayoutNode) {
  return {
    top: { x: node.x, y: node.y },
    bottom: { x: node.x, y: node.y + GRAPH_NODE_H },
    left: { x: node.x - GRAPH_NODE_W / 2, y: node.y + GRAPH_NODE_H / 2 },
    right: { x: node.x + GRAPH_NODE_W / 2, y: node.y + GRAPH_NODE_H / 2 },
  };
}

export function hierarchyBusPath(
  root: GraphLayoutNode,
  children: GraphLayoutNode[],
  busY: number,
): string {
  if (!children.length) return "";

  const rootBottom = nodeAnchors(root).bottom;
  const xs = children.map((c) => c.x);
  const minX = Math.min(...xs);
  const maxX = Math.max(...xs);

  if (children.length === 1) {
    const childTop = nodeAnchors(children[0]!).top;
    const midY = (rootBottom.y + childTop.y) / 2;
    return `M ${rootBottom.x} ${rootBottom.y} C ${rootBottom.x} ${midY}, ${childTop.x} ${midY}, ${childTop.x} ${childTop.y}`;
  }

  const childTops = children
    .map((child) => {
      const top = nodeAnchors(child).top;
      return `M ${child.x} ${busY} L ${child.x} ${top.y}`;
    })
    .join(" ");

  return [
    `M ${rootBottom.x} ${rootBottom.y} L ${rootBottom.x} ${busY}`,
    `M ${minX} ${busY} L ${maxX} ${busY}`,
    childTops,
  ].join(" ");
}

export function peerEdgePath(
  source: GraphLayoutNode,
  target: GraphLayoutNode,
  laneY: number,
): string {
  const s = nodeAnchors(source);
  const t = nodeAnchors(target);
  const [left, right] = source.x <= target.x ? [s, t] : [t, s];
  const start = left.right;
  const end = right.left;
  const drop = laneY;

  return [
    `M ${start.x} ${start.y}`,
    `L ${start.x} ${drop}`,
    `L ${end.x} ${drop}`,
    `L ${end.x} ${end.y}`,
  ].join(" ");
}

export function peerLabelPoint(
  source: GraphLayoutNode,
  target: GraphLayoutNode,
  laneY: number,
): GraphPoint {
  return { x: (source.x + target.x) / 2, y: laneY - 10 };
}

export function hierarchyChildrenFor(
  rootId: string,
  edges: WorkspaceGraphEdge[],
  byId: Map<string, GraphLayoutNode>,
): GraphLayoutNode[] {
  return edges
    .filter((e) => e.type === "hierarchy" && e.sourceId === rootId)
    .map((e) => byId.get(e.targetId))
    .filter((n): n is GraphLayoutNode => Boolean(n))
    .sort((a, b) => a.x - b.x);
}
