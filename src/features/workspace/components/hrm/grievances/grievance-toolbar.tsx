"use client";

import { Filter, Plus, Search } from "lucide-react";

import type { GrievancePriority, GrievanceStage } from "@/features/workspace/data/hrm-grievances-demo";
import { cn } from "@/lib/utils/cn";

export type GrievanceFilters = {
  query: string;
  stage: GrievanceStage | "";
  priority: GrievancePriority | "";
};

type Props = {
  filters: GrievanceFilters;
  onChange: (next: GrievanceFilters) => void;
  onFileGrievance: () => void;
  resultCount?: number;
};

export function GrievanceToolbar({ filters, onChange, onFileGrievance, resultCount }: Props) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex flex-1 flex-wrap items-center gap-2">
        <div className="relative min-w-[200px] flex-1 sm:max-w-xs">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            type="search"
            value={filters.query}
            onChange={(e) => onChange({ ...filters, query: e.target.value })}
            placeholder="Search ticket ID, subject, employee…"
            className="h-9 w-full rounded-lg border border-slate-200/80 bg-white pl-9 pr-3 text-sm outline-none focus:border-[#2277ff]/50 focus:ring-2"
          />
        </div>
        <div className="relative">
          <Filter className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
          <select
            value={filters.stage}
            onChange={(e) => onChange({ ...filters, stage: e.target.value as GrievanceFilters["stage"] })}
            className="h-9 appearance-none rounded-lg border border-slate-200/80 bg-white py-0 pl-8 pr-8 text-xs font-medium"
          >
            <option value="">All stages</option>
            <option value="submitted">Submitted</option>
            <option value="under_review">Under review</option>
            <option value="assigned">Assigned</option>
            <option value="resolved">Resolved</option>
          </select>
        </div>
        <select
          value={filters.priority}
          onChange={(e) => onChange({ ...filters, priority: e.target.value as GrievanceFilters["priority"] })}
          className="h-9 rounded-lg border border-slate-200/80 px-3 text-xs font-medium"
        >
          <option value="">All priorities</option>
          <option value="high">High</option>
          <option value="medium">Medium</option>
          <option value="low">Low</option>
        </select>
        {resultCount != null ? (
          <span className="text-xs text-slate-400">{resultCount} ticket{resultCount === 1 ? "" : "s"}</span>
        ) : null}
      </div>
      <button
        type="button"
        onClick={onFileGrievance}
        className={cn(
          "inline-flex h-9 shrink-0 items-center gap-1.5 rounded-lg bg-[#191970] px-3.5 text-xs font-semibold text-white hover:bg-[#12124a]",
        )}
      >
        <Plus className="h-3.5 w-3.5" />
        File a grievance
      </button>
    </div>
  );
}
