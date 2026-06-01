"use client";

import { ChevronRight } from "lucide-react";

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

export function MembersDirectoryTable({ users, selectedId, onSelect }: Props) {
  if (users.length === 0) {
    return (
      <div className="px-4 py-16 text-center">
        <p className="text-sm font-medium text-slate-700">No members match your search</p>
        <p className="mt-1 text-sm text-slate-500">Try different filters or invite someone new.</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[640px] text-left text-sm">
        <thead>
          <tr className="border-b border-slate-100 bg-slate-50 text-xs font-medium text-slate-500 dark:border-slate-800 dark:bg-slate-950/50">
            <th className="px-4 py-3 font-medium">Name</th>
            <th className="px-4 py-3 font-medium">Profile role</th>
            <th className="hidden px-4 py-3 font-medium md:table-cell">Department</th>
            <th className="px-4 py-3 font-medium">Status</th>
            <th className="hidden px-4 py-3 font-medium sm:table-cell">Last active</th>
            <th className="w-10 px-2 py-3" aria-hidden />
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
          {users.map((user) => {
            const selected = selectedId === user.id;
            return (
              <tr
                key={user.id}
                onClick={() => onSelect(user)}
                className={cn(
                  "cursor-pointer transition-colors hover:bg-slate-50 dark:hover:bg-slate-800/50",
                  selected && "bg-blue-50/70 dark:bg-blue-950/25",
                )}
              >
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <div
                      className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-xs font-semibold text-white"
                      style={{ backgroundColor: BRAND }}
                    >
                      {initials(user.name)}
                    </div>
                    <div className="min-w-0">
                      <p className="font-medium text-slate-900 dark:text-white">{user.name}</p>
                      <p className="truncate text-xs text-slate-500">{user.email}</p>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3 text-slate-700 dark:text-slate-300">{user.profileRole}</td>
                <td className="hidden px-4 py-3 text-slate-600 md:table-cell">{user.department}</td>
                <td className="px-4 py-3">
                  <UserStatusBadge status={user.status} />
                </td>
                <td className="hidden px-4 py-3 text-slate-500 sm:table-cell">{user.lastActive}</td>
                <td className="px-2 py-3 text-slate-300">
                  <ChevronRight className="h-4 w-4" />
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
