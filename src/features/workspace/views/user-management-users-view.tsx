"use client";

import { useMemo, useState } from "react";
import { AnimatePresence } from "framer-motion";

import { InviteMemberWizard } from "@/features/workspace/components/user-management/invite-member-wizard";
import {
  MembersDirectoryTable,
} from "@/features/workspace/components/user-management/members-directory-table";
import {
  MembersDirectoryToolbar,
  type MembersFilters,
} from "@/features/workspace/components/user-management/members-directory-toolbar";
import { UserDetailPanel } from "@/features/workspace/components/user-management/user-detail-panel";
import {
  DEMO_WORKSPACE_USERS,
  type WorkspaceUserRecord,
} from "@/features/workspace/data/workspace-users-demo";

const EMPTY_FILTERS: MembersFilters = {
  query: "",
  role: "",
  status: "",
  department: "",
};

export function UserManagementUsersView() {
  const [users, setUsers] = useState<WorkspaceUserRecord[]>(DEMO_WORKSPACE_USERS);
  const [inviteOpen, setInviteOpen] = useState(false);
  const [filters, setFilters] = useState<MembersFilters>(EMPTY_FILTERS);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const filtered = useMemo(() => {
    const q = filters.query.trim().toLowerCase();
    return users.filter((user) => {
      if (q) {
        const hay = `${user.name} ${user.email}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      if (filters.role && user.profileRole !== filters.role) return false;
      if (filters.status && user.status !== filters.status) return false;
      if (filters.department && user.department !== filters.department) return false;
      return true;
    });
  }, [filters, users]);

  const selected = selectedId ? users.find((u) => u.id === selectedId) ?? null : null;

  const departments = useMemo(
    () => [...new Set(users.map((u) => u.department))].sort(),
    [users],
  );

  const activeCount = users.filter((u) => u.status === "active").length;
  const invitedCount = users.filter((u) => u.status === "invited").length;

  const updateSelected = (patch: Partial<WorkspaceUserRecord>) => {
    if (!selectedId) return;
    setUsers((prev) => prev.map((u) => (u.id === selectedId ? { ...u, ...patch } : u)));
  };

  const removeSelected = () => {
    if (!selectedId) return;
    setUsers((prev) => prev.filter((u) => u.id !== selectedId));
    setSelectedId(null);
  };

  return (
    <div className="pb-10">
      <header className="mb-6">
        <p className="text-xs font-medium text-slate-500">Governance · User management</p>
        <h1 className="mt-1 text-2xl font-semibold text-slate-900 dark:text-white">Workspace members</h1>
        <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
          {users.length} members · {activeCount} active
          {invitedCount > 0 ? ` · ${invitedCount} invited` : ""}
          {" · "}Click a row to view details
        </p>
      </header>

      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <MembersDirectoryToolbar
          filters={filters}
          onChange={setFilters}
          departments={departments}
          onInvite={() => setInviteOpen(true)}
          resultCount={filtered.length}
        />
        <MembersDirectoryTable
          users={filtered}
          selectedId={selectedId}
          onSelect={(user) => setSelectedId(user.id)}
        />
      </div>

      <AnimatePresence>
        {selected ? (
          <UserDetailPanel
            key={selected.id}
            user={selected}
            onClose={() => setSelectedId(null)}
            onUpdate={updateSelected}
            onRemove={removeSelected}
          />
        ) : null}
      </AnimatePresence>

      <AnimatePresence>
        {inviteOpen ? (
          <InviteMemberWizard
            open={inviteOpen}
            onClose={() => setInviteOpen(false)}
            onCreated={(user) => {
              setUsers((prev) => [user, ...prev]);
              setSelectedId(user.id);
            }}
          />
        ) : null}
      </AnimatePresence>
    </div>
  );
}
