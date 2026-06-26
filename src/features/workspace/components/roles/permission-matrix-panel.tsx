"use client";

import { useEffect, useState } from "react";
import {
  Users,
  Shield,
  Globe,
  Settings,
  TrendingUp,
  Target,
  Briefcase,
  Contact,
  GitFork,
  CheckCircle,
  FileText,
  Eye,
  Receipt,
  Bell,
  BarChart3,
  Key,
  FolderOpen,
  Check,
  ChevronRight
} from "lucide-react";

import type { PermissionCategory, PermissionModule } from "@/features/workspace/data/workspace-permissions-catalog";
import {
  keysForCategory,
  keysForModule,
  permissionKey,
} from "@/features/workspace/data/workspace-permissions-catalog";
import { cn } from "@/lib/utils/cn";

type Props = {
  category: PermissionCategory;
  selected: Set<string>;
  onChange: (next: Set<string>) => void;
};

export function formatResourceName(label: string) {
  const names: Record<string, string> = {
    crm: "CRM settings",
    kyc: "KYC settings",
    ai: "AI agents",
    user: "Users",
    roles: "Roles",
    workspace: "Workspace",
    settings: "Settings",
    lead: "Leads",
    deal: "Deals",
    contact: "Contacts",
    pipeline: "Pipelines",
    case: "Cases",
    screening: "Screening",
    document: "Documents",
    invoice: "Invoices",
    notification: "Notifications",
    reports: "Reports",
  };
  return names[label] ?? label.charAt(0).toUpperCase() + label.slice(1);
}

export function permissionDescription(resource: string, actionKey: string): string {
  const r = formatResourceName(resource).toLowerCase();
  const descriptions: Record<string, string> = {
    manage: `Full control over ${r}`,
    create: `Add new ${r}`,
    edit: `Change existing ${r}`,
    delete: `Remove ${r}`,
    show: `See ${r} in the app`,
    view: `See ${r} records`,
    move: `Move ${r} in the pipeline`,
    import: `Import ${r} from a file`,
    export: `Download ${r} data`,
    approve: `Approve ${r}`,
    reject: `Reject ${r}`,
    upload: `Upload ${r} files`,
    verify: `Verify ${r}`,
    escalate: `Send ${r} for review`,
    send: `Send ${r}`,
    convert_deal: "Turn a lead into a deal",
    payment_create: "Record invoice payments",
    dashboard_manage: "Change dashboard layout",
    report_manage: "Build and edit reports",
    tools_use: "Run AI tools",
    history_view: "See activity history",
    profile_manage: "Edit user profiles",
    reset_password: "Reset team passwords",
    login_manage: "Manage sign-in access",
  };
  return descriptions[actionKey] ?? `Permission for ${r}`;
}

export function permissionTitle(resource: string, actionKey: string): string {
  const r = formatResourceName(resource);
  const titles: Record<string, string> = {
    manage: `Manage ${r}`,
    create: `Create ${r}`,
    edit: `Edit ${r}`,
    delete: `Delete ${r}`,
    show: `View ${r}`,
    view: `View ${r}`,
    move: `Move ${r}`,
    import: `Import ${r}`,
    export: `Export ${r}`,
    approve: `Approve ${r}`,
    reject: `Reject ${r}`,
    upload: `Upload ${r}`,
    verify: `Verify ${r}`,
    escalate: `Escalate ${r}`,
    send: `Send ${r}`,
    convert_deal: "Convert to deal",
    payment_create: "Record payments",
    dashboard_manage: "Manage dashboard",
    report_manage: "Manage reports",
    tools_use: "Use AI tools",
    history_view: "View history",
    profile_manage: "Manage profiles",
    reset_password: "Reset passwords",
    login_manage: "Manage logins",
  };
  return titles[actionKey] ?? `${actionKey.replace(/_/g, " ")} — ${r}`;
}

type AccessLevel = "none" | "view" | "edit" | "full";

function detectAccessLevel(mod: PermissionModule, categoryId: string, selected: Set<string>): AccessLevel {
  const modKeys = keysForModule(categoryId, mod.id);
  const granted = modKeys.filter((k) => selected.has(k));
  if (granted.length === 0) return "none";
  if (granted.length === modKeys.length) return "full";

  const viewKeys = mod.actions
    .filter((a) => ["show", "view"].includes(a.key))
    .map((a) => permissionKey(categoryId, mod.id, a.key));
  const onlyView =
    granted.length > 0 &&
    granted.every((k) => viewKeys.includes(k)) &&
    granted.length === viewKeys.filter((k) => modKeys.includes(k)).length;
  if (onlyView) return "view";

  return "edit";
}

function applyAccessLevel(
  level: AccessLevel,
  mod: PermissionModule,
  categoryId: string,
  selected: Set<string>,
): Set<string> {
  const modKeys = keysForModule(categoryId, mod.id);
  const next = new Set(selected);
  for (const k of modKeys) next.delete(k);

  if (level === "none") return next;
  if (level === "full") {
    for (const k of modKeys) next.add(k);
    return next;
  }

  const targetActions =
    level === "view"
      ? ["show", "view"]
      : ["show", "view", "create", "edit", "move", "import", "upload", "send", "convert_deal"];

  for (const action of mod.actions) {
    if (targetActions.includes(action.key) || (level === "edit" && !["manage", "delete"].includes(action.key))) {
      next.add(permissionKey(categoryId, mod.id, action.key));
    }
  }

  return next;
}

function getModuleIcon(moduleId: string) {
  const icons: Record<string, any> = {
    user: Users,
    roles: Shield,
    workspace: Globe,
    settings: Settings,
    crm: TrendingUp,
    lead: Target,
    deal: Briefcase,
    contact: Contact,
    pipeline: GitFork,
    kyc: CheckCircle,
    case: FolderOpen,
    screening: Eye,
    document: FileText,
    invoice: Receipt,
    notification: Bell,
    reports: BarChart3,
  };
  return icons[moduleId] ?? Key;
}

function PermissionRow({
  title,
  description,
  allowed,
  onToggle,
}: {
  title: string;
  description: string;
  allowed: boolean;
  onToggle: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onToggle}
      className={cn(
        "flex w-full items-start gap-3.5 px-4 py-3.5 text-left transition-all duration-200 border-l-2",
        allowed
          ? "border-[#191970] bg-gradient-to-r from-[#191970]/[0.02] to-white/0 hover:bg-[#191970]/[0.04] dark:border-blue-500 dark:from-blue-950/5 dark:to-slate-900/0"
          : "border-transparent hover:bg-slate-50/50 dark:hover:bg-slate-800/20"
      )}
    >
      <span
        className={cn(
          "mt-0.5 flex h-4.5 w-4.5 shrink-0 items-center justify-center rounded border-2 transition-all duration-200",
          allowed
            ? "border-[#191970] bg-[#191970] text-white scale-105 shadow-sm shadow-[#191970]/10"
            : "border-slate-300 bg-white dark:border-slate-600 dark:bg-slate-900",
        )}
        aria-hidden
      >
        {allowed ? <Check className="h-3 w-3 animate-fade-in" strokeWidth={3} /> : null}
      </span>
      <span className="min-w-0 flex-1">
        <span className={cn("block text-sm font-bold transition", allowed ? "text-slate-900 dark:text-white" : "text-slate-700 dark:text-slate-300")}>
          {title}
        </span>
        <span className="mt-0.5 block text-xs text-slate-400 font-medium leading-relaxed">{description}</span>
      </span>
    </button>
  );
}

export function PermissionMatrixPanel({ category, selected, onChange }: Props) {
  const [activeModuleId, setActiveModuleId] = useState(category.modules[0]?.id ?? "");

  useEffect(() => {
    setActiveModuleId(category.modules[0]?.id ?? "");
  }, [category.id, category.modules]);

  const categoryKeys = keysForCategory(category.id);
  const grantedCount = categoryKeys.filter((k) => selected.has(k)).length;
  const activeModule = category.modules.find((m) => m.id === activeModuleId) ?? category.modules[0];

  const setKeys = (keys: string[], on: boolean) => {
    const next = new Set(selected);
    for (const k of keys) {
      if (on) next.add(k);
      else next.delete(k);
    }
    onChange(next);
  };

  const toggleKey = (key: string) => {
    const next = new Set(selected);
    if (next.has(key)) next.delete(key);
    else next.add(key);
    onChange(next);
  };

  if (!activeModule) return null;

  const activeModKeys = keysForModule(category.id, activeModule.id);
  const activeGranted = activeModKeys.filter((k) => selected.has(k)).length;
  const accessLevel = detectAccessLevel(activeModule, category.id, selected);

  const levelSummary: Record<AccessLevel, string> = {
    none: "Blocked",
    view: "View only",
    edit: "Can edit",
    full: "Full access",
  };

  return (
    <div>
      <div className="border-b border-slate-200/80 px-5 py-4 dark:border-slate-800 bg-slate-50/20 dark:bg-slate-950/10">
        <h3 className="text-sm font-bold text-slate-900 dark:text-white">{category.label} access</h3>
        <p className="mt-1 text-xs text-slate-500">Pick an area and enable the actions this role needs.</p>
      </div>

      <div className="grid lg:grid-cols-[210px_1fr]">
        <nav className="border-b border-slate-200/80 p-2 lg:border-b-0 lg:border-r dark:border-slate-800 bg-slate-50/[0.15] dark:bg-slate-950/[0.05]">
          <p className="mb-2 px-3 text-[10px] font-bold uppercase tracking-wider text-slate-400">Areas</p>
          <ul className="space-y-0.5">
            {category.modules.map((mod) => {
              const active = mod.id === activeModuleId;
              const modKeys = keysForModule(category.id, mod.id);
              const modGranted = modKeys.filter((k) => selected.has(k)).length;
              const level = detectAccessLevel(mod, category.id, selected);
              const IconComponent = getModuleIcon(mod.id);

              return (
                <li key={mod.id}>
                  <button
                    type="button"
                    onClick={() => setActiveModuleId(mod.id)}
                    className={cn(
                      "flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-left transition duration-200",
                      active
                        ? "bg-[#191970] text-white shadow-sm shadow-[#191970]/10 dark:bg-blue-650"
                        : "text-slate-650 hover:bg-slate-100 hover:text-slate-800 dark:text-slate-350 dark:hover:bg-slate-800 dark:hover:text-white",
                    )}
                  >
                    <IconComponent className={cn("h-4 w-4 shrink-0", active ? "text-white" : "text-slate-400")} />
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-bold truncate">{formatResourceName(mod.label)}</p>
                      <p className={cn("mt-0.5 text-[9.5px] font-medium leading-none", active ? "text-white/70" : "text-slate-400")}>
                        {levelSummary[level]}
                        {modGranted > 0 ? ` · ${modGranted} on` : ""}
                      </p>
                    </div>
                    {active ? <ChevronRight className="h-3.5 w-3.5 shrink-0 opacity-80" /> : null}
                  </button>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="p-5">
          <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-50/50 border border-slate-100 p-3 rounded-xl dark:bg-slate-950/20 dark:border-slate-850">
            <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
              Preset Access:
            </span>
            <div className="inline-flex rounded-xl border border-slate-200/80 bg-slate-50/40 p-0.5 dark:border-slate-700 dark:bg-slate-950">
              {(
                [
                  { id: "none" as const, label: "None" },
                  { id: "view" as const, label: "View" },
                  { id: "edit" as const, label: "Edit" },
                  { id: "full" as const, label: "Full" },
                ] as const
              ).map((preset) => (
                <button
                  key={preset.id}
                  type="button"
                  onClick={() => onChange(applyAccessLevel(preset.id, activeModule, category.id, selected))}
                  className={cn(
                    "rounded-lg px-3.5 py-1 text-xs font-bold transition duration-200",
                    accessLevel === preset.id
                      ? "bg-[#191970] text-white shadow-sm dark:bg-blue-650"
                      : "text-slate-500 hover:text-slate-800 dark:text-slate-450 dark:hover:text-white",
                  )}
                >
                  {preset.label}
                </button>
              ))}
            </div>
          </div>

          <ul className="mt-4 divide-y divide-slate-100 overflow-hidden rounded-xl border border-slate-200/80 dark:divide-slate-800 dark:border-slate-800 shadow-sm bg-white dark:bg-slate-900">
            {activeModule.actions.map((action) => {
              const key = permissionKey(category.id, activeModule.id, action.key);
              const enabled = selected.has(key);
              return (
                <li key={key}>
                  <PermissionRow
                    title={permissionTitle(activeModule.label, action.key)}
                    description={permissionDescription(activeModule.label, action.key)}
                    allowed={enabled}
                    onToggle={() => toggleKey(key)}
                  />
                </li>
              );
            })}
          </ul>

          <div className="mt-3 flex items-center justify-between">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              {activeGranted} of {activeModKeys.length} enabled
            </p>
          </div>
        </div>
      </div>

      <div className="border-t border-slate-150 px-5 py-3 text-xs font-semibold text-slate-400 dark:border-slate-800 bg-slate-50/10">
        {grantedCount} active permission grants inside {category.label} for this role
      </div>
    </div>
  );
}
