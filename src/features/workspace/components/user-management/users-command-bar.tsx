"use client";

import {
  Download,
  LayoutGrid,
  List,
  Plus,
  Search,
  SlidersHorizontal,
  X,
} from "lucide-react";

import {
  WORKSPACE_PROFILE_ROLES,
  WORKSPACE_USER_STATUSES,
} from "@/features/workspace/data/workspace-user-roles";
import { cn } from "@/lib/utils/cn";

export type UsersCommandFilters = {
  query: string;
  role: string;
  status: string;
  department: string;
};

type Props = {
  filters: UsersCommandFilters;
  onChange: (next: UsersCommandFilters) => void;
  viewMode: "table" | "grid";
  onViewModeChange: (mode: "table" | "grid") => void;
  onInvite: () => void;
  onExport?: () => void;
  resultCount: number;
  departments: string[];
};

const selectClass =
  "h-9 rounded-lg border border-slate-200/90 bg-white pl-2.5 pr-8 text-xs font-medium text-slate-700 outline-none focus:border-[#4338ca] focus:ring-2 focus:ring-[#4338ca]/10 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200";

export function UsersCommandBar({
  filters,
  onChange,
  viewMode,
  onViewModeChange,
  onInvite,
  onExport,
  resultCount,
  departments,
}: Props) {
  const set = (key: keyof UsersCommandFilters, value: string) =>
    onChange({ ...filters, [key]: value });

  const hasFilters =
    filters.query || filters.role || filters.status || filters.department;

  const clearAll = () =>
    onChange({ query: "", role: "", status: "", department: "" });

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200/90 bg-gradient-to-br from-white via-white to-slate-50/80 shadow-sm dark:border-slate-800 dark:from-slate-900 dark:via-slate-900 dark:to-slate-950/80">
      <div className="flex flex-col gap-3 border-b border-slate-100/90 px-4 py-3.5 dark:border-slate-800 sm:flex-row sm:items-center">
        <div className="relative min-w-0 flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            type="search"
            value={filters.query}
            onChange={(e) => set("query", e.target.value)}
            placeholder="Search members by name, email, or role…"
            className="h-10 w-full rounded-xl border border-slate-200/90 bg-white pl-10 pr-10 text-sm text-slate-900 outline-none transition focus:border-[#4338ca] focus:ring-2 focus:ring-[#4338ca]/12 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
          />
          {filters.query ? (
            <button
              type="button"
              onClick={() => set("query", "")}
              className="absolute right-2 top-1/2 -translate-y-1/2 rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
              aria-label="Clear search"
            >
              <X className="h-4 w-4" />
            </button>
          ) : null}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-0.5 rounded-xl border border-slate-200/90 bg-white p-0.5 dark:border-slate-700 dark:bg-slate-950">
            <button
              type="button"
              onClick={() => onViewModeChange("table")}
              className={cn(
                "inline-flex h-8 items-center gap-1.5 rounded-lg px-2.5 text-xs font-semibold transition",
                viewMode === "table"
                  ? "bg-[#191970] text-white shadow-sm"
                  : "text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800",
              )}
            >
              <List className="h-3.5 w-3.5" />
              Directory
            </button>
            <button
              type="button"
              onClick={() => onViewModeChange("grid")}
              className={cn(
                "inline-flex h-8 items-center gap-1.5 rounded-lg px-2.5 text-xs font-semibold transition",
                viewMode === "grid"
                  ? "bg-[#191970] text-white shadow-sm"
                  : "text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800",
              )}
            >
              <LayoutGrid className="h-3.5 w-3.5" />
              Cards
            </button>
          </div>

          <button
            type="button"
            onClick={onExport}
            className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200/90 bg-white text-slate-600 transition hover:border-slate-300 hover:text-slate-900 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-400"
            aria-label="Export directory"
          >
            <Download className="h-4 w-4" />
          </button>

          <button
            type="button"
            onClick={onInvite}
            className="inline-flex h-9 items-center gap-2 rounded-xl bg-[#191970] px-4 text-xs font-semibold text-white shadow-md shadow-[#191970]/25 transition hover:bg-[#0f0f4d]"
          >
            <Plus className="h-4 w-4" />
            Invite member
          </button>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2 px-4 py-3">
        <span className="inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-slate-400">
          <SlidersHorizontal className="h-3.5 w-3.5" />
          Refine
        </span>

        <select
          value={filters.role}
          onChange={(e) => set("role", e.target.value)}
          className={selectClass}
          aria-label="Filter by role"
        >
          <option value="">All profile roles</option>
          {WORKSPACE_PROFILE_ROLES.map((role) => (
            <option key={role} value={role}>
              {role}
            </option>
          ))}
        </select>

        <select
          value={filters.status}
          onChange={(e) => set("status", e.target.value)}
          className={selectClass}
          aria-label="Filter by status"
        >
          <option value="">All statuses</option>
          {WORKSPACE_USER_STATUSES.map((status) => (
            <option key={status} value={status}>
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </option>
          ))}
        </select>

        <select
          value={filters.department}
          onChange={(e) => set("department", e.target.value)}
          className={selectClass}
          aria-label="Filter by department"
        >
          <option value="">All departments</option>
          {departments.map((d) => (
            <option key={d} value={d}>
              {d}
            </option>
          ))}
        </select>

        {hasFilters ? (
          <button
            type="button"
            onClick={clearAll}
            className="text-xs font-semibold text-slate-500 underline-offset-2 hover:text-slate-800 hover:underline dark:text-slate-400"
          >
            Clear filters
          </button>
        ) : null}

        <p className="ml-auto text-xs text-slate-500">
          <span className="font-semibold tabular-nums text-slate-800 dark:text-slate-200">
            {resultCount}
          </span>{" "}
          members
        </p>
      </div>
    </div>
  );
}
