"use client";

import { RotateCcw, Search, UserPlus } from "lucide-react";

import {
  WORKSPACE_PROFILE_ROLES,
  WORKSPACE_USER_STATUSES,
} from "@/features/workspace/data/workspace-user-roles";
import { cn } from "@/lib/utils/cn";

export type UserManagementFilterState = {
  name: string;
  email: string;
  role: string;
  status: string;
};

type Props = {
  filters: UserManagementFilterState;
  onChange: (next: UserManagementFilterState) => void;
  onSearch: () => void;
  onReset: () => void;
  onInvite?: () => void;
  className?: string;
};

const fieldClass =
  "mt-1 h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/15 dark:border-slate-700 dark:bg-slate-900 dark:text-white";

export function UserManagementFilters({
  filters,
  onChange,
  onSearch,
  onReset,
  onInvite,
  className,
}: Props) {
  const set = (key: keyof UserManagementFilterState, value: string) =>
    onChange({ ...filters, [key]: value });

  return (
    <div
      className={cn(
        "rounded-2xl border border-slate-200/90 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900",
        className,
      )}
    >
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        <div>
          <label htmlFor="um-filter-name" className="text-xs font-semibold text-slate-600 dark:text-slate-400">
            Name
          </label>
          <input
            id="um-filter-name"
            type="text"
            value={filters.name}
            onChange={(e) => set("name", e.target.value)}
            placeholder="Search by name"
            className={fieldClass}
          />
        </div>
        <div>
          <label htmlFor="um-filter-email" className="text-xs font-semibold text-slate-600 dark:text-slate-400">
            Email
          </label>
          <input
            id="um-filter-email"
            type="email"
            value={filters.email}
            onChange={(e) => set("email", e.target.value)}
            placeholder="Search by email"
            className={fieldClass}
          />
        </div>
        <div>
          <label htmlFor="um-filter-role" className="text-xs font-semibold text-slate-600 dark:text-slate-400">
            Profile role
          </label>
          <select
            id="um-filter-role"
            value={filters.role}
            onChange={(e) => set("role", e.target.value)}
            className={fieldClass}
          >
            <option value="">All roles</option>
            {WORKSPACE_PROFILE_ROLES.map((role) => (
              <option key={role} value={role}>
                {role}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="um-filter-status" className="text-xs font-semibold text-slate-600 dark:text-slate-400">
            Status
          </label>
          <select
            id="um-filter-status"
            value={filters.status}
            onChange={(e) => set("status", e.target.value)}
            className={fieldClass}
          >
            <option value="">All statuses</option>
            {WORKSPACE_USER_STATUSES.map((status) => (
              <option key={status} value={status}>
                {status.charAt(0).toUpperCase() + status.slice(1)}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap items-center justify-end gap-2">
        <button
          type="button"
          onClick={onInvite}
          className="inline-flex items-center gap-2 rounded-xl border border-blue-200 bg-blue-50 px-3.5 py-2 text-sm font-semibold text-blue-700 transition hover:bg-blue-100 dark:border-blue-900 dark:bg-blue-950/40 dark:text-blue-300"
        >
          <UserPlus className="h-4 w-4" />
          Invite user
        </button>
        <button
          type="button"
          onClick={onSearch}
          className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-md shadow-blue-600/25 transition hover:bg-blue-700"
        >
          <Search className="h-4 w-4" />
          Apply filters
        </button>
        <button
          type="button"
          onClick={onReset}
          className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-rose-200 bg-rose-50 text-rose-600 transition hover:bg-rose-100 dark:border-rose-900/40 dark:bg-rose-950/30 dark:text-rose-400"
          aria-label="Reset filters"
        >
          <RotateCcw className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
