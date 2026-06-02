"use client";

import { useMemo, useState } from "react";
import { ArrowRight, Layers, TrendingUp, Wallet } from "lucide-react";

import { OpportunityFormModal } from "@/features/workspace/components/crm/opportunity-form-modal";
import { PipelineKanbanBoard } from "@/features/workspace/components/crm/pipeline-kanban-board";
import { EnterprisePageShell } from "@/features/workspace/components/enterprise/enterprise-page-shell";
import { EnterpriseToolbar } from "@/features/workspace/components/enterprise/enterprise-toolbar";
import { useDebouncedSearch } from "@/features/workspace/hooks/use-debounced-search";
import {
  DEMO_OPPORTUNITIES,
  formatDealValue,
  type OpportunityRecord,
} from "@/features/workspace/data/crm-demo";

export function CrmPipelinesView() {
  const [opportunities, setOpportunities] = useState<OpportunityRecord[]>(DEMO_OPPORTUNITIES);
  const [search, setSearch] = useState("");
  const { effectiveQuery, validation } = useDebouncedSearch(search, { minLength: 2 });
  const [modalOpen, setModalOpen] = useState(false);

  const totals = useMemo(() => {
    const open = opportunities.filter((o) => o.stageId !== "closed_won");
    const won = opportunities.filter((o) => o.stageId === "closed_won");
    const openValue = open.reduce((s, o) => s + o.value, 0);
    const wonValue = won.reduce((s, o) => s + o.value, 0);
    const enterprise = open.filter((o) => o.value >= 100_000).reduce((s, o) => s + o.value, 0);
    const smb = open.filter((o) => o.value < 100_000).reduce((s, o) => s + o.value, 0);
    return { openCount: open.length, openValue, wonValue, enterprise, smb };
  }, [opportunities]);

  return (
    <>
      <EnterprisePageShell
        eyebrow="Operations · CRM"
        title="Pipelines"
        description="Drag opportunities between stages to update forecast. Weighted values roll up in real time."
        metrics={[
          {
            label: "Enterprise pipeline",
            value: formatDealValue(totals.enterprise),
            hint: "Deals ≥ $100k",
            trend: "+12%",
            trendUp: true,
            icon: Wallet,
            tone: "blue",
          },
          {
            label: "SMB pipeline",
            value: formatDealValue(totals.smb),
            hint: "Deals under $100k",
            icon: Layers,
            tone: "purple",
          },
          {
            label: "Open pipeline",
            value: formatDealValue(totals.openValue),
            hint: `${totals.openCount} active deals`,
            trend: "Weighted",
            trendUp: true,
            icon: TrendingUp,
            tone: "emerald",
          },
          {
            label: "Closed won",
            value: formatDealValue(totals.wonValue),
            hint: "This quarter",
            icon: ArrowRight,
            tone: "amber",
          },
        ]}
        toolbar={
          <EnterpriseToolbar
            searchPlaceholder="Search deals…"
            searchValue={search}
            onSearchChange={setSearch}
            searchHint={validation.message}
            primaryLabel="New opportunity"
            onPrimaryClick={() => setModalOpen(true)}
          />
        }
      >
        <div className="mb-3 flex items-center justify-between gap-4">
          <p className="text-xs font-medium text-slate-500">
            <span className="font-semibold text-slate-700 dark:text-slate-300">{opportunities.length}</span>{" "}
            opportunities · drag cards to change stage
          </p>
        </div>
        <PipelineKanbanBoard
          opportunities={opportunities}
          onChange={setOpportunities}
          searchQuery={effectiveQuery}
        />
      </EnterprisePageShell>

      <OpportunityFormModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSubmit={(deal) => setOpportunities((prev) => [deal, ...prev])}
      />
    </>
  );
}
