"use client";

import { useMemo, useState } from "react";
import { AnimatePresence } from "framer-motion";
import { ShieldCheck, UserCheck, UserPlus, Users } from "lucide-react";

import { InviteMemberWizard } from "@/features/workspace/components/user-management/invite-member-wizard";
import { BulkUserImportModal } from "@/features/workspace/components/user-management/bulk-user-import-modal";
import { MembersDirectoryGrid } from "@/features/workspace/components/user-management/members-directory-grid";
import { MembersDirectoryTable } from "@/features/workspace/components/user-management/members-directory-table";
import {
  MembersDirectoryToolbar,
  type MembersFilters,
  type MembersViewMode,
} from "@/features/workspace/components/user-management/members-directory-toolbar";
import { UserDetailPanel } from "@/features/workspace/components/user-management/user-detail-panel";
import { useListSearchFromUrl } from "@/features/workspace/hooks/use-list-search-from-url";
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
  const [showBulkImportModal, setShowBulkImportModal] = useState(false);
  const [filters, setFilters] = useState<MembersFilters>(EMPTY_FILTERS);
  useListSearchFromUrl((value) => setFilters((current) => ({ ...current, query: value })));
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<MembersViewMode>("grid");

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
  const mfaCount = users.filter((u) => u.mfaEnabled).length;

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
        <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Governance · User management</p>
        <div className="mt-1 flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">Workspace members</h1>
            <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
              Directory of provisioned accounts, roles, and module access.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            {[
              { label: "Total", value: users.length, icon: Users },
              { label: "Active", value: activeCount, icon: UserCheck },
              { label: "Invited", value: invitedCount, icon: UserPlus },
              { label: "MFA", value: mfaCount, icon: ShieldCheck },
            ].map((stat) => (
              <div
                key={stat.label}
                className="flex items-center gap-2 rounded-xl border border-slate-200/80 bg-white px-3 py-2 shadow-sm dark:border-slate-800 dark:bg-slate-900"
              >
                <stat.icon className="h-3.5 w-3.5 text-slate-400" />
                <span className="text-xs text-slate-500">{stat.label}</span>
                <span className="text-sm font-bold text-slate-900 dark:text-white">{stat.value}</span>
              </div>
            ))}
          </div>
        </div>
      </header>

      <div className="overflow-hidden rounded-2xl border border-slate-200/90 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <MembersDirectoryToolbar
          filters={filters}
          onChange={setFilters}
          departments={departments}
          onInvite={() => setInviteOpen(true)}
          onBulkImport={() => setShowBulkImportModal(true)}
          resultCount={filtered.length}
          viewMode={viewMode}
          onViewModeChange={setViewMode}
        />

        {viewMode === "grid" ? (
          <MembersDirectoryGrid
            users={filtered}
            selectedId={selectedId}
            onSelect={(user) => setSelectedId(user.id)}
            onInvite={() => setInviteOpen(true)}
          />
        ) : (
          <MembersDirectoryTable
            users={filtered}
            selectedId={selectedId}
            onSelect={(user) => setSelectedId(user.id)}
          />
        )}
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

      {showBulkImportModal && (
        <BulkUserImportModal
          open={showBulkImportModal}
          onClose={() => setShowBulkImportModal(false)}
          onImport={(newUsers) => {
            setUsers((prev) => [...newUsers, ...prev]);
            if (newUsers[0]) setSelectedId(newUsers[0].id);
          }}
        />
      )}
    </div>
  );
}
