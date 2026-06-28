"use client";

import { useState, useRef, useEffect } from "react";
import { Check, ChevronDown, ChevronUp, Download, GitBranchPlus, Layers, Plus, RefreshCw, Search, UserPlus } from "lucide-react";

import { crm } from "@/features/workspace/components/crm/crm-styles";
import { CrmViewToggle, type CrmViewMode } from "@/features/workspace/components/crm/crm-view-toggle";
import { cn } from "@/lib/utils/cn";
import type { CrmPipeline } from "@/lib/api/crm";

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
  onExport?: () => void;
  exporting?: boolean;
  onRefresh?: () => void;
  refreshing?: boolean;
  showPipelineToggle?: boolean;
  pipelinePanelOpen?: boolean;
  onPipelinePanelToggle?: () => void;
  pipelines?: CrmPipeline[];
  activePipeline?: CrmPipeline | null;
  onSelectPipeline?: (pipeline: CrmPipeline) => void;
};

export function LeadsDirectoryToolbar({
  filters,
  onChange,
  resultCount,
  viewMode,
  onViewModeChange,
  onCreateLead,
  onCreateStage,
  onExport,
  exporting,
  onRefresh,
  refreshing,
  showPipelineToggle,
  pipelinePanelOpen,
  onPipelinePanelToggle,
  pipelines = [],
  activePipeline,
  onSelectPipeline,
}: Props) {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const displayPipelines = pipelines.length > 0 ? pipelines : [{ id: "default", name: "Default Pipeline", companyId: "", stages: [] }];
  const currentPipelineName = activePipeline?.name || displayPipelines[0]?.name || "Pipeline";

  return (
    <div className="border-b border-slate-100 bg-white px-4 py-3 dark:border-slate-800 dark:bg-slate-900">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
        <div className="relative min-w-0 flex-1 lg:max-w-md xl:hidden">
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
          {showPipelineToggle ? (
            <div className="relative" ref={dropdownRef}>
              <button
                type="button"
                onClick={() => setDropdownOpen((v) => !v)}
                className={cn(
                  crm.btnSecondarySm,
                  (pipelinePanelOpen || dropdownOpen) && "border-[#191970]/25 bg-[#191970]/5 text-[#191970] dark:border-[#2277FF]/30 dark:bg-[#2277FF]/10 dark:text-[#2277FF]",
                )}
                title="Select active pipeline"
              >
                <Layers className="h-3.5 w-3.5 text-[#191970] dark:text-[#2277FF]" />
                <span className="font-semibold text-slate-800 dark:text-slate-200">{currentPipelineName}</span>
                {dropdownOpen ? (
                  <ChevronUp className="h-3.5 w-3.5 opacity-70" />
                ) : (
                  <ChevronDown className="h-3.5 w-3.5 opacity-70" />
                )}
              </button>

              {dropdownOpen ? (
                <div className="absolute left-0 z-50 mt-1.5 w-64 rounded-xl border border-slate-200/80 bg-white p-1.5 shadow-xl ring-1 ring-black/5 dark:border-slate-800 dark:bg-slate-900">
                  <div className="px-2 py-1.5 text-[10.5px] font-bold uppercase tracking-wider text-slate-400">
                    Active Pipeline Selector
                  </div>

                  <div className="max-h-60 overflow-y-auto space-y-0.5">
                    {displayPipelines.map((pipe) => {
                      const isActive = activePipeline?.id === pipe.id || (!activePipeline && pipe === displayPipelines[0]);
                      return (
                        <button
                          key={pipe.id}
                          type="button"
                          onClick={() => {
                            if (onSelectPipeline) onSelectPipeline(pipe);
                            setDropdownOpen(false);
                          }}
                          className={cn(
                            "flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-xs font-medium transition",
                            isActive
                              ? "bg-[#191970]/10 font-semibold text-[#191970] dark:bg-[#2277FF]/20 dark:text-[#2277FF]"
                              : "text-slate-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800",
                          )}
                        >
                          <span className="truncate">{pipe.name}</span>
                          {isActive ? <Check className="h-4 w-4 shrink-0 text-[#191970] dark:text-[#2277FF]" /> : null}
                        </button>
                      );
                    })}
                  </div>

                  {onPipelinePanelToggle ? (
                    <div className="mt-1.5 border-t border-slate-100 pt-1.5 dark:border-slate-800">
                      <button
                        type="button"
                        onClick={() => {
                          onPipelinePanelToggle();
                          setDropdownOpen(false);
                        }}
                        className="flex w-full items-center gap-2 rounded-lg px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800"
                      >
                        <Layers className="h-3.5 w-3.5" />
                        <span>{pipelinePanelOpen ? "Hide Overview Panel" : "Show Overview Panel"}</span>
                      </button>
                    </div>
                  ) : null}
                </div>
              ) : null}
            </div>
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
          <button
            type="button"
            onClick={onExport}
            disabled={!onExport || exporting}
            className={cn(crm.btnSecondarySm, "disabled:opacity-50")}
          >
            <Download className={cn("h-3.5 w-3.5", exporting && "animate-pulse")} />
            <span className="hidden sm:inline">{exporting ? "Exporting…" : "Export"}</span>
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
