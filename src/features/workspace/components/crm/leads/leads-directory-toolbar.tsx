"use client";

import { Download, Plus, RefreshCw, Search } from "lucide-react";

import { crm } from "@/features/workspace/components/crm/crm-styles";
import { CrmViewToggle, type CrmViewMode } from "@/features/workspace/components/crm/crm-view-toggle";
import { cn } from "@/lib/utils/cn";

export type LeadsFilters = {
  query: string;
  source: string;
  owner: string;
};

type Props = {
  filters: LeadsFilters;
  onChange: (next: LeadsFilters) => void;
  sources: string[];
  owners: string[];
  resultCount: number;
  viewMode: CrmViewMode;
  onViewModeChange: (mode: CrmViewMode) => void;
  onAdd: () => void;
  onRefresh?: () => void;
  refreshing?: boolean;
};

export function LeadsDirectoryToolbar({
  filters,
  onChange,
  sources,
  owners,
  resultCount,
  viewMode,
  onViewModeChange,
  onAdd,
  onRefresh,
  refreshing,
}: Props) {
  const set = <K extends keyof LeadsFilters>(key: K, value: LeadsFilters[K]) =>
    onChange({ ...filters, [key]: value });

  return (
    <div className="border-b border-slate-100 bg-slate-50/50 px-4 py-3 dark:border-slate-800 dark:bg-slate-950/25">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
        <div className="relative min-w-0 flex-1 lg:max-w-sm xl:hidden">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            type="search"
            value={filters.query}
            onChange={(e) => set("query", e.target.value)}
            placeholder="Search name, company, email…"
            className={cn(crm.inputSm, "w-full pl-9")}
          />
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <select value={filters.source} onChange={(e) => set("source", e.target.value)} className={crm.select}>
            <option value="">All sources</option>
            {sources.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
          <select value={filters.owner} onChange={(e) => set("owner", e.target.value)} className={crm.select}>
            <option value="">All owners</option>
            {owners.map((o) => (
              <option key={o} value={o}>{o}</option>
            ))}
          </select>
        </div>
        <div className="flex flex-wrap items-center gap-2 lg:ml-auto">
          <CrmViewToggle mode={viewMode} onChange={onViewModeChange} />
          <span className="hidden h-4 w-px bg-slate-200 sm:block dark:bg-slate-700" />
          <span className={crm.metricPill}>
            <span className="font-bold tabular-nums text-slate-900 dark:text-white">{resultCount}</span>
            <span className="text-slate-500">leads</span>
          </span>
          {onRefresh ? (
            <button type="button" onClick={onRefresh} disabled={refreshing} className={cn(crm.btnSecondarySm, "disabled:opacity-50")}>
              <RefreshCw className={cn("h-3.5 w-3.5", refreshing && "animate-spin")} />
              <span className="hidden sm:inline">Refresh</span>
            </button>
          ) : null}
          <button type="button" className={crm.btnSecondarySm}>
            <Download className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Export</span>
          </button>
          <button type="button" onClick={onAdd} className={crm.btnPrimarySm}>
            <Plus className="h-3.5 w-3.5" />
            Add lead
          </button>
        </div>
      </div>
    </div>
  );
}
