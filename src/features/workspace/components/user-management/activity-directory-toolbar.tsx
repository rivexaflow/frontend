"use client";

import { Download, Search } from "lucide-react";

import {
  ACTIVITY_MODULES,
  ACTIVITY_TYPE_LABELS,
  type ActivityEventType,
  type ActivityModuleKey,
} from "@/features/workspace/data/workspace-activity-demo";
import { cn } from "@/lib/utils/cn";

export type ActivityFilters = {
  query: string;
  module: ActivityModuleKey;
  type: ActivityEventType | "all";
};

type Props = {
  filters: ActivityFilters;
  onChange: (next: ActivityFilters) => void;
  resultCount: number;
};

const TYPE_OPTIONS: { id: ActivityEventType | "all"; label: string }[] = [
  { id: "all", label: "All actions" },
  ...Object.entries(ACTIVITY_TYPE_LABELS).map(([id, label]) => ({
    id: id as ActivityEventType,
    label,
  })),
];

export function ActivityDirectoryToolbar({ filters, onChange, resultCount }: Props) {
  const set = <K extends keyof ActivityFilters>(key: K, value: ActivityFilters[K]) =>
    onChange({ ...filters, [key]: value });

  return (
    <div className="space-y-3 border-b border-slate-200/90 px-4 py-4 dark:border-slate-800">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
        <div className="relative min-w-0 flex-1 lg:max-w-md">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            type="search"
            value={filters.query}
            onChange={(e) => set("query", e.target.value)}
            placeholder="Search by user, action, or resource…"
            className="h-9 w-full rounded-lg border border-slate-200 bg-white pl-9 pr-3 text-sm outline-none transition focus:border-[#191970] focus:ring-2 focus:ring-[#191970]/10 dark:border-slate-700 dark:bg-slate-950"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2 lg:ml-auto">
          <span className="text-xs text-slate-500">
            <span className="font-semibold tabular-nums text-slate-800 dark:text-slate-200">{resultCount}</span>{" "}
            events
          </span>
          <button
            type="button"
            className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-slate-200/90 bg-white px-3 text-sm font-semibold text-slate-600 transition hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300"
          >
            <Download className="h-4 w-4" />
            Export log
          </button>
        </div>
      </div>

      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap gap-1">
          {ACTIVITY_MODULES.map((mod) => (
            <button
              key={mod.id}
              type="button"
              onClick={() => set("module", mod.id)}
              className={cn(
                "rounded-md px-2.5 py-1.5 text-xs font-semibold transition",
                filters.module === mod.id
                  ? "bg-[#191970] text-white"
                  : "text-slate-500 hover:bg-slate-100 hover:text-slate-800 dark:hover:bg-slate-800",
              )}
            >
              {mod.label}
            </button>
          ))}
        </div>

        <select
          value={filters.type}
          onChange={(e) => set("type", e.target.value as ActivityFilters["type"])}
          className="h-8 rounded-lg border border-slate-200 bg-white px-2.5 text-xs font-medium text-slate-700 outline-none focus:border-[#191970] dark:border-slate-700 dark:bg-slate-950 dark:text-slate-300"
        >
          {TYPE_OPTIONS.map((opt) => (
            <option key={opt.id} value={opt.id}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
