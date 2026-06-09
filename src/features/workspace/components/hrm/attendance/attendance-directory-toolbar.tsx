"use client";

import { Download, Plus, Search } from "lucide-react";

import {
  HrmDirectoryViewToggle,
  type HrmViewMode,
} from "@/features/workspace/components/hrm/hrm-directory-view-toggle";
import {
  ATTENDANCE_STATUSES,
  type AttendanceStatus,
} from "@/features/workspace/data/hrm-attendance-demo";

export type AttendanceFilters = {
  query: string;
  department: string;
  status: AttendanceStatus | "";
};

type Props = {
  filters: AttendanceFilters;
  onChange: (next: AttendanceFilters) => void;
  departments: string[];
  resultCount: number;
  viewMode: HrmViewMode;
  onViewModeChange: (mode: HrmViewMode) => void;
  salaryMonthLabel: string;
  todayLabel: string;
};

const selectClass =
  "h-9 rounded-lg border border-slate-200 bg-white px-2.5 text-sm text-slate-700 outline-none focus:border-[#191970] focus:ring-1 focus:ring-[#191970]/20 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-200";

export function AttendanceDirectoryToolbar({
  filters,
  onChange,
  departments,
  resultCount,
  viewMode,
  onViewModeChange,
  salaryMonthLabel,
  todayLabel,
}: Props) {
  const set = <K extends keyof AttendanceFilters>(key: K, value: AttendanceFilters[K]) =>
    onChange({ ...filters, [key]: value });

  return (
    <div className="border-b border-slate-200/90 dark:border-slate-800">
      <div className="flex flex-wrap items-center gap-2 border-b border-slate-100 bg-slate-50/80 px-4 py-2.5 dark:border-slate-800 dark:bg-slate-950/40">
        <span className="rounded-md bg-[#191970] px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white">
          Today · {todayLabel}
        </span>
        <span className="text-xs text-slate-500">
          Salary month <span className="font-semibold text-slate-700 dark:text-slate-300">{salaryMonthLabel}</span>
          <span className="text-slate-400"> · cycles 27th to 27th</span>
        </span>
      </div>
    <div className="flex flex-col gap-3 px-4 py-4 sm:flex-row sm:flex-wrap sm:items-center">
      <div className="relative min-w-[200px] flex-1 sm:max-w-sm">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
        <input
          type="search"
          value={filters.query}
          onChange={(e) => set("query", e.target.value)}
          placeholder="Search employee…"
          className="h-9 w-full rounded-lg border border-slate-200 bg-white pl-9 pr-3 text-sm outline-none focus:border-[#191970] focus:ring-1 focus:ring-[#191970]/20 dark:border-slate-700 dark:bg-slate-950"
        />
      </div>

      <select value={filters.department} onChange={(e) => set("department", e.target.value)} className={selectClass}>
        <option value="">All departments</option>
        {departments.map((d) => (
          <option key={d} value={d}>{d}</option>
        ))}
      </select>

      <select
        value={filters.status}
        onChange={(e) => set("status", e.target.value as AttendanceFilters["status"])}
        className={selectClass}
      >
        <option value="">All statuses</option>
        {ATTENDANCE_STATUSES.map((s) => (
          <option key={s.id} value={s.id}>{s.label}</option>
        ))}
      </select>

      <div className="flex items-center gap-2 sm:ml-auto">
        <HrmDirectoryViewToggle viewMode={viewMode} onChange={onViewModeChange} />
        <span className="text-xs text-slate-500">
          <span className="font-semibold tabular-nums text-slate-800">{resultCount}</span> records
        </span>
        <button
          type="button"
          className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 text-sm font-medium text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900"
        >
          <Download className="h-4 w-4" />
          Export
        </button>
        <button
          type="button"
          className="inline-flex h-9 items-center gap-1.5 rounded-lg bg-[#191970] px-4 text-sm font-semibold text-white hover:bg-[#12124a]"
        >
          <Plus className="h-4 w-4" />
          Mark attendance
        </button>
      </div>
    </div>
    </div>
  );
}
