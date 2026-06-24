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
import { useHrCompanyId } from "@/features/workspace/hooks/use-hr-company-id";
import { matchesLeadAdvancedFilters, matchesLeadQuickSearch } from "@/lib/workspace/lead-topbar-filters";
import { MISSING_COMPANY_CONTEXT_MESSAGE } from "@/lib/workspace/company-context";
import { workspaceTopbarStore } from "@/stores/workspace-topbar.store";
import {
  LEAD_BOARD_STAGES,
  LEAD_PIPELINE_PHASES,
  type LeadBoardStage,
  type LeadRecord,
  type LeadStatus,
} from "@/features/workspace/data/crm-demo";
import {
  fetchCrmLeads,
  createCrmLead,
  updateCrmLead,
} from "@/lib/api/crm";

const EMPTY_FILTERS: LeadsFilters = { query: "" };

export function CrmLeadsView() {
  const router = useRouter();
  const companyId = useHrCompanyId();
  const [leads, setLeads] = useState<LeadRecord[]>([]);
  const [boardStages, setBoardStages] = useState<LeadBoardStage[]>(LEAD_BOARD_STAGES);
  const [filters, setFilters] = useState<LeadsFilters>(EMPTY_FILTERS);
  const [viewMode, setViewMode] = useState<CrmViewMode>("board");
  const [leadModalOpen, setLeadModalOpen] = useState(false);
  const [stageModalOpen, setStageModalOpen] = useState(false);
  const [selectedLead, setSelectedLead] = useState<LeadRecord | null>(null);
  const [highlightStageId, setHighlightStageId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const quickSearch = workspaceTopbarStore((s) => s.quickSearch);
  const searchableFields = workspaceTopbarStore((s) => s.searchableFields);
  const advancedFilters = workspaceTopbarStore((s) => s.advancedFilters);
  const advancedFiltersActive = workspaceTopbarStore((s) => s.advancedFiltersActive);

  const combinedQuery = [quickSearch, filters.query].filter(Boolean).join(" ").trim();
  const { effectiveQuery } = useDebouncedSearch(combinedQuery, { minLength: 0, debounceMs: 250 });

  const loadLeads = useCallback(async () => {
    if (!companyId) {
      setLoading(false);
      return;
    }
    setError(null);
    try {
      const data = await fetchCrmLeads({ search: effectiveQuery || undefined });
      setLeads(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch CRM leads.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [companyId, effectiveQuery]);

  useEffect(() => {
    loadLeads();
  }, [loadLeads]);

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
      await updateCrmLead(id, { status });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update lead status.");
      // Rollback to database state
      loadLeads();
    }
  }, [loadLeads]);

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
    loadLeads();
  };

  const handleCreateStage = (stage: LeadBoardStage) => {
    setBoardStages((prev) => [...prev, stage]);
    setHighlightStageId(stage.id);
  };

  if (!companyId) {
    return (
      <div className="rounded-xl border border-amber-200/80 bg-amber-50 p-4 text-sm text-amber-800">
        {MISSING_COMPANY_CONTEXT_MESSAGE}
      </div>
    );
  }

  return (
    <div className="pb-4">
      {error ? (
        <div role="alert" className="mb-6 rounded-xl border border-rose-200/80 bg-rose-50 px-4 py-3 text-sm text-rose-800">
          {error}
        </div>
      ) : null}

      <CrmShell className="overflow-visible">
        <LeadsDirectoryToolbar
          filters={filters}
          onChange={setFilters}
          resultCount={filtered.length}
          viewMode={viewMode}
          onViewModeChange={setViewMode}
          onCreateLead={() => setLeadModalOpen(true)}
          onCreateStage={() => setStageModalOpen(true)}
          onRefresh={handleRefresh}
          refreshing={refreshing}
        />

        {loading ? (
          <div className="flex h-64 items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
          </div>
        ) : (
          <>
            {viewMode === "board" ? (
              <LeadsPipelineHierarchy
                phases={LEAD_PIPELINE_PHASES}
                stages={boardStages}
                leads={filtered}
                activeStageId={highlightStageId}
                onStageSelect={setHighlightStageId}
              />
            ) : null}

            <div className="p-3 md:p-4 lg:p-5">
              {viewMode === "board" ? (
                <LeadsKanbanBoard
                  stages={boardStages}
                  leads={filtered}
                  highlightStageId={highlightStageId}
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
                        await updateCrmLead(changedLead.id, { status: changedLead.status });
                      } catch (err) {
                        setError(err instanceof Error ? err.message : "Failed to update lead stage.");
                        loadLeads();
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
          </>
        )}
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
        lead={selectedLead}
        onClose={() => setSelectedLead(null)}
        onStatusChange={updateStatus}
        onConvert={() => router.push("/crm/pipelines")}
      />
    </div>
  );
}
