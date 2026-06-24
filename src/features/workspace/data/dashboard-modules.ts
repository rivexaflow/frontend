import type { LucideIcon } from "lucide-react";
import {
  BarChart3,
  Bot,
  FileText,
  Mail,
  MessageCircle,
  Phone,
  ShieldCheck,
  Target,
  Users,
} from "lucide-react";

export type DashboardModuleDef = {
  id: string;
  label: string;
  description: string;
  icon: LucideIcon;
  href: string;
  color: string;
  todoHint: string;
};

const MODULE_REGISTRY: Record<string, Omit<DashboardModuleDef, "id">> = {
  CRM: {
    label: "CRM",
    description: "Leads, contacts, and pipeline in one governed surface.",
    icon: Target,
    href: "crm/leads",
    color: "blue",
    todoHint: "Review 12 new leads assigned to you",
  },
  KYC: {
    label: "KYC",
    description: "Identity verification and compliance workflows.",
    icon: ShieldCheck,
    href: "kyc",
    color: "purple",
    todoHint: "3 submissions awaiting review",
  },
  Invoice: {
    label: "Invoicing",
    description: "Quotes, invoices, and payment tracking.",
    icon: FileText,
    href: "invoices",
    color: "amber",
    todoHint: "Send 2 pending invoices",
  },
  "AI Agents": {
    label: "AI Agents",
    description: "Automations and AI-assisted operations.",
    icon: Bot,
    href: "ai",
    color: "indigo",
    todoHint: "Run weekly pipeline summary",
  },
  "Calling Agent": {
    label: "Calling",
    description: "Outbound calls and call intelligence.",
    icon: Phone,
    href: "ai/tools",
    color: "rose",
    todoHint: "Schedule 5 follow-up calls",
  },
  WhatsApp: {
    label: "WhatsApp",
    description: "Customer messaging and broadcast campaigns.",
    icon: MessageCircle,
    href: "notifications",
    color: "emerald",
    todoHint: "Reply to 8 open conversations",
  },
  "Email Marketing": {
    label: "Email",
    description: "Campaigns, sequences, and deliverability.",
    icon: Mail,
    href: "notifications",
    color: "sky",
    todoHint: "Approve draft nurture sequence",
  },
  "Project Management": {
    label: "Projects",
    description: "Tasks, milestones, and team delivery.",
    icon: Users,
    href: "user",
    color: "slate",
    todoHint: "Update Q2 rollout checklist",
  },
  Analytics: {
    label: "Analytics",
    description: "Reports, KPIs, and operational insights.",
    icon: BarChart3,
    href: "reports",
    color: "violet",
    todoHint: "Export monthly performance report",
  },
};

export function resolveDashboardModules(selected: string[]): DashboardModuleDef[] {
  const source = selected.length > 0 ? selected : ["CRM", "KYC", "Analytics"];
  
  const resolved: DashboardModuleDef[] = [];
  const seenLabels = new Set<string>();

  for (const id of source) {
    const registryKey = Object.keys(MODULE_REGISTRY).find(
      (key) =>
        key.toLowerCase() === id.toLowerCase() ||
        MODULE_REGISTRY[key].label.toLowerCase() === id.toLowerCase()
    );

    if (registryKey) {
      const meta = MODULE_REGISTRY[registryKey];
      const normalizedLabel = meta.label.toLowerCase();
      if (!seenLabels.has(normalizedLabel)) {
        seenLabels.add(normalizedLabel);
        resolved.push({
          id: registryKey,
          ...meta,
          href: `/${meta.href}`,
        });
      }
    }
  }

  if (resolved.length === 0) {
    return ["CRM", "KYC", "Analytics"].map((key) => {
      const meta = MODULE_REGISTRY[key];
      return {
        id: key,
        ...meta,
        href: `/${meta.href}`,
      };
    });
  }

  return resolved;
}

export function buildTodosFromModules(modules: DashboardModuleDef[]) {
  return modules.slice(0, 6).map((mod, index) => ({
    id: `todo-${mod.id}`,
    title: mod.todoHint,
    module: mod.label,
    priority: index < 2 ? ("high" as const) : ("medium" as const),
    done: false,
  }));
}
