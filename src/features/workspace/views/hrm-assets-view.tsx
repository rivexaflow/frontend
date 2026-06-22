"use client";

import { useMemo, useState } from "react";
import { AnimatePresence } from "framer-motion";
import { CheckCircle2, IndianRupee, Package, PackageCheck, PackageOpen, Wrench } from "lucide-react";

import { AssetCard } from "@/features/workspace/components/hrm/assets/asset-card";
import { AssetDetailPanel } from "@/features/workspace/components/hrm/assets/asset-detail-panel";
import {
  AssetFormModal,
  assetFormToRecord,
  type AssetFormValues,
} from "@/features/workspace/components/hrm/assets/asset-form-modal";
import { AssetsTable } from "@/features/workspace/components/hrm/assets/assets-table";
import {
  AssetsToolbar,
  type AssetFilters,
} from "@/features/workspace/components/hrm/assets/assets-toolbar";
import { CrmPanel, CrmPanelHead, CrmShell } from "@/features/workspace/components/crm/crm-panel";
import { HrmCompactBanner, HrmPanelTabs } from "@/features/workspace/components/hrm/hrm-compact-banner";
import type { HrmViewMode } from "@/features/workspace/components/hrm/hrm-directory-view-toggle";
import { OrgChartStatStrip } from "@/features/workspace/components/hrm/org-chart-stat-strip";
import {
  DEMO_HRM_ASSETS,
  formatAssetValue,
  getAssetStats,
  nextAssetTag,
  type AssetTab,
  type HrmAssetRecord,
} from "@/features/workspace/data/hrm-assets-demo";
import { cn } from "@/lib/utils/cn";

const EMPTY_FILTERS: AssetFilters = { query: "", category: "" };

export function HrmAssetsView() {
  const [assets, setAssets] = useState<HrmAssetRecord[]>(() => [...DEMO_HRM_ASSETS]);
  const [tab, setTab] = useState<AssetTab>("all");
  const [filters, setFilters] = useState<AssetFilters>(EMPTY_FILTERS);
  const [viewMode, setViewMode] = useState<HrmViewMode>("grid");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const stats = useMemo(() => getAssetStats(assets), [assets]);

  const tabFiltered = useMemo(() => {
    if (tab === "all") return assets;
    return assets.filter((a) => a.status === tab);
  }, [assets, tab]);

  const filtered = useMemo(() => {
    const q = filters.query.trim().toLowerCase();
    return tabFiltered.filter((a) => {
      if (filters.category && a.category !== filters.category) return false;
      if (!q) return true;
      const hay = `${a.name} ${a.tag} ${a.custodian} ${a.serial} ${a.department} ${a.category}`.toLowerCase();
      return hay.includes(q);
    });
  }, [tabFiltered, filters]);

  const selected = selectedId ? assets.find((a) => a.id === selectedId) ?? null : null;

  const showSuccess = (msg: string) => {
    setSuccessMessage(msg);
    window.setTimeout(() => setSuccessMessage(null), 4000);
  };

  const handleAddAsset = (values: AssetFormValues) => {
    const id = `a${Date.now()}`;
    const record = assetFormToRecord(values, id);
    setAssets((prev) => [record, ...prev]);
    setSelectedId(id);
    showSuccess(`${record.tag} added to the register — ready to assign.`);
  };

  return (
    <div className="pb-8">
      {successMessage ? (
        <div className="mx-3 mb-3 mt-1 flex items-start gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-2.5 text-sm text-emerald-800 md:mx-4">
          <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" />
          {successMessage}
        </div>
      ) : null}

      <CrmShell>
        <HrmCompactBanner
          title="Asset management"
          subtitle="Register laptops, phones, and equipment · track custodians & lifecycle"
          stats={[
            { label: "Assigned", value: stats.assigned, tone: "success" },
            { label: "Available", value: stats.available },
            { label: "In repair", value: stats.repair, tone: "warning" },
            { label: "Portfolio", value: formatAssetValue(stats.totalValue) },
          ]}
          actions={
            <button
              type="button"
              onClick={() => setFormOpen(true)}
              className="inline-flex h-8 items-center gap-1.5 rounded-lg bg-white/15 px-3 text-xs font-semibold text-white ring-1 ring-white/20 hover:bg-white/25"
            >
              + Add asset
            </button>
          }
        />

        <HrmPanelTabs
          tabs={[
            { id: "all" as const, label: "All assets", count: stats.total },
            { id: "assigned" as const, label: "Assigned", count: stats.assigned },
            { id: "available" as const, label: "Available", count: stats.available },
            { id: "repair" as const, label: "In repair", count: stats.repair },
          ]}
          active={tab}
          onChange={setTab}
        />

        <div className="space-y-4 p-3 md:p-4">
          <OrgChartStatStrip
            stats={[
              { label: "Total assets", value: stats.total, hint: "Registered", icon: Package, tone: "blue" },
              { label: "In use", value: stats.assigned, hint: "With custodian", icon: PackageCheck, tone: "emerald" },
              { label: "Spare pool", value: stats.available, hint: "Ready to assign", icon: PackageOpen, tone: "blue" },
            ]}
          />

          {stats.repair > 0 ? (
            <div className="flex items-start gap-2 rounded-xl border border-amber-200/80 bg-amber-50/60 px-4 py-3 text-sm text-amber-900">
              <Wrench className="mt-0.5 h-4 w-4 shrink-0" />
              <p>
                <strong className="font-semibold">{stats.repair} asset{stats.repair === 1 ? "" : "s"}</strong> in repair
                — check service center status before reassigning.
              </p>
            </div>
          ) : null}

          <div className="flex flex-wrap gap-2">
            <CategoryChip
              label="All categories"
              active={!filters.category}
              onClick={() => setFilters((f) => ({ ...f, category: "" }))}
            />
            {stats.categories.map((cat) => (
              <CategoryChip
                key={cat}
                label={cat}
                active={filters.category === cat}
                onClick={() => setFilters((f) => ({ ...f, category: f.category === cat ? "" : cat }))}
              />
            ))}
          </div>

          <CrmPanel>
            <CrmPanelHead
              title="Asset register"
              subtitle="Click any item for custody history, specs, and actions"
              actions={
                <span className="inline-flex items-center gap-1 text-xs font-medium text-slate-400">
                  <IndianRupee className="h-3.5 w-3.5" />
                  {formatAssetValue(stats.totalValue)} total value
                </span>
              }
            />
            <div className="space-y-4 p-4">
              <AssetsToolbar
                filters={filters}
                categories={stats.categories}
                viewMode={viewMode}
                resultCount={filtered.length}
                onChange={setFilters}
                onViewModeChange={setViewMode}
                onAddAsset={() => setFormOpen(true)}
              />

              {viewMode === "grid" ? (
                <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                  {filtered.map((asset) => (
                    <AssetCard
                      key={asset.id}
                      asset={asset}
                      selected={selectedId === asset.id}
                      onSelect={() => setSelectedId(asset.id)}
                    />
                  ))}
                </div>
              ) : (
                <AssetsTable
                  assets={filtered}
                  selectedId={selectedId}
                  onSelect={(a) => setSelectedId(a.id)}
                />
              )}

              {filtered.length === 0 ? (
                <div className="rounded-xl border border-dashed border-slate-200 py-14 text-center">
                  <Package className="mx-auto h-8 w-8 text-slate-300" />
                  <p className="mt-3 text-sm font-medium text-slate-600">No assets match your filters</p>
                  <button
                    type="button"
                    onClick={() => {
                      setFilters(EMPTY_FILTERS);
                      setTab("all");
                    }}
                    className="mt-2 text-sm font-semibold text-[#2277ff] hover:underline"
                  >
                    Clear filters
                  </button>
                </div>
              ) : null}
            </div>
          </CrmPanel>
        </div>
      </CrmShell>

      <AssetFormModal
        open={formOpen}
        suggestedTag={nextAssetTag(assets)}
        onClose={() => setFormOpen(false)}
        onSubmit={handleAddAsset}
      />

      <AnimatePresence>
        {selected ? <AssetDetailPanel key={selected.id} asset={selected} onClose={() => setSelectedId(null)} /> : null}
      </AnimatePresence>
    </div>
  );
}

function CategoryChip({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "rounded-full px-3 py-1 text-xs font-semibold transition",
        active
          ? "bg-[#191970] text-white shadow-sm"
          : "bg-white text-slate-600 ring-1 ring-slate-200 hover:ring-[#2277ff]/40",
      )}
    >
      {label}
    </button>
  );
}
