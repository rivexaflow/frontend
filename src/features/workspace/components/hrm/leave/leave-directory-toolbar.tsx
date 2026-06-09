"use client";

import { Plus, Search } from "lucide-react";

import {
  HrmDirectoryViewToggle,
  type HrmViewMode,
} from "@/features/workspace/components/hrm/hrm-directory-view-toggle";
import {
  LEAVE_STATUSES,
  LEAVE_TYPES,
  type LeaveStatus,
  type LeaveType,
} from "@/features/workspace/data/hrm-leave-demo";

export type LeaveFilters = {
  query: string;
  status: LeaveStatus | "";
  leaveType: LeaveType | "";
};

type Props = {
  filters: LeaveFilters;
  onChange: (next: LeaveFilters) => void;
  onApply: () => void;
  resultCount: number;
  viewMode: HrmViewMode;
  onViewModeChange: (mode: HrmViewMode) => void;
};

const selectClass =
  "h-9 rounded-lg border border-slate-200 bg-white px-2.5 text-sm text-slate-700 outline-none focus:border-[#191970] focus:ring-1 focus:ring-[#191970]/20 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-200";

export function LeaveDirectoryToolbar({
  filters,
  onChange,
  onApply,
  resultCount,
  viewMode,
  onViewModeChange,
}: Props) {
  const set = <K extends keyof LeaveFilters>(key: K, value: LeaveFilters[K]) =>
    onChange({ ...filters, [key]: value });

  return (
    <div className="flex flex-col gap-3 border-b border-slate-200/90 px-4 py-4 sm:flex-row sm:flex-wrap sm:items-center dark:border-slate-800">
      <div className="relative min-w-[200px] flex-1 sm:max-w-sm">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
        <input
          type="search"
          value={filters.query}
          onChange={(e) => set("query", e.target.value)}
          placeholder="Search employee or request ID…"
          className="h-9 w-full rounded-lg border border-slate-200 bg-white pl-9 pr-3 text-sm outline-none focus:border-[#191970] focus:ring-1 focus:ring-[#191970]/20 dark:border-slate-700 dark:bg-slate-950"
        />
      </div>

      <select
        value={filters.leaveType}
        onChange={(e) => set("leaveType", e.target.value as LeaveFilters["leaveType"])}
        className={selectClass}
      >
        <option value="">All types</option>
        {LEAVE_TYPES.map((t) => (
          <option key={t.id} value={t.id}>{t.label}</option>
        ))}
      </select>

      <select
        value={filters.status}
        onChange={(e) => set("status", e.target.value as LeaveFilters["status"])}
        className={selectClass}
      >
        <option value="">All statuses</option>
        {LEAVE_STATUSES.map((s) => (
          <option key={s.id} value={s.id}>{s.label}</option>
        ))}
      </select>

      <div className="flex items-center gap-2 sm:ml-auto">
        <HrmDirectoryViewToggle viewMode={viewMode} onChange={onViewModeChange} />
        <span className="text-xs text-slate-500">
          <span className="font-semibold tabular-nums text-slate-800">{resultCount}</span> requests
        </span>
        <button
          type="button"
          onClick={onApply}
          className="inline-flex h-9 items-center gap-1.5 rounded-lg bg-[#191970] px-4 text-sm font-semibold text-white hover:bg-[#12124a]"
        >
          <Plus className="h-4 w-4" />
          Apply leave
        </button>
      </div>
    </div>
  );
}
