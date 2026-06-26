"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Copy,
  KeyRound,
  Layers,
  Lock,
  Pencil,
  Shield,
  Trash2,
  Users,
  X,
} from "lucide-react";

import type { WorkspaceRoleRecord } from "@/features/workspace/data/workspace-roles-demo";
import {
  CRM_PIPELINE_STAGES,
  PERMISSION_CATEGORIES,
  labelForPermissionKey,
} from "@/features/workspace/data/workspace-permissions-catalog";
import { DEMO_WORKSPACE_USERS } from "@/features/workspace/data/workspace-users-demo";
import { roleEditPath, workspacePaths } from "@/lib/workspace/paths";
import { cn } from "@/lib/utils/cn";
import { workspaceRolesStore } from "@/stores/workspace-roles.store";

type TabId = "overview" | "permissions" | "members" | "pipeline";

type Props = {
  role: WorkspaceRoleRecord;
  onDelete?: () => void;
  onDuplicate?: () => void;
};

const TABS: { id: TabId; label: string }[] = [
  { id: "overview", label: "Overview" },
  { id: "permissions", label: "Permissions" },
  { id: "members", label: "Members" },
  { id: "pipeline", label: "Pipeline access" },
];

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
    total: c.modules.reduce((sum, m) => sum + m.actions.length, 0),
  }));
}

function stageCount(stageAccess: WorkspaceRoleRecord["stageAccess"]) {
  return Object.values(stageAccess).filter((s) => s.view || s.move || s.edit).length;
}

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

export function RoleInspector({ role, onDelete, onDuplicate }: Props) {
  const [tab, setTab] = useState<TabId>("overview");
  const [deleteConfirm, setDeleteConfirm] = useState(false);

  const upsertRole = workspaceRolesStore((s) => s.upsertRole);

  const members = DEMO_WORKSPACE_USERS.filter((u) => role.memberIds.includes(u.id));
  const categories = summarizeCategories(role.permissionKeys);
  const groupedPermissions = permissionsByCategory(role.permissionKeys);
  const stagesConfigured = stageCount(role.stageAccess);

  const handleDelete = () => {
    if (!deleteConfirm) {
      setDeleteConfirm(true);
      return;
    }
    onDelete?.();
    setDeleteConfirm(false);
  };

  return (
    <div className="flex h-full min-h-[520px] flex-col">
      <div className="relative shrink-0 border-b border-slate-200/90 bg-slate-50/70 px-6 py-5 dark:border-slate-800 dark:bg-slate-900/40">
        <div className="relative flex flex-wrap items-start justify-between gap-4">
          <div className="flex min-w-0 items-start gap-3.5">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#191970]/8 text-[#191970] ring-1 ring-[#191970]/15 dark:bg-blue-950/40 dark:text-blue-300 dark:ring-blue-800/30">
              {role.systemLocked ? <Lock className="h-5 w-5" /> : <Shield className="h-5 w-5" />}
            </div>
            <div className="min-w-0">
              <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-slate-400 dark:text-slate-500">Access policy</p>
              <h2 className="mt-1.5 truncate text-xl font-bold tracking-tight text-slate-900 dark:text-white leading-none">{role.name}</h2>
              <p className="mt-2 text-xs font-medium text-slate-500 dark:text-slate-400">
                {role.systemLocked ? "Built-in system role · read-only" : "Custom workspace role"}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <Link
              href={roleEditPath(role.id)}
              className="inline-flex h-9 items-center gap-1.5 rounded-lg bg-[#191970] px-4 text-sm font-semibold text-white shadow-sm transition hover:bg-[#12124a] dark:bg-blue-600 dark:hover:bg-blue-700"
            >
              <Pencil className="h-3.5 w-3.5" />
              Edit policy
            </Link>
            {!role.systemLocked && onDuplicate ? (
              <button
                type="button"
                onClick={onDuplicate}
                className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3.5 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800"
              >
                <Copy className="h-3.5 w-3.5" />
                Duplicate
              </button>
            ) : null}
          </div>
        </div>

        <dl className="relative mt-6 grid grid-cols-3 gap-3">
          {[
            { label: "Permissions", value: role.permissionKeys.length, icon: KeyRound },
            { label: "Members", value: members.length, icon: Users },
            { label: "Pipeline stages", value: stagesConfigured, icon: Layers },
          ].map((item) => (
            <div key={item.label} className="rounded-xl border border-slate-200 bg-white px-4 py-3 shadow-sm dark:border-slate-800 dark:bg-slate-900">
              <dt className="flex items-center gap-1.5 text-[9px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                <item.icon className="h-3.5 w-3.5 text-slate-400 dark:text-slate-550" />
                {item.label}
              </dt>
              <dd className="mt-1.5 text-xl font-bold tabular-nums text-slate-900 dark:text-white leading-none">{item.value}</dd>
            </div>
          ))}
        </dl>
      </div>

      <div className="shrink-0 border-b border-slate-200/90 bg-white px-6 dark:border-slate-800 dark:bg-slate-900">
        <div className="flex gap-6 py-2.5" role="tablist">
          {TABS.map((t) => {
            const active = tab === t.id;
            return (
              <button
                key={t.id}
                type="button"
                role="tab"
                aria-selected={active}
                onClick={() => setTab(t.id)}
                className={cn(
                  "relative py-1 text-sm font-semibold transition outline-none",
                  active
                    ? "text-[#191970] dark:text-blue-400"
                    : "text-slate-500 hover:text-slate-800 dark:hover:text-slate-250",
                )}
              >
                {t.label}
                {active && (
                  <span className="absolute bottom-[-11px] left-0 right-0 h-[2.5px] bg-[#191970] dark:bg-blue-500 rounded-t-full shadow-[0_-1px_4px_rgba(25,25,112,0.15)]" />
                )}
              </button>
            );
          })}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto bg-slate-50/50 p-5 dark:bg-slate-950/30">
        {tab === "overview" ? (
          <div className="space-y-5">
            <section className="rounded-xl border border-slate-200/90 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">Module coverage</h3>
              <div className="mt-4 space-y-3">
                {categories.length === 0 ? (
                  <p className="text-sm text-slate-500">No permissions assigned to this role.</p>
                ) : (
                  categories.map((cat) => {
                    const pct = cat.total > 0 ? Math.round((cat.count / cat.total) * 100) : 0;
                    return (
                      <div key={cat.id}>
                        <div className="mb-1 flex items-center justify-between text-sm">
                          <span className="font-medium text-slate-800 dark:text-slate-200">{cat.label}</span>
                          <span className="tabular-nums text-xs text-slate-500">
                            {cat.count} / {cat.total} grants
                          </span>
                        </div>
                        <div className="h-2 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
                          <div
                            className="h-full rounded-full bg-[#191970] transition-all dark:bg-blue-600"
                            style={{ width: `${Math.max(pct, cat.count > 0 ? 8 : 0)}%` }}
                          />
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </section>

            <section className="rounded-xl border border-slate-200/90 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">Security restrictions</h3>
              <div className="mt-4 space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium text-slate-800 dark:text-slate-200">IP Filtering</span>
                  <span className={cn(
                    "rounded-full px-2 py-0.5 text-xs font-semibold",
                    role.allowedIps
                      ? "bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400"
                      : "bg-slate-100 text-slate-500 dark:bg-slate-800"
                  )}>
                    {role.allowedIps ? "Restricted" : "Unrestricted"}
                  </span>
                </div>
                {role.allowedIps ? (
                  <div className="mt-2 rounded-lg bg-slate-50 p-3 text-xs font-mono text-slate-600 dark:bg-slate-950 dark:text-slate-400">
                    {role.allowedIps.split(",").map((ip) => ip.trim()).join(", ")}
                  </div>
                ) : (
                  <p className="text-xs text-slate-500 mt-1">
                    No IP address filters configured. Workspace members with this role can log in from any location.
                  </p>
                )}
              </div>
            </section>
          </div>
        ) : null}

        {tab === "permissions" ? (
          <div className="space-y-4">
            {groupedPermissions.length === 0 ? (
              <p className="text-sm text-slate-500">No permission grants configured.</p>
            ) : (
              groupedPermissions.map(({ category, keys }) => (
                <section
                  key={category.id}
                  className="overflow-hidden rounded-xl border border-slate-200/90 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900"
                >
                  <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50/80 px-4 py-3 dark:border-slate-800 dark:bg-slate-900/60">
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white">{category.label}</h3>
                    <span className="rounded-md bg-[#191970]/8 px-2 py-0.5 text-xs font-semibold tabular-nums text-[#191970] dark:bg-blue-950/40 dark:text-blue-300">
                      {keys.length} grants
                    </span>
                  </div>
                  <ul className="divide-y divide-slate-100 dark:divide-slate-800">
                    {keys.map((key) => (
                      <li key={key} className="flex items-center gap-3 px-4 py-2.5 text-sm">
                        <KeyRound className="h-3.5 w-3.5 shrink-0 text-slate-400" />
                        <span className="font-medium text-slate-800 dark:text-slate-200">{labelForPermissionKey(key)}</span>
                        <span className="ml-auto font-mono text-[10px] text-slate-400">{key}</span>
                      </li>
                    ))}
                  </ul>
                </section>
              ))
            )}
          </div>
        ) : null}

        {tab === "members" ? (
          <section className="rounded-xl border border-slate-200/90 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <div className="flex flex-wrap items-center justify-between border-b border-slate-100 px-4 py-3 dark:border-slate-800 gap-2">
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">Assigned members</h3>
                <p className="text-xs text-slate-500">Manage who is assigned to this role policy.</p>
              </div>
              <div className="flex items-center gap-2">
                {DEMO_WORKSPACE_USERS.filter((u) => !role.memberIds.includes(u.id)).length > 0 && (
                  <select
                    value=""
                    onChange={(e) => {
                      const userId = e.target.value;
                      if (userId) {
                        upsertRole({
                          ...role,
                          memberIds: [...role.memberIds, userId]
                        });
                      }
                    }}
                    className="h-8 rounded-lg border border-slate-200 bg-slate-50/50 px-2 text-[10px] font-bold uppercase tracking-wider outline-none transition focus:border-blue-500 focus:bg-white dark:border-slate-700 dark:bg-slate-900 text-slate-750 dark:text-slate-350 cursor-pointer"
                  >
                    <option value="">+ Assign Member</option>
                    {DEMO_WORKSPACE_USERS.filter((u) => !role.memberIds.includes(u.id)).map((u) => (
                      <option key={u.id} value={u.id}>
                        {u.name} ({u.profileRole})
                      </option>
                    ))}
                  </select>
                )}
              </div>
            </div>
            {members.length === 0 ? (
              <div className="px-4 py-10 text-center">
                <Users className="mx-auto h-8 w-8 text-slate-300" />
                <p className="mt-2 text-sm font-medium text-slate-700 dark:text-slate-300">No members assigned</p>
                <p className="mt-1 text-xs text-slate-500">Use the dropdown above to assign a member to this role.</p>
              </div>
            ) : (
              <ul className="divide-y divide-slate-100 dark:divide-slate-800">
                {members.map((m) => (
                  <li key={m.id} className="flex items-center gap-3 px-4 py-3">
                    <span className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-[#191970] to-indigo-700 text-[11px] font-bold text-white">
                      {m.name
                        .split(" ")
                        .map((p) => p[0])
                        .join("")
                        .slice(0, 2)}
                    </span>
                    <span className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold text-slate-900 dark:text-white">{m.name}</p>
                      <p className="truncate text-xs text-slate-500">{m.email}</p>
                    </span>
                    <div className="flex items-center gap-2">
                      <span className="rounded-md bg-slate-100 px-2 py-0.5 text-[10px] font-semibold uppercase text-slate-600 dark:bg-slate-800 dark:text-slate-400">
                        {m.status}
                      </span>
                      <button
                        type="button"
                        onClick={() => {
                          upsertRole({
                            ...role,
                            memberIds: role.memberIds.filter(id => id !== m.id)
                          });
                        }}
                        className="p-1 text-slate-450 hover:text-rose-600 transition"
                        title="Remove member assignment"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </section>
        ) : null}

        {tab === "pipeline" ? (
          <section className="overflow-hidden rounded-xl border border-slate-200/90 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <div className="border-b border-slate-100 px-4 py-3 dark:border-slate-800">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">CRM pipeline stage access</h3>
              <p className="mt-1 text-xs text-slate-500">View, move, and edit permissions per pipeline stage.</p>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[480px] text-left text-sm">
                <thead>
                  <tr className="bg-[#191970] text-[11px] font-bold uppercase tracking-wider text-white">
                    <th className="px-4 py-2.5">Stage</th>
                    <th className="px-4 py-2.5 text-center">View</th>
                    <th className="px-4 py-2.5 text-center">Move</th>
                    <th className="px-4 py-2.5 text-center">Edit</th>
                  </tr>
                </thead>
                <tbody>
                  {CRM_PIPELINE_STAGES.map((stage, i) => {
                    const rule = role.stageAccess[stage.id] ?? { view: false, move: false, edit: false };
                    return (
                      <tr
                        key={stage.id}
                        className={cn(
                          "border-t border-slate-100 dark:border-slate-800",
                          i % 2 === 1 ? "bg-slate-50/60 dark:bg-slate-950/40" : "",
                        )}
                      >
                        <td className="px-4 py-2.5 font-medium text-slate-800 dark:text-slate-200">{stage.label}</td>
                        {(["view", "move", "edit"] as const).map((action) => (
                          <td key={action} className="px-4 py-2.5 text-center">
                            <span
                              className={cn(
                                "inline-flex h-6 w-6 items-center justify-center rounded-full text-[10px] font-bold",
                                rule[action]
                                  ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400"
                                  : "bg-slate-100 text-slate-400 dark:bg-slate-800",
                              )}
                            >
                              {rule[action] ? "✓" : "—"}
                            </span>
                          </td>
                        ))}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </section>
        ) : null}
      </div>

      {!role.systemLocked && onDelete ? (
        <div className="shrink-0 border-t border-slate-200/90 bg-white px-5 py-4 dark:border-slate-800 dark:bg-slate-900">
          {deleteConfirm ? (
            <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-rose-200 bg-rose-50/80 px-4 py-3 dark:border-rose-900/40 dark:bg-rose-950/20">
              <p className="text-sm font-medium text-rose-800 dark:text-rose-300">
                Delete &ldquo;{role.name}&rdquo;? This cannot be undone.
              </p>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setDeleteConfirm(false)}
                  className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-white dark:border-slate-700 dark:text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleDelete}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-rose-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-rose-700"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  Confirm delete
                </button>
              </div>
            </div>
          ) : (
            <button
              type="button"
              onClick={handleDelete}
              className="inline-flex items-center gap-1.5 text-sm font-semibold text-rose-600 transition hover:text-rose-700 dark:text-rose-400"
            >
              <Trash2 className="h-4 w-4" />
              Delete role
            </button>
          )}
        </div>
      ) : null}
    </div>
  );
}
