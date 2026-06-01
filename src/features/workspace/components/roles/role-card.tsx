"use client";

import Link from "next/link";
import { Pencil, Shield, Trash2 } from "lucide-react";

import type { WorkspaceRoleRecord } from "@/features/workspace/data/workspace-roles-demo";
import { labelForPermissionKey } from "@/features/workspace/data/workspace-permissions-catalog";
import { DEMO_WORKSPACE_USERS } from "@/features/workspace/data/workspace-users-demo";
import { roleEditPath, workspacePaths } from "@/lib/workspace/paths";
import { cn } from "@/lib/utils/cn";

type Props = {
  role: WorkspaceRoleRecord;
  onDelete?: (id: string) => void;
};

function permissionChipClassName() {
  return cn(
    "inline-flex items-center rounded-md px-2 py-1 text-[10px] font-medium tracking-wide",
    "bg-slate-100 text-slate-600 ring-1 ring-inset ring-slate-200/80",
    "dark:bg-slate-800/90 dark:text-slate-300 dark:ring-slate-700/80",
  );
}

export function RoleCard({ role, onDelete }: Props) {
  const members = DEMO_WORKSPACE_USERS.filter((u) => role.memberIds.includes(u.id));
  const displayMembers = members.length > 0 ? members : DEMO_WORKSPACE_USERS.slice(0, 3);
  const permissionLabels = role.permissionKeys.slice(0, 8).map(labelForPermissionKey);
  const extraCount = Math.max(0, role.permissionKeys.length - 8);

  return (
    <article
      className={cn(
        "group flex flex-col overflow-hidden rounded-2xl border border-slate-200/90 bg-white shadow-sm",
        "transition duration-200 hover:border-blue-200/80 hover:shadow-md hover:shadow-blue-950/5",
        "dark:border-slate-800 dark:bg-slate-900 dark:hover:border-blue-900/50",
      )}
    >
      <div className="flex items-start justify-between gap-3 border-b border-slate-100/90 bg-gradient-to-br from-slate-50/80 to-white px-4 py-3.5 dark:border-slate-800 dark:from-slate-900/60 dark:to-slate-900">
        <div className="min-w-0 flex-1">
          <span className="inline-flex items-center gap-1.5 rounded-lg bg-gradient-to-r from-[#191970] to-blue-600 px-3 py-1.5 text-xs font-bold text-white shadow-sm">
            <Shield className="h-3 w-3 shrink-0 opacity-90" aria-hidden />
            <span className="truncate">{role.name}</span>
          </span>
          <p className="mt-2 text-[11px] font-medium text-slate-500">
            {role.permissionKeys.length} permission{role.permissionKeys.length === 1 ? "" : "s"}
          </p>
        </div>
      </div>

      <div className="flex flex-1 flex-wrap gap-1.5 p-4 pt-3">
        {permissionLabels.map((label) => (
          <span key={`${role.id}-${label}`} className={permissionChipClassName()}>
            {label}
          </span>
        ))}
        {extraCount > 0 ? (
          <span
            className={cn(
              permissionChipClassName(),
              "bg-blue-50 font-semibold text-blue-700 ring-blue-100 dark:bg-blue-950/40 dark:text-blue-300 dark:ring-blue-900/50",
            )}
          >
            +{extraCount} more
          </span>
        ) : null}
      </div>

      <div className="flex items-center justify-between gap-3 border-t border-slate-100 px-4 py-3 dark:border-slate-800">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-slate-400">Members</p>
          <div className="mt-1.5 flex -space-x-2">
            {displayMembers.slice(0, 4).map((m) => (
              <span
                key={m.id}
                title={m.name}
                className="inline-flex h-8 w-8 items-center justify-center rounded-full border-2 border-white bg-gradient-to-br from-blue-100 to-indigo-200 text-[10px] font-bold text-indigo-900 dark:border-slate-900 dark:from-blue-950 dark:to-indigo-950 dark:text-blue-200"
              >
                {m.name
                  .split(" ")
                  .map((p) => p[0])
                  .join("")
                  .slice(0, 2)}
              </span>
            ))}
            {members.length > 4 ? (
              <span className="inline-flex h-8 w-8 items-center justify-center rounded-full border-2 border-white bg-slate-100 text-[10px] font-bold text-slate-600 dark:border-slate-900 dark:bg-slate-800 dark:text-slate-300">
                +{members.length - 4}
              </span>
            ) : null}
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          <Link
            href={roleEditPath(role.id)}
            className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-blue-600 text-white shadow-sm transition hover:bg-blue-700"
            aria-label={`Edit ${role.name}`}
          >
            <Pencil className="h-4 w-4" />
          </Link>
          {!role.systemLocked ? (
            <button
              type="button"
              onClick={() => onDelete?.(role.id)}
              className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-rose-200 bg-rose-50 text-rose-600 transition hover:bg-rose-100 dark:border-rose-900/40 dark:bg-rose-950/30 dark:text-rose-400 dark:hover:bg-rose-950/50"
              aria-label={`Delete ${role.name}`}
            >
              <Trash2 className="h-4 w-4" />
            </button>
          ) : (
            <span
              className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 text-slate-300 dark:border-slate-700"
              title="System role cannot be deleted"
            >
              <Trash2 className="h-4 w-4" />
            </span>
          )}
        </div>
      </div>
    </article>
  );
}

export function NewRoleCard() {
  return (
    <Link
      href={workspacePaths.roleNew}
      className={cn(
        "flex min-h-[220px] flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed p-6 text-center transition",
        "border-slate-200 bg-slate-50/50 hover:border-blue-300 hover:bg-blue-50/30",
        "dark:border-slate-700 dark:bg-slate-900/40 dark:hover:border-blue-800 dark:hover:bg-blue-950/20",
      )}
    >
      <span className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-[#191970] to-blue-600 text-2xl font-light text-white shadow-lg shadow-blue-900/20">
        +
      </span>
      <div>
        <p className="text-sm font-bold text-slate-900 dark:text-white">New role</p>
        <p className="mt-1 text-xs text-slate-500">Define permissions and assign members</p>
      </div>
    </Link>
  );
}
