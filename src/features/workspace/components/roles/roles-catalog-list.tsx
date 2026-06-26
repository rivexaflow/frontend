"use client";

import { Lock, Shield } from "lucide-react";

import type { WorkspaceRoleRecord } from "@/features/workspace/data/workspace-roles-demo";
import { DEMO_WORKSPACE_USERS } from "@/features/workspace/data/workspace-users-demo";
import { cn } from "@/lib/utils/cn";

type Props = {
  roles: WorkspaceRoleRecord[];
  selectedId: string | null;
  onSelect: (role: WorkspaceRoleRecord) => void;
};

export function RolesCatalogList({ roles, selectedId, onSelect }: Props) {
  if (roles.length === 0) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center px-6 py-12 text-center">
        <Shield className="h-8 w-8 text-slate-300" />
        <p className="mt-3 text-sm font-medium text-slate-700 dark:text-slate-300">No roles match filters</p>
        <p className="mt-1 text-xs text-slate-500">Adjust search or create a new access policy.</p>
      </div>
    );
  }

  return (
    <ul className="divide-y divide-slate-100 dark:divide-slate-800" role="listbox" aria-label="Role catalog">
      {roles.map((role) => {
        const selected = selectedId === role.id;
        const memberCount = role.memberIds.length;
        const members = DEMO_WORKSPACE_USERS.filter((u) => role.memberIds.includes(u.id));

        return (
          <li key={role.id}>
            <button
              type="button"
              role="option"
              aria-selected={selected}
              onClick={() => onSelect(role)}
              className={cn(
                "group relative flex w-full items-start gap-3.5 px-4.5 py-4 text-left transition-all duration-250 outline-none",
                selected
                  ? "bg-slate-50 dark:bg-slate-800/40"
                  : "hover:bg-slate-50/50 dark:hover:bg-slate-800/20",
              )}
            >
              {/* Highlight bar */}
              {selected ? (
                <span className="absolute left-0 top-0 bottom-0 w-[4px] rounded-r-md bg-gradient-to-b from-[#191970] to-[#252d7a] shadow-[1px_0_6px_rgba(25,25,112,0.3)]" aria-hidden />
              ) : null}

              <span
                className={cn(
                  "mt-0.5 flex h-9.5 w-9.5 shrink-0 items-center justify-center rounded-xl border transition-all duration-300 shadow-sm",
                  selected
                    ? "border-[#191970]/10 bg-gradient-to-br from-[#191970] to-[#252d7a] text-white scale-105"
                    : "border-slate-200 bg-white text-slate-400 group-hover:border-slate-355 group-hover:text-slate-600 dark:border-slate-800 dark:bg-slate-900 dark:group-hover:border-slate-700 dark:group-hover:text-slate-300",
                )}
              >
                {role.systemLocked ? <Lock className="h-4 w-4" /> : <Shield className="h-4 w-4" />}
              </span>

              <span className="min-w-0 flex-1">
                <span className="flex items-center gap-2">
                  <span className="truncate text-sm font-semibold text-slate-800 dark:text-slate-100 group-hover:text-[#191970] dark:group-hover:text-blue-400 transition-colors">
                    {role.name}
                  </span>
                  {role.systemLocked ? (
                    <span className="shrink-0 rounded bg-slate-50 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider text-slate-400 ring-1 ring-slate-200 dark:bg-slate-800/40 dark:text-slate-500 dark:ring-slate-850">
                      System
                    </span>
                  ) : null}
                </span>
                <span className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs text-slate-400 dark:text-slate-500">
                  <span className="tabular-nums font-medium">{role.permissionKeys.length} permissions</span>
                  <span className="text-slate-300 dark:text-slate-750" aria-hidden>·</span>
                  <span className="font-medium">{memberCount === 0 ? "Unassigned" : `${memberCount} member${memberCount === 1 ? "" : "s"}`}</span>
                </span>

                {members.length > 0 ? (
                  <span className="mt-2.5 flex -space-x-1.5">
                    {members.slice(0, 5).map((m) => (
                      <span
                        key={m.id}
                        title={m.name}
                        className="inline-flex h-6 w-6 items-center justify-center rounded-full border-2 border-white bg-gradient-to-br from-slate-100 to-slate-200 text-[8px] font-bold text-slate-600 shadow-sm dark:border-slate-900 dark:from-slate-800 dark:to-slate-900 dark:text-slate-300"
                      >
                        {m.name
                          .split(" ")
                          .map((p) => p[0])
                          .join("")
                          .slice(0, 2)}
                      </span>
                    ))}
                    {members.length > 5 ? (
                      <span className="inline-flex h-6 w-6 items-center justify-center rounded-full border-2 border-white bg-slate-100 text-[8px] font-bold text-slate-500 shadow-sm dark:border-slate-900 dark:bg-slate-800 dark:text-slate-400">
                        +{members.length - 5}
                      </span>
                    ) : null}
                  </span>
                ) : null}
              </span>
            </button>
          </li>
        );
      })}
    </ul>
  );
}
