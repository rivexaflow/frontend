"use client";

import { cn } from "@/lib/utils/cn";
import {
  WORKSPACE_PROFILE_ROLES,
  WORKSPACE_USER_STATUSES,
} from "@/features/workspace/data/workspace-user-roles";

const BRAND = "#191970";

export type MemberRailFilters = {
  query: string;
  role: string;
  status: string;
  department: string;
};

type DeptChip = { name: string; count: number };

type Props = {
  filters: MemberRailFilters;
  onChange: (next: MemberRailFilters) => void;
  departments: DeptChip[];
  resultCount: number;
};

export function MemberFilterRail({ filters, onChange, departments, resultCount }: Props) {
  const set = (key: keyof MemberRailFilters, value: string) =>
    onChange({ ...filters, [key]: value });

  return (
    <div className="rounded-xl border border-slate-200 bg-white px-4 py-3 shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex gap-2 overflow-x-auto pb-0.5 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          <button
            type="button"
            onClick={() => set("department", "")}
            className={cn(
              "shrink-0 rounded-md px-3 py-1.5 text-xs font-semibold transition",
              !filters.department ? "text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300",
            )}
            style={!filters.department ? { backgroundColor: BRAND } : undefined}
          >
            All departments ({resultCount})
          </button>
          {departments.map((d) => (
            <button
              key={d.name}
              type="button"
              onClick={() => set("department", filters.department === d.name ? "" : d.name)}
              className={cn(
                "shrink-0 rounded-md border px-3 py-1.5 text-xs font-semibold transition",
                filters.department === d.name
                  ? "border-transparent text-white"
                  : "border-slate-200 bg-white text-slate-600 hover:border-slate-300 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-400",
              )}
              style={filters.department === d.name ? { backgroundColor: BRAND } : undefined}
            >
              {d.name} ({d.count})
            </button>
          ))}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <label className="sr-only" htmlFor="filter-role">
            Profile role
          </label>
          <select
            id="filter-role"
            value={filters.role}
            onChange={(e) => set("role", e.target.value)}
            className="h-9 min-w-[9rem] rounded-md border border-slate-200 bg-white px-2.5 text-xs font-medium text-slate-700 outline-none focus:border-[#191970] focus:ring-1 focus:ring-[#191970]/20 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-200"
          >
            <option value="">All profile roles</option>
            {WORKSPACE_PROFILE_ROLES.map((r) => (
              <option key={r} value={r}>
                {r}
              </option>
            ))}
          </select>
          <label className="sr-only" htmlFor="filter-status">
            Status
          </label>
          <select
            id="filter-status"
            value={filters.status}
            onChange={(e) => set("status", e.target.value)}
            className="h-9 min-w-[8rem] rounded-md border border-slate-200 bg-white px-2.5 text-xs font-medium text-slate-700 outline-none focus:border-[#191970] focus:ring-1 focus:ring-[#191970]/20 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-200"
          >
            <option value="">All statuses</option>
            {WORKSPACE_USER_STATUSES.map((s) => (
              <option key={s} value={s}>
                {s.charAt(0).toUpperCase() + s.slice(1)}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
}
