"use client";

import { useMemo, useState } from "react";
import { Eye } from "lucide-react";

import { CrmPageHeader } from "@/features/workspace/components/crm/crm-workspace-header";
import { CrmShell } from "@/features/workspace/components/crm/crm-panel";
import type { CrmViewMode } from "@/features/workspace/components/crm/crm-view-toggle";
import { DealDetailDrawer } from "@/features/workspace/components/crm/deals/deal-detail-drawer";
import { DealFormModal } from "@/features/workspace/components/crm/deals/deal-form-modal";
import { DealsDirectoryToolbar, type DealsFilters } from "@/features/workspace/components/crm/deals/deals-directory-toolbar";
import { DealsKanbanBoard } from "@/features/workspace/components/crm/deals/deals-kanban-board";
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
} from "@/features/workspace/data/deals-demo";

const EMPTY_FILTERS: DealsFilters = { query: "", stage: "", owner: "" };

export function CrmDealsView() {
  const [deals, setDeals] = useState<DealRecord[]>(DEMO_DEALS);
  const [filters, setFilters] = useState<DealsFilters>(EMPTY_FILTERS);
  const [viewMode, setViewMode] = useState<CrmViewMode>("board");
  const [modalOpen, setModalOpen] = useState(false);
  const [editDeal, setEditDeal] = useState<DealRecord | null>(null);
  const [selectedDeal, setSelectedDeal] = useState<DealRecord | null>(null);
  const [refreshing, setRefreshing] = useState(false);

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
    <div className="pb-8">
      <CrmPageHeader
        eyebrow="Operations · CRM"
        title="Deals"
        description="Track revenue opportunities from qualification through close with weighted forecasting."
        metrics={[
          { label: "Open", value: metrics.openCount },
          { label: "Weighted", value: formatDealValue(metrics.weighted) },
          { label: "Won", value: metrics.wonCount },
          { label: "Pipeline", value: formatDealValue(metrics.openValue) },
        ]}
      />

      <CrmShell>
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
        />

        <div className="p-3 md:p-4">
          {viewMode === "board" ? (
            <DealsKanbanBoard
                deals={filtered}
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
      </CrmShell>

      <DealFormModal
        open={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setEditDeal(null);
        }}
        initial={editDeal}
        onSubmit={upsertDeal}
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
