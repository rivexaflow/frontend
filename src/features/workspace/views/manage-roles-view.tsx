"use client";

import { useState } from "react";
import { Plus, Shield } from "lucide-react";
import Link from "next/link";

import { EnterprisePageShell } from "@/features/workspace/components/enterprise/enterprise-page-shell";
import { NewRoleCard, RoleCard } from "@/features/workspace/components/roles/role-card";
import { workspacePaths } from "@/lib/workspace/paths";
import { workspaceRolesStore } from "@/stores/workspace-roles.store";

export function ManageRolesView() {
  const roles = workspaceRolesStore((s) => s.roles);
  const removeRole = workspaceRolesStore((s) => s.removeRole);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

  const handleDelete = (id: string) => {
    if (confirmDelete !== id) {
      setConfirmDelete(id);
      return;
    }
    removeRole(id);
    setConfirmDelete(null);
  };

  return (
    <EnterprisePageShell
      eyebrow="Governance · Roles"
      title="Manage roles"
      description="Define profile roles, granular module permissions, and CRM stage access for your workspace team."
      metrics={[
        { label: "Active roles", value: String(roles.length), icon: Shield, tone: "purple" },
      ]}
      toolbar={
        <Link
          href={workspacePaths.roleNew}
          className="inline-flex h-10 items-center gap-2 rounded-xl bg-blue-600 px-4 text-sm font-semibold text-white shadow-md shadow-blue-600/25 transition hover:bg-blue-700"
        >
          <Plus className="h-4 w-4" />
          Add role
        </Link>
      }
    >
      {confirmDelete ? (
        <div
          role="status"
          className="mb-4 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900"
        >
          Click delete again on the same role to confirm removal.
        </div>
      ) : null}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {roles.map((role) => (
          <RoleCard key={role.id} role={role} onDelete={handleDelete} />
        ))}
        <NewRoleCard />
      </div>
    </EnterprisePageShell>
  );
}
