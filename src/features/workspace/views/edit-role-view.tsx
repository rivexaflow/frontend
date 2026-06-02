"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ChevronRight } from "lucide-react";

import { PermissionMatrixPanel } from "@/features/workspace/components/roles/permission-matrix-panel";
import { CrmStageAccessPanel } from "@/features/workspace/components/roles/crm-stage-access-panel";
import {
  CRM_PIPELINE_STAGES,
  PERMISSION_CATEGORIES,
} from "@/features/workspace/data/workspace-permissions-catalog";
import type { WorkspaceRoleRecord } from "@/features/workspace/data/workspace-roles-demo";
import {
  cloneStageAccess,
  createEmptyRole,
  workspaceRolesStore,
} from "@/stores/workspace-roles.store";
import { workspacePaths } from "@/lib/workspace/paths";
import { inputClassName } from "@/features/workspace/components/enterprise/enterprise-form-modal";
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
  const [allowedIps, setAllowedIps] = useState("");
  const [permissionKeys, setPermissionKeys] = useState<Set<string>>(new Set());
  const [stageAccess, setStageAccess] = useState<WorkspaceRoleRecord["stageAccess"]>({});
  const [activeCategory, setActiveCategory] = useState(PERMISSION_CATEGORIES[0]!.id);
  const [error, setError] = useState<string | null>(null);
  const [recordId, setRecordId] = useState<string>("");

  useEffect(() => {
    if (mode === "edit" && storedRole) {
      setRecordId(storedRole.id);
      setName(storedRole.name);
      setAllowedIps(storedRole.allowedIps);
      setPermissionKeys(new Set(storedRole.permissionKeys));
      setStageAccess(cloneStageAccess(storedRole.stageAccess));
      return;
    }
    if (mode === "create") {
      const empty = createEmptyRole();
      setRecordId(empty.id);
      setName("");
      setAllowedIps("");
      setPermissionKeys(new Set());
      setStageAccess(buildDefaultStageAccess());
    }
  }, [mode, storedRole]);

  const activeCategoryDef = useMemo(
    () => PERMISSION_CATEGORIES.find((c) => c.id === activeCategory) ?? PERMISSION_CATEGORIES[0]!,
    [activeCategory],
  );

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
      allowedIps: allowedIps.trim(),
      systemLocked: storedRole?.systemLocked,
      stageAccess,
    });
    router.push(workspacePaths.role);
  };

  if (mode === "edit" && roleId && !storedRole) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center dark:border-slate-800 dark:bg-slate-900">
        <p className="text-sm text-slate-600">Role not found.</p>
        <Link href={workspacePaths.role} className="mt-4 inline-block text-sm font-semibold text-blue-600">
          Back to roles
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <header className="border-b border-slate-200/80 pb-5 dark:border-slate-800">
        <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-blue-600">Governance · Roles</p>
        <h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
          {mode === "create" ? "Create role" : "Edit role"}
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          Configure module permissions and CRM stage access for this profile role.
        </p>
      </header>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,280px)_1fr]">
        <aside className="space-y-4">
          <div className="rounded-2xl border border-slate-200/90 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <label htmlFor="role-name" className="text-xs font-semibold text-slate-700 dark:text-slate-300">
              Name *
            </label>
            <input
              id="role-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Sales Executive"
              className={cn(inputClassName, "mt-1.5")}
            />
            {error ? <p className="mt-2 text-xs font-medium text-rose-600">{error}</p> : null}
          </div>

          <div className="rounded-2xl border border-slate-200/90 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <label htmlFor="role-ips" className="text-xs font-semibold text-slate-700 dark:text-slate-300">
              Allowed IP addresses (optional)
            </label>
            <textarea
              id="role-ips"
              value={allowedIps}
              onChange={(e) => setAllowedIps(e.target.value)}
              rows={3}
              placeholder="Enter IP addresses separated by comma"
              className={cn(inputClassName, "mt-1.5 min-h-[80px] resize-none py-2")}
            />
            <p className="mt-2 text-[11px] text-slate-500">Leave empty for no restriction.</p>
          </div>

          <nav className="overflow-hidden rounded-2xl border border-slate-200/90 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
            {PERMISSION_CATEGORIES.map((cat) => {
              const active = cat.id === activeCategory;
              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setActiveCategory(cat.id)}
                  className={cn(
                    "flex w-full items-center justify-between border-b border-slate-100 px-4 py-3 text-left text-sm font-semibold transition last:border-0 dark:border-slate-800",
                    active
                      ? "bg-blue-600 text-white"
                      : "text-slate-700 hover:bg-slate-50 dark:text-slate-300 dark:hover:bg-slate-800/50",
                  )}
                >
                  {cat.label}
                  <ChevronRight className={cn("h-4 w-4", active ? "text-white/90" : "text-slate-400")} />
                </button>
              );
            })}
          </nav>
        </aside>

        <div>
          <PermissionMatrixPanel
            category={activeCategoryDef}
            selected={permissionKeys}
            onChange={setPermissionKeys}
          />
          {activeCategory === "crm" ? (
            <CrmStageAccessPanel stageAccess={stageAccess} onChange={setStageAccess} />
          ) : null}
        </div>
      </div>

      <footer className="flex flex-col-reverse justify-end gap-2 border-t border-slate-200/80 pt-5 sm:flex-row dark:border-slate-800">
        <Link
          href={workspacePaths.role}
          className="inline-flex h-11 items-center justify-center rounded-xl border border-slate-200 px-5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300"
        >
          Cancel
        </Link>
        <button
          type="button"
          onClick={onSave}
          className="inline-flex h-11 items-center justify-center rounded-xl bg-blue-600 px-6 text-sm font-semibold text-white shadow-md shadow-blue-600/25 transition hover:bg-blue-700"
        >
          {mode === "create" ? "Create" : "Update"}
        </button>
      </footer>
    </div>
  );
}
