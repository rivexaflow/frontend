"use client";

import { useEffect, useState } from "react";
import { Check, ChevronRight } from "lucide-react";

import type { HrmPermissionCategory, HrmPermissionModule } from "@/features/workspace/data/hrm-permissions-catalog";
import {
  hrmPermissionKey,
  keysForHrmCategory,
  keysForHrmModule,
} from "@/features/workspace/data/hrm-permissions-catalog";
import { cn } from "@/lib/utils/cn";

type Props = {
  category: HrmPermissionCategory;
  selected: Set<string>;
  onChange: (next: Set<string>) => void;
  readOnly?: boolean;
};

type AccessLevel = "none" | "view" | "edit" | "full";

const VIEW_ACTIONS = new Set(["view"]);
const EDIT_ACTIONS = new Set([
  "view",
  "create",
  "edit",
  "apply",
  "approve",
  "verify",
  "remind",
  "ack",
  "export",
]);

function detectAccessLevel(mod: HrmPermissionModule, categoryId: string, selected: Set<string>): AccessLevel {
  const modKeys = keysForHrmModule(categoryId, mod.id);
  const granted = modKeys.filter((k) => selected.has(k));
  if (granted.length === 0) return "none";
  if (granted.length === modKeys.length) return "full";

  const viewKeys = mod.actions
    .filter((a) => VIEW_ACTIONS.has(a.key))
    .map((a) => hrmPermissionKey(categoryId, mod.id, a.key));
  const onlyView =
    granted.length > 0 &&
    granted.every((k) => viewKeys.includes(k)) &&
    granted.length === viewKeys.filter((k) => modKeys.includes(k)).length;
  if (onlyView) return "view";

  return "edit";
}

function applyAccessLevel(
  level: AccessLevel,
  mod: HrmPermissionModule,
  categoryId: string,
  selected: Set<string>,
): Set<string> {
  const modKeys = keysForHrmModule(categoryId, mod.id);
  const next = new Set(selected);
  for (const k of modKeys) next.delete(k);
  if (level === "none") return next;
  if (level === "full") {
    for (const k of modKeys) next.add(k);
    return next;
  }

  for (const action of mod.actions) {
    const key = hrmPermissionKey(categoryId, mod.id, action.key);
    if (level === "view" && VIEW_ACTIONS.has(action.key)) next.add(key);
    if (level === "edit" && (EDIT_ACTIONS.has(action.key) || !["manage", "run", "offboard", "publish"].includes(action.key))) {
      next.add(key);
    }
  }
  return next;
}

function PermissionRow({
  title,
  description,
  allowed,
  readOnly,
  onToggle,
}: {
  title: string;
  description: string;
  allowed: boolean;
  readOnly?: boolean;
  onToggle: () => void;
}) {
  return (
    <button
      type="button"
      onClick={readOnly ? undefined : onToggle}
      disabled={readOnly}
      className={cn(
        "flex w-full items-start gap-3 px-4 py-3 text-left transition",
        readOnly ? "cursor-default" : "cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/40",
      )}
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
      {readOnly ? (
        <span
          className={cn(
            "shrink-0 rounded-md px-2 py-0.5 text-[10px] font-bold uppercase",
            allowed ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-400",
          )}
        >
          {allowed ? "On" : "Off"}
        </span>
      ) : null}
    </button>
  );
}

export function HrmPermissionMatrixPanel({ category, selected, onChange, readOnly = false }: Props) {
  const [activeModuleId, setActiveModuleId] = useState(category.modules[0]?.id ?? "");

  useEffect(() => {
    setActiveModuleId(category.modules[0]?.id ?? "");
  }, [category.id, category.modules]);

  const categoryKeys = keysForHrmCategory(category.id);
  const grantedCount = categoryKeys.filter((k) => selected.has(k)).length;
  const activeModule = category.modules.find((m) => m.id === activeModuleId) ?? category.modules[0];

  const toggleKey = (key: string) => {
    if (readOnly) return;
    const next = new Set(selected);
    if (next.has(key)) next.delete(key);
    else next.add(key);
    onChange(next);
  };

  if (!activeModule) return null;

  const activeModKeys = keysForHrmModule(category.id, activeModule.id);
  const activeGranted = activeModKeys.filter((k) => selected.has(k)).length;
  const accessLevel = detectAccessLevel(activeModule, category.id, selected);

  const levelSummary: Record<AccessLevel, string> = {
    none: "Blocked",
    view: "View only",
    edit: "Can operate",
    full: "Full access",
  };

  return (
    <div>
      <div className="border-b border-slate-200/90 px-5 py-4 dark:border-slate-800">
        <h3 className="text-base font-semibold text-slate-900 dark:text-white">{category.label} access</h3>
        <p className="mt-1 text-sm text-slate-500">
          {readOnly
            ? "Review grants for this module group."
            : "Pick an area and enable the actions this role needs — click rows or use quick presets."}
        </p>
      </div>

      <div className="grid lg:grid-cols-[200px_1fr]">
        <nav className="border-b border-slate-200/90 p-2 lg:border-b-0 lg:border-r dark:border-slate-800">
          <p className="mb-1 px-2 text-[10px] font-semibold uppercase tracking-wide text-slate-400">Modules</p>
          <ul>
            {category.modules.map((mod) => {
              const active = mod.id === activeModuleId;
              const modKeys = keysForHrmModule(category.id, mod.id);
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
                      <p className="text-sm font-semibold">{mod.label}</p>
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
          {!readOnly ? (
            <div className="flex flex-wrap items-center gap-3">
              <span className="text-xs font-medium text-slate-500">{activeModule.label}:</span>
              <div className="inline-flex rounded-lg border border-slate-200/90 bg-white p-0.5 dark:border-slate-700 dark:bg-slate-950">
                {(
                  [
                    { id: "none" as const, label: "None" },
                    { id: "view" as const, label: "View" },
                    { id: "edit" as const, label: "Operate" },
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
          ) : (
            <p className="text-xs font-medium text-slate-500">
              {activeModule.label} · {levelSummary[accessLevel]}
            </p>
          )}

          <ul className="mt-4 divide-y divide-slate-100 overflow-hidden rounded-lg border border-slate-200/90 dark:divide-slate-800 dark:border-slate-800">
            {activeModule.actions.map((action) => {
              const key = hrmPermissionKey(category.id, activeModule.id, action.key);
              const enabled = selected.has(key);
              return (
                <li key={key}>
                  <PermissionRow
                    title={action.label}
                    description={action.description}
                    allowed={enabled}
                    readOnly={readOnly}
                    onToggle={() => toggleKey(key)}
                  />
                </li>
              );
            })}
          </ul>

          <p className="mt-2 text-xs text-slate-400">
            {activeGranted} of {activeModKeys.length} enabled in {activeModule.label}
          </p>
        </div>
      </div>

      <div className="border-t border-slate-100 px-5 py-2.5 text-xs text-slate-400 dark:border-slate-800">
        {grantedCount} permissions allowed in {category.label} for this role
      </div>
    </div>
  );
}
