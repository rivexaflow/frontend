"use client";

import { useState } from "react";
import Link from "next/link";
import { KeyRound, Layers, Lock, Pencil, Shield, Trash2, Users } from "lucide-react";

import type { WorkspaceRoleRecord } from "@/features/workspace/data/workspace-roles-demo";
import {
  CRM_PIPELINE_STAGES,
  PERMISSION_CATEGORIES,
  labelForPermissionKey,
} from "@/features/workspace/data/workspace-permissions-catalog";
import { DEMO_WORKSPACE_USERS } from "@/features/workspace/data/workspace-users-demo";
import { roleEditPath, workspacePaths } from "@/lib/workspace/paths";
import { cn } from "@/lib/utils/cn";

type Props = {
  role: WorkspaceRoleRecord;
  onDelete?: () => void;
  onDuplicate?: () => void;
};

function permissionsByCategory(keys: string[]) {
  const grouped = new Map<string, string[]>();
  for (const key of keys) {
    const catId = key.split(".")[0] ?? "other";
    if (!grouped.has(catId)) grouped.set(catId, []);
    grouped.get(catId)!.push(key);
  }
  return PERMISSION_CATEGORIES.filter((c) => grouped.has(c.id)).map((c) => ({
    category: c,
    keys: grouped.get(c.id) ?? [],
  }));
}

function stageCount(stageAccess: WorkspaceRoleRecord["stageAccess"]) {
  return Object.values(stageAccess).filter((s) => s.view || s.move || s.edit).length;
}

export function RoleInspector({ role, onDelete, onDuplicate }: Props) {
  const [activeCategory, setActiveCategory] = useState(PERMISSION_CATEGORIES[0]?.id ?? "");
  const [deleteConfirm, setDeleteConfirm] = useState(false);

  const members = DEMO_WORKSPACE_USERS.filter((u) => role.memberIds.includes(u.id));
  const groupedPermissions = permissionsByCategory(role.permissionKeys);
  const stagesConfigured = stageCount(role.stageAccess);
  const activeGroup =
    groupedPermissions.find((g) => g.category.id === activeCategory) ?? groupedPermissions[0];

  const handleDelete = () => {
    if (!deleteConfirm) {
      setDeleteConfirm(true);
      return;
    }
    onDelete?.();
    setDeleteConfirm(false);
  };

  return (
    <div className="flex h-full min-h-[520px] flex-col bg-white dark:bg-slate-900">
      <div className="shrink-0 border-b border-slate-200/90 px-5 py-4 dark:border-slate-800">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex min-w-0 items-center gap-2.5">
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#191970]/10 text-[#191970] dark:bg-[#2277FF]/15 dark:text-[#2277FF]">
              {role.systemLocked ? <Lock className="h-4 w-4" /> : <Shield className="h-4 w-4" />}
            </span>
            <div className="min-w-0">
              <h2 className="truncate text-base font-semibold text-slate-900 dark:text-white">{role.name}</h2>
              <p className="text-xs text-slate-500">
                {role.permissionKeys.length} permissions · {members.length} members
                {stagesConfigured > 0 ? ` · ${stagesConfigured} pipeline stages` : ""}
              </p>
            </div>
          </div>
          <Link
            href={roleEditPath(role.id)}
            className="inline-flex h-8 shrink-0 items-center gap-1.5 rounded-lg bg-[#191970] px-3 text-xs font-semibold text-white hover:bg-[#12124a]"
          >
            <Pencil className="h-3.5 w-3.5" />
            Edit permissions
          </Link>
        </div>
      </div>

      <div className="flex min-h-0 flex-1 flex-col lg:flex-row">
        <aside className="shrink-0 border-b border-slate-200/90 bg-slate-50/50 dark:border-slate-800 dark:bg-slate-950/40 lg:w-56 lg:border-b-0 lg:border-r">
          <div className="flex items-center justify-between px-4 py-3">
            <h3 className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide text-slate-500">
              <Users className="h-3.5 w-3.5" />
              Members
            </h3>
            <span className="rounded-md bg-white px-1.5 py-0.5 text-[10px] font-bold tabular-nums text-slate-600 ring-1 ring-slate-200 dark:bg-slate-900 dark:text-slate-300 dark:ring-slate-700">
              {members.length}
            </span>
          </div>
          {members.length === 0 ? (
            <div className="px-4 pb-4 text-center">
              <p className="text-xs text-slate-500">No members assigned</p>
              <Link
                href={workspacePaths.user}
                className="mt-1 inline-block text-[11px] font-semibold text-[#191970] hover:underline dark:text-[#2277FF]"
              >
                User directory
              </Link>
            </div>
          ) : (
            <ul className="max-h-48 divide-y divide-slate-200/80 overflow-y-auto dark:divide-slate-800 lg:max-h-none">
              {members.map((m) => (
                <li key={m.id} className="flex items-center gap-2.5 px-4 py-2.5">
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-[#191970] to-[#2277ff] text-[10px] font-bold text-white">
                    {m.name
                      .split(" ")
                      .map((p) => p[0])
                      .join("")
                      .slice(0, 2)}
                  </span>
                  <span className="min-w-0">
                    <p className="truncate text-xs font-semibold text-slate-800 dark:text-slate-200">{m.name}</p>
                    <p className="truncate text-[10px] text-slate-500">{m.email}</p>
                  </span>
                </li>
              ))}
            </ul>
          )}
        </aside>

        <div className="flex min-h-0 min-w-0 flex-1 flex-col">
          {groupedPermissions.length > 0 ? (
            <>
              <div className="shrink-0 border-b border-slate-200/90 px-4 py-2 dark:border-slate-800">
                <div className="flex flex-wrap gap-1">
                  {groupedPermissions.map(({ category, keys }) => {
                    const active = activeCategory === category.id;
                    return (
                      <button
                        key={category.id}
                        type="button"
                        onClick={() => setActiveCategory(category.id)}
                        className={cn(
                          "rounded-lg px-2.5 py-1.5 text-xs font-semibold transition",
                          active
                            ? "bg-[#191970] text-white"
                            : "text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800",
                        )}
                      >
                        {category.label}
                        <span className={cn("ml-1 tabular-nums", active ? "text-white/80" : "text-slate-400")}>
                          {keys.length}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="min-h-0 flex-1 overflow-y-auto p-4">
                {activeGroup ? (
                  <ul className="divide-y divide-slate-100 overflow-hidden rounded-xl border border-slate-200/90 bg-white dark:divide-slate-800 dark:border-slate-800 dark:bg-slate-900">
                    {activeGroup.keys.map((key) => (
                      <li key={key} className="flex items-center gap-3 px-4 py-2.5 text-sm">
                        <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded border-2 border-[#191970] bg-[#191970] text-white">
                          <KeyRound className="h-3 w-3" />
                        </span>
                        <span className="font-medium text-slate-800 dark:text-slate-200">
                          {labelForPermissionKey(key)}
                        </span>
                      </li>
                    ))}
                  </ul>
                ) : null}
              </div>
            </>
          ) : (
            <div className="flex flex-1 items-center justify-center p-8 text-sm text-slate-500">
              No permissions assigned to this role.
            </div>
          )}

          {stagesConfigured > 0 ? (
            <div className="shrink-0 border-t border-slate-200/90 px-4 py-3 dark:border-slate-800">
              <p className="flex items-center gap-1.5 text-xs text-slate-500">
                <Layers className="h-3.5 w-3.5" />
                CRM pipeline access on {stagesConfigured} of {CRM_PIPELINE_STAGES.length} stages — edit role to change
              </p>
            </div>
          ) : null}
        </div>
      </div>

      {!role.systemLocked && (onDelete || onDuplicate) ? (
        <div className="shrink-0 border-t border-slate-200/90 px-5 py-2.5 dark:border-slate-800">
          <div className="flex flex-wrap items-center justify-between gap-2">
            {onDuplicate ? (
              <button
                type="button"
                onClick={onDuplicate}
                className="text-xs font-semibold text-[#191970] hover:underline dark:text-[#2277FF]"
              >
                Duplicate role
              </button>
            ) : (
              <span />
            )}
            {onDelete ? (
              deleteConfirm ? (
                <div className="flex items-center gap-2">
                  <span className="text-xs text-rose-600">Delete this role?</span>
                  <button
                    type="button"
                    onClick={() => setDeleteConfirm(false)}
                    className="rounded-md px-2 py-1 text-xs font-semibold text-slate-600 hover:bg-slate-100"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleDelete}
                    className="inline-flex items-center gap-1 rounded-md bg-rose-600 px-2 py-1 text-xs font-semibold text-white hover:bg-rose-700"
                  >
                    <Trash2 className="h-3 w-3" />
                    Delete
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={handleDelete}
                  className="text-xs font-semibold text-rose-600 hover:text-rose-700"
                >
                  Delete role
                </button>
              )
            ) : null}
          </div>
        </div>
      ) : null}
    </div>
  );
}
