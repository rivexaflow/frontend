export const WORKSPACE_ACCESS_MODULES = [
  { id: "crm", label: "CRM & Leads", description: "Pipeline, contacts, and deal rooms" },
  { id: "kyc", label: "KYC & Compliance", description: "Verification workflows and audit trails" },
  { id: "deals", label: "Deals", description: "Deal desk and revenue operations" },
  { id: "billing", label: "Billing", description: "Invoices, subscriptions, and payments" },
  { id: "hrm", label: "HRM", description: "People, payroll, and org structure" },
  { id: "ai", label: "AI Agents", description: "Automations and intelligent assistants" },
] as const;

export type WorkspaceModuleId = (typeof WORKSPACE_ACCESS_MODULES)[number]["id"];

export const DEFAULT_MODULES_BY_DEPARTMENT: Record<string, WorkspaceModuleId[]> = {
  Revenue: ["crm", "deals"],
  Compliance: ["kyc"],
  People: ["hrm"],
  Finance: ["billing"],
  Operations: ["crm", "billing"],
  Success: ["crm"],
  Intelligence: ["ai", "crm"],
  Support: ["crm"],
};
