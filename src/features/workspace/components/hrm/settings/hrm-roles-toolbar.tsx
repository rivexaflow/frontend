"use client";

import { Plus, Search } from "lucide-react";

import { cn } from "@/lib/utils/cn";

export type HrmRoleTypeFilter = "all" | "system" | "custom";

type Props = {
  query: string;
  onQueryChange: (value: string) => void;
  typeFilter: HrmRoleTypeFilter;
  onTypeFilterChange: (value: HrmRoleTypeFilter) => void;
  resultCount: number;
  onCreateRole: () => void;
  canManage?: boolean;
};

const TYPE_TABS: { id: HrmRoleTypeFilter; label: string }[] = [
  { id: "all", label: "All roles" },
  { id: "system", label: "Templates" },
  { id: "custom", label: "Custom" },
];

export function HrmRolesToolbar({
  query,
  onQueryChange,
  typeFilter,
  onTypeFilterChange,
  resultCount,
  onCreateRole,
  canManage = true,
}: Props) {
  return (
    <div className="space-y-3 border-b border-slate-200/90 px-4 py-4 dark:border-slate-800">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
        <div className="relative min-w-0 flex-1 lg:max-w-md">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            type="search"
            value={query}
            onChange={(e) => onQueryChange(e.target.value)}
            placeholder="Search by role name or scope…"
            className="h-9 w-full rounded-lg border border-slate-200 bg-white pl-9 pr-3 text-sm outline-none transition focus:border-[#191970] focus:ring-2 focus:ring-[#191970]/10 dark:border-slate-700 dark:bg-slate-950"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2 lg:ml-auto">
          <span className="text-xs text-slate-500">
            <span className="font-semibold tabular-nums text-slate-800 dark:text-slate-200">{resultCount}</span> roles
          </span>
          {canManage ? (
            <button
              type="button"
              onClick={onCreateRole}
              className="inline-flex h-9 items-center gap-1.5 rounded-lg bg-[#191970] px-4 text-sm font-semibold text-white shadow-sm transition hover:bg-[#12124a]"
            >
              <Plus className="h-4 w-4" />
              Create role
            </button>
          ) : null}
        </div>
      </div>

      <div className="flex flex-wrap gap-1 rounded-lg border border-slate-200/90 bg-slate-50/80 p-0.5 dark:border-slate-800 dark:bg-slate-900/60">
        {TYPE_TABS.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => onTypeFilterChange(tab.id)}
            className={cn(
              "rounded-md px-2.5 py-1.5 text-xs font-semibold transition",
              typeFilter === tab.id
                ? "bg-white text-[#191970] shadow-sm dark:bg-slate-800 dark:text-white"
                : "text-slate-500 hover:text-slate-800 dark:hover:text-slate-200",
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>
    </div>
  );
}
