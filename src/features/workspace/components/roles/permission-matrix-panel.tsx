"use client";

import type { PermissionCategory } from "@/features/workspace/data/workspace-permissions-catalog";
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

function Check({
  checked,
  onChange,
  label,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  label: string;
}) {
  return (
    <label className="inline-flex cursor-pointer items-center gap-1.5 text-xs text-slate-700 dark:text-slate-300">
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="h-3.5 w-3.5 rounded border-slate-300 text-blue-600 focus:ring-blue-500/30"
      />
      <span>{label}</span>
    </label>
  );
}

export function PermissionMatrixPanel({ category, selected, onChange }: Props) {
  const categoryKeys = keysForCategory(category.id);
  const allCategorySelected = categoryKeys.length > 0 && categoryKeys.every((k) => selected.has(k));

  const setKeys = (keys: string[], on: boolean) => {
    const next = new Set(selected);
    for (const k of keys) {
      if (on) next.add(k);
      else next.delete(k);
    }
    onChange(next);
  };

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200/90 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3 dark:border-slate-800">
        <h3 className="text-sm font-bold text-slate-900 dark:text-white">{category.label}</h3>
        <label className="inline-flex cursor-pointer items-center gap-2 text-xs font-semibold text-slate-600">
          <input
            type="checkbox"
            checked={allCategorySelected}
            onChange={(e) => setKeys(categoryKeys, e.target.checked)}
            className="h-4 w-4 rounded border-slate-300 text-blue-600"
          />
          Assign {category.label} permissions to role
        </label>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[640px] text-left text-sm">
          <thead>
            <tr className="bg-blue-600 text-xs font-bold uppercase tracking-wider text-white">
              <th className="w-[140px] px-4 py-3">Module</th>
              <th className="px-4 py-3">Permissions</th>
            </tr>
          </thead>
          <tbody>
            {category.modules.map((mod, rowIndex) => {
              const modKeys = keysForModule(category.id, mod.id);
              const allModSelected = modKeys.every((k) => selected.has(k));

              return (
                <tr
                  key={mod.id}
                  className={cn(
                    "border-t border-slate-100 dark:border-slate-800",
                    rowIndex % 2 === 1 ? "bg-slate-50/80 dark:bg-slate-950/40" : "bg-white dark:bg-slate-900",
                  )}
                >
                  <td className="px-4 py-3 align-top">
                    <label className="inline-flex cursor-pointer items-center gap-2 font-semibold text-slate-800 dark:text-slate-200">
                      <input
                        type="checkbox"
                        checked={allModSelected}
                        onChange={(e) => setKeys(modKeys, e.target.checked)}
                        className="h-4 w-4 rounded border-slate-300 text-blue-600"
                      />
                      {mod.label}
                    </label>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-x-4 gap-y-2">
                      {mod.actions.map((action) => {
                        const key = permissionKey(category.id, mod.id, action.key);
                        return (
                          <Check
                            key={key}
                            checked={selected.has(key)}
                            onChange={(on) => {
                              const next = new Set(selected);
                              if (on) next.add(key);
                              else next.delete(key);
                              onChange(next);
                            }}
                            label={action.label}
                          />
                        );
                      })}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
