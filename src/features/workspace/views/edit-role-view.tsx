"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Check, Lock, Search, Settings2, TrendingUp, CheckSquare, Coins, Brain, Shield } from "lucide-react";

import {
  PermissionMatrixPanel,
  formatResourceName,
  permissionDescription,
  permissionTitle,
} from "@/features/workspace/components/roles/permission-matrix-panel";
import { CrmStageAccessPanel } from "@/features/workspace/components/roles/crm-stage-access-panel";
import {
  CRM_PIPELINE_STAGES,
  PERMISSION_CATEGORIES,
  keysForCategory,
  permissionKey,
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

const CATEGORY_ICONS: Record<string, any> = {
  general: Settings2,
  crm: TrendingUp,
  kyc: CheckSquare,
  operations: Coins,
  intelligence: Brain,
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
  const [permissionSearch, setPermissionSearch] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [recordId, setRecordId] = useState<string>("");

  useEffect(() => {
    if (mode === "edit" && storedRole) {
      setRecordId(storedRole.id);
      setName(storedRole.name);
      setPermissionKeys(new Set(storedRole.permissionKeys));
      setStageAccess(cloneStageAccess(storedRole.stageAccess));
      setAllowedIps(storedRole.allowedIps || "");
      return;
    }
    if (mode === "create") {
      const empty = createEmptyRole();
      setRecordId(empty.id);
      setName("");
      setPermissionKeys(new Set());
      setStageAccess(buildDefaultStageAccess());
      setAllowedIps("");
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

  const allPermissions = useMemo(() => {
    const list: {
      key: string;
      categoryId: string;
      categoryLabel: string;
      moduleLabel: string;
      title: string;
      description: string;
    }[] = [];
    for (const cat of PERMISSION_CATEGORIES) {
      for (const mod of cat.modules) {
        for (const action of mod.actions) {
          const key = permissionKey(cat.id, mod.id, action.key);
          list.push({
            key,
            categoryId: cat.id,
            categoryLabel: cat.label,
            moduleLabel: formatResourceName(mod.label),
            title: permissionTitle(mod.label, action.key),
            description: permissionDescription(mod.label, action.key),
          });
        }
      }
    }
    return list;
  }, []);

  const filteredPermissions = useMemo(() => {
    const query = permissionSearch.trim().toLowerCase();
    if (!query) return [];
    return allPermissions.filter(
      (p) =>
        p.title.toLowerCase().includes(query) ||
        p.description.toLowerCase().includes(query) ||
        p.key.toLowerCase().includes(query) ||
        p.categoryLabel.toLowerCase().includes(query) ||
        p.moduleLabel.toLowerCase().includes(query),
    );
  }, [allPermissions, permissionSearch]);

  const onSave = () => {
    if (!name.trim()) {
      setError("Role name is required.");
      return;
    }
    setError(null);

    if (mode === "create") {
      const names = name.split(",").map((s) => s.trim()).filter(Boolean);
      if (names.length === 0) {
        setError("Role name is required.");
        return;
      }
      // Create multiple roles if comma-separated names are given
      names.forEach((roleName, index) => {
        upsertRole({
          id: `role_${Date.now()}_${index}`,
          name: roleName,
          permissionKeys: Array.from(permissionKeys),
          memberIds: [],
          allowedIps: allowedIps.trim(),
          stageAccess: cloneStageAccess(stageAccess),
        });
      });
    } else {
      // Edit mode updates a single role
      upsertRole({
        id: recordId || `role_${Date.now()}`,
        name: name.trim(),
        permissionKeys: Array.from(permissionKeys),
        memberIds: storedRole?.memberIds ?? [],
        allowedIps: allowedIps.trim(),
        systemLocked: storedRole?.systemLocked,
        stageAccess,
      });
    }
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
            className="inline-flex h-10 items-center rounded-lg px-4 text-sm font-bold text-slate-600 border border-slate-200 bg-white shadow-sm hover:bg-slate-50 transition dark:text-slate-350 dark:border-slate-850 dark:bg-slate-900 dark:hover:bg-slate-850"
          >
            Cancel
          </Link>
          <button
            type="button"
            onClick={onSave}
            className="inline-flex h-10 items-center gap-2 rounded-lg bg-[#191970] px-5 text-sm font-bold text-white shadow-md shadow-[#191970]/10 hover:bg-[#12124a] hover:-translate-y-0.5 transition active:translate-y-0"
          >
            <Check className="h-4 w-4" />
            Save
          </button>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-6 items-start">
        {/* Left Column — Role Details Card */}
        <div className="w-full lg:w-[320px] shrink-0 space-y-6">
          <section className="rounded-xl border border-slate-200/80 border-t-4 border-t-[#191970] bg-white p-5 shadow-md dark:border-slate-800 dark:bg-slate-900 dark:border-t-blue-500">
            <h2 className="text-sm font-bold text-slate-900 dark:text-white">1. Role Details</h2>
            <p className="mt-1.5 text-xs text-slate-400 font-medium leading-relaxed">
              Define the name and security configuration for this role policy.
            </p>

            <div className="mt-4 space-y-4">
              <div>
                <label htmlFor="role-name" className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                  Role Name
                </label>
                <input
                  id="role-name"
                  value={name}
                  onChange={(e) => {
                    setName(e.target.value);
                    if (error) setError(null);
                  }}
                  placeholder={mode === "create" ? "e.g. Sales Executive, Tech Lead, Assistant" : "e.g. Sales Executive"}
                  disabled={isSystemLocked}
                  className={cn(
                    "w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none transition focus:border-[#191970] focus:ring-2 focus:ring-[#191970]/10 dark:border-slate-700 dark:bg-slate-900 dark:text-white",
                    isSystemLocked && "cursor-not-allowed bg-slate-50 opacity-70",
                  )}
                />
                {mode === "create" && (
                  <p className="mt-2 text-[10px] text-slate-450 leading-relaxed">
                    💡 Tip: Separate names with commas to create multiple roles at once with the same permission set.
                  </p>
                )}
                {isSystemLocked && (
                  <span className="inline-flex items-center gap-1.5 text-[10px] font-bold text-slate-400 mt-2">
                    <Lock className="h-3 w-3" />
                    System role — name read-only
                  </span>
                )}
                {error && <p className="mt-2 text-xs font-semibold text-rose-600">{error}</p>}
              </div>

              <div className="border-t border-slate-100 pt-4 dark:border-slate-800">
                <label htmlFor="role-allowed-ips" className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                  IP Restrictions
                </label>
                <input
                  id="role-allowed-ips"
                  value={allowedIps}
                  onChange={(e) => setAllowedIps(e.target.value)}
                  disabled={isSystemLocked}
                  placeholder="e.g. 192.168.1.1, 203.0.113.0/24"
                  className={cn(
                    "w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none transition focus:border-[#191970] focus:ring-2 focus:ring-[#191970]/10 dark:border-slate-700 dark:bg-slate-900 dark:text-white",
                    isSystemLocked && "cursor-not-allowed bg-slate-50 opacity-70",
                  )}
                />
                <p className="mt-2 text-[10px] text-slate-450 leading-relaxed font-medium">
                  Limit sign-in to specific IPs or CIDR ranges. Leave blank to allow sign-in from anywhere. Separate with commas.
                </p>
              </div>
            </div>
          </section>
        </div>

        {/* Right Column — Permissions Section */}
        <div className="flex-1 w-full min-w-0">
          <section className="rounded-xl border border-slate-200/80 bg-white p-5 shadow-md dark:border-slate-800 dark:bg-slate-900">
            <h2 className="text-sm font-bold text-slate-900 dark:text-white">2. Permissions Configuration</h2>
            <p className="mt-1.5 text-xs text-slate-400 font-medium leading-relaxed">
              Configure access module permissions and stage guidelines for this role.
            </p>

            {/* Search input field */}
            <div className="mt-4 relative">
              <input
                id="permission-search"
                type="text"
                placeholder="Search permissions (e.g. create lead, delete role)..."
                value={permissionSearch}
                onChange={(e) => setPermissionSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 text-sm rounded-lg border border-slate-200 bg-white text-slate-900 outline-none transition focus:border-[#191970] focus:ring-2 focus:ring-[#191970]/10 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
              />
              <Search className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
            </div>

            {permissionSearch.trim() ? (
              <div className="mt-4 overflow-hidden rounded-xl border border-slate-200/80 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
                <div className="border-b border-slate-200/80 bg-slate-50/50 px-5 py-4 dark:border-slate-800 dark:bg-slate-950/40">
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                    Search Results ({filteredPermissions.length})
                  </h3>
                  <p className="mt-1 text-xs text-slate-500 font-medium">
                    Showing matching permission actions across all modules.
                  </p>
                </div>
                {filteredPermissions.length === 0 ? (
                  <div className="px-5 py-12 text-center text-sm text-slate-550">
                    No permissions found matching &ldquo;{permissionSearch}&rdquo;.
                  </div>
                ) : (
                  <ul className="divide-y divide-slate-100 dark:divide-slate-800 max-h-[420px] overflow-y-auto">
                    {filteredPermissions.map((item) => {
                      const enabled = permissionKeys.has(item.key);
                      return (
                        <li key={item.key}>
                          <button
                            type="button"
                            onClick={() => {
                              const next = new Set(permissionKeys);
                              if (next.has(item.key)) next.delete(item.key);
                              else next.add(item.key);
                              setPermissionKeys(next);
                            }}
                            className={cn(
                              "flex w-full items-start gap-4 px-5 py-3.5 text-left transition-all duration-200 border-l-2",
                              enabled
                                ? "border-[#191970] bg-gradient-to-r from-[#191970]/[0.02] to-white/0 hover:bg-[#191970]/[0.04] dark:border-blue-500 dark:from-blue-950/5 dark:to-slate-900/0"
                                : "border-transparent hover:bg-slate-50/50 dark:hover:bg-slate-800/20"
                            )}
                          >
                            <span
                              className={cn(
                                "mt-0.5 flex h-4.5 w-4.5 shrink-0 items-center justify-center rounded border-2 transition-all duration-200",
                                enabled
                                  ? "border-[#191970] bg-[#191970] text-white scale-105 shadow-sm shadow-[#191970]/10"
                                  : "border-slate-300 bg-white dark:border-slate-600 dark:bg-slate-900",
                              )}
                            >
                              {enabled ? <Check className="h-3 w-3 animate-fade-in" strokeWidth={3} /> : null}
                            </span>
                            <div className="min-w-0 flex-1">
                              <div className="flex flex-wrap items-center gap-2">
                                <span className={cn("text-sm font-bold transition", enabled ? "text-slate-900 dark:text-white" : "text-slate-700 dark:text-slate-300")}>
                                  {item.title}
                                </span>
                                <span className="inline-flex items-center gap-1 rounded bg-[#191970]/5 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-[#191970] dark:bg-blue-950/40 dark:text-blue-300">
                                  {item.categoryLabel} &rsaquo; {item.moduleLabel}
                                </span>
                              </div>
                              <p className="mt-1 text-xs text-slate-400 font-medium leading-relaxed">
                                {item.description}
                              </p>
                              <p className="mt-1 font-mono text-[9px] text-slate-400">
                                {item.key}
                              </p>
                            </div>
                          </button>
                        </li>
                      );
                    })}
                  </ul>
                )}
                <div className="border-t border-slate-100 bg-slate-50/50 px-5 py-3 text-xs text-slate-450 dark:border-slate-800 dark:bg-slate-950/40">
                  Clear search input to return to category-based selection tabs.
                </div>
              </div>
            ) : (
              <>
                <div className="mt-4 flex flex-wrap gap-2">
                  {PERMISSION_CATEGORIES.map((cat) => {
                    const active = cat.id === activeCategory;
                    const count = categoryCounts.get(cat.id) ?? 0;
                    const Icon = CATEGORY_ICONS[cat.id] || Shield;
                    return (
                      <button
                        key={cat.id}
                        type="button"
                        onClick={() => setActiveCategory(cat.id)}
                        className={cn(
                          "inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-bold transition duration-300 hover:scale-[1.02]",
                          active
                            ? "bg-[#191970] text-white shadow-md shadow-[#191970]/15 dark:bg-blue-650"
                            : "bg-white text-slate-655 border border-slate-200/80 hover:bg-slate-50 dark:bg-slate-900 dark:text-slate-300 dark:border-slate-800",
                        )}
                      >
                        <Icon className="h-4 w-4" />
                        <span>{cat.label}</span>
                        {count > 0 ? (
                          <span
                            className={cn(
                              "ml-1 rounded-md px-1.5 py-0.5 text-[10px] font-bold tabular-nums",
                              active ? "bg-white/20 text-white" : "bg-[#191970]/10 text-[#191970] dark:bg-white/10 dark:text-white",
                            )}
                          >
                            {count}
                          </span>
                        ) : null}
                      </button>
                    );
                  })}
                </div>

                <div className="mt-4 overflow-hidden rounded-xl border border-slate-200/80 bg-white shadow-md dark:border-slate-800 dark:bg-slate-900">
                  <PermissionMatrixPanel
                    category={activeCategoryDef}
                    selected={permissionKeys}
                    onChange={setPermissionKeys}
                  />
                  {activeCategory === "crm" ? (
                    <CrmStageAccessPanel stageAccess={stageAccess} onChange={setStageAccess} />
                  ) : null}
                </div>
              </>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}
