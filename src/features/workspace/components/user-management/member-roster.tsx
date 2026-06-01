"use client";

import { Shield } from "lucide-react";

import { ModuleAccessChips } from "@/features/workspace/components/user-management/module-access-chips";
import { UserStatusBadge } from "@/features/workspace/components/user-management/user-status-badge";
import type { WorkspaceUserRecord } from "@/features/workspace/data/workspace-users-demo";
import { cn } from "@/lib/utils/cn";

const BRAND = "#191970";

function initials(name: string) {
  return name
    .split(" ")
    .map((p) => p[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

type Props = {
  users: WorkspaceUserRecord[];
  selectedId: string | null;
  onSelect: (user: WorkspaceUserRecord) => void;
};

export function MemberRoster({ users, selectedId, onSelect }: Props) {
  if (users.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-slate-200 bg-slate-50 py-14">
        <p className="text-sm font-medium text-slate-700">No members match your filters</p>
        <p className="mt-1 text-xs text-slate-500">Clear filters or invite a new teammate.</p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <div className="hidden border-b border-slate-100 bg-slate-50/90 px-4 py-2.5 text-[10px] font-semibold uppercase tracking-wider text-slate-500 sm:grid sm:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)_auto] sm:gap-4 dark:border-slate-800 dark:bg-slate-950/50">
        <span>Member</span>
        <span>Role & department</span>
        <span className="text-right">Access · Activity</span>
      </div>

      <ul className="divide-y divide-slate-100 dark:divide-slate-800" role="list">
        {users.map((user) => {
          const selected = selectedId === user.id;

          return (
            <li key={user.id}>
              <button
                type="button"
                onClick={() => onSelect(user)}
                className={cn(
                  "grid w-full gap-3 px-4 py-3.5 text-left transition sm:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)_auto] sm:items-center sm:gap-4",
                  selected ? "bg-blue-50/60 dark:bg-blue-950/20" : "hover:bg-slate-50/80 dark:hover:bg-slate-800/40",
                )}
                style={selected ? { boxShadow: `inset 3px 0 0 ${BRAND}` } : undefined}
              >
                <div className="flex min-w-0 items-center gap-3">
                  <div className="relative shrink-0">
                    <div
                      className="flex h-11 w-11 items-center justify-center rounded-lg text-xs font-semibold text-white"
                      style={{ backgroundColor: BRAND }}
                    >
                      {initials(user.name)}
                    </div>
                    {user.mfaEnabled ? (
                      <span
                        className="absolute -bottom-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full border border-white bg-emerald-600 text-white dark:border-slate-900"
                        title="MFA enabled"
                      >
                        <Shield className="h-2.5 w-2.5" />
                      </span>
                    ) : null}
                  </div>
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="truncate text-sm font-semibold text-slate-900 dark:text-white">{user.name}</p>
                      <UserStatusBadge status={user.status} />
                    </div>
                    <p className="truncate text-xs text-slate-500">{user.email}</p>
                  </div>
                </div>

                <div className="min-w-0 pl-14 sm:pl-0">
                  <p className="text-sm font-medium text-slate-800 dark:text-slate-200">{user.profileRole}</p>
                  <p className="mt-0.5 text-xs text-slate-500">
                    {user.department}
                    {user.team ? ` · ${user.team}` : ""}
                  </p>
                </div>

                <div className="flex flex-wrap items-center justify-between gap-2 pl-14 sm:flex-col sm:items-end sm:pl-0">
                  <ModuleAccessChips modules={user.modules} max={3} />
                  <span className="text-xs font-medium tabular-nums text-slate-400">{user.lastActive}</span>
                </div>
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
