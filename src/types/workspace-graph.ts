export type WorkspaceModuleId = "CRM" | "HRM" | "KYC" | "Invoice" | "AI Agents" | "Analytics" | string;

export type WorkspaceGraphNode = {
  id: string;
  name: string;
  slug: string;
  /** null = organization root (main company). */
  parentId: string | null;
  modules: WorkspaceModuleId[];
  employeeCount: number;
  plan: string;
  industry?: string;
  isMain?: boolean;
  status: "active" | "draft" | "archived";
  createdAt: string;
  adminName: string;
  adminEmail: string;
  region?: string;
};

export type WorkspaceGraphEdgeType = "hierarchy" | "peer";

export type WorkspaceGraphEdge = {
  id: string;
  sourceId: string;
  targetId: string;
  type: WorkspaceGraphEdgeType;
  /** When true, employees can access the peer workspace with the same credentials. */
  crossAccess: boolean;
  /** Shared data domains when peer-connected. */
  sharedDomains: ("employees" | "crm" | "hrm" | "kyc" | "billing")[];
  label?: string;
  createdAt: string;
};

export type WorkspaceGraphEmployee = {
  id: string;
  name: string;
  email: string;
  role: string;
  department: string;
  crossWorkspaceAccess?: string[];
};

export type WorkspaceGraphSnapshot = {
  organizationName: string;
  nodes: WorkspaceGraphNode[];
  edges: WorkspaceGraphEdge[];
};
