"use client";

import { Download, Play, Search } from "lucide-react";

import {
  HrmDirectoryViewToggle,
  type HrmViewMode,
} from "@/features/workspace/components/hrm/hrm-directory-view-toggle";
import {
  PAYROLL_PERIODS,
  PAYROLL_STATUSES,
  type PayrollRunStatus,
} from "@/features/workspace/data/hrm-payroll-demo";

export type PayrollFilters = {
  query: string;
  period: string;
  status: PayrollRunStatus | "";
};

type Props = {
  filters: PayrollFilters;
  onChange: (next: PayrollFilters) => void;
  periods?: string[];
  resultCount: number;
  viewMode: HrmViewMode;
  onViewModeChange: (mode: HrmViewMode) => void;
  onRunPayroll?: () => void;
};

const selectClass =
  "h-9 rounded-lg border border-slate-200 bg-white px-2.5 text-sm text-slate-700 outline-none focus:border-[#191970] focus:ring-1 focus:ring-[#191970]/20 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-200";

export function PayrollDirectoryToolbar({
  filters,
  onChange,
  periods = PAYROLL_PERIODS,
  resultCount,
  viewMode,
  onViewModeChange,
  onRunPayroll,
}: Props) {
  const set = <K extends keyof PayrollFilters>(key: K, value: PayrollFilters[K]) =>
    onChange({ ...filters, [key]: value });

  return (
    <div className="flex flex-col gap-3 border-b border-slate-200/90 px-4 py-4 sm:flex-row sm:flex-wrap sm:items-center dark:border-slate-800">
      <div className="relative min-w-[200px] flex-1 sm:max-w-sm">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
        <input
          type="search"
          value={filters.query}
          onChange={(e) => set("query", e.target.value)}
          placeholder="Search employee or payslip…"
          className="h-9 w-full rounded-lg border border-slate-200 bg-white pl-9 pr-3 text-sm outline-none focus:border-[#191970] focus:ring-1 focus:ring-[#191970]/20 dark:border-slate-700 dark:bg-slate-950"
        />
      </div>

      <select value={filters.period} onChange={(e) => set("period", e.target.value)} className={selectClass}>
        <option value="">All periods</option>
        {periods.map((p) => (
          <option key={p} value={p}>{p}</option>
        ))}
      </select>

      <select
        value={filters.status}
        onChange={(e) => set("status", e.target.value as PayrollFilters["status"])}
        className={selectClass}
      >
        <option value="">All statuses</option>
        {PAYROLL_STATUSES.map((s) => (
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
          onClick={onRunPayroll}
          disabled={!onRunPayroll}
          className="inline-flex h-9 items-center gap-1.5 rounded-lg bg-[#191970] px-4 text-sm font-semibold text-white hover:bg-[#12124a] disabled:opacity-50"
        >
          <Play className="h-4 w-4" />
          Run payroll
        </button>
      </div>
    </div>
  );
}
