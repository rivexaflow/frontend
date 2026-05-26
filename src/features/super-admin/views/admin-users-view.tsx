"use client";

import { useCallback, useEffect, useState } from "react";
import { Users } from "lucide-react";

import { fetchAdminUsers, patchUserRole, patchUserStatus } from "@/lib/api/admin";
import type { AdminUser, UserStatus } from "@/types/admin";
import type { Role } from "@/types/auth";
import { StatusBadge } from "@/components/shared/status-badge/status-badge";
import {
  AdminAlert,
  AdminAvatar,
  AdminEmptyState,
  AdminInlineSelect,
  AdminPagination,
  AdminPanel,
  AdminSearchInput,
  AdminSkeletonRows,
  AdminTable,
  AdminTableWrap,
  AdminTd,
  AdminTh,
  AdminThead,
  AdminToolbar,
  AdminTr,
  AdminTbody,
  adminSelectClass,
} from "@/features/super-admin/components/admin-ui";
import { SuperAdminAppShell } from "@/features/super-admin/components/super-admin-app-shell";
import { cn } from "@/lib/utils";

const ROLES: Role[] = ["USER", "ADMIN", "SUPER_ADMIN"];
const STATUSES: UserStatus[] = ["ACTIVE", "SUSPENDED", "PENDING"];

function statusTone(s: UserStatus): "success" | "warning" | "danger" | "neutral" {
  if (s === "ACTIVE") return "success";
  if (s === "SUSPENDED") return "danger";
  return "warning";
}

export function AdminUsersView() {
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<UserStatus | "">("");
  const [role, setRole] = useState<Role | "">("");
  const [page, setPage] = useState(1);
  const [data, setData] = useState<Awaited<ReturnType<typeof fetchAdminUsers>> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionId, setActionId] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await fetchAdminUsers({ search, status, role, page, pageSize: 10 });
      setData(result);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load users");
    } finally {
      setLoading(false);
    }
  }, [search, status, role, page]);

  useEffect(() => {
    const t = window.setTimeout(load, 300);
    return () => window.clearTimeout(t);
  }, [load]);

  const onStatusChange = async (user: AdminUser, next: UserStatus) => {
    setActionId(user.id);
    try {
      await patchUserStatus(user.id, next);
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Update failed");
    } finally {
      setActionId(null);
    }
  };

  const onRoleChange = async (user: AdminUser, next: Role) => {
    setActionId(user.id);
    try {
      await patchUserRole(user.id, next);
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Update failed");
    } finally {
      setActionId(null);
    }
  };

  const rows = data?.items ?? [];

  return (
    <SuperAdminAppShell
      title="Users"
      description="Search, filter, and govern platform accounts — update roles and access status with full audit intent."
    >
      {error ? <AdminAlert>{error}</AdminAlert> : null}

      <AdminToolbar>
        <AdminSearchInput
          value={search}
          onChange={(v) => {
            setPage(1);
            setSearch(v);
          }}
          placeholder="Search name, email, company…"
        />
        <select
          value={status}
          onChange={(e) => {
            setPage(1);
            setStatus(e.target.value as UserStatus | "");
          }}
          className={adminSelectClass}
        >
          <option value="">All statuses</option>
          {STATUSES.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
        <select
          value={role}
          onChange={(e) => {
            setPage(1);
            setRole(e.target.value as Role | "");
          }}
          className={adminSelectClass}
        >
          <option value="">All roles</option>
          {ROLES.map((r) => (
            <option key={r} value={r}>
              {r}
            </option>
          ))}
        </select>
      </AdminToolbar>

      <AdminPanel title="User directory" description={`${data?.total ?? 0} accounts on platform`}>
        <AdminTableWrap>
          <AdminTable minWidth="800px">
            <AdminThead>
              <AdminTh>User</AdminTh>
              <AdminTh>Company</AdminTh>
              <AdminTh>Role</AdminTh>
              <AdminTh>Status</AdminTh>
              <AdminTh>Last login</AdminTh>
            </AdminThead>
            <AdminTbody>
              {loading ? (
                <AdminSkeletonRows cols={5} />
              ) : rows.length === 0 ? (
                <tr>
                  <td colSpan={5}>
                    <AdminEmptyState
                      icon={Users}
                      title="No users match your filters"
                      description="Try clearing search or filters, or adjust criteria to see platform accounts."
                    />
                  </td>
                </tr>
              ) : (
                rows.map((user) => (
                  <AdminTr key={user.id} className={cn(actionId === user.id && "opacity-50")}>
                    <AdminTd>
                      <div className="flex items-center gap-3">
                        <AdminAvatar name={user.fullName} />
                        <div className="min-w-0">
                          <p className="truncate font-semibold text-[#191970]">{user.fullName}</p>
                          <p className="truncate text-xs text-slate-500">{user.email}</p>
                        </div>
                      </div>
                    </AdminTd>
                    <AdminTd className="text-slate-600">{user.companyName ?? "—"}</AdminTd>
                    <AdminTd>
                      <AdminInlineSelect
                        value={user.role}
                        disabled={actionId === user.id}
                        onChange={(v) => onRoleChange(user, v as Role)}
                        options={ROLES.map((r) => ({ value: r, label: r }))}
                      />
                    </AdminTd>
                    <AdminTd>
                      <div className="flex flex-col gap-2">
                        <StatusBadge label={user.status} tone={statusTone(user.status)} />
                        <AdminInlineSelect
                          value={user.status}
                          disabled={actionId === user.id}
                          onChange={(v) => onStatusChange(user, v as UserStatus)}
                          options={STATUSES.map((s) => ({ value: s, label: s }))}
                        />
                      </div>
                    </AdminTd>
                    <AdminTd className="text-xs text-slate-500">
                      {user.lastLoginAt ? new Date(user.lastLoginAt).toLocaleString() : "Never"}
                    </AdminTd>
                  </AdminTr>
                ))
              )}
            </AdminTbody>
          </AdminTable>
        </AdminTableWrap>
        {data ? (
          <AdminPagination
            page={data.page}
            totalPages={data.totalPages}
            total={data.total}
            label="users"
            onPrev={() => setPage((p) => p - 1)}
            onNext={() => setPage((p) => p + 1)}
          />
        ) : null}
      </AdminPanel>
    </SuperAdminAppShell>
  );
}
