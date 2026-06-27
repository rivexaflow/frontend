"use client";

import { Lock, Shield } from "lucide-react";

import type { HrmRoleRecord } from "@/features/workspace/data/hrm-roles-demo";
import { cn } from "@/lib/utils/cn";

type Props = {
  roles: HrmRoleRecord[];
  selectedId: string | null;
  onSelect: (role: HrmRoleRecord) => void;
};

export function HrmRolesCatalogList({ roles, selectedId, onSelect }: Props) {
  if (roles.length === 0) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center px-6 py-12 text-center">
        <Shield className="h-8 w-8 text-slate-300" />
        <p className="mt-3 text-sm font-medium text-slate-700 dark:text-slate-300">No roles match filters</p>
        <p className="mt-1 text-xs text-slate-500">Adjust search or create a new HR role.</p>
      </div>
    );
  }

  return (
    <ul className="divide-y divide-slate-100 dark:divide-slate-800" role="listbox" aria-label="HR role catalog">
      {roles.map((role) => {
        const selected = selectedId === role.id;
        return (
          <li key={role.id}>
            <button
              type="button"
              role="option"
              aria-selected={selected}
              onClick={() => onSelect(role)}
              className={cn(
                "group flex w-full items-start gap-3 px-4 py-3.5 text-left transition",
                selected
                  ? "bg-[#191970]/[0.06] dark:bg-blue-950/30"
                  : "hover:bg-slate-50/90 dark:hover:bg-slate-800/40",
              )}
            >
              <span
                className={cn(
                  "mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border transition",
                  selected
                    ? "border-[#191970]/20 bg-[#191970] text-white"
                    : "border-slate-200 bg-white text-slate-500 group-hover:border-slate-300 dark:border-slate-700 dark:bg-slate-900",
                )}
              >
                {role.isSystem ? <Lock className="h-4 w-4" /> : <Shield className="h-4 w-4" />}
              </span>

              <span className="min-w-0 flex-1">
                <span className="flex items-center gap-2">
                  <span className="truncate text-sm font-semibold text-slate-900 dark:text-white">{role.name}</span>
                </span>
                <p className="mt-0.5 line-clamp-1 text-xs text-slate-500">{role.description ?? "No description"}</p>
              </span>

              {selected ? <span className="mt-2 h-8 w-1 shrink-0 rounded-full bg-[#191970]" aria-hidden /> : null}
            </button>
          </li>
        );
      })}
    </ul>
  );
}
