"use client";

import { useEffect, useMemo, useState } from "react";
import { Shield } from "lucide-react";

import { RoleInspector } from "@/features/workspace/components/roles/role-inspector";
import { RolesCatalogList } from "@/features/workspace/components/roles/roles-catalog-list";
import {
  RolesDirectoryToolbar,
  type RoleAssignmentFilter,
  type RoleTypeFilter,
} from "@/features/workspace/components/roles/roles-directory-toolbar";
import type { WorkspaceRoleRecord } from "@/features/workspace/data/workspace-roles-demo";
import {
  cloneStageAccess,
  workspaceRolesStore,
} from "@/stores/workspace-roles.store";

export function ManageRolesView() {
  const roles = workspaceRolesStore((s) => s.roles);
  const removeRole = workspaceRolesStore((s) => s.removeRole);
  const upsertRole = workspaceRolesStore((s) => s.upsertRole);

  const [query, setQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState<RoleTypeFilter>("all");
  const [assignmentFilter, setAssignmentFilter] = useState<RoleAssignmentFilter>("all");
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return roles.filter((r) => {
      if (q && !r.name.toLowerCase().includes(q)) return false;
      if (typeFilter === "system" && !r.systemLocked) return false;
      if (typeFilter === "custom" && r.systemLocked) return false;
      if (assignmentFilter === "assigned" && r.memberIds.length === 0) return false;
      if (assignmentFilter === "unassigned" && r.memberIds.length > 0) return false;
      return true;
    });
  }, [assignmentFilter, query, roles, typeFilter]);

  const selected = selectedId ? roles.find((r) => r.id === selectedId) ?? null : null;

  useEffect(() => {
    if (filtered.length === 0) {
      setSelectedId(null);
      return;
    }
    if (!selectedId || !filtered.some((r) => r.id === selectedId)) {
      setSelectedId(filtered[0]!.id);
    }
  }, [filtered, selectedId]);

  const handleDelete = (id: string) => {
    removeRole(id);
  };

  const handleDuplicate = (role: WorkspaceRoleRecord) => {
    const copy: WorkspaceRoleRecord = {
      id: `role_${Date.now()}`,
      name: `${role.name} (copy)`,
      permissionKeys: [...role.permissionKeys],
      memberIds: [],
      allowedIps: role.allowedIps,
      stageAccess: cloneStageAccess(role.stageAccess),
    };
    upsertRole(copy);
    setSelectedId(copy.id);
  };

  return (
    <div className="pb-10">
      <header className="mb-5">
        <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
          Governance · Roles & permissions
        </p>
        <h1 className="mt-1 text-xl font-bold tracking-tight text-slate-900 dark:text-white">Roles & permissions</h1>
        <p className="mt-1 max-w-2xl text-sm text-slate-600 dark:text-slate-400">
          Select a role to review members and permissions. Use Edit permissions to change access.
        </p>
      </header>

      <div className="overflow-hidden rounded-xl border border-slate-200/90 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <RolesDirectoryToolbar
          query={query}
          onQueryChange={setQuery}
          typeFilter={typeFilter}
          onTypeFilterChange={setTypeFilter}
          assignmentFilter={assignmentFilter}
          onAssignmentFilterChange={setAssignmentFilter}
          resultCount={filtered.length}
        />

        <div className="grid min-h-[560px] lg:grid-cols-[minmax(280px,340px)_1fr]">
          <div className="max-h-[min(720px,70vh)] overflow-y-auto border-b border-slate-200/90 lg:border-b-0 lg:border-r dark:border-slate-800">
            <RolesCatalogList
              roles={filtered}
              selectedId={selectedId}
              onSelect={(role) => setSelectedId(role.id)}
            />
          </div>

          <div className="min-h-[400px]">
            {selected ? (
              <RoleInspector
                key={selected.id}
                role={selected}
                onDelete={!selected.systemLocked ? () => handleDelete(selected.id) : undefined}
                onDuplicate={!selected.systemLocked ? () => handleDuplicate(selected) : undefined}
              />
            ) : (
              <div className="flex h-full min-h-[400px] flex-col items-center justify-center px-8 text-center">
                <Shield className="h-10 w-10 text-slate-300" />
                <p className="mt-4 text-sm font-semibold text-slate-800 dark:text-slate-200">Select a role policy</p>
                <p className="mt-1 max-w-sm text-sm text-slate-500">
                  Choose a role from the catalog to review permissions, assigned members, and pipeline access.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
