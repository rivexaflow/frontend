"use client";

import { useEffect, useState } from "react";
import { Check, ChevronRight } from "lucide-react";

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

function formatResourceName(label: string) {
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

function permissionDescription(resource: string, actionKey: string): string {
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

function permissionTitle(resource: string, actionKey: string): string {
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
      className="flex w-full items-start gap-3 px-4 py-3 text-left transition hover:bg-slate-50 dark:hover:bg-slate-800/40"
    >
      <span
        className={cn(
          "mt-0.5 flex h-[18px] w-[18px] shrink-0 items-center justify-center rounded border-2 transition",
          allowed
            ? "border-[#191970] bg-[#191970] text-white"
            : "border-slate-300 bg-white dark:border-slate-600 dark:bg-slate-900",
        )}
        aria-hidden
      >
        {allowed ? <Check className="h-3 w-3" strokeWidth={3} /> : null}
      </span>
      <span className="min-w-0 flex-1">
        <span className="block text-sm font-medium text-slate-900 dark:text-white">{title}</span>
        <span className="mt-0.5 block text-xs text-slate-500">{description}</span>
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
      <div className="border-b border-slate-200/90 px-5 py-4 dark:border-slate-800">
        <h3 className="text-base font-semibold text-slate-900 dark:text-white">{category.label} access</h3>
        <p className="mt-1 text-sm text-slate-500">Pick an area and enable the actions this role needs.</p>
      </div>

      <div className="grid lg:grid-cols-[200px_1fr]">
        <nav className="border-b border-slate-200/90 p-2 lg:border-b-0 lg:border-r dark:border-slate-800">
          <p className="mb-1 px-2 text-[10px] font-semibold uppercase tracking-wide text-slate-400">Areas</p>
          <ul>
            {category.modules.map((mod) => {
              const active = mod.id === activeModuleId;
              const modKeys = keysForModule(category.id, mod.id);
              const modGranted = modKeys.filter((k) => selected.has(k)).length;
              const level = detectAccessLevel(mod, category.id, selected);

              return (
                <li key={mod.id}>
                  <button
                    type="button"
                    onClick={() => setActiveModuleId(mod.id)}
                    className={cn(
                      "mb-0.5 flex w-full items-center gap-2 rounded-lg px-3 py-2.5 text-left transition",
                      active
                        ? "bg-[#191970] text-white shadow-sm"
                        : "text-slate-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800",
                    )}
                  >
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-semibold">{formatResourceName(mod.label)}</p>
                      <p className={cn("mt-0.5 text-[11px]", active ? "text-white/70" : "text-slate-400")}>
                        {levelSummary[level]}
                        {modGranted > 0 ? ` · ${modGranted} on` : ""}
                      </p>
                    </div>
                    {active ? <ChevronRight className="h-4 w-4 shrink-0" /> : null}
                  </button>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="p-5">
          <div className="flex flex-wrap items-center gap-3">
            <span className="text-xs font-medium text-slate-500">
              {formatResourceName(activeModule.label)}:
            </span>
            <div className="inline-flex rounded-lg border border-slate-200/90 bg-white p-0.5 dark:border-slate-700 dark:bg-slate-950">
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
                    "rounded-md px-3 py-1.5 text-xs font-semibold transition",
                    accessLevel === preset.id
                      ? "bg-[#191970] text-white shadow-sm"
                      : "text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white",
                  )}
                >
                  {preset.label}
                </button>
              ))}
            </div>
          </div>

          <ul className="mt-4 divide-y divide-slate-100 overflow-hidden rounded-lg border border-slate-200/90 dark:divide-slate-800 dark:border-slate-800">
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

          <p className="mt-2 text-xs text-slate-400">
            {activeGranted} of {activeModKeys.length} enabled
          </p>
        </div>
      </div>

      <div className="border-t border-slate-100 px-5 py-2.5 text-xs text-slate-400 dark:border-slate-800">
        {grantedCount} permissions allowed in {category.label} for this role
      </div>
    </div>
  );
}
