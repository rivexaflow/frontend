"use client";

import { Filter, Plus, Search } from "lucide-react";

import { cn } from "@/lib/utils/cn";

export type RecruitmentFilters = {
  query: string;
  department: string;
  stage: string;
};

type Props = {
  filters: RecruitmentFilters;
  onChange: (next: RecruitmentFilters) => void;
  departments: string[];
  onPostJob?: () => void;
  resultCount?: number;
};

export function RecruitmentToolbar({ filters, onChange, departments, onPostJob, resultCount }: Props) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex flex-1 flex-wrap items-center gap-2">
        <div className="relative min-w-[200px] flex-1 sm:max-w-xs">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            type="search"
            value={filters.query}
            onChange={(e) => onChange({ ...filters, query: e.target.value })}
            placeholder="Search roles, departments…"
            className="h-9 w-full rounded-lg border border-slate-200/80 bg-white pl-9 pr-3 text-sm text-slate-900 outline-none ring-[#191970]/20 transition placeholder:text-slate-400 focus:border-[#2277ff]/50 focus:ring-2 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
          />
        </div>
        <div className="relative">
          <Filter className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
          <select
            value={filters.department}
            onChange={(e) => onChange({ ...filters, department: e.target.value })}
            className="h-9 appearance-none rounded-lg border border-slate-200/80 bg-white py-0 pl-8 pr-8 text-xs font-medium text-slate-700 outline-none focus:border-[#2277ff]/50 focus:ring-2 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
          >
            <option value="">All departments</option>
            {departments.map((d) => (
              <option key={d} value={d}>
                {d}
              </option>
            ))}
          </select>
        </div>
        <select
          value={filters.stage}
          onChange={(e) => onChange({ ...filters, stage: e.target.value })}
          className="h-9 appearance-none rounded-lg border border-slate-200/80 bg-white px-3 text-xs font-medium text-slate-700 outline-none focus:border-[#2277ff]/50 focus:ring-2 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
        >
          <option value="">All statuses</option>
          <option value="published">Published</option>
          <option value="draft">Draft</option>
          <option value="closed">Closed</option>
        </select>
        {resultCount != null ? (
          <span className="text-xs text-slate-400">{resultCount} role{resultCount === 1 ? "" : "s"}</span>
        ) : null}
      </div>
      <button
        type="button"
        onClick={onPostJob}
        className={cn(
          "inline-flex h-9 shrink-0 items-center gap-1.5 rounded-lg bg-[#191970] px-3.5 text-xs font-semibold text-white",
          "hover:bg-[#12124a] active:scale-[0.98]",
        )}
      >
        <Plus className="h-3.5 w-3.5" />
        Post job
      </button>
    </div>
  );
}
