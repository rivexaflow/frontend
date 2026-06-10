"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Check, Lock } from "lucide-react";

import { PermissionMatrixPanel } from "@/features/workspace/components/roles/permission-matrix-panel";
import { CrmStageAccessPanel } from "@/features/workspace/components/roles/crm-stage-access-panel";
import {
  CRM_PIPELINE_STAGES,
  PERMISSION_CATEGORIES,
  keysForCategory,
} from "@/features/workspace/data/workspace-permissions-catalog";
import type { WorkspaceRoleRecord } from "@/features/workspace/data/workspace-roles-demo";
import {
  cloneStageAccess,
  createEmptyRole,
  workspaceRolesStore,
} from "@/stores/workspace-roles.store";
import { workspacePaths } from "@/lib/workspace/paths";
import { cn } from "@/lib/utils/cn";

type Props = {
  roleId?: string;
  mode: "create" | "edit";
};

function buildDefaultStageAccess(): WorkspaceRoleRecord["stageAccess"] {
  return Object.fromEntries(
    CRM_PIPELINE_STAGES.map((s) => [s.id, { view: false, move: false, edit: false }]),
  );
}

export function EditRoleView({ roleId, mode }: Props) {
  const router = useRouter();
  const storedRole = workspaceRolesStore((s) =>
    roleId ? s.roles.find((r) => r.id === roleId) : undefined,
  );
  const upsertRole = workspaceRolesStore((s) => s.upsertRole);

  const [name, setName] = useState("");
  const [permissionKeys, setPermissionKeys] = useState<Set<string>>(new Set());
  const [stageAccess, setStageAccess] = useState<WorkspaceRoleRecord["stageAccess"]>({});
  const [activeCategory, setActiveCategory] = useState(PERMISSION_CATEGORIES[0]!.id);
  const [error, setError] = useState<string | null>(null);
  const [recordId, setRecordId] = useState<string>("");

  useEffect(() => {
    if (mode === "edit" && storedRole) {
      setRecordId(storedRole.id);
      setName(storedRole.name);
      setPermissionKeys(new Set(storedRole.permissionKeys));
      setStageAccess(cloneStageAccess(storedRole.stageAccess));
      return;
    }
    if (mode === "create") {
      const empty = createEmptyRole();
      setRecordId(empty.id);
      setName("");
      setPermissionKeys(new Set());
      setStageAccess(buildDefaultStageAccess());
    }
  }, [mode, storedRole]);

  const activeCategoryDef = useMemo(
    () => PERMISSION_CATEGORIES.find((c) => c.id === activeCategory) ?? PERMISSION_CATEGORIES[0]!,
    [activeCategory],
  );

  const categoryCounts = useMemo(() => {
    const map = new Map<string, number>();
    for (const cat of PERMISSION_CATEGORIES) {
      const keys = keysForCategory(cat.id);
      map.set(cat.id, keys.filter((k) => permissionKeys.has(k)).length);
    }
    return map;
  }, [permissionKeys]);

  const onSave = () => {
    if (!name.trim()) {
      setError("Role name is required.");
      return;
    }
    setError(null);
    upsertRole({
      id: recordId || `role_${Date.now()}`,
      name: name.trim(),
      permissionKeys: Array.from(permissionKeys),
      memberIds: storedRole?.memberIds ?? [],
      allowedIps: storedRole?.allowedIps ?? "",
      systemLocked: storedRole?.systemLocked,
      stageAccess,
    });
    router.push(workspacePaths.role);
  };

  if (mode === "edit" && roleId && !storedRole) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center dark:border-slate-800 dark:bg-slate-900">
        <p className="text-sm text-slate-600">Role not found.</p>
        <Link href={workspacePaths.role} className="mt-4 inline-block text-sm font-semibold text-[#191970]">
          Back to roles
        </Link>
      </div>
    );
  }

  const isSystemLocked = Boolean(storedRole?.systemLocked);

  return (
    <div className="mx-auto max-w-5xl pb-8">
      <div className="mb-8 flex flex-wrap items-start justify-between gap-4">
        <div>
          <Link
            href={workspacePaths.role}
            className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 transition hover:text-[#191970]"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to roles
          </Link>
          <h1 className="mt-2 text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            {mode === "create" ? "Create role" : "Edit role"}
          </h1>
        </div>
        <div className="flex items-center gap-2">
          <Link
            href={workspacePaths.role}
            className="inline-flex h-10 items-center rounded-lg px-4 text-sm font-semibold text-slate-600 ring-1 ring-slate-200 transition hover:bg-white dark:text-slate-300 dark:ring-slate-700"
          >
            Cancel
          </Link>
          <button
            type="button"
            onClick={onSave}
            className="inline-flex h-10 items-center gap-2 rounded-lg bg-[#191970] px-5 text-sm font-semibold text-white shadow-sm transition hover:bg-[#12124a]"
          >
            <Check className="h-4 w-4" />
            Save
          </button>
        </div>
      </div>

      {/* Step 1 — Name */}
      <section className="mb-8">
        <h2 className="text-sm font-semibold text-slate-900 dark:text-white">1. Role name</h2>
        <p className="mt-1 text-sm text-slate-500">Give this role a clear name your team will recognize.</p>
        <div className="mt-3 flex flex-wrap items-center gap-3">
          <input
            id="role-name"
            value={name}
            onChange={(e) => {
              setName(e.target.value);
              if (error) setError(null);
            }}
            placeholder="e.g. Sales Executive"
            disabled={isSystemLocked}
            className={cn(
              "w-full max-w-md rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-base text-slate-900 outline-none transition focus:border-[#191970] focus:ring-2 focus:ring-[#191970]/10 dark:border-slate-700 dark:bg-slate-900 dark:text-white",
              isSystemLocked && "cursor-not-allowed bg-slate-50 opacity-70",
            )}
          />
          {isSystemLocked ? (
            <span className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-500">
              <Lock className="h-3.5 w-3.5" />
              System role — name cannot be changed
            </span>
          ) : null}
        </div>
        {error ? <p className="mt-2 text-sm font-medium text-rose-600">{error}</p> : null}
      </section>

      {/* Step 2 — Permissions */}
      <section>
        <h2 className="text-sm font-semibold text-slate-900 dark:text-white">2. Permissions</h2>
        <p className="mt-1 text-sm text-slate-500">
          Choose a module, pick an area, then set what this role is allowed to do.
        </p>

        <div className="mt-4 flex flex-wrap gap-2">
          {PERMISSION_CATEGORIES.map((cat) => {
            const active = cat.id === activeCategory;
            const count = categoryCounts.get(cat.id) ?? 0;
            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => setActiveCategory(cat.id)}
                className={cn(
                  "rounded-full px-4 py-2 text-sm font-semibold transition",
                  active
                    ? "bg-[#191970] text-white shadow-sm"
                    : "bg-white text-slate-600 ring-1 ring-slate-200 hover:bg-slate-50 dark:bg-slate-900 dark:text-slate-300 dark:ring-slate-700",
                )}
              >
                {cat.label}
                {count > 0 ? (
                  <span
                    className={cn(
                      "ml-1.5 rounded-full px-1.5 py-0.5 text-[10px] font-bold",
                      active ? "bg-white/20" : "bg-[#191970]/10 text-[#191970]",
                    )}
                  >
                    {count}
                  </span>
                ) : null}
              </button>
            );
          })}
        </div>

        <div className="mt-4 overflow-hidden rounded-xl border border-slate-200/90 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <PermissionMatrixPanel
            category={activeCategoryDef}
            selected={permissionKeys}
            onChange={setPermissionKeys}
          />
          {activeCategory === "crm" ? (
            <CrmStageAccessPanel stageAccess={stageAccess} onChange={setStageAccess} />
          ) : null}
        </div>
      </section>
    </div>
  );
}
