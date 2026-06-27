"use client";

import type { HrmPermissionCategory, HrmPermissionModule } from "@/features/workspace/data/hrm-permissions-catalog";
import {
  hrmPermissionKey,
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

function Toggle({
  on,
  disabled,
  onClick,
  label,
}: {
  on: boolean;
  disabled?: boolean;
  onClick: () => void;
  label: string;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={on}
      aria-label={label}
      disabled={disabled}
      onClick={onClick}
      className={cn(
        "relative h-5 w-9 shrink-0 rounded-full transition-colors",
        on ? "bg-[#191970]" : "bg-slate-200 dark:bg-slate-700",
        disabled ? "cursor-default opacity-60" : "cursor-pointer",
      )}
    >
      <span
        className={cn(
          "absolute top-0.5 h-4 w-4 rounded-full bg-white shadow-sm transition-transform",
          on ? "left-[18px]" : "left-0.5",
        )}
      />
    </button>
  );
}

const PRESETS: { id: AccessLevel; label: string }[] = [
  { id: "none", label: "Off" },
  { id: "view", label: "View" },
  { id: "full", label: "Full" },
];

export function HrmPermissionMatrixPanel({ category, selected, onChange, readOnly = false }: Props) {
  const toggleKey = (key: string) => {
    if (readOnly) return;
    const next = new Set(selected);
    if (next.has(key)) next.delete(key);
    else next.add(key);
    onChange(next);
  };

  return (
    <div className="divide-y divide-slate-100 dark:divide-slate-800">
      {category.modules.map((mod) => {
        const accessLevel = detectAccessLevel(mod, category.id, selected);

        return (
          <section key={mod.id} className="px-4 py-3">
            <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
              <h4 className="text-sm font-semibold text-slate-900 dark:text-white">{mod.label}</h4>
              {!readOnly ? (
                <div className="inline-flex rounded-lg border border-slate-200 bg-slate-50 p-0.5 dark:border-slate-700 dark:bg-slate-950">
                  {PRESETS.map((preset) => (
                    <button
                      key={preset.id}
                      type="button"
                      onClick={() => onChange(applyAccessLevel(preset.id, mod, category.id, selected))}
                      className={cn(
                        "rounded-md px-2 py-1 text-[10px] font-semibold transition",
                        accessLevel === preset.id || (preset.id === "view" && accessLevel === "edit")
                          ? "bg-[#191970] text-white"
                          : "text-slate-500 hover:text-slate-800 dark:hover:text-slate-200",
                      )}
                    >
                      {preset.label}
                    </button>
                  ))}
                </div>
              ) : null}
            </div>

            <ul className="rounded-lg border border-slate-200/90 dark:border-slate-800">
              {mod.actions.map((action, index) => {
                const key = hrmPermissionKey(category.id, mod.id, action.key);
                const enabled = selected.has(key);
                return (
                  <li
                    key={key}
                    className={cn(
                      "flex items-center justify-between gap-3 px-3 py-2",
                      index > 0 && "border-t border-slate-100 dark:border-slate-800",
                    )}
                  >
                    <span className="min-w-0 text-sm text-slate-700 dark:text-slate-300">{action.label}</span>
                    <Toggle
                      on={enabled}
                      disabled={readOnly}
                      onClick={() => toggleKey(key)}
                      label={action.label}
                    />
                  </li>
                );
              })}
            </ul>
          </section>
        );
      })}
    </div>
  );
}
