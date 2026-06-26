"use client";

import { useMemo, useState } from "react";
import { Plus, RefreshCw } from "lucide-react";

import { CrmShell } from "@/features/workspace/components/crm/crm-panel";
import { crm } from "@/features/workspace/components/crm/crm-styles";
import { CrmPageHeader } from "@/features/workspace/components/crm/crm-workspace-header";
import { cn } from "@/lib/utils/cn";
import { OpportunityFormModal } from "@/features/workspace/components/crm/opportunity-form-modal";
import { PipelineKanbanBoard } from "@/features/workspace/components/crm/pipeline-kanban-board";
import { useDebouncedSearch } from "@/features/workspace/hooks/use-debounced-search";
import {
  DEMO_OPPORTUNITIES,
  formatDealValue,
  PIPELINE_STAGES,
  type OpportunityRecord,
} from "@/features/workspace/data/crm-demo";

const PIPELINE_OPTIONS = [
  { id: "sales", label: "Sales pipeline" },
  { id: "enterprise", label: "Enterprise expansion" },
  { id: "renewals", label: "Renewals" },
] as const;

export function CrmPipelinesView() {
  const [opportunities, setOpportunities] = useState<OpportunityRecord[]>(DEMO_OPPORTUNITIES);
  const [pipelineId, setPipelineId] = useState<(typeof PIPELINE_OPTIONS)[number]["id"]>("sales");
  const [search, setSearch] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const { effectiveQuery, validation } = useDebouncedSearch(search, { minLength: 2 });

  const totals = useMemo(() => {
    const open = opportunities.filter((o) => o.stageId !== "closed_won");
    const won = opportunities.filter((o) => o.stageId === "closed_won");
    const openValue = open.reduce((s, o) => s + o.value, 0);
    const wonValue = won.reduce((s, o) => s + o.value, 0);
    const weighted = open.reduce((s, o) => s + (o.value * o.probability) / 100, 0);
    const enterprise = open.filter((o) => o.value >= 100_000).reduce((s, o) => s + o.value, 0);
    return { openCount: open.length, openValue, wonValue, weighted, enterprise };
  }, [opportunities]);

  const handleRefresh = () => {
    setRefreshing(true);
    window.setTimeout(() => setRefreshing(false), 400);
  };

  return (
    <div className="pb-4">
      <CrmPageHeader
        metrics={[
          { label: "Open", value: formatDealValue(totals.openValue) },
          { label: "Weighted", value: formatDealValue(totals.weighted) },
          { label: "Enterprise", value: formatDealValue(totals.enterprise) },
          { label: "Won", value: formatDealValue(totals.wonValue) },
        ]}
      />

      <CrmShell>
        <div className="border-b border-slate-100 bg-slate-50/50 px-4 py-3 dark:border-slate-800 dark:bg-slate-950/25">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
            <select
              value={pipelineId}
              onChange={(e) => setPipelineId(e.target.value as typeof pipelineId)}
              className={cn(crm.select, "h-9 px-3 text-sm lg:max-w-[200px]")}
            >
              {PIPELINE_OPTIONS.map((p) => (
                <option key={p.id} value={p.id}>{p.label}</option>
              ))}
            </select>
            <input
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search opportunities…"
              className={cn(crm.inputSm, "w-full lg:max-w-xs")}
            />
            {validation.message ? (
              <span className="text-xs text-amber-700">{validation.message}</span>
            ) : null}
            <div className="flex flex-wrap items-center gap-2 lg:ml-auto">
              <span className={crm.metricPill}>
                <span className="font-bold tabular-nums text-slate-900 dark:text-white">{opportunities.length}</span>
                <span className="text-slate-500">opportunities · {PIPELINE_STAGES.length} stages</span>
              </span>
              <button
                type="button"
                onClick={handleRefresh}
                disabled={refreshing}
                className={cn(crm.btnSecondarySm, "disabled:opacity-50")}
              >
                <RefreshCw className={cn("h-3.5 w-3.5", refreshing && "animate-spin")} />
                Refresh
              </button>
              <button type="button" onClick={() => setModalOpen(true)} className={crm.btnPrimarySm}>
                <Plus className="h-3.5 w-3.5" />
                New opportunity
              </button>
            </div>
          </div>
        </div>

        <div className="bg-slate-50/40 p-3 md:p-4 dark:bg-slate-950/20">
          <PipelineKanbanBoard
            opportunities={opportunities}
            onChange={setOpportunities}
            searchQuery={effectiveQuery}
          />
        </div>
      </CrmShell>

      <OpportunityFormModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSubmit={(deal) => setOpportunities((prev) => [deal, ...prev])}
      />
    </div>
  );
}
