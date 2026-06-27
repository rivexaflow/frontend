"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Check, Lock, RotateCcw, Shield, Trash2, Users } from "lucide-react";

import { HrmPermissionMatrixPanel } from "@/features/workspace/components/hrm/settings/hrm-permission-matrix-panel";
import type { HrmRoleRecord, HrmRoleScope } from "@/features/workspace/data/hrm-roles-demo";
import {
  HRM_PERMISSION_CATEGORIES,
  keysForHrmCategory,
} from "@/features/workspace/data/hrm-permissions-catalog";
import { DEMO_HRM_ROLE_ASSIGNEES } from "@/features/workspace/data/hrm-roles-demo";
import { workspacePaths } from "@/lib/workspace/paths";
import { cn } from "@/lib/utils/cn";

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

const SCOPES: { id: HrmRoleScope; label: string }[] = [
  { id: "organization", label: "Organization" },
  { id: "department", label: "Department" },
  { id: "self", label: "Self only" },
];

export function HrmRoleEditorPanel({
  role,
  canManage,
  saving = false,
  onSave,
  onDuplicate,
  onDelete,
}: Props) {
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
    setActiveCategory(HRM_PERMISSION_CATEGORIES[0]!.id);
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

  const members = DEMO_HRM_ROLE_ASSIGNEES[role.id] ?? [];
  const memberCount = members.length || role.memberCount;
  const editable = canManage;

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

  return (
    <div className="flex h-full min-h-[520px] flex-col bg-white dark:bg-slate-900">
      <div className="shrink-0 border-b border-slate-200/90 px-4 py-3 dark:border-slate-800">
        <div className="flex flex-wrap items-center gap-2">
          <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-[#191970]/10 text-[#191970] dark:text-[#2277FF]">
            {role.isSystem ? <Lock className="h-3.5 w-3.5" /> : <Shield className="h-3.5 w-3.5" />}
          </span>

          {editable && !role.isSystem ? (
            <input
              value={draft.name}
              onChange={(e) => setDraft((d) => ({ ...d, name: e.target.value }))}
              className="min-w-[140px] flex-1 rounded-lg border border-slate-200 px-2.5 py-1.5 text-sm font-semibold text-slate-900 outline-none focus:border-[#191970] dark:border-slate-700 dark:bg-slate-950 dark:text-white"
              placeholder="Role name"
            />
          ) : (
            <h2 className="min-w-0 flex-1 truncate text-sm font-semibold text-slate-900 dark:text-white">{role.name}</h2>
          )}

          {editable ? (
            <select
              value={draft.scope}
              onChange={(e) => setDraft((d) => ({ ...d, scope: e.target.value as HrmRoleScope }))}
              className="h-8 rounded-lg border border-slate-200 px-2 text-xs text-slate-700 outline-none focus:border-[#191970] dark:border-slate-700 dark:bg-slate-950 dark:text-slate-200"
            >
              {SCOPES.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.label}
                </option>
              ))}
            </select>
          ) : null}

          <Link
            href={workspacePaths.hrmEmployees}
            className="inline-flex h-8 items-center gap-1 rounded-lg border border-slate-200 px-2.5 text-xs font-medium text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300"
          >
            <Users className="h-3.5 w-3.5" />
            {memberCount}
          </Link>

          {editable && isDirty ? (
            <>
              <button
                type="button"
                onClick={handleDiscard}
                disabled={saving}
                className="inline-flex h-8 items-center gap-1 rounded-lg border border-slate-200 px-2.5 text-xs font-semibold text-slate-600 hover:bg-slate-50 disabled:opacity-50"
              >
                <RotateCcw className="h-3 w-3" />
                Discard
              </button>
              <button
                type="button"
                onClick={handleSave}
                disabled={saving || !draft.name.trim()}
                className="inline-flex h-8 items-center gap-1 rounded-lg bg-[#191970] px-2.5 text-xs font-semibold text-white hover:bg-[#12124a] disabled:opacity-50"
              >
                <Check className="h-3 w-3" />
                {saving ? "Saving…" : "Save"}
              </button>
            </>
          ) : null}
        </div>

        {editable ? (
          <input
            value={draft.description}
            onChange={(e) => setDraft((d) => ({ ...d, description: e.target.value }))}
            placeholder="Description (optional)"
            className="mt-2 h-8 w-full rounded-lg border border-slate-200 px-2.5 text-xs text-slate-600 outline-none focus:border-[#191970] dark:border-slate-700 dark:bg-slate-950 dark:text-slate-300"
          />
        ) : draft.description ? (
          <p className="mt-1.5 text-xs text-slate-500">{draft.description}</p>
        ) : null}
      </div>

      <div className="shrink-0 border-b border-slate-200/90 px-4 py-2 dark:border-slate-800">
        <div className="flex flex-wrap gap-1">
          {HRM_PERMISSION_CATEGORIES.map((cat) => {
            const count = categoryCounts.get(cat.id) ?? 0;
            const active = activeCategory === cat.id;
            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => setActiveCategory(cat.id)}
                className={cn(
                  "rounded-md px-2.5 py-1 text-xs font-semibold transition",
                  active
                    ? "bg-[#191970] text-white"
                    : "text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800",
                )}
              >
                {cat.label}
                {count > 0 ? <span className={cn("ml-1 tabular-nums", active ? "text-white/75" : "text-slate-400")}>{count}</span> : null}
              </button>
            );
          })}
        </div>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto">
        <HrmPermissionMatrixPanel
          category={activeCategoryDef}
          selected={draft.permissionKeys}
          onChange={(next) => setDraft((d) => ({ ...d, permissionKeys: next }))}
          readOnly={!editable}
        />
      </div>

      {editable ? (
        <div className="shrink-0 border-t border-slate-200/90 px-4 py-2 dark:border-slate-800">
          <div className="flex flex-wrap items-center justify-between gap-2 text-[11px] text-slate-500">
            <span>
              {draft.permissionKeys.size} permissions on
              {onDuplicate && !role.isSystem ? (
                <>
                  {" · "}
                  <button type="button" onClick={onDuplicate} className="font-semibold text-[#191970] hover:underline dark:text-[#2277FF]">
                    Duplicate
                  </button>
                </>
              ) : null}
            </span>
            {!role.isSystem && onDelete ? (
              deleteConfirm ? (
                <span className="flex items-center gap-2">
                  <span className="text-rose-600">Delete role?</span>
                  <button type="button" onClick={() => setDeleteConfirm(false)} className="font-semibold text-slate-600">
                    Cancel
                  </button>
                  <button type="button" onClick={onDelete} className="font-semibold text-rose-600">
                    Confirm
                  </button>
                </span>
              ) : (
                <button type="button" onClick={() => setDeleteConfirm(true)} className="inline-flex items-center gap-1 font-semibold text-rose-600">
                  <Trash2 className="h-3 w-3" />
                  Delete
                </button>
              )
            ) : null}
          </div>
        </div>
      ) : null}
    </div>
  );
}
