"use client";

import { Plus, Search } from "lucide-react";

import { inputClassName, selectClassName } from "@/features/workspace/components/enterprise/enterprise-form-modal";
import type { HrmViewMode } from "@/features/workspace/components/hrm/hrm-directory-view-toggle";
import { HrmDirectoryViewToggle } from "@/features/workspace/components/hrm/hrm-directory-view-toggle";
import { cn } from "@/lib/utils/cn";

export type AssetFilters = {
  query: string;
  category: string;
};

type Props = {
  filters: AssetFilters;
  categories: string[];
  viewMode: HrmViewMode;
  resultCount: number;
  onChange: (filters: AssetFilters) => void;
  onViewModeChange: (mode: HrmViewMode) => void;
  onAddAsset: () => void;
};

export function AssetsToolbar({
  filters,
  categories,
  viewMode,
  resultCount,
  onChange,
  onViewModeChange,
  onAddAsset,
}: Props) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex min-w-0 flex-1 flex-wrap items-center gap-2">
        <div className="relative w-full min-w-[200px] flex-1 sm:max-w-xs">
          <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
          <input
            type="search"
            value={filters.query}
            onChange={(e) => onChange({ ...filters, query: e.target.value })}
            placeholder="Search asset, tag, custodian, serial…"
            className={cn(inputClassName, "h-9 pl-8 text-sm")}
          />
        </div>
        <select
          value={filters.category}
          onChange={(e) => onChange({ ...filters, category: e.target.value })}
          className={cn(selectClassName, "h-9 min-w-[140px] text-sm")}
          aria-label="Category filter"
        >
          <option value="">All categories</option>
          {categories.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
      </div>

      <div className="flex items-center gap-2">
        <span className="text-xs text-slate-400">
          <span className="font-semibold tabular-nums text-slate-700">{resultCount}</span> assets
        </span>
        <HrmDirectoryViewToggle viewMode={viewMode} onChange={onViewModeChange} />
        <button
          type="button"
          onClick={onAddAsset}
          className="inline-flex h-9 items-center gap-1.5 rounded-lg bg-[#191970] px-3 text-xs font-semibold text-white hover:bg-[#12124a]"
        >
          <Plus className="h-3.5 w-3.5" />
          Add asset
        </button>
      </div>
    </div>
  );
}
