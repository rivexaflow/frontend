import type { LucideIcon } from "lucide-react";
import {
  BarChart3,
  ClipboardList,
  Copy,
  LayoutTemplate,
  ListTodo,
  Megaphone,
  Phone,
  PieChart,
  Settings2,
  Share2,
  UserPlus,
  Users,
  Webhook,
} from "lucide-react";

import { workspacePaths } from "@/lib/workspace/paths";

export type CrmNavLink = { type: "link"; name: string; href: string; icon: LucideIcon };

export type CrmNavSubGroup = {
  type: "group";
  name: string;
  icon: LucideIcon;
  children: { name: string; href: string; icon: LucideIcon }[];
};

export type CrmNavChild = CrmNavLink | CrmNavSubGroup;

export function isCrmNavSubGroup(item: CrmNavChild): item is CrmNavSubGroup {
  return item.type === "group";
}

/** CRM sidebar structure — Report groups Lead & Deal like the reference app. */
export const CRM_NAV_CHILDREN: CrmNavChild[] = [
  { type: "link", name: "Leads", href: workspacePaths.leads, icon: UserPlus },
  { type: "link", name: "Deals", href: workspacePaths.deals, icon: Users },
  { type: "link", name: "Tasks", href: workspacePaths.crmTasks, icon: ListTodo },
  { type: "link", name: "My tasks", href: workspacePaths.crmMyTasks, icon: ClipboardList },
  { type: "link", name: "Dialer", href: workspacePaths.crmDialer, icon: Phone },
  { type: "link", name: "Settings", href: workspacePaths.crmSetup, icon: Settings2 },
  { type: "link", name: "WhatsApp", href: workspacePaths.crmWhatsapp, icon: Megaphone },
  { type: "link", name: "Webhooks", href: workspacePaths.crmWebhooks, icon: Webhook },
  { type: "link", name: "Form builder", href: workspacePaths.crmLayoutBuilder, icon: LayoutTemplate },
  { type: "link", name: "Facebook leads", href: workspacePaths.crmFacebookLeads, icon: Share2 },
  { type: "link", name: "Duplicates", href: workspacePaths.crmDuplicates, icon: Copy },
  {
    type: "group",
    name: "Report",
    icon: BarChart3,
    children: [
      { name: "Lead", href: workspacePaths.crmLeadReports, icon: BarChart3 },
      { name: "Deal", href: workspacePaths.crmDealReports, icon: PieChart },
    ],
  },
];

/** Flat links for command palette / search */
export const CRM_NAV_FLAT_LINKS = CRM_NAV_CHILDREN.flatMap((item) =>
  isCrmNavSubGroup(item)
    ? item.children.map((c) => ({ name: `${item.name} · ${c.name}`, href: c.href }))
    : [{ name: item.name, href: item.href }],
);

export type CrmSetupSection =
  | "lead_stages"
  | "deal_stages"
  | "lost_reasons"
  | "sources"
  | "deal_types"
  | "labels"
  | "general";

export const CRM_SETUP_SECTIONS: {
  id: CrmSetupSection;
  label: string;
  description: string;
  group: "pipeline" | "picklists" | "defaults";
}[] = [
  {
    id: "lead_stages",
    label: "Lead stages",
    description: "Lifecycle stages shown on the leads board — from first touch to qualified or closed.",
    group: "pipeline",
  },
  {
    id: "deal_stages",
    label: "Deal stages",
    description: "Sales stages with win probability for forecasting and the deals pipeline board.",
    group: "pipeline",
  },
  {
    id: "lost_reasons",
    label: "Lost reasons",
    description: "Required when marking a deal lost — powers loss analysis and coaching.",
    group: "pipeline",
  },
  {
    id: "sources",
    label: "Lead sources",
    description: "Where prospects come from — used on lead forms, imports, and ROI reporting.",
    group: "picklists",
  },
  {
    id: "deal_types",
    label: "Deal types",
    description: "Categorize opportunities (new business, renewal, upsell) for routing and reports.",
    group: "picklists",
  },
  {
    id: "labels",
    label: "Labels",
    description: "Color tags for leads, deals, and tasks — filter and segment without custom fields.",
    group: "picklists",
  },
  {
    id: "general",
    label: "General defaults",
    description: "Assignment rules, SLAs, duplicate checks, and required fields for data quality.",
    group: "defaults",
  },
];
