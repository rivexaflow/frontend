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
                {role.systemLocked ? <Lock className="h-4 w-4" /> : <Shield className="h-4 w-4" />}
              </span>

              <span className="min-w-0 flex-1">
                <span className="flex items-center gap-2">
                  <span className="truncate text-sm font-semibold text-slate-900 dark:text-white">{role.name}</span>
                  {role.systemLocked ? (
                    <span className="shrink-0 rounded px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-slate-500 ring-1 ring-slate-200 dark:ring-slate-700">
                      System
                    </span>
                  ) : null}
                </span>
                <span className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs text-slate-500">
                  <span className="tabular-nums">{role.permissionKeys.length} permissions</span>
                  <span aria-hidden>·</span>
                  <span>{memberCount === 0 ? "Unassigned" : `${memberCount} member${memberCount === 1 ? "" : "s"}`}</span>
                </span>

                {members.length > 0 ? (
                  <span className="mt-2 flex -space-x-1.5">
                    {members.slice(0, 4).map((m) => (
                      <span
                        key={m.id}
                        title={m.name}
                        className="inline-flex h-6 w-6 items-center justify-center rounded-full border-2 border-white bg-slate-100 text-[9px] font-bold text-slate-600 dark:border-slate-900 dark:bg-slate-800"
                      >
                        {m.name
                          .split(" ")
                          .map((p) => p[0])
                          .join("")
                          .slice(0, 2)}
                      </span>
                    ))}
                    {members.length > 4 ? (
                      <span className="inline-flex h-6 w-6 items-center justify-center rounded-full border-2 border-white bg-slate-200 text-[9px] font-semibold text-slate-600 dark:border-slate-900 dark:bg-slate-700">
                        +{members.length - 4}
                      </span>
                    ) : null}
                  </span>
                ) : null}
              </span>

              {selected ? (
                <span className="mt-2 h-8 w-1 shrink-0 rounded-full bg-[#191970]" aria-hidden />
              ) : null}
            </button>
          </li>
        );
      })}
    </ul>
  );
}
