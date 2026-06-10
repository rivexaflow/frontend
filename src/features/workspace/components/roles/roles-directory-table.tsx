"use client";

import Link from "next/link";
import { MoreHorizontal, Pencil, Trash2 } from "lucide-react";

import type { WorkspaceRoleRecord } from "@/features/workspace/data/workspace-roles-demo";
import { PERMISSION_CATEGORIES } from "@/features/workspace/data/workspace-permissions-catalog";
import { DEMO_WORKSPACE_USERS } from "@/features/workspace/data/workspace-users-demo";
import { roleEditPath } from "@/lib/workspace/paths";
import { cn } from "@/lib/utils/cn";

function moduleScope(keys: string[]) {
  const ids = new Set(keys.map((k) => k.split(".")[0]).filter(Boolean));
  return PERMISSION_CATEGORIES.filter((c) => ids.has(c.id))
    .map((c) => c.label)
    .join(", ");
}

function stageCount(stageAccess: WorkspaceRoleRecord["stageAccess"]) {
  return Object.values(stageAccess).filter((s) => s.view || s.move || s.edit).length;
}

type Props = {
  roles: WorkspaceRoleRecord[];
  selectedId: string | null;
  onSelect: (role: WorkspaceRoleRecord) => void;
  onDelete?: (id: string) => void;
};

export function RolesDirectoryTable({ roles, selectedId, onSelect, onDelete }: Props) {
  if (roles.length === 0) {
    return (
      <div className="px-6 py-16 text-center">
        <p className="text-sm font-medium text-slate-800 dark:text-slate-200">No roles match your search</p>
        <p className="mt-1 text-sm text-slate-500">Try a different term or create a new role.</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[880px] text-left text-sm">
        <thead>
          <tr className="border-b border-slate-200 bg-slate-50/80 text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:border-slate-800 dark:bg-slate-950/40">
            <th className="px-5 py-3.5 font-semibold">Role</th>
            <th className="px-4 py-3.5 font-semibold">Type</th>
            <th className="px-4 py-3.5 font-semibold">Permissions</th>
            <th className="hidden px-4 py-3.5 font-semibold lg:table-cell">Module scope</th>
            <th className="px-4 py-3.5 font-semibold">Members</th>
            <th className="hidden px-4 py-3.5 font-semibold md:table-cell">Pipeline</th>
            <th className="w-28 px-4 py-3.5 text-right font-semibold">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
          {roles.map((role) => {
            const selected = selectedId === role.id;
            const members = DEMO_WORKSPACE_USERS.filter((u) => role.memberIds.includes(u.id));
            const scope = moduleScope(role.permissionKeys);
            const stages = stageCount(role.stageAccess);

            return (
              <tr
                key={role.id}
                onClick={() => onSelect(role)}
                className={cn(
                  "cursor-pointer transition-colors hover:bg-slate-50/80 dark:hover:bg-slate-800/40",
                  selected && "bg-[#191970]/[0.04] dark:bg-blue-950/20",
                )}
              >
                <td className="px-5 py-4">
                  <p className="font-semibold text-slate-900 dark:text-white">{role.name}</p>
                </td>
                <td className="px-4 py-4">
                  <span
                    className={cn(
                      "inline-flex rounded-md px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide",
                      role.systemLocked
                        ? "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400"
                        : "bg-[#191970]/8 text-[#191970] dark:bg-blue-950/40 dark:text-blue-300",
                    )}
                  >
                    {role.systemLocked ? "System" : "Custom"}
                  </span>
                </td>
                <td className="px-4 py-4 tabular-nums text-slate-700 dark:text-slate-300">
                  {role.permissionKeys.length}
                </td>
                <td className="hidden max-w-[200px] truncate px-4 py-4 text-slate-600 lg:table-cell dark:text-slate-400">
                  {scope || "—"}
                </td>
                <td className="px-4 py-4">
                  {members.length > 0 ? (
                    <div className="flex items-center gap-2">
                      <div className="flex -space-x-1.5">
                        {members.slice(0, 3).map((m) => (
                          <span
                            key={m.id}
                            title={m.name}
                            className="inline-flex h-7 w-7 items-center justify-center rounded-full border-2 border-white bg-slate-100 text-[10px] font-semibold text-slate-600 dark:border-slate-900 dark:bg-slate-800"
                          >
                            {m.name
                              .split(" ")
                              .map((p) => p[0])
                              .join("")
                              .slice(0, 2)}
                          </span>
                        ))}
                      </div>
                      <span className="text-xs text-slate-500">{members.length}</span>
                    </div>
                  ) : (
                    <span className="text-xs text-slate-400">Unassigned</span>
                  )}
                </td>
                <td className="hidden px-4 py-4 tabular-nums text-slate-600 md:table-cell dark:text-slate-400">
                  {stages} stages
                </td>
                <td className="px-4 py-4">
                  <div className="flex items-center justify-end gap-1" onClick={(e) => e.stopPropagation()}>
                    <Link
                      href={roleEditPath(role.id)}
                      className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-slate-500 transition hover:bg-slate-100 hover:text-[#191970] dark:hover:bg-slate-800"
                      aria-label={`Edit ${role.name}`}
                    >
                      <Pencil className="h-3.5 w-3.5" />
                    </Link>
                    {!role.systemLocked && onDelete ? (
                      <button
                        type="button"
                        onClick={() => onDelete(role.id)}
                        className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 transition hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-950/30"
                        aria-label={`Delete ${role.name}`}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    ) : (
                      <span className="inline-flex h-8 w-8 items-center justify-center text-slate-200 dark:text-slate-700">
                        <MoreHorizontal className="h-3.5 w-3.5" aria-hidden />
                      </span>
                    )}
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
