"use client";

import { useMemo, useState } from "react";
import { Check } from "lucide-react";

import {
  HRM_PERMISSION_CATEGORIES,
  hrmPermissionKey,
} from "@/features/workspace/data/hrm-permissions-catalog";
import type { HrmRoleRecord } from "@/features/workspace/data/hrm-roles-demo";
import { cn } from "@/lib/utils/cn";

type Props = {
  role: HrmRoleRecord;
  editable?: boolean;
  selectedKeys: Set<string>;
  onChange?: (next: Set<string>) => void;
};

export function HrmRolePermissionsPanel({
  role,
  editable = false,
  selectedKeys,
  onChange,
}: Props) {
  const [activeCategory, setActiveCategory] = useState(HRM_PERMISSION_CATEGORIES[0]?.id ?? "people");

  const category = HRM_PERMISSION_CATEGORIES.find((c) => c.id === activeCategory);

  const grantedInCategory = useMemo(() => {
    if (!category) return 0;
    const keys = category.modules.flatMap((mod) =>
      mod.actions.map((a) => hrmPermissionKey(category.id, mod.id, a.key)),
    );
    return keys.filter((k) => selectedKeys.has(k)).length;
  }, [category, selectedKeys]);

  const totalInCategory = useMemo(() => {
    if (!category) return 0;
    return category.modules.reduce((s, mod) => s + mod.actions.length, 0);
  }, [category]);

  const toggle = (key: string) => {
    if (!editable || !onChange) return;
    const next = new Set(selectedKeys);
    if (next.has(key)) next.delete(key);
    else next.add(key);
    onChange(next);
  };

  const toggleModule = (moduleId: string, allKeys: string[]) => {
    if (!editable || !onChange) return;
    const next = new Set(selectedKeys);
    const allGranted = allKeys.every((k) => next.has(k));
    for (const k of allKeys) {
      if (allGranted) next.delete(k);
      else next.add(k);
    }
    onChange(next);
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-1 border-b border-slate-100 pb-1">
        {HRM_PERMISSION_CATEGORIES.map((cat) => {
          const catKeys = cat.modules.flatMap((mod) =>
            mod.actions.map((a) => hrmPermissionKey(cat.id, mod.id, a.key)),
          );
          const granted = catKeys.filter((k) => selectedKeys.has(k)).length;
          const active = activeCategory === cat.id;
          return (
            <button
              key={cat.id}
              type="button"
              onClick={() => setActiveCategory(cat.id)}
              className={cn(
                "relative shrink-0 px-3 py-2.5 text-xs font-semibold transition",
                active ? "text-[#191970]" : "text-slate-500 hover:text-slate-800",
              )}
            >
              {cat.label}
              <span
                className={cn(
                  "ml-1.5 rounded-md px-1.5 py-0.5 text-[10px] tabular-nums",
                  active ? "bg-[#191970]/10 text-[#191970]" : "bg-slate-100 text-slate-500",
                )}
              >
                {granted}/{catKeys.length}
              </span>
              {active ? (
                <span className="absolute inset-x-2 bottom-0 h-0.5 rounded-full bg-[#191970]" />
              ) : null}
            </button>
          );
        })}
      </div>

      <div className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-[#2277ff]/15 bg-[#2277ff]/[0.04] px-4 py-2.5 text-xs text-slate-600">
        <span>
          <strong className="text-slate-800">{role.name}</strong>
          {role.isSystem ? " · System role (read-only in demo)" : " · Custom role"}
        </span>
        <span className="font-semibold tabular-nums text-[#191970]">
          {grantedInCategory}/{totalInCategory} in {category?.label}
        </span>
      </div>

      {category ? (
        <div className="space-y-4">
          {category.modules.map((mod) => {
            const modKeys = mod.actions.map((a) => hrmPermissionKey(category.id, mod.id, a.key));
            const modGranted = modKeys.filter((k) => selectedKeys.has(k)).length;
            const allMod = modGranted === modKeys.length && modKeys.length > 0;

            return (
              <section
                key={mod.id}
                className="overflow-hidden rounded-xl border border-slate-200/80 bg-white"
              >
                <div className="flex items-center justify-between gap-3 border-b border-slate-100 bg-slate-50/80 px-4 py-3">
                  <div>
                    <h4 className="text-sm font-bold text-slate-900">{mod.label}</h4>
                    <p className="text-[11px] text-slate-500">
                      {modGranted} of {modKeys.length} permissions enabled
                    </p>
                  </div>
                  {editable && !role.isSystem ? (
                    <button
                      type="button"
                      onClick={() => toggleModule(mod.id, modKeys)}
                      className="text-xs font-semibold text-[#191970] hover:underline"
                    >
                      {allMod ? "Clear all" : "Enable all"}
                    </button>
                  ) : null}
                </div>
                <ul className="divide-y divide-slate-50">
                  {mod.actions.map((action) => {
                    const key = hrmPermissionKey(category.id, mod.id, action.key);
                    const checked = selectedKeys.has(key);
                    return (
                      <li key={key}>
                        <label
                          className={cn(
                            "flex items-start gap-3 px-4 py-3",
                            editable && !role.isSystem ? "cursor-pointer hover:bg-slate-50/80" : "",
                          )}
                        >
                          <span
                            className={cn(
                              "mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-md border transition",
                              checked
                                ? "border-[#191970] bg-[#191970] text-white"
                                : "border-slate-300 bg-white text-transparent",
                            )}
                          >
                            {checked ? <Check className="h-3 w-3" strokeWidth={3} /> : null}
                          </span>
                          <span className="min-w-0 flex-1">
                            <span className="block text-sm font-semibold text-slate-800">
                              {action.label}
                            </span>
                            <span className="mt-0.5 block text-xs text-slate-500">
                              {action.description}
                            </span>
                          </span>
                          {editable && !role.isSystem ? (
                            <input
                              type="checkbox"
                              className="sr-only"
                              checked={checked}
                              onChange={() => toggle(key)}
                            />
                          ) : null}
                          {!editable || role.isSystem ? (
                            <span
                              className={cn(
                                "shrink-0 rounded-md px-2 py-0.5 text-[10px] font-bold uppercase",
                                checked
                                  ? "bg-emerald-50 text-emerald-700"
                                  : "bg-slate-100 text-slate-400",
                              )}
                            >
                              {checked ? "Granted" : "Off"}
                            </span>
                          ) : null}
                        </label>
                      </li>
                    );
                  })}
                </ul>
              </section>
            );
          })}
        </div>
      ) : null}
    </div>
  );
}
