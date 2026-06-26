"use client";

import { useEffect, useMemo, useState } from "react";
import { KeyRound, Lock, Shield, Users } from "lucide-react";

import { RoleInspector } from "@/features/workspace/components/roles/role-inspector";
import { RolesCatalogList } from "@/features/workspace/components/roles/roles-catalog-list";
import {
  RolesDirectoryToolbar,
  type RoleAssignmentFilter,
  type RoleTypeFilter,
} from "@/features/workspace/components/roles/roles-directory-toolbar";
import { IpPolicyModal } from "@/features/workspace/components/roles/ip-policy-modal";
import type { WorkspaceRoleRecord } from "@/features/workspace/data/workspace-roles-demo";
import {
  cloneStageAccess,
  workspaceRolesStore,
} from "@/stores/workspace-roles.store";
import { cn } from "@/lib/utils/cn";

export function ManageRolesView() {
  const roles = workspaceRolesStore((s) => s.roles);
  const removeRole = workspaceRolesStore((s) => s.removeRole);
  const upsertRole = workspaceRolesStore((s) => s.upsertRole);

  const [query, setQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState<RoleTypeFilter>("all");
  const [assignmentFilter, setAssignmentFilter] = useState<RoleAssignmentFilter>("all");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [isIpModalOpen, setIsIpModalOpen] = useState(false);

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

  const assignedMemberIds = new Set(roles.flatMap((r) => r.memberIds));
  const totalPermissions = roles.reduce((sum, r) => sum + r.permissionKeys.length, 0);
  const systemRoles = roles.filter((r) => r.systemLocked).length;

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
      <header className="mb-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 w-full">
          {[
            { label: "Active Policies", value: roles.length, icon: Shield, desc: "Configured roles", color: "from-blue-500/10 to-indigo-500/10 text-[#191970] dark:text-blue-400" },
            { label: "Total Permission Grants", value: totalPermissions, icon: KeyRound, desc: "Assigned rights", color: "from-amber-500/10 to-orange-500/10 text-amber-600" },
            { label: "Assigned Members", value: assignedMemberIds.size, icon: Users, desc: "Active workspace users", color: "from-emerald-500/10 to-teal-500/10 text-emerald-600" },
            { label: "System Defaults", value: systemRoles, icon: Lock, desc: "Read-only templates", color: "from-purple-500/10 to-pink-500/10 text-purple-600" },
          ].map((stat) => (
            <div
              key={stat.label}
              className="group relative overflow-hidden rounded-2xl border border-slate-200/90 bg-white p-4 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-md dark:border-slate-800 dark:bg-slate-900"
            >
              <div className="flex items-center justify-between">
                <div>
                  <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">{stat.label}</span>
                  <span className="mt-1 block text-2xl font-bold tabular-nums text-slate-900 dark:text-white leading-none">
                    {stat.value}
                  </span>
                </div>
                <div className={cn("flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br transition-all group-hover:scale-110", stat.color)}>
                  <stat.icon className="h-5 w-5" />
                </div>
              </div>
              <p className="mt-2 text-[10px] text-slate-550 dark:text-slate-450">{stat.desc}</p>
            </div>
          ))}
        </div>
      </header>

      <div className="overflow-hidden rounded-2xl border border-slate-200/90 bg-white shadow-md dark:border-slate-800 dark:bg-slate-900">
        <RolesDirectoryToolbar
          query={query}
          onQueryChange={setQuery}
          typeFilter={typeFilter}
          onTypeFilterChange={setTypeFilter}
          assignmentFilter={assignmentFilter}
          onAssignmentFilterChange={setAssignmentFilter}
          resultCount={filtered.length}
          onManageIpPolicies={() => setIsIpModalOpen(true)}
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

      <IpPolicyModal open={isIpModalOpen} onClose={() => setIsIpModalOpen(false)} />
    </div>
  );
}
