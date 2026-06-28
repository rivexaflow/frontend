"use client";

import { FileSpreadsheet, LayoutGrid, List, Plus, Search } from "lucide-react";

import {
  WORKSPACE_PROFILE_ROLES,
  WORKSPACE_USER_STATUSES,
} from "@/features/workspace/data/workspace-user-roles";
import { cn } from "@/lib/utils/cn";

export type MembersFilters = {
  query: string;
  role: string;
  status: string;
  department: string;
};

export type MembersViewMode = "grid" | "list";

type Props = {
  filters: MembersFilters;
  onChange: (next: MembersFilters) => void;
  departments: string[];
  onInvite: () => void;
  onBulkImport?: () => void;
  resultCount: number;
  viewMode: MembersViewMode;
  onViewModeChange: (mode: MembersViewMode) => void;
};

const selectClass =
  "h-9 rounded-lg border border-slate-200 bg-white px-2.5 text-sm text-slate-700 outline-none focus:border-[#191970] focus:ring-1 focus:ring-[#191970]/20 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-200";

export function MembersDirectoryToolbar({
  filters,
  onChange,
  departments,
  onInvite,
  onBulkImport,
  resultCount,
  viewMode,
  onViewModeChange,
}: Props) {
  const set = (key: keyof MembersFilters, value: string) =>
    onChange({ ...filters, [key]: value });

  return (
    <div className="flex flex-col gap-3 border-b border-slate-100 px-4 py-4 sm:flex-row sm:flex-wrap sm:items-center dark:border-slate-800">
      <div className="relative min-w-[200px] flex-1 sm:max-w-sm">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
        <input
          type="search"
          value={filters.query}
          onChange={(e) => set("query", e.target.value)}
          placeholder="Search by name or email"
          className="h-9 w-full rounded-lg border border-slate-200 bg-white pl-9 pr-3 text-sm outline-none focus:border-[#191970] focus:ring-1 focus:ring-[#191970]/20 dark:border-slate-700 dark:bg-slate-950"
        />
      </div>

      <select
        value={filters.department}
        onChange={(e) => set("department", e.target.value)}
        className={selectClass}
        aria-label="Department"
      >
        <option value="">All departments</option>
        {departments.map((d) => (
          <option key={d} value={d}>
            {d}
          </option>
        ))}
      </select>

      <select
        value={filters.role}
        onChange={(e) => set("role", e.target.value)}
        className={selectClass}
        aria-label="Profile role"
      >
        <option value="">All roles</option>
        {WORKSPACE_PROFILE_ROLES.map((r) => (
          <option key={r} value={r}>
            {r}
          </option>
        ))}
      </select>

      <select
        value={filters.status}
        onChange={(e) => set("status", e.target.value)}
        className={selectClass}
        aria-label="Status"
      >
        <option value="">All statuses</option>
        {WORKSPACE_USER_STATUSES.map((s) => (
          <option key={s} value={s}>
            {s.charAt(0).toUpperCase() + s.slice(1)}
          </option>
        ))}
      </select>

      <div className="flex flex-wrap items-center gap-2.5 sm:ml-auto">
        <div className="flex items-center rounded-lg border border-slate-200 p-0.5 dark:border-slate-700">
          <button
            type="button"
            onClick={() => onViewModeChange("grid")}
            className={cn(
              "inline-flex h-8 w-8 items-center justify-center rounded-md transition",
              viewMode === "grid"
                ? "bg-[#191970] text-white"
                : "text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800",
            )}
            aria-label="Card view"
          >
            <LayoutGrid className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => onViewModeChange("list")}
            className={cn(
              "inline-flex h-8 w-8 items-center justify-center rounded-md transition",
              viewMode === "list"
                ? "bg-[#191970] text-white"
                : "text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800",
            )}
            aria-label="List view"
          >
            <List className="h-4 w-4" />
          </button>
        </div>
        <span className="hidden text-sm text-slate-500 sm:inline">
          <span className="font-medium text-slate-800 dark:text-slate-200">{resultCount}</span> shown
        </span>
        {onBulkImport ? (
          <button
            type="button"
            onClick={onBulkImport}
            className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800 transition"
          >
            <FileSpreadsheet className="h-4 w-4 text-emerald-600" />
            Import Users List
          </button>
        ) : null}
        <button
          type="button"
          onClick={onInvite}
          className="inline-flex h-9 items-center gap-1.5 rounded-lg bg-[#191970] px-4 text-sm font-semibold text-white hover:bg-[#12124a] transition"
        >
          <Plus className="h-4 w-4" />
          Invite member
        </button>
      </div>
    </div>
  );
}
