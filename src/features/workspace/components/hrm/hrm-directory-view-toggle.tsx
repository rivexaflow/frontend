"use client";

import { LayoutGrid, List } from "lucide-react";

import { cn } from "@/lib/utils/cn";

export type HrmViewMode = "grid" | "list";

type Props = {
  viewMode: HrmViewMode;
  onChange: (mode: HrmViewMode) => void;
};

export function HrmDirectoryViewToggle({ viewMode, onChange }: Props) {
  return (
    <div className="flex items-center rounded-lg border border-slate-200 p-0.5 dark:border-slate-700">
      <button
        type="button"
        onClick={() => onChange("grid")}
        className={cn(
          "inline-flex h-8 w-8 items-center justify-center rounded-md transition",
          viewMode === "grid"
            ? "bg-[#191970] text-white"
            : "text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800",
        )}
        aria-label="Card view"
        aria-pressed={viewMode === "grid"}
      >
        <LayoutGrid className="h-4 w-4" />
      </button>
      <button
        type="button"
        onClick={() => onChange("list")}
        className={cn(
          "inline-flex h-8 w-8 items-center justify-center rounded-md transition",
          viewMode === "list"
            ? "bg-[#191970] text-white"
            : "text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800",
        )}
        aria-label="List view"
        aria-pressed={viewMode === "list"}
      >
        <List className="h-4 w-4" />
      </button>
    </div>
  );
}
