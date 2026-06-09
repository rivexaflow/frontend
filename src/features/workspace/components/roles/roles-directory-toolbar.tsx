"use client";

import { Plus, Search } from "lucide-react";
import Link from "next/link";

import { workspacePaths } from "@/lib/workspace/paths";
import { cn } from "@/lib/utils/cn";

export type RoleTypeFilter = "all" | "system" | "custom";
export type RoleAssignmentFilter = "all" | "assigned" | "unassigned";
export type RoleSortKey = "name" | "permissions" | "members";

type Props = {
  query: string;
  onQueryChange: (value: string) => void;
  typeFilter: RoleTypeFilter;
  onTypeFilterChange: (value: RoleTypeFilter) => void;
  assignmentFilter: RoleAssignmentFilter;
  onAssignmentFilterChange: (value: RoleAssignmentFilter) => void;
  resultCount: number;
};

const TYPE_TABS: { id: RoleTypeFilter; label: string }[] = [
  { id: "all", label: "All roles" },
  { id: "system", label: "System" },
  { id: "custom", label: "Custom" },
];

const ASSIGNMENT_TABS: { id: RoleAssignmentFilter; label: string }[] = [
  { id: "all", label: "Any assignment" },
  { id: "assigned", label: "Has members" },
  { id: "unassigned", label: "Unassigned" },
];

export function RolesDirectoryToolbar({
  query,
  onQueryChange,
  typeFilter,
  onTypeFilterChange,
  assignmentFilter,
  onAssignmentFilterChange,
  resultCount,
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
            placeholder="Search by role name…"
            className="h-9 w-full rounded-lg border border-slate-200 bg-white pl-9 pr-3 text-sm outline-none transition focus:border-[#191970] focus:ring-2 focus:ring-[#191970]/10 dark:border-slate-700 dark:bg-slate-950"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2 lg:ml-auto">
          <span className="text-xs text-slate-500">
            <span className="font-semibold tabular-nums text-slate-800 dark:text-slate-200">{resultCount}</span>{" "}
            policies
          </span>
          <Link
            href={workspacePaths.roleNew}
            className="inline-flex h-9 items-center gap-1.5 rounded-lg bg-[#191970] px-4 text-sm font-semibold text-white shadow-sm transition hover:bg-[#12124a]"
          >
            <Plus className="h-4 w-4" />
            Create role
          </Link>
        </div>
      </div>

      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
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

        <div className="flex flex-wrap gap-1">
          {ASSIGNMENT_TABS.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => onAssignmentFilterChange(tab.id)}
              className={cn(
                "rounded-md border px-2.5 py-1.5 text-xs font-medium transition",
                assignmentFilter === tab.id
                  ? "border-[#191970]/30 bg-[#191970]/5 text-[#191970] dark:border-blue-800 dark:bg-blue-950/30 dark:text-blue-300"
                  : "border-transparent text-slate-500 hover:border-slate-200 hover:bg-white hover:text-slate-700 dark:hover:border-slate-700 dark:hover:bg-slate-900",
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
