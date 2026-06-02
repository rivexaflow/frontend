"use client";

import { ChevronRight, Shield } from "lucide-react";

import { ModuleAccessChips } from "@/features/workspace/components/user-management/module-access-chips";
import { UserRoleBadge } from "@/features/workspace/components/user-management/user-role-badge";
import { UserStatusBadge } from "@/features/workspace/components/user-management/user-status-badge";
import type { WorkspaceUserRecord } from "@/features/workspace/data/workspace-users-demo";
import { cn } from "@/lib/utils/cn";

function initials(name: string) {
  return name
    .split(" ")
    .map((p) => p[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

const deptAccent: Record<string, string> = {
  Revenue: "from-blue-600 to-indigo-700",
  Compliance: "from-emerald-600 to-teal-700",
  People: "from-violet-600 to-purple-700",
  Finance: "from-amber-500 to-orange-600",
  Operations: "from-slate-600 to-slate-800",
  Success: "from-cyan-600 to-blue-700",
  Intelligence: "from-indigo-600 to-blue-800",
  Support: "from-slate-500 to-slate-700",
};

type Props = {
  users: WorkspaceUserRecord[];
  selectedId: string | null;
  onSelect: (user: WorkspaceUserRecord) => void;
};

export function UsersDirectoryTable({ users, selectedId, onSelect }: Props) {
  if (users.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-slate-50/50 py-20 dark:border-slate-800 dark:bg-slate-950/30">
        <Shield className="h-10 w-10 text-slate-300" />
        <p className="mt-3 text-sm font-semibold text-slate-700 dark:text-slate-300">No members match</p>
        <p className="mt-1 text-xs text-slate-500">Adjust filters or invite a new teammate.</p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200/90 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[880px] text-left text-sm">
          <thead>
            <tr className="border-b border-slate-100 bg-slate-50/90 text-[10px] font-bold uppercase tracking-[0.14em] text-slate-500 dark:border-slate-800 dark:bg-slate-950/60">
              <th className="px-5 py-3.5">Member</th>
              <th className="px-4 py-3.5">Profile role</th>
              <th className="px-4 py-3.5">Department</th>
              <th className="px-4 py-3.5">Module access</th>
              <th className="px-4 py-3.5">Status</th>
              <th className="px-4 py-3.5">Last active</th>
              <th className="w-10 px-3 py-3.5" aria-hidden />
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80">
            {users.map((user) => {
              const selected = selectedId === user.id;
              const accent = deptAccent[user.department] ?? "from-slate-600 to-slate-800";

              return (
                <tr
                  key={user.id}
                  onClick={() => onSelect(user)}
                  className={cn(
                    "group cursor-pointer transition",
                    selected
                      ? "bg-blue-50/80 dark:bg-blue-950/25"
                      : "hover:bg-slate-50/90 dark:hover:bg-slate-800/40",
                  )}
                >
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <div
                        className={cn(
                          "flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br text-xs font-bold text-white shadow-sm",
                          accent,
                        )}
                      >
                        {initials(user.name)}
                      </div>
                      <div className="min-w-0">
                        <p className="truncate font-semibold text-slate-900 dark:text-white">{user.name}</p>
                        <p className="truncate text-xs text-slate-500">{user.email}</p>
                        {user.mfaEnabled ? (
                          <span className="mt-1 inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-600">
                            <Shield className="h-3 w-3" />
                            MFA on
                          </span>
                        ) : null}
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    <UserRoleBadge role={user.profileRole} size="md" />
                  </td>
                  <td className="px-4 py-4">
                    <p className="font-medium text-slate-800 dark:text-slate-200">{user.department}</p>
                    {user.team ? (
                      <p className="mt-0.5 text-xs text-slate-500">{user.team}</p>
                    ) : null}
                  </td>
                  <td className="px-4 py-4">
                    <ModuleAccessChips modules={user.modules} />
                  </td>
                  <td className="px-4 py-4">
                    <UserStatusBadge status={user.status} />
                  </td>
                  <td className="px-4 py-4 text-xs font-medium text-slate-500">{user.lastActive}</td>
                  <td className="px-3 py-4 text-slate-300 group-hover:text-blue-600">
                    <ChevronRight className="h-4 w-4" />
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
