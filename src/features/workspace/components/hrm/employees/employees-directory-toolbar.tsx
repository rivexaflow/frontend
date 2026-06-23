"use client";

import { Download, Plus, RefreshCw, Search, Upload } from "lucide-react";

import { crm } from "@/features/workspace/components/crm/crm-styles";
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
import { cn } from "@/lib/utils/cn";

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
  onRefresh?: () => void;
  refreshing?: boolean;
  exporting?: boolean;
  resultCount: number;
  viewMode: HrmViewMode;
  onViewModeChange: (mode: HrmViewMode) => void;
};

const selectClass =
  "h-9 min-w-[132px] shrink-0 rounded-lg border border-slate-200 bg-white px-2.5 text-sm text-slate-700 outline-none focus:border-[#191970] focus:ring-1 focus:ring-[#191970]/20 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-200";

export function EmployeesDirectoryToolbar({
  filters,
  onChange,
  departments,
  locations,
  onAdd,
  onExport,
  onBulkImport,
  onRefresh,
  refreshing = false,
  exporting = false,
  resultCount,
  viewMode,
  onViewModeChange,
}: Props) {
  const set = <K extends keyof EmployeesFilters>(key: K, value: EmployeesFilters[K]) =>
    onChange({ ...filters, [key]: value });

  return (
    <div className="border-b border-slate-100 bg-white px-4 py-3 dark:border-slate-800 dark:bg-slate-900">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        {/* Left — search + filters in one professional row */}
        <div className="flex min-w-0 flex-1 flex-wrap items-center gap-2">
          <div className="relative w-full min-w-[220px] flex-1 basis-[min(100%,320px)] sm:max-w-[360px]">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              type="search"
              value={filters.query}
              onChange={(e) => set("query", e.target.value)}
              placeholder="Search by name, employee ID, or email…"
              className="h-9 w-full rounded-lg border border-slate-200 bg-white pl-9 pr-3 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-[#191970] focus:ring-2 focus:ring-[#191970]/10 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
            />
          </div>

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

        {/* Right — view, count, actions */}
        <div className="flex shrink-0 flex-wrap items-center gap-2 lg:justify-end">
          <HrmDirectoryViewToggle viewMode={viewMode} onChange={onViewModeChange} />
          <span className="hidden h-4 w-px bg-slate-200 sm:block dark:bg-slate-700" />
          <span className="text-sm text-slate-500">
            <span className="font-semibold tabular-nums text-slate-800 dark:text-slate-200">{resultCount}</span>{" "}
            employees
          </span>
          {onRefresh ? (
            <button
              type="button"
              onClick={onRefresh}
              disabled={refreshing}
              className={cn(crm.btnSecondarySm, "disabled:opacity-50")}
            >
              <RefreshCw className={cn("h-3.5 w-3.5", refreshing && "animate-spin")} />
              <span className="hidden sm:inline">Refresh</span>
            </button>
          ) : null}
          {onBulkImport ? (
            <button type="button" onClick={onBulkImport} className={crm.btnSecondarySm}>
              <Upload className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Import</span>
            </button>
          ) : null}
          <button
            type="button"
            onClick={onExport}
            disabled={!onExport || exporting}
            className={cn(crm.btnSecondarySm, "disabled:opacity-50")}
          >
            <Download className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">{exporting ? "Exporting…" : "Export"}</span>
          </button>
          <button type="button" onClick={onAdd} className={crm.btnPrimarySm}>
            <Plus className="h-3.5 w-3.5" />
            Add employee
          </button>
        </div>
      </div>
    </div>
  );
}
