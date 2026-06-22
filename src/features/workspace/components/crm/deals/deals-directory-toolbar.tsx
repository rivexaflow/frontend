"use client";

import { Download, Plus, RefreshCw, Search } from "lucide-react";

import { crm } from "@/features/workspace/components/crm/crm-styles";
import { CrmViewToggle, type CrmViewMode } from "@/features/workspace/components/crm/crm-view-toggle";
import { DEAL_STAGE_META, type DealStage } from "@/features/workspace/data/deals-demo";
import { cn } from "@/lib/utils/cn";

export type DealsFilters = {
  query: string;
  stage: DealStage | "";
  owner: string;
};

type Props = {
  filters: DealsFilters;
  onChange: (next: DealsFilters) => void;
  owners: string[];
  resultCount: number;
  viewMode: CrmViewMode;
  onViewModeChange: (mode: CrmViewMode) => void;
  onAdd: () => void;
  onRefresh?: () => void;
  refreshing?: boolean;
};

export function DealsDirectoryToolbar({
  filters,
  onChange,
  owners,
  resultCount,
  viewMode,
  onViewModeChange,
  onAdd,
  onRefresh,
  refreshing,
}: Props) {
  const set = <K extends keyof DealsFilters>(key: K, value: DealsFilters[K]) =>
    onChange({ ...filters, [key]: value });

  return (
    <div className="border-b border-slate-100 bg-slate-50/50 px-4 py-3 dark:border-slate-800 dark:bg-slate-950/25">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
        <div className="relative min-w-0 flex-1 lg:max-w-sm">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            type="search"
            value={filters.query}
            onChange={(e) => set("query", e.target.value)}
            placeholder="Search deals, company, owner…"
            className={cn(crm.inputSm, "w-full pl-9")}
          />
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <select
            value={filters.stage}
            onChange={(e) => set("stage", e.target.value as DealsFilters["stage"])}
            className={crm.select}
          >
            <option value="">All stages</option>
            {(Object.keys(DEAL_STAGE_META) as DealStage[]).map((s) => (
              <option key={s} value={s}>{DEAL_STAGE_META[s].label}</option>
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
            <span className="text-slate-500">deals</span>
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
            New deal
          </button>
        </div>
      </div>
    </div>
  );
}
