"use client";

import { useCallback, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

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
import { matchesLeadAdvancedFilters, matchesLeadQuickSearch } from "@/lib/workspace/lead-topbar-filters";
import { workspaceTopbarStore } from "@/stores/workspace-topbar.store";
import {
  DEMO_LEADS,
  LEAD_BOARD_STAGES,
  LEAD_PIPELINE_PHASES,
  type LeadBoardStage,
  type LeadRecord,
  type LeadStatus,
} from "@/features/workspace/data/crm-demo";

const EMPTY_FILTERS: LeadsFilters = { query: "" };

export function CrmLeadsView() {
  const router = useRouter();
  const [leads, setLeads] = useState<LeadRecord[]>(DEMO_LEADS);
  const [boardStages, setBoardStages] = useState<LeadBoardStage[]>(LEAD_BOARD_STAGES);
  const [filters, setFilters] = useState<LeadsFilters>(EMPTY_FILTERS);
  const [viewMode, setViewMode] = useState<CrmViewMode>("board");
  const [leadModalOpen, setLeadModalOpen] = useState(false);
  const [stageModalOpen, setStageModalOpen] = useState(false);
  const [selectedLead, setSelectedLead] = useState<LeadRecord | null>(null);
  const [highlightStageId, setHighlightStageId] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const quickSearch = workspaceTopbarStore((s) => s.quickSearch);
  const searchableFields = workspaceTopbarStore((s) => s.searchableFields);
  const advancedFilters = workspaceTopbarStore((s) => s.advancedFilters);
  const advancedFiltersActive = workspaceTopbarStore((s) => s.advancedFiltersActive);

  const combinedQuery = [quickSearch, filters.query].filter(Boolean).join(" ").trim();
  const { effectiveQuery } = useDebouncedSearch(combinedQuery, { minLength: 0, debounceMs: 250 });

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

  const updateStatus = useCallback((id: string, status: LeadStatus) => {
    setLeads((prev) =>
      prev.map((l) =>
        l.id === id
          ? {
              ...l,
              status,
              boardStage: status,
              updatedAt: "Just now",
              slaStatus: status === "interested" || status === "move_to_activation" ? "on_track" : l.slaStatus,
            }
          : l,
      ),
    );
    setSelectedLead((sel) => (sel?.id === id ? { ...sel, status, boardStage: status } : sel));
  }, []);

  const handleRefresh = () => {
    setRefreshing(true);
    window.setTimeout(() => setRefreshing(false), 400);
  };

  const handleCreateStage = (stage: LeadBoardStage) => {
    setBoardStages((prev) => [...prev, stage]);
    setHighlightStageId(stage.id);
  };

  return (
    <div className="pb-4">
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
              onChange={(next) => {
                const ids = new Set(filtered.map((l) => l.id));
                setLeads((prev) => {
                  const updated = new Map(next.filter((l) => ids.has(l.id)).map((l) => [l.id, l]));
                  return prev.map((l) => updated.get(l.id) ?? l);
                });
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
      </CrmShell>

      <LeadFormModal
        open={leadModalOpen}
        onClose={() => setLeadModalOpen(false)}
        onSubmit={(lead) => setLeads((prev) => [lead, ...prev])}
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
