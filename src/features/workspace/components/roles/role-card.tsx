"use client";

import Link from "next/link";
import { ChevronRight, Lock, Plus, Shield, Trash2, Users } from "lucide-react";

import type { WorkspaceRoleRecord } from "@/features/workspace/data/workspace-roles-demo";
import { PERMISSION_CATEGORIES } from "@/features/workspace/data/workspace-permissions-catalog";
import { DEMO_WORKSPACE_USERS } from "@/features/workspace/data/workspace-users-demo";
import { roleEditPath, workspacePaths } from "@/lib/workspace/paths";
import { cn } from "@/lib/utils/cn";

const CATEGORY_TONE: Record<string, string> = {
  general: "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300",
  crm: "bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300",
  kyc: "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300",
  operations: "bg-amber-50 text-amber-800 dark:bg-amber-950/40 dark:text-amber-300",
  intelligence: "bg-violet-50 text-violet-700 dark:bg-violet-950/40 dark:text-violet-300",
};

const ROLE_ACCENTS = [
  "from-[#191970] to-indigo-700",
  "from-indigo-700 to-violet-700",
  "from-violet-700 to-purple-700",
  "from-blue-700 to-cyan-700",
  "from-emerald-700 to-teal-700",
  "from-amber-600 to-orange-600",
  "from-slate-700 to-slate-800",
];

function roleAccent(id: string) {
  let hash = 0;
  for (let i = 0; i < id.length; i++) hash = (hash + id.charCodeAt(i)) % ROLE_ACCENTS.length;
  return ROLE_ACCENTS[hash] ?? ROLE_ACCENTS[0]!;
}

function summarizeCategories(keys: string[]) {
  const counts = new Map<string, number>();
  for (const key of keys) {
    const catId = key.split(".")[0] ?? "";
    if (catId) counts.set(catId, (counts.get(catId) ?? 0) + 1);
  }
  return PERMISSION_CATEGORIES.filter((c) => counts.has(c.id)).map((c) => ({
    id: c.id,
    label: c.label,
    count: counts.get(c.id) ?? 0,
  }));
}

function configuredStages(stageAccess: WorkspaceRoleRecord["stageAccess"]) {
  return Object.values(stageAccess).filter((s) => s.view || s.move || s.edit).length;
}

type Props = {
  role: WorkspaceRoleRecord;
  onDelete?: (id: string) => void;
};

export function RoleCard({ role, onDelete }: Props) {
  const accent = roleAccent(role.id);
  const categories = summarizeCategories(role.permissionKeys);
  const members = DEMO_WORKSPACE_USERS.filter((u) => role.memberIds.includes(u.id));
  const stageCount = configuredStages(role.stageAccess);

  return (
    <article
      className={cn(
        "group relative flex w-full overflow-hidden rounded-xl border bg-white text-left shadow-sm transition-all dark:bg-slate-900",
        "border-slate-200/90 hover:border-slate-300 hover:shadow-md dark:border-slate-800 dark:hover:border-slate-700",
      )}
    >
      <div className={cn("w-1 shrink-0 bg-gradient-to-b", accent)} aria-hidden />

      <div className="min-w-0 flex-1 p-3">
        <div className="flex items-start justify-between gap-2">
          <Link href={roleEditPath(role.id)} className="flex min-w-0 flex-1 items-start gap-2.5">
            <span
              className={cn(
                "flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br text-white shadow-sm",
                accent,
              )}
            >
              <Shield className="h-4 w-4" />
            </span>
            <span className="min-w-0">
              <span className="flex flex-wrap items-center gap-1.5">
                <span className="truncate text-sm font-semibold text-slate-900 dark:text-white">{role.name}</span>
                {role.systemLocked ? (
                  <span className="inline-flex items-center gap-0.5 rounded-md bg-slate-100 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wide text-slate-500 dark:bg-slate-800">
                    <Lock className="h-2.5 w-2.5" />
                    System
                  </span>
                ) : null}
              </span>
              <span className="mt-0.5 block text-[11px] text-slate-500">
                {role.permissionKeys.length} permissions · {categories.length} modules · {stageCount} stages
              </span>
            </span>
          </Link>
          <Link
            href={roleEditPath(role.id)}
            className="shrink-0 text-slate-300 transition group-hover:text-[#191970] dark:group-hover:text-blue-400"
            aria-label={`Open ${role.name}`}
          >
            <ChevronRight className="h-4 w-4" />
          </Link>
        </div>

        <div className="mt-2.5 flex flex-wrap gap-1">
          {categories.slice(0, 4).map((cat) => (
            <span
              key={cat.id}
              className={cn(
                "inline-flex items-center rounded-md px-1.5 py-0.5 text-[10px] font-semibold",
                CATEGORY_TONE[cat.id] ?? "bg-slate-100 text-slate-600",
              )}
            >
              {cat.label}
              <span className="ml-1 opacity-60">{cat.count}</span>
            </span>
          ))}
          {categories.length > 4 ? (
            <span className="inline-flex items-center rounded-md bg-slate-50 px-1.5 py-0.5 text-[10px] font-semibold text-slate-500 dark:bg-slate-800">
              +{categories.length - 4}
            </span>
          ) : null}
        </div>

        <div className="mt-2.5 flex items-center justify-between gap-2 border-t border-slate-100 pt-2 dark:border-slate-800">
          <div className="flex min-w-0 items-center gap-2">
            <Users className="h-3 w-3 shrink-0 text-slate-400" />
            {members.length > 0 ? (
              <div className="flex -space-x-1.5">
                {members.slice(0, 3).map((m) => (
                  <span
                    key={m.id}
                    title={m.name}
                    className="inline-flex h-6 w-6 items-center justify-center rounded-full border border-white bg-slate-100 text-[9px] font-bold text-slate-600 dark:border-slate-900 dark:bg-slate-800 dark:text-slate-300"
                  >
                    {m.name
                      .split(" ")
                      .map((p) => p[0])
                      .join("")
                      .slice(0, 2)}
                  </span>
                ))}
                {members.length > 3 ? (
                  <span className="inline-flex h-6 w-6 items-center justify-center rounded-full border border-white bg-slate-200 text-[9px] font-bold text-slate-600 dark:border-slate-900 dark:bg-slate-700">
                    +{members.length - 3}
                  </span>
                ) : null}
              </div>
            ) : (
              <span className="truncate text-[10px] text-slate-400">No members assigned</span>
            )}
          </div>

          <div className="flex shrink-0 items-center gap-1">
            <Link
              href={roleEditPath(role.id)}
              className="rounded-md px-2 py-1 text-[10px] font-semibold text-[#191970] transition hover:bg-[#191970]/5 dark:text-blue-400"
            >
              Configure
            </Link>
            {!role.systemLocked ? (
              <button
                type="button"
                onClick={() => onDelete?.(role.id)}
                className="inline-flex h-6 w-6 items-center justify-center rounded-md text-slate-400 transition hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-950/30"
                aria-label={`Delete ${role.name}`}
              >
                <Trash2 className="h-3 w-3" />
              </button>
            ) : null}
          </div>
        </div>
      </div>
    </article>
  );
}

export function NewRoleCard() {
  return (
    <Link
      href={workspacePaths.roleNew}
      className="group flex w-full items-center gap-3 overflow-hidden rounded-xl border border-dashed border-slate-200 bg-gradient-to-r from-slate-50/80 to-violet-50/30 px-3 py-3 transition hover:border-[#191970]/40 hover:shadow-sm dark:border-slate-700 dark:from-slate-950/40 dark:to-violet-950/20"
    >
      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-[#191970] to-indigo-700 text-white shadow-sm transition group-hover:scale-105">
        <Plus className="h-4 w-4" />
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-semibold text-slate-900 dark:text-white">Create role</p>
        <p className="truncate text-[11px] text-slate-500">Define permissions & pipeline access</p>
      </div>
      <ChevronRight className="h-3.5 w-3.5 shrink-0 text-slate-300 group-hover:text-[#191970]" />
    </Link>
  );
}
