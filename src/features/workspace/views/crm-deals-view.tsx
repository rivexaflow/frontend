"use client";

import { useMemo, useState } from "react";
import { Eye } from "lucide-react";

import { cn } from "@/lib/utils/cn";
import { useCurrentUser } from "@/hooks/use-current-user";

import { CrmPageHeader } from "@/features/workspace/components/crm/crm-workspace-header";
import { CrmShell } from "@/features/workspace/components/crm/crm-panel";
import type { CrmViewMode } from "@/features/workspace/components/crm/crm-view-toggle";
import { DealDetailDrawer } from "@/features/workspace/components/crm/deals/deal-detail-drawer";
import { DealFormModal } from "@/features/workspace/components/crm/deals/deal-form-modal";
import { DealsDirectoryToolbar, type DealsFilters } from "@/features/workspace/components/crm/deals/deals-directory-toolbar";
import { DealsKanbanBoard } from "@/features/workspace/components/crm/deals/deals-kanban-board";
import {
  DealsPipelineHierarchy,
  DEAL_PIPELINE_PHASES,
} from "@/features/workspace/components/crm/deals/deals-pipeline-hierarchy";
import {
  EnterpriseDataTable,
  StatusBadge,
  type TableColumn,
} from "@/features/workspace/components/enterprise/enterprise-data-table";
import { useDebouncedSearch } from "@/features/workspace/hooks/use-debounced-search";
import {
  DEAL_STAGE_META,
  DEMO_DEALS,
  formatDealValue,
  type DealRecord,
  type DealStage,
} from "@/features/workspace/data/deals-demo";

const EMPTY_FILTERS: DealsFilters = { query: "", stage: "", owner: "" };

const BOARD_STAGES: DealStage[] = [
  "qualification",
  "discovery",
  "proposal",
  "negotiation",
  "closed_won",
  "closed_lost",
];

export function CrmDealsView() {
  const currentUser = useCurrentUser();
  const isAdmin =
    currentUser?.role === "ADMIN" ||
    currentUser?.role === "SUPER_ADMIN" ||
    currentUser?.profileRole === "owner" ||
    currentUser?.profileRole === "manager";

  const [deals, setDeals] = useState<DealRecord[]>(DEMO_DEALS);
  const [filters, setFilters] = useState<DealsFilters>(EMPTY_FILTERS);
  const [viewMode, setViewMode] = useState<CrmViewMode>("board");
  const [modalOpen, setModalOpen] = useState(false);
  const [editDeal, setEditDeal] = useState<DealRecord | null>(null);
  const [selectedDeal, setSelectedDeal] = useState<DealRecord | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const [selectedPhaseId, setSelectedPhaseId] = useState<string | null>(null);
  const [highlightStageId, setHighlightStageId] = useState<string | null>(null);
  const [pipelinePanelOpen, setPipelinePanelOpen] = useState(true);

  const { effectiveQuery } = useDebouncedSearch(filters.query, { minLength: 0, debounceMs: 250 });

  const owners = useMemo(() => [...new Set(deals.map((d) => d.owner))].sort(), [deals]);

  const filtered = useMemo(() => {
    const q = effectiveQuery.trim().toLowerCase();
    return deals.filter((d) => {
      if (filters.stage && d.stage !== filters.stage) return false;
      if (filters.owner && d.owner !== filters.owner) return false;
      if (!q) return true;
      return (
        d.title.toLowerCase().includes(q) ||
        d.company.toLowerCase().includes(q) ||
        d.reference.toLowerCase().includes(q) ||
        d.owner.toLowerCase().includes(q)
      );
    });
  }, [deals, filters.stage, filters.owner, effectiveQuery]);

  const visibleStages = useMemo(() => {
    if (!selectedPhaseId || viewMode !== "board") return BOARD_STAGES;
    const phase = DEAL_PIPELINE_PHASES.find((p) => p.id === selectedPhaseId);
    if (!phase) return BOARD_STAGES;
    return BOARD_STAGES.filter((s) => phase.stageIds.includes(s));
  }, [selectedPhaseId, viewMode]);

  const metrics = useMemo(() => {
    const open = deals.filter((d) => d.stage !== "closed_won" && d.stage !== "closed_lost");
    const openValue = open.reduce((s, d) => s + d.value, 0);
    const won = deals.filter((d) => d.stage === "closed_won");
    const wonValue = won.reduce((s, d) => s + d.value, 0);
    const weighted = open.reduce((s, d) => s + (d.value * d.probability) / 100, 0);
    return { openCount: open.length, openValue, wonCount: won.length, wonValue, weighted };
  }, [deals]);

  const columns: TableColumn<DealRecord>[] = [
    {
      key: "deal",
      header: "Deal",
      render: (row) => (
        <div>
          <p className="font-semibold text-slate-900 dark:text-white">{row.title}</p>
          <p className="text-xs text-slate-500">
            {row.reference} · {row.company}
          </p>
        </div>
      ),
    },
    {
      key: "value",
      header: "Value",
      render: (row) => (
        <span className="font-semibold text-slate-800 dark:text-slate-200">
          {formatDealValue(row.value, row.currency)}
        </span>
      ),
    },
    {
      key: "stage",
      header: "Stage",
      render: (row) => (
        <StatusBadge label={DEAL_STAGE_META[row.stage].label} tone={DEAL_STAGE_META[row.stage].tone} />
      ),
    },
    {
      key: "probability",
      header: "Probability",
      render: (row) => (
        <div className="flex items-center gap-2">
          <div className="h-1.5 w-16 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
            <div className="h-full rounded-full bg-[#191970]" style={{ width: `${row.probability}%` }} />
          </div>
          <span className="text-xs font-semibold text-slate-600">{row.probability}%</span>
        </div>
      ),
    },
    { key: "owner", header: "Owner", render: (row) => <span className="text-sm text-slate-600">{row.owner}</span> },
    {
      key: "close",
      header: "Close date",
      render: (row) => <span className="text-sm text-slate-500">{row.closeDate}</span>,
    },
  ];

  const upsertDeal = (deal: DealRecord) => {
    setDeals((prev) => {
      const exists = prev.some((d) => d.id === deal.id);
      return exists ? prev.map((d) => (d.id === deal.id ? deal : d)) : [deal, ...prev];
    });
    setSelectedDeal((sel) => (sel?.id === deal.id ? deal : sel));
  };

  const handleRefresh = () => {
    setRefreshing(true);
    window.setTimeout(() => setRefreshing(false), 400);
  };

  return (
    <div
      className={cn(
        viewMode === "board" ? "flex h-[calc(100dvh-8.5rem)] min-h-0 flex-col" : "pb-4",
      )}
    >
      <CrmPageHeader
        metrics={[
          { label: "Open", value: metrics.openCount },
          { label: "Weighted", value: formatDealValue(metrics.weighted) },
          { label: "Won", value: metrics.wonCount },
          { label: "Pipeline", value: formatDealValue(metrics.openValue) },
        ]}
      />

      <CrmShell
        className={cn(
          viewMode === "board" && "flex min-h-0 flex-1 flex-col overflow-hidden",
        )}
      >
        <DealsDirectoryToolbar
          filters={filters}
          onChange={setFilters}
          owners={owners}
          resultCount={filtered.length}
          viewMode={viewMode}
          onViewModeChange={setViewMode}
          onAdd={() => {
            setEditDeal(null);
            setModalOpen(true);
          }}
          onRefresh={handleRefresh}
          refreshing={refreshing}
          showPipelineToggle={viewMode === "board"}
          pipelinePanelOpen={pipelinePanelOpen}
          onPipelinePanelToggle={() => setPipelinePanelOpen((open) => !open)}
        />

        <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
          {viewMode === "board" && pipelinePanelOpen ? (
            <div className="shrink-0">
              <DealsPipelineHierarchy
                phases={DEAL_PIPELINE_PHASES}
                stages={BOARD_STAGES}
                deals={filtered}
                activeStageId={highlightStageId}
                onStageSelect={setHighlightStageId}
                selectedPhaseId={selectedPhaseId}
                onPhaseSelect={setSelectedPhaseId}
              />
            </div>
          ) : null}

          <div
            className={cn(
              viewMode === "board"
                ? "flex min-h-0 flex-1 flex-col overflow-hidden p-3 md:p-4"
                : "p-3 md:p-4",
            )}
          >
            {viewMode === "board" ? (
              <DealsKanbanBoard
                className="min-h-0 flex-1"
                stages={visibleStages}
                deals={filtered}
                isAdmin={isAdmin}
                highlightStageId={highlightStageId}
                onChange={(next) => {
                  const ids = new Set(filtered.map((d) => d.id));
                  setDeals((prev) => {
                    const updated = new Map(next.filter((d) => ids.has(d.id)).map((d) => [d.id, d]));
                    return prev.map((d) => updated.get(d.id) ?? d);
                  });
                }}
                onSelect={setSelectedDeal}
                searchQuery={effectiveQuery}
              />
            ) : (
              <EnterpriseDataTable
                columns={columns}
                rows={filtered}
                emptyMessage="No deals match your filters."
                renderActions={(row) => (
                  <button
                    type="button"
                    onClick={() => setSelectedDeal(row)}
                    className="rounded-lg p-2 text-slate-400 hover:bg-blue-50 hover:text-[#191970]"
                    aria-label="View deal"
                  >
                    <Eye className="h-4 w-4" />
                  </button>
                )}
              />
            )}
          </div>
        </div>
      </CrmShell>

      <DealFormModal
        open={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setEditDeal(null);
        }}
        initial={editDeal}
        onSubmit={upsertDeal}
        isAdmin={isAdmin}
      />

      <DealDetailDrawer
        deal={selectedDeal}
        onClose={() => setSelectedDeal(null)}
        onEdit={(deal) => {
          setEditDeal(deal);
          setModalOpen(true);
        }}
      />
    </div>
  );
}
