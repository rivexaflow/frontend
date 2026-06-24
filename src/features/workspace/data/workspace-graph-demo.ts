import type {
  WorkspaceGraphEdge,
  WorkspaceGraphEmployee,
  WorkspaceGraphNode,
  WorkspaceGraphSnapshot,
} from "@/types/workspace-graph";

export const DEMO_WORKSPACE_GRAPH: WorkspaceGraphSnapshot = {
  organizationName: "Alpha Holdings",
  nodes: [
    {
      id: "ws_alpha",
      name: "Alpha",
      slug: "alpha",
      parentId: null,
      modules: ["CRM", "HRM", "KYC", "Invoice", "Analytics"],
      employeeCount: 124,
      plan: "Enterprise",
      industry: "Financial services",
      isMain: true,
      status: "active",
      createdAt: "Jan 2024",
      adminName: "Priya Sharma",
      adminEmail: "priya@alpha.com",
      region: "Singapore",
    },
    {
      id: "ws_beta",
      name: "Beta",
      slug: "beta",
      parentId: "ws_alpha",
      modules: ["HRM"],
      employeeCount: 48,
      plan: "Growth",
      industry: "Operations",
      status: "active",
      createdAt: "Mar 2024",
      adminName: "James Okonkwo",
      adminEmail: "james@beta.alpha.com",
      region: "Dubai",
    },
    {
      id: "ws_gamma",
      name: "Gamma",
      slug: "gamma",
      parentId: "ws_alpha",
      modules: ["CRM", "KYC"],
      employeeCount: 32,
      plan: "Growth",
      industry: "Sales & compliance",
      status: "active",
      createdAt: "Jun 2024",
      adminName: "Elena Rossi",
      adminEmail: "elena@gamma.alpha.com",
      region: "London",
    },
    {
      id: "ws_delta",
      name: "Delta",
      slug: "delta",
      parentId: "ws_alpha",
      modules: ["CRM"],
      employeeCount: 14,
      plan: "Starter",
      industry: "Regional sales",
      status: "active",
      createdAt: "Nov 2025",
      adminName: "Marcus Lee",
      adminEmail: "marcus@delta.alpha.com",
      region: "Sydney",
    },
  ],
  edges: [
    {
      id: "edge_alpha_beta",
      sourceId: "ws_alpha",
      targetId: "ws_beta",
      type: "hierarchy",
      crossAccess: false,
      sharedDomains: [],
      label: "Parent workspace",
      createdAt: "Mar 2024",
    },
    {
      id: "edge_alpha_gamma",
      sourceId: "ws_alpha",
      targetId: "ws_gamma",
      type: "hierarchy",
      crossAccess: false,
      sharedDomains: [],
      label: "Parent workspace",
      createdAt: "Jun 2024",
    },
    {
      id: "edge_alpha_delta",
      sourceId: "ws_alpha",
      targetId: "ws_delta",
      type: "hierarchy",
      crossAccess: false,
      sharedDomains: [],
      label: "Parent workspace",
      createdAt: "Nov 2025",
    },
    {
      id: "edge_beta_gamma",
      sourceId: "ws_beta",
      targetId: "ws_gamma",
      type: "peer",
      crossAccess: true,
      sharedDomains: ["employees", "hrm", "crm"],
      label: "Data & employee bridge",
      createdAt: "Aug 2024",
    },
  ],
};

export const DEMO_WORKSPACE_EMPLOYEES: Record<string, WorkspaceGraphEmployee[]> = {
  ws_alpha: [
    { id: "e1", name: "Priya Sharma", email: "priya@alpha.com", role: "Owner", department: "Executive" },
    { id: "e2", name: "Noah Patel", email: "noah@alpha.com", role: "HR Director", department: "People" },
    { id: "e3", name: "Sarah Chen", email: "sarah@alpha.com", role: "Compliance Lead", department: "Risk" },
  ],
  ws_beta: [
    {
      id: "e4",
      name: "James Okonkwo",
      email: "james@beta.alpha.com",
      role: "Workspace Admin",
      department: "HR",
    },
    {
      id: "e5",
      name: "Lena Fischer",
      email: "lena@beta.alpha.com",
      role: "Payroll Specialist",
      department: "HR",
      crossWorkspaceAccess: ["ws_gamma"],
    },
    {
      id: "e6",
      name: "Sofia Alvarez",
      email: "sofia@beta.alpha.com",
      role: "HR Analyst",
      department: "People Ops",
    },
  ],
  ws_gamma: [
    {
      id: "e7",
      name: "Elena Rossi",
      email: "elena@gamma.alpha.com",
      role: "Workspace Admin",
      department: "Sales",
    },
    {
      id: "e8",
      name: "Lena Fischer",
      email: "lena@beta.alpha.com",
      role: "Shared HR liaison",
      department: "Cross-workspace",
      crossWorkspaceAccess: ["ws_beta"],
    },
    {
      id: "e9",
      name: "Omar Hassan",
      email: "omar@gamma.alpha.com",
      role: "KYC Analyst",
      department: "Compliance",
    },
  ],
  ws_delta: [
    {
      id: "e10",
      name: "Marcus Lee",
      email: "marcus@delta.alpha.com",
      role: "Workspace Admin",
      department: "Sales",
    },
  ],
};

const MODULE_META: Record<
  string,
  { label: string; tone: string; short: string }
> = {
  CRM: { label: "CRM", tone: "bg-blue-50 text-blue-700 border-blue-100", short: "Leads & pipeline" },
  HRM: { label: "HRM", tone: "bg-violet-50 text-violet-700 border-violet-100", short: "People & payroll" },
  KYC: { label: "KYC", tone: "bg-purple-50 text-purple-700 border-purple-100", short: "Compliance" },
  Invoice: { label: "Invoice", tone: "bg-amber-50 text-amber-800 border-amber-100", short: "Billing" },
  "AI Agents": { label: "AI", tone: "bg-indigo-50 text-indigo-700 border-indigo-100", short: "Automation" },
  Analytics: { label: "Analytics", tone: "bg-slate-100 text-slate-700 border-slate-200", short: "Reports" },
};

export function workspaceModuleMeta(moduleId: string) {
  return (
    MODULE_META[moduleId] ?? {
      label: moduleId,
      tone: "bg-slate-100 text-slate-700 border-slate-200",
      short: "Module",
    }
  );
}

export function peerConnectionsFor(nodeId: string, edges: WorkspaceGraphEdge[]) {
  return edges.filter(
    (e) => e.type === "peer" && (e.sourceId === nodeId || e.targetId === nodeId),
  );
}

export function hierarchyChildren(parentId: string, nodes: WorkspaceGraphNode[]) {
  return nodes.filter((n) => n.parentId === parentId);
}

export function connectionCount(nodeId: string, edges: WorkspaceGraphEdge[]) {
  return edges.filter((e) => e.sourceId === nodeId || e.targetId === nodeId).length;
}

export function isIsolated(nodeId: string, edges: WorkspaceGraphEdge[]) {
  return !edges.some(
    (e) => e.type === "peer" && (e.sourceId === nodeId || e.targetId === nodeId),
  );
}

export function mergeApiWorkspaces(
  apiList: { id: string; name: string; slug: string; modules?: string[]; size?: string }[],
  snapshot: WorkspaceGraphSnapshot,
): WorkspaceGraphSnapshot {
  if (!apiList.length) return snapshot;

  const demoBySlug = new Map(snapshot.nodes.map((n) => [n.slug.toLowerCase(), n]));
  const nodes: WorkspaceGraphNode[] = apiList.map((ws, index) => {
    const demo = demoBySlug.get(ws.slug.toLowerCase());
    if (demo) {
      return {
        ...demo,
        id: ws.id,
        name: ws.name,
        slug: ws.slug,
        modules: (ws.modules?.length ? ws.modules : demo.modules) as WorkspaceGraphNode["modules"],
        plan: ws.size || demo.plan,
      };
    }
    return {
      id: ws.id,
      name: ws.name,
      slug: ws.slug,
      parentId: index === 0 ? null : apiList[0]?.id ?? null,
      modules: (ws.modules ?? ["CRM"]) as WorkspaceGraphNode["modules"],
      employeeCount: 12 + index * 8,
      plan: ws.size || "Growth",
      status: "active" as const,
      createdAt: "Recently",
      adminName: "Workspace admin",
      adminEmail: `admin@${ws.slug}.com`,
    };
  });

  const edges = snapshot.edges
    .map((e) => {
      const sourceSlug = snapshot.nodes.find((n) => n.id === e.sourceId)?.slug.toLowerCase();
      const targetSlug = snapshot.nodes.find((n) => n.id === e.targetId)?.slug.toLowerCase();
      const source = nodes.find((n) => n.slug.toLowerCase() === sourceSlug);
      const target = nodes.find((n) => n.slug.toLowerCase() === targetSlug);
      if (!source || !target) return null;
      return { ...e, sourceId: source.id, targetId: target.id };
    })
    .filter((e): e is WorkspaceGraphEdge => Boolean(e));

  const root = nodes.find((n) => n.parentId === null) ?? nodes[0];
  for (const node of nodes) {
    if (node.id === root?.id) {
      node.isMain = true;
      node.parentId = null;
    } else if (!edges.some((e) => e.targetId === node.id && e.type === "hierarchy")) {
      node.parentId = root?.id ?? null;
      edges.push({
        id: `edge_${root?.id}_${node.id}`,
        sourceId: root!.id,
        targetId: node.id,
        type: "hierarchy",
        crossAccess: false,
        sharedDomains: [],
        label: "Parent workspace",
        createdAt: "Auto-linked",
      });
    }
  }

  return {
    organizationName: root?.name ? `${root.name} Organization` : snapshot.organizationName,
    nodes,
    edges,
  };
}
