"use client";

import { Download, Filter, Plus, Search } from "lucide-react";

import { cn } from "@/lib/utils/cn";

type Props = {
  searchPlaceholder?: string;
  searchValue?: string;
  onSearchChange?: (value: string) => void;
  searchHint?: string | null;
  primaryLabel?: string;
  onPrimaryClick?: () => void;
  showExport?: boolean;
  className?: string;
};

export function EnterpriseToolbar({
  searchPlaceholder = "Search records…",
  searchValue = "",
  onSearchChange,
  searchHint,
  primaryLabel = "Create",
  onPrimaryClick,
  showExport = true,
  className,
}: Props) {
  return (
    <>
      <div className="flex min-w-[220px] flex-1 flex-col gap-1 lg:max-w-sm">
        <div
          className={cn(
            "flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 shadow-sm dark:border-slate-700 dark:bg-slate-900",
            searchHint && "border-amber-200 ring-1 ring-amber-100",
            className,
          )}
        >
          <Search className="h-4 w-4 shrink-0 text-slate-400" />
          <input
            type="search"
            value={searchValue}
            onChange={(e) => onSearchChange?.(e.target.value)}
            placeholder={searchPlaceholder}
            className="w-full bg-transparent text-sm outline-none placeholder:text-slate-400"
            aria-label="Search"
            aria-invalid={searchHint ? true : undefined}
            aria-describedby={searchHint ? "toolbar-search-hint" : undefined}
          />
        </div>
        {searchHint ? (
          <p id="toolbar-search-hint" className="text-[11px] font-medium text-amber-600">
            {searchHint}
          </p>
        ) : null}
      </div>
      <button
        type="button"
        className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300"
      >
        <Filter className="h-4 w-4" />
        Filters
      </button>
      {showExport ? (
        <button
          type="button"
          className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300"
        >
          <Download className="h-4 w-4" />
          Export
        </button>
      ) : null}
      <button
        type="button"
        onClick={onPrimaryClick}
        className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-md shadow-blue-600/25 transition hover:bg-blue-700"
      >
        <Plus className="h-4 w-4" />
        {primaryLabel}
      </button>
    </>
  );
}
