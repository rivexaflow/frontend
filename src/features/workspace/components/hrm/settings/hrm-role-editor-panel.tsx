"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  AlertTriangle,
  Check,
  Copy,
  KeyRound,
  Lock,
  RotateCcw,
  Shield,
  Trash2,
  Users,
} from "lucide-react";

import { HrmPermissionMatrixPanel } from "@/features/workspace/components/hrm/settings/hrm-permission-matrix-panel";
import type { HrmRoleRecord, HrmRoleScope } from "@/features/workspace/data/hrm-roles-demo";
import {
  HRM_PERMISSION_CATEGORIES,
  keysForHrmCategory,
  labelForHrmPermissionKey,
} from "@/features/workspace/data/hrm-permissions-catalog";
import { DEMO_HRM_ROLE_ASSIGNEES } from "@/features/workspace/data/hrm-roles-demo";
import { workspacePaths } from "@/lib/workspace/paths";
import { cn } from "@/lib/utils/cn";

type TabId = "permissions" | "overview" | "members";

type Props = {
  role: HrmRoleRecord;
  canManage: boolean;
  saving?: boolean;
  onSave: (draft: RoleDraft) => void;
  onDuplicate?: () => void;
  onDelete?: () => void;
};

export type RoleDraft = {
  name: string;
  description: string;
  scope: HrmRoleScope;
  permissionKeys: Set<string>;
};

const TABS: { id: TabId; label: string }[] = [
  { id: "permissions", label: "Permissions" },
  { id: "overview", label: "Overview" },
  { id: "members", label: "Members" },
];

const SCOPES: { id: HrmRoleScope; label: string }[] = [
  { id: "organization", label: "Organization-wide" },
  { id: "department", label: "Department scoped" },
  { id: "self", label: "Self only" },
];

function summarizeCategories(keys: Set<string>) {
  return HRM_PERMISSION_CATEGORIES.map((cat) => {
    const catKeys = keysForHrmCategory(cat.id);
    const total = catKeys.length;
    const count = catKeys.filter((k) => keys.has(k)).length;
    return { id: cat.id, label: cat.label, count, total };
  }).filter((c) => c.count > 0 || c.total > 0);
}

export function HrmRoleEditorPanel({
  role,
  canManage,
  saving = false,
  onSave,
  onDuplicate,
  onDelete,
}: Props) {
  const [tab, setTab] = useState<TabId>("permissions");
  const [activeCategory, setActiveCategory] = useState(HRM_PERMISSION_CATEGORIES[0]!.id);
  const [deleteConfirm, setDeleteConfirm] = useState(false);

  const [draft, setDraft] = useState<RoleDraft>(() => ({
    name: role.name,
    description: role.description ?? "",
    scope: role.scope,
    permissionKeys: new Set(role.permissionKeys),
  }));

  useEffect(() => {
    setDraft({
      name: role.name,
      description: role.description ?? "",
      scope: role.scope,
      permissionKeys: new Set(role.permissionKeys),
    });
    setTab("permissions");
    setDeleteConfirm(false);
  }, [role.id]);

  const isDirty = useMemo(() => {
    if (draft.name !== role.name) return true;
    if (draft.description !== (role.description ?? "")) return true;
    if (draft.scope !== role.scope) return true;
    if (draft.permissionKeys.size !== role.permissionKeys.length) return true;
    for (const k of role.permissionKeys) {
      if (!draft.permissionKeys.has(k)) return true;
    }
    return false;
  }, [draft, role]);

  const categoryCounts = useMemo(() => {
    const map = new Map<string, number>();
    for (const cat of HRM_PERMISSION_CATEGORIES) {
      const keys = keysForHrmCategory(cat.id);
      map.set(cat.id, keys.filter((k) => draft.permissionKeys.has(k)).length);
    }
    return map;
  }, [draft.permissionKeys]);

  const activeCategoryDef =
    HRM_PERMISSION_CATEGORIES.find((c) => c.id === activeCategory) ?? HRM_PERMISSION_CATEGORIES[0]!;

  const categories = summarizeCategories(draft.permissionKeys);
  const members = DEMO_HRM_ROLE_ASSIGNEES[role.id] ?? [];

  const handleDiscard = () => {
    setDraft({
      name: role.name,
      description: role.description ?? "",
      scope: role.scope,
      permissionKeys: new Set(role.permissionKeys),
    });
  };

  const handleSave = () => {
    if (!draft.name.trim()) return;
    onSave(draft);
  };

  const editable = canManage;

  return (
    <div className="flex h-full min-h-[560px] flex-col">
      <div className="relative shrink-0 overflow-hidden border-b border-slate-200/90 bg-gradient-to-br from-[#191970] via-[#1a1d6e] to-[#252d7a] px-6 py-5 text-white dark:border-slate-800">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_0%,rgba(255,255,255,0.08),transparent_50%)]" />
        <div className="relative flex flex-wrap items-start justify-between gap-4">
          <div className="flex min-w-0 items-start gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white/15 ring-1 ring-white/20">
              {role.isSystem ? <Lock className="h-5 w-5" /> : <Shield className="h-5 w-5" />}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-white/55">HR access role</p>
              {editable && !role.isSystem ? (
                <input
                  value={draft.name}
                  onChange={(e) => setDraft((d) => ({ ...d, name: e.target.value }))}
                  className="mt-0.5 w-full max-w-md truncate rounded-md border border-white/20 bg-white/10 px-2 py-1 text-lg font-semibold text-white outline-none placeholder:text-white/40 focus:border-white/40 focus:ring-1 focus:ring-white/30"
                  placeholder="Role name"
                />
              ) : (
                <h2 className="mt-0.5 truncate text-xl font-semibold tracking-tight">{role.name}</h2>
              )}
              <p className="mt-1 text-sm text-white/70">
                {role.isSystem
                  ? "Default template · permissions editable by admin"
                  : "Custom role · full edit access"}
              </p>
            </div>
          </div>

          {editable ? (
            <div className="flex flex-wrap gap-2">
              {onDuplicate ? (
                <button
                  type="button"
                  onClick={onDuplicate}
                  className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-white/25 bg-white/10 px-3.5 text-sm font-semibold text-white transition hover:bg-white/15"
                >
                  <Copy className="h-3.5 w-3.5" />
                  Duplicate
                </button>
              ) : null}
              {isDirty ? (
                <>
                  <button
                    type="button"
                    onClick={handleDiscard}
                    disabled={saving}
                    className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-white/25 bg-white/10 px-3.5 text-sm font-semibold text-white transition hover:bg-white/15 disabled:opacity-50"
                  >
                    <RotateCcw className="h-3.5 w-3.5" />
                    Discard
                  </button>
                  <button
                    type="button"
                    onClick={handleSave}
                    disabled={saving || !draft.name.trim()}
                    className="inline-flex h-9 items-center gap-1.5 rounded-lg bg-white px-3.5 text-sm font-semibold text-[#191970] shadow-sm transition hover:bg-white/95 disabled:opacity-50"
                  >
                    <Check className="h-3.5 w-3.5" />
                    {saving ? "Saving…" : "Save changes"}
                  </button>
                </>
              ) : (
                <span className="inline-flex h-9 items-center rounded-lg border border-white/20 bg-white/5 px-3.5 text-xs font-medium text-white/70">
                  Toggle permissions below, then save
                </span>
              )}
            </div>
          ) : null}
        </div>

        <dl className="relative mt-5 grid grid-cols-3 gap-3">
          {[
            { label: "Permissions", value: draft.permissionKeys.size, icon: KeyRound },
            { label: "Members", value: role.memberCount, icon: Users },
            { label: "Scope", value: draft.scope, icon: Shield },
          ].map((item) => (
            <div key={item.label} className="rounded-lg bg-white/10 px-3 py-2 ring-1 ring-white/10">
              <dt className="flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wide text-white/55">
                <item.icon className="h-3 w-3" />
                {item.label}
              </dt>
              <dd className="mt-0.5 truncate text-lg font-bold capitalize tabular-nums">{item.value}</dd>
            </div>
          ))}
        </dl>
      </div>

      {editable ? (
        <div className="shrink-0 border-b border-slate-200/90 bg-[#2277ff]/[0.04] px-5 py-2.5 dark:border-slate-800">
          <p className="flex items-start gap-2 text-xs text-slate-600">
            <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-amber-500" />
            Changes apply to all members assigned this role. Use least-privilege — grant only what each job function
            requires.
          </p>
        </div>
      ) : null}

      {editable ? (
        <div className="shrink-0 border-b border-slate-200/90 bg-white px-5 py-4 dark:border-slate-800 dark:bg-slate-900">
          <div className="grid gap-3 sm:grid-cols-2">
            <label className="block">
              <span className="text-xs font-semibold text-slate-600">Description</span>
              <input
                value={draft.description}
                onChange={(e) => setDraft((d) => ({ ...d, description: e.target.value }))}
                disabled={!editable}
                placeholder="What this role is responsible for"
                className="mt-1 h-9 w-full rounded-lg border border-slate-200 px-3 text-sm outline-none focus:border-[#191970] focus:ring-1 focus:ring-[#191970]/20 disabled:bg-slate-50"
              />
            </label>
            <label className="block">
              <span className="text-xs font-semibold text-slate-600">Data scope</span>
              <select
                value={draft.scope}
                onChange={(e) => setDraft((d) => ({ ...d, scope: e.target.value as HrmRoleScope }))}
                disabled={!editable}
                className="mt-1 h-9 w-full rounded-lg border border-slate-200 px-3 text-sm outline-none focus:border-[#191970] disabled:bg-slate-50"
              >
                {SCOPES.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.label}
                  </option>
                ))}
              </select>
            </label>
          </div>
        </div>
      ) : null}

      <div className="shrink-0 border-b border-slate-200/90 bg-white px-4 dark:border-slate-800 dark:bg-slate-900">
        <div className="flex gap-1 overflow-x-auto py-2" role="tablist">
          {TABS.map((t) => (
            <button
              key={t.id}
              type="button"
              role="tab"
              aria-selected={tab === t.id}
              onClick={() => setTab(t.id)}
              className={cn(
                "shrink-0 rounded-lg px-3 py-2 text-sm font-semibold transition",
                tab === t.id
                  ? "bg-[#191970]/8 text-[#191970] dark:bg-blue-950/40 dark:text-blue-300"
                  : "text-slate-500 hover:bg-slate-50 hover:text-slate-800 dark:hover:bg-slate-800 dark:hover:text-slate-200",
              )}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto bg-slate-50/50 dark:bg-slate-950/30">
        {tab === "permissions" ? (
          <div>
            <div className="flex flex-wrap gap-1 border-b border-slate-200/90 bg-white px-4 py-2 dark:border-slate-800 dark:bg-slate-900">
              {HRM_PERMISSION_CATEGORIES.map((cat) => {
                const count = categoryCounts.get(cat.id) ?? 0;
                const active = activeCategory === cat.id;
                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setActiveCategory(cat.id)}
                    className={cn(
                      "rounded-lg px-3 py-2 text-xs font-semibold transition",
                      active
                        ? "bg-[#191970] text-white"
                        : "text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800",
                    )}
                  >
                    {cat.label}
                    <span
                      className={cn(
                        "ml-1.5 rounded-md px-1.5 py-0.5 text-[10px] tabular-nums",
                        active ? "bg-white/20" : "bg-slate-100 text-slate-500",
                      )}
                    >
                      {count}
                    </span>
                  </button>
                );
              })}
            </div>
            <div className="m-4 overflow-hidden rounded-xl border border-slate-200/90 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
              <HrmPermissionMatrixPanel
                category={activeCategoryDef}
                selected={draft.permissionKeys}
                onChange={(next) => setDraft((d) => ({ ...d, permissionKeys: next }))}
                readOnly={!editable}
              />
            </div>
          </div>
        ) : null}

        {tab === "overview" ? (
          <div className="space-y-4 p-5">
            <section className="rounded-xl border border-slate-200/90 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">Module coverage</h3>
              <div className="mt-4 space-y-3">
                {categories.map((cat) => {
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
                          className="h-full rounded-full bg-[#191970] transition-all"
                          style={{ width: `${Math.max(pct, cat.count > 0 ? 8 : 0)}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>

            <section className="rounded-xl border border-slate-200/90 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
              <div className="border-b border-slate-100 px-4 py-3 dark:border-slate-800">
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">Effective permissions</h3>
              </div>
              <ul className="max-h-64 divide-y divide-slate-100 overflow-y-auto dark:divide-slate-800">
                {[...draft.permissionKeys].slice(0, 24).map((key) => (
                  <li key={key} className="flex items-center gap-3 px-4 py-2 text-sm">
                    <KeyRound className="h-3.5 w-3.5 shrink-0 text-slate-400" />
                    <span className="font-medium text-slate-800 dark:text-slate-200">
                      {labelForHrmPermissionKey(key)}
                    </span>
                  </li>
                ))}
                {draft.permissionKeys.size > 24 ? (
                  <li className="px-4 py-2 text-xs text-slate-500">
                    +{draft.permissionKeys.size - 24} more permissions
                  </li>
                ) : null}
              </ul>
            </section>
          </div>
        ) : null}

        {tab === "members" ? (
          <section className="m-5 overflow-hidden rounded-xl border border-slate-200/90 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3 dark:border-slate-800">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">Assigned members</h3>
              <Link href={workspacePaths.hrmEmployees} className="text-xs font-semibold text-[#191970] hover:underline">
                Employee directory →
              </Link>
            </div>
            {members.length === 0 ? (
              <div className="px-4 py-10 text-center">
                <Users className="mx-auto h-8 w-8 text-slate-300" />
                <p className="mt-2 text-sm font-medium text-slate-700 dark:text-slate-300">No sample assignees</p>
                <p className="mt-1 text-xs text-slate-500">
                  Assign this role from the employee profile access section.
                </p>
              </div>
            ) : (
              <ul className="divide-y divide-slate-100 dark:divide-slate-800">
                {members.map((m) => (
                  <li key={m.id} className="flex items-center gap-3 px-4 py-3">
                    <span className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-[#191970] to-[#2277ff] text-[11px] font-bold text-white">
                      {m.initials}
                    </span>
                    <span className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold text-slate-900 dark:text-white">{m.name}</p>
                      <p className="truncate text-xs text-slate-500">{m.designation}</p>
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </section>
        ) : null}
      </div>

      {editable && !role.isSystem && onDelete ? (
        <div className="shrink-0 border-t border-slate-200/90 bg-white px-5 py-4 dark:border-slate-800 dark:bg-slate-900">
          {deleteConfirm ? (
            <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-rose-200 bg-rose-50/80 px-4 py-3">
              <p className="text-sm font-medium text-rose-800">
                Delete &ldquo;{role.name}&rdquo;? Members will lose this role assignment.
              </p>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setDeleteConfirm(false)}
                  className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-white"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={onDelete}
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
              onClick={() => setDeleteConfirm(true)}
              className="inline-flex items-center gap-1.5 text-sm font-semibold text-rose-600 hover:text-rose-700"
            >
              <Trash2 className="h-4 w-4" />
              Delete custom role
            </button>
          )}
        </div>
      ) : null}
    </div>
  );
}
