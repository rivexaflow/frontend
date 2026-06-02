"use client";

import { useMemo, useState } from "react";
import {
  Briefcase,
  DollarSign,
  Filter,
  TrendingUp,
  Trophy,
} from "lucide-react";

import {
  EnterpriseDataTable,
  StatusBadge,
  type TableColumn,
} from "@/features/workspace/components/enterprise/enterprise-data-table";
import { EnterprisePageShell } from "@/features/workspace/components/enterprise/enterprise-page-shell";
import { EnterpriseToolbar } from "@/features/workspace/components/enterprise/enterprise-toolbar";
import {
  DEAL_STAGE_META,
  DEMO_DEALS,
  formatDealValue,
  type DealRecord,
  type DealStage,
} from "@/features/workspace/data/deals-demo";
import { cn } from "@/lib/utils/cn";

const STAGE_FILTERS: { id: DealStage | "all"; label: string }[] = [
  { id: "all", label: "All stages" },
  { id: "qualification", label: "Qualification" },
  { id: "discovery", label: "Discovery" },
  { id: "proposal", label: "Proposal" },
  { id: "negotiation", label: "Negotiation" },
  { id: "closed_won", label: "Closed won" },
  { id: "closed_lost", label: "Closed lost" },
];

export function CrmDealsView() {
  const [deals] = useState<DealRecord[]>(DEMO_DEALS);
  const [search, setSearch] = useState("");
  const [stageFilter, setStageFilter] = useState<DealStage | "all">("all");

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return deals.filter((d) => {
      if (stageFilter !== "all" && d.stage !== stageFilter) return false;
      if (!q) return true;
      return (
        d.title.toLowerCase().includes(q) ||
        d.company.toLowerCase().includes(q) ||
        d.reference.toLowerCase().includes(q) ||
        d.owner.toLowerCase().includes(q)
      );
    });
  }, [deals, search, stageFilter]);

  const metrics = useMemo(() => {
    const open = deals.filter(
      (d) => d.stage !== "closed_won" && d.stage !== "closed_lost",
    );
    const openValue = open.reduce((s, d) => s + d.value, 0);
    const won = deals.filter((d) => d.stage === "closed_won");
    const wonValue = won.reduce((s, d) => s + d.value, 0);
    const weighted = open.reduce((s, d) => s + (d.value * d.probability) / 100, 0);
    return {
      openCount: open.length,
      openValue,
      wonCount: won.length,
      wonValue,
      weighted,
    };
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
            <div
              className="h-full rounded-full bg-blue-600"
              style={{ width: `${row.probability}%` }}
            />
          </div>
          <span className="text-xs font-semibold text-slate-600">{row.probability}%</span>
        </div>
      ),
    },
    {
      key: "owner",
      header: "Owner",
      render: (row) => <span className="text-sm text-slate-600">{row.owner}</span>,
    },
    {
      key: "close",
      header: "Close date",
      render: (row) => <span className="text-sm text-slate-500">{row.closeDate}</span>,
    },
  ];

  return (
    <EnterprisePageShell
      eyebrow="Operations · CRM"
      title="Deals"
      description="Track revenue opportunities from qualification through close. Forecast with weighted pipeline and owner accountability."
      metrics={[
        {
          label: "Open deals",
          value: String(metrics.openCount),
          hint: formatDealValue(metrics.openValue),
          icon: Briefcase,
          tone: "blue",
        },
        {
          label: "Weighted pipeline",
          value: formatDealValue(metrics.weighted),
          hint: "Probability-adjusted",
          icon: TrendingUp,
          tone: "purple",
        },
        {
          label: "Won (period)",
          value: String(metrics.wonCount),
          hint: formatDealValue(metrics.wonValue),
          icon: Trophy,
          tone: "purple",
        },
        {
          label: "Avg. deal size",
          value: formatDealValue(
            Math.round(
              deals.reduce((s, d) => s + d.value, 0) / Math.max(deals.length, 1),
            ),
          ),
          hint: "All opportunities",
          icon: DollarSign,
          tone: "amber",
        },
      ]}
      toolbar={
        <div className="flex flex-wrap items-center gap-2">
          <EnterpriseToolbar
            searchValue={search}
            onSearchChange={setSearch}
            searchPlaceholder="Search deals, company, owner…"
            primaryLabel="New deal"
            onPrimaryClick={() => {}}
          />
        </div>
      }
    >
      <div className="flex flex-wrap items-center gap-2">
        <Filter className="h-4 w-4 text-slate-400" aria-hidden />
        {STAGE_FILTERS.map((f) => (
          <button
            key={f.id}
            type="button"
            onClick={() => setStageFilter(f.id)}
            className={cn(
              "rounded-lg px-3 py-1.5 text-xs font-semibold transition",
              stageFilter === f.id
                ? "bg-blue-600 text-white shadow-sm"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300",
            )}
          >
            {f.label}
          </button>
        ))}
      </div>

      <EnterpriseDataTable columns={columns} rows={filtered} />
    </EnterprisePageShell>
  );
}
