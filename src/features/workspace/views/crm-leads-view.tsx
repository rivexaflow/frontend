"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

import { CrmShell } from "@/features/workspace/components/crm/crm-panel";
import type { CrmViewMode } from "@/features/workspace/components/crm/crm-view-toggle";
import { LeadFormModal } from "@/features/workspace/components/crm/lead-form-modal";
import { LeadsCreateStageModal } from "@/features/workspace/components/crm/leads/leads-create-stage-modal";
import { LeadDetailDrawer } from "@/features/workspace/components/crm/leads/lead-detail-drawer";
import {
  LeadsDirectoryToolbar,
  type LeadsFilters,
} from "@/features/workspace/components/crm/leads/leads-directory-toolbar";
import { LeadsKanbanBoard } from "@/features/workspace/components/crm/leads/leads-kanban-board";
import { LeadsPipelineHierarchy } from "@/features/workspace/components/crm/leads/leads-pipeline-hierarchy";
import { LeadsInboxPanel } from "@/features/workspace/components/crm/leads/panels/leads-inbox-panel";
import { useDebouncedSearch } from "@/features/workspace/hooks/use-debounced-search";
import { useListSearchFromUrl } from "@/features/workspace/hooks/use-list-search-from-url";
import { useHrCompanyId } from "@/features/workspace/hooks/use-hr-company-id";
import { useCurrentUser } from "@/hooks/use-current-user";
import { matchesLeadAdvancedFilters, matchesLeadQuickSearch } from "@/lib/workspace/lead-topbar-filters";
import { MISSING_COMPANY_CONTEXT_MESSAGE } from "@/lib/workspace/company-context";
import { workspaceTopbarStore } from "@/stores/workspace-topbar.store";
import {
  LEAD_PIPELINE_PHASES,
  type LeadBoardStage,
  type LeadRecord,
  type LeadStatus,
} from "@/features/workspace/data/crm-demo";
import {
  fetchCrmLeads,
  createCrmLead,
  updateCrmLead,
  deleteCrmLead,
  exportCrmLeadsCsv,
  fetchCrmLead,
  fetchCrmPipelines,
  createCrmStage,
  updateCrmStage,
  deleteCrmStage,
  type CrmLeadDetail,
  type CrmPipeline,
} from "@/lib/api/crm";
import { cn } from "@/lib/utils/cn";

const EMPTY_FILTERS: LeadsFilters = { query: "" };

function mapDbStageToBoardStage(stage: any): LeadBoardStage {
  let tone: LeadBoardStage["tone"] = "slate";
  const color = stage.color?.toLowerCase() || "";
  if (color.includes("blue") || color === "#2277ff") tone = "blue";
  else if (color.includes("amber") || color === "#f59e0b") tone = "amber";
  else if (color.includes("emerald") || color === "#10b981") tone = "emerald";
  else if (color.includes("rose") || color === "#ef4444") tone = "rose";
  else if (color.includes("slate")) tone = "slate";
  else if (stage.position % 5 === 0) tone = "blue";
  else if (stage.position % 5 === 1) tone = "amber";
  else if (stage.position % 5 === 2) tone = "emerald";
  else if (stage.position % 5 === 3) tone = "rose";
  return {
    id: stage.id,
    name: stage.name,
    tone,
  };
}

export function CrmLeadsView() {
  const router = useRouter();
  const companyId = useHrCompanyId();
  const currentUser = useCurrentUser();
  
  const isOwner = currentUser?.profileRole === "owner";

  const [leads, setLeads] = useState<LeadRecord[]>([]);
  const [pipelines, setPipelines] = useState<CrmPipeline[]>([]);
  const [activePipeline, setActivePipeline] = useState<CrmPipeline | null>(null);
  const [boardStages, setBoardStages] = useState<LeadBoardStage[]>([]);
  const [filters, setFilters] = useState<LeadsFilters>(EMPTY_FILTERS);
  useListSearchFromUrl((value) => setFilters((current) => ({ ...current, query: value })));
  const [viewMode, setViewMode] = useState<CrmViewMode>("board");
  const [selectedPhaseId, setSelectedPhaseId] = useState<string | null>(null);
  const [leadModalOpen, setLeadModalOpen] = useState(false);
  const [stageModalOpen, setStageModalOpen] = useState(false);
  const [selectedLead, setSelectedLead] = useState<LeadRecord | null>(null);
  const [selectedLeadDetail, setSelectedLeadDetail] = useState<CrmLeadDetail | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [highlightStageId, setHighlightStageId] = useState<string | null>(null);
  const [pipelinePanelOpen, setPipelinePanelOpen] = useState(true);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const quickSearch = workspaceTopbarStore((s) => s.quickSearch);
  const searchableFields = workspaceTopbarStore((s) => s.searchableFields);
  const advancedFilters = workspaceTopbarStore((s) => s.advancedFilters);
  const advancedFiltersActive = workspaceTopbarStore((s) => s.advancedFiltersActive);

  const visibleStages = useMemo(() => {
    if (!selectedPhaseId || viewMode !== "board") return boardStages;
    const phase = LEAD_PIPELINE_PHASES.find((p) => p.id === selectedPhaseId);
    if (!phase) return boardStages;
    return boardStages.filter((s) => phase.stageIds.includes(s.id));
  }, [boardStages, selectedPhaseId, viewMode]);

  const combinedQuery = [quickSearch, filters.query].filter(Boolean).join(" ").trim();
  const { effectiveQuery } = useDebouncedSearch(combinedQuery, { minLength: 0, debounceMs: 250 });

  const loadPipelinesAndLeads = useCallback(async () => {
    if (!companyId) {
      setLoading(false);
      return;
    }
    setError(null);
    try {
      // 1. Fetch Pipelines
      const pipelinesData = await fetchCrmPipelines();
      setPipelines(pipelinesData);
      
      const activePipe = pipelinesData[0] || null;
      setActivePipeline(activePipe);
      
      let mappedStages: LeadBoardStage[] = [];
      if (activePipe && activePipe.stages) {
        mappedStages = activePipe.stages.map(mapDbStageToBoardStage);
      }
      setBoardStages(mappedStages);

      // 2. Fetch Leads
      const leadsData = await fetchCrmLeads({ search: effectiveQuery || undefined });
      setLeads(leadsData);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch CRM data.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [companyId, effectiveQuery]);

  useEffect(() => {
    loadPipelinesAndLeads();
  }, [loadPipelinesAndLeads]);

  useEffect(() => {
    if (!selectedLead) {
      setSelectedLeadDetail(null);
      return;
    }
    setDetailLoading(true);
    void fetchCrmLead(selectedLead.id)
      .then(setSelectedLeadDetail)
      .catch(() => setSelectedLeadDetail({ ...selectedLead, activities: [] }))
      .finally(() => setDetailLoading(false));
  }, [selectedLead]);

  const handleExport = async () => {
    setExporting(true);
    setError(null);
    try {
      await exportCrmLeadsCsv({ search: effectiveQuery || undefined });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to export leads.");
    } finally {
      setExporting(false);
    }
  };

  const handleDeleteLead = async (id: string) => {
    setError(null);
    try {
      await deleteCrmLead(id);
      setLeads((prev) => prev.filter((l) => l.id !== id));
      setSelectedLead(null);
      setSelectedLeadDetail(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete lead.");
    }
  };

  const handleLeadDetailRefresh = async () => {
    if (!selectedLead) return;
    const detail = await fetchCrmLead(selectedLead.id);
    setSelectedLeadDetail(detail);
    setLeads((prev) => prev.map((l) => (l.id === detail.id ? detail : l)));
    setSelectedLead(detail);
  };

  const filtered = useMemo(() => {
    const q = effectiveQuery.trim().toLowerCase();
    return leads.filter((l) => {
      if (advancedFiltersActive && !matchesLeadAdvancedFilters(l, advancedFilters)) return false;
      if (!q) return true;
      if (quickSearch.trim()) {
        return matchesLeadQuickSearch(l, quickSearch, searchableFields);
      }
      return (
        l.name.toLowerCase().includes(q) ||
        l.company.toLowerCase().includes(q) ||
        l.email.toLowerCase().includes(q) ||
        l.owner.toLowerCase().includes(q)
      );
    });
  }, [leads, effectiveQuery, quickSearch, searchableFields, advancedFilters, advancedFiltersActive]);

  const updateStatus = useCallback(async (id: string, status: LeadStatus) => {
    setError(null);
    // Optimistic UI update
    setLeads((prev) =>
      prev.map((l) =>
        l.id === id
          ? {
              ...l,
              status,
              boardStage: status,
              updatedAt: "Just now",
            }
          : l,
      ),
    );
    setSelectedLead((sel) => (sel?.id === id ? { ...sel, status, boardStage: status } : sel));

    try {
      await updateCrmLead(id, { status, stageId: status });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update lead status.");
      // Rollback to database state
      loadPipelinesAndLeads();
    }
  }, [loadPipelinesAndLeads]);

  const handleCreateLead = async (leadValues: LeadRecord) => {
    setError(null);
    try {
      const newLead = await createCrmLead({
        name: leadValues.name,
        title: leadValues.title,
        company: leadValues.company,
        email: leadValues.email,
        phone: leadValues.phone,
        country: leadValues.country,
        source: leadValues.source,
        owner: leadValues.owner,
      });
      setLeads((prev) => [newLead, ...prev]);
      setLeadModalOpen(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create lead.");
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    loadPipelinesAndLeads();
  };

  const handleCreateStage = async (stage: LeadBoardStage) => {
    if (!activePipeline) return;
    setError(null);
    try {
      let color = "#4F46E5";
      if (stage.tone === "blue") color = "#2277FF";
      else if (stage.tone === "amber") color = "#F59E0B";
      else if (stage.tone === "emerald") color = "#10B981";
      else if (stage.tone === "rose") color = "#EF4444";
      else if (stage.tone === "slate") color = "#64748B";

      await createCrmStage(activePipeline.id, {
        name: stage.name,
        color,
        position: boardStages.length,
      });
      await loadPipelinesAndLeads();
      setHighlightStageId(stage.id);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create stage.");
    }
  };

  const handleRenameStage = async (stageId: string, newName: string) => {
    if (!activePipeline) return;
    setError(null);
    try {
      await updateCrmStage(activePipeline.id, stageId, { name: newName });
      await loadPipelinesAndLeads();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to rename stage.");
    }
  };

  const handleDeleteStage = async (stageId: string) => {
    if (!activePipeline) return;
    setError(null);
    try {
      await deleteCrmStage(activePipeline.id, stageId);
      await loadPipelinesAndLeads();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete stage.");
    }
  };

  if (!companyId) {
    return (
      <div className="rounded-xl border border-amber-200/80 bg-amber-50 p-4 text-sm text-amber-800">
        {MISSING_COMPANY_CONTEXT_MESSAGE}
      </div>
    );
  }

  return (
    <div
      className={cn(
        viewMode === "board" ? "flex h-[calc(100dvh-5.25rem)] min-h-0 flex-col" : "pb-4",
      )}
    >
      {error ? (
        <div role="alert" className="mb-3 shrink-0 rounded-xl border border-rose-200/80 bg-rose-50 px-4 py-3 text-sm text-rose-800">
          {error}
        </div>
      ) : null}

      <CrmShell
        className={cn(
          viewMode === "board" && "flex min-h-0 flex-1 flex-col overflow-hidden",
        )}
      >
        <LeadsDirectoryToolbar
          filters={filters}
          onChange={setFilters}
          resultCount={filtered.length}
          viewMode={viewMode}
          onViewModeChange={setViewMode}
          onCreateLead={() => setLeadModalOpen(true)}
          onCreateStage={() => setStageModalOpen(true)}
          onExport={() => void handleExport()}
          exporting={exporting}
          onRefresh={handleRefresh}
          refreshing={refreshing}
          showPipelineToggle={viewMode === "board"}
          pipelinePanelOpen={pipelinePanelOpen}
          onPipelinePanelToggle={() => setPipelinePanelOpen((open) => !open)}
        />

        <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
          {loading ? (
            <div className="flex flex-1 items-center justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
            </div>
          ) : (
          <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
            {viewMode === "board" && pipelinePanelOpen ? (
              <div className="shrink-0">
                <LeadsPipelineHierarchy
                  phases={LEAD_PIPELINE_PHASES}
                  stages={boardStages}
                  leads={filtered}
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
                  ? "flex min-h-0 flex-1 flex-col overflow-hidden p-3 md:p-4 lg:p-5"
                  : "p-3 md:p-4 lg:p-5",
              )}
            >
              {viewMode === "board" ? (
                <LeadsKanbanBoard
                  className="min-h-0 flex-1"
                  stages={visibleStages}
                  leads={filtered}
                  highlightStageId={highlightStageId}
                  isOwner={isOwner}
                  onRenameStage={handleRenameStage}
                  onDeleteStage={handleDeleteStage}
                  onChange={async (next) => {
                    // Find which lead changed status
                    const changedLead = next.find((newLead) => {
                      const oldLead = leads.find((l) => l.id === newLead.id);
                      return oldLead && oldLead.status !== newLead.status;
                    });

                    // Optimistic update
                    const ids = new Set(filtered.map((l) => l.id));
                    setLeads((prev) => {
                      const updated = new Map(next.filter((l) => ids.has(l.id)).map((l) => [l.id, l]));
                      return prev.map((l) => updated.get(l.id) ?? l);
                    });

                    if (changedLead) {
                      try {
                        await updateCrmLead(changedLead.id, {
                          status: changedLead.status,
                          stageId: changedLead.boardStage,
                        });
                      } catch (err) {
                        setError(err instanceof Error ? err.message : "Failed to update lead stage.");
                        loadPipelinesAndLeads();
                      }
                    }
                  }}
                  onSelect={setSelectedLead}
                  searchQuery={effectiveQuery}
                />
              ) : (
                <LeadsInboxPanel
                  leads={filtered}
                  search={filters.query}
                  onSelect={setSelectedLead}
                  onStatusChange={updateStatus}
                />
              )}
            </div>
          </div>
          )}
        </div>
      </CrmShell>

      <LeadFormModal
        open={leadModalOpen}
        onClose={() => setLeadModalOpen(false)}
        onSubmit={handleCreateLead}
      />

      <LeadsCreateStageModal
        open={stageModalOpen}
        existingIds={boardStages.map((s) => s.id)}
        onClose={() => setStageModalOpen(false)}
        onCreate={handleCreateStage}
      />

      <LeadDetailDrawer
        lead={selectedLeadDetail ?? selectedLead}
        loading={detailLoading}
        onClose={() => {
          setSelectedLead(null);
          setSelectedLeadDetail(null);
        }}
        onStatusChange={updateStatus}
        onConvert={() => router.push("/crm/pipelines")}
        onDelete={handleDeleteLead}
        onActivityLogged={handleLeadDetailRefresh}
      />
    </div>
  );
}
