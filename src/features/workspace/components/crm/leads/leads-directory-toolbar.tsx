"use client";

import { ChevronDown, ChevronUp, Download, GitBranchPlus, Layers, RefreshCw, Search, UserPlus } from "lucide-react";

import { crm } from "@/features/workspace/components/crm/crm-styles";
import { CrmViewToggle, type CrmViewMode } from "@/features/workspace/components/crm/crm-view-toggle";
import { cn } from "@/lib/utils/cn";

export type LeadsFilters = {
  query: string;
};

type Props = {
  filters: LeadsFilters;
  onChange: (next: LeadsFilters) => void;
  resultCount: number;
  viewMode: CrmViewMode;
  onViewModeChange: (mode: CrmViewMode) => void;
  onCreateLead: () => void;
  onCreateStage: () => void;
  onRefresh?: () => void;
  refreshing?: boolean;
  showPipelineToggle?: boolean;
  pipelinePanelOpen?: boolean;
  onPipelinePanelToggle?: () => void;
  pipelines?: any[];
  activePipelineId?: string | null;
  onActivePipelineChange?: (id: string) => void;
};

export function LeadsDirectoryToolbar({
  filters,
  onChange,
  resultCount,
  viewMode,
  onViewModeChange,
  onCreateLead,
  onCreateStage,
  onRefresh,
  refreshing,
  showPipelineToggle,
  pipelinePanelOpen,
  onPipelinePanelToggle,
  pipelines,
  activePipelineId,
  onActivePipelineChange,
}: Props) {
  return (
    <div className="border-b border-slate-100 bg-slate-50/50 px-4 py-3 dark:border-slate-800 dark:bg-slate-950/25">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
        <div className="relative min-w-0 flex-1 lg:max-w-sm">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            type="search"
            value={filters.query}
            onChange={(e) => onChange({ ...filters, query: e.target.value })}
            placeholder="Search name, company, email…"
            className={cn(crm.inputSm, "w-full pl-9")}
          />
        </div>

        <div className="flex flex-wrap items-center gap-2 lg:ml-auto">
          {pipelines && pipelines.length > 1 ? (
            <div className="flex items-center gap-1.5 mr-2">
              <span className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Pipeline:</span>
              <select
                value={activePipelineId || ""}
                onChange={(e) => onActivePipelineChange?.(e.target.value)}
                className="h-8 rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-xs font-semibold text-slate-750 outline-none hover:border-slate-350 focus:border-[#191970] focus:ring-1 focus:ring-[#191970]/10 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200"
              >
                {pipelines.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
            </div>
          ) : null}

          {showPipelineToggle && onPipelinePanelToggle ? (
            <button
              type="button"
              onClick={onPipelinePanelToggle}
              className={cn(
                crm.btnSecondarySm,
                pipelinePanelOpen && "border-[#191970]/25 bg-[#191970]/5 text-[#191970] dark:border-[#2277FF]/30 dark:bg-[#2277FF]/10 dark:text-[#2277FF]",
              )}
              title={pipelinePanelOpen ? "Hide pipeline overview" : "Show pipeline overview"}
            >
              <Layers className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Pipeline</span>
              {pipelinePanelOpen ? (
                <ChevronUp className="h-3.5 w-3.5 opacity-70" />
              ) : (
                <ChevronDown className="h-3.5 w-3.5 opacity-70" />
              )}
            </button>
          ) : null}
          <CrmViewToggle mode={viewMode} onChange={onViewModeChange} />
          <span className="hidden h-4 w-px bg-slate-200 sm:block dark:bg-slate-700" />
          <span className={crm.metricPill}>
            <span className="font-bold tabular-nums text-slate-900 dark:text-white">{resultCount}</span>
            <span className="text-slate-500">leads</span>
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
          <button type="button" className={crm.btnSecondarySm}>
            <Download className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Export</span>
          </button>
          <button type="button" onClick={onCreateStage} className={crm.btnSecondarySm}>
            <GitBranchPlus className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Create stage</span>
          </button>
          <button type="button" onClick={onCreateLead} className={crm.btnPrimarySm}>
            <UserPlus className="h-3.5 w-3.5" />
            Create lead
          </button>
        </div>
      </div>
    </div>
  );
}
