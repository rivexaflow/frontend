"use client";

import { Download, Plus, Search, Upload } from "lucide-react";

import {
  HrmDirectoryViewToggle,
  type HrmViewMode,
} from "@/features/workspace/components/hrm/hrm-directory-view-toggle";
import {
  HRM_EMPLOYMENT_STATUSES,
  HRM_EMPLOYMENT_TYPES,
  type HrmEmploymentStatus,
  type HrmEmploymentType,
} from "@/features/workspace/data/hrm-employees-demo";

export type EmployeesFilters = {
  query: string;
  department: string;
  status: HrmEmploymentStatus | "";
  employmentType: HrmEmploymentType | "";
  location: string;
};

type Props = {
  filters: EmployeesFilters;
  onChange: (next: EmployeesFilters) => void;
  departments: string[];
  locations: string[];
  onAdd: () => void;
  onExport?: () => void;
  onBulkImport?: () => void;
  exporting?: boolean;
  resultCount: number;
  viewMode: HrmViewMode;
  onViewModeChange: (mode: HrmViewMode) => void;
};

const selectClass =
  "h-9 rounded-lg border border-slate-200 bg-white px-2.5 text-sm text-slate-700 outline-none focus:border-[#191970] focus:ring-1 focus:ring-[#191970]/20 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-200";

export function EmployeesDirectoryToolbar({
  filters,
  onChange,
  departments,
  locations,
  onAdd,
  onExport,
  onBulkImport,
  exporting = false,
  resultCount,
  viewMode,
  onViewModeChange,
}: Props) {
  const set = <K extends keyof EmployeesFilters>(key: K, value: EmployeesFilters[K]) =>
    onChange({ ...filters, [key]: value });

  return (
    <div className="space-y-3 border-b border-slate-200/90 px-4 py-4 dark:border-slate-800">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
        <div className="relative min-w-0 flex-1 lg:max-w-sm">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            type="search"
            value={filters.query}
            onChange={(e) => set("query", e.target.value)}
            placeholder="Search name, ID, or email…"
            className="h-9 w-full rounded-lg border border-slate-200 bg-white pl-9 pr-3 text-sm outline-none focus:border-[#191970] focus:ring-1 focus:ring-[#191970]/20 dark:border-slate-700 dark:bg-slate-950"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
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
            value={filters.location}
            onChange={(e) => set("location", e.target.value)}
            className={selectClass}
            aria-label="Location"
          >
            <option value="">All locations</option>
            {locations.map((l) => (
              <option key={l} value={l}>
                {l}
              </option>
            ))}
          </select>

          <select
            value={filters.status}
            onChange={(e) => set("status", e.target.value as EmployeesFilters["status"])}
            className={selectClass}
            aria-label="Status"
          >
            <option value="">All statuses</option>
            {HRM_EMPLOYMENT_STATUSES.map((s) => (
              <option key={s.id} value={s.id}>
                {s.label}
              </option>
            ))}
          </select>

          <select
            value={filters.employmentType}
            onChange={(e) => set("employmentType", e.target.value as EmployeesFilters["employmentType"])}
            className={selectClass}
            aria-label="Employment type"
          >
            <option value="">All types</option>
            {HRM_EMPLOYMENT_TYPES.map((t) => (
              <option key={t.id} value={t.id}>
                {t.label}
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-2 lg:ml-auto">
          <HrmDirectoryViewToggle viewMode={viewMode} onChange={onViewModeChange} />
          <span className="text-xs text-slate-500">
            <span className="font-semibold tabular-nums text-slate-800 dark:text-slate-200">{resultCount}</span>{" "}
            employees
          </span>
          {onBulkImport ? (
            <button
              type="button"
              onClick={onBulkImport}
              className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 text-sm font-medium text-slate-600 transition hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300"
            >
              <Upload className="h-4 w-4" />
              Bulk import
            </button>
          ) : null}
          <button
            type="button"
            onClick={onExport}
            disabled={!onExport || exporting}
            className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 text-sm font-medium text-slate-600 transition hover:bg-slate-50 disabled:opacity-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300"
          >
            <Download className="h-4 w-4" />
            {exporting ? "Exporting…" : "Export"}
          </button>
          <button
            type="button"
            onClick={onAdd}
            className="inline-flex h-9 items-center gap-1.5 rounded-lg bg-[#191970] px-4 text-sm font-semibold text-white transition hover:bg-[#12124a]"
          >
            <Plus className="h-4 w-4" />
            Add employee
          </button>
        </div>
      </div>
    </div>
  );
}
