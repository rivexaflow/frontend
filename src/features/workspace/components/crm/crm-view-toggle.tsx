"use client";

import { Columns3, LayoutGrid, List } from "lucide-react";

import { cn } from "@/lib/utils/cn";

export type CrmViewMode = "board" | "list";

type Props = {
  mode: CrmViewMode;
  onChange: (mode: CrmViewMode) => void;
  className?: string;
};

export function CrmViewToggle({ mode, onChange, className }: Props) {
  return (
    <div
      className={cn(
        "inline-flex rounded-xl border border-slate-200/90 bg-slate-50/80 p-0.5 shadow-sm dark:border-slate-700 dark:bg-slate-900/60",
        className,
      )}
      role="group"
      aria-label="View mode"
    >
      <button
        type="button"
        onClick={() => onChange("board")}
        className={cn(
          "inline-flex h-8 items-center gap-1.5 rounded-md px-2.5 text-xs font-semibold transition",
          mode === "board"
            ? "bg-white text-[#191970] shadow-sm dark:bg-slate-800 dark:text-white"
            : "text-slate-500 hover:text-slate-700 dark:text-slate-400",
        )}
        aria-pressed={mode === "board"}
      >
        <LayoutGrid className="h-3.5 w-3.5" />
        <span className="hidden sm:inline">Board</span>
      </button>
      <button
        type="button"
        onClick={() => onChange("list")}
        className={cn(
          "inline-flex h-8 items-center gap-1.5 rounded-md px-2.5 text-xs font-semibold transition",
          mode === "list"
            ? "bg-white text-[#191970] shadow-sm dark:bg-slate-800 dark:text-white"
            : "text-slate-500 hover:text-slate-700 dark:text-slate-400",
        )}
        aria-pressed={mode === "list"}
      >
        <List className="h-3.5 w-3.5" />
        <span className="hidden sm:inline">List</span>
      </button>
    </div>
  );
}

export function CrmBoardIcon() {
  return <Columns3 className="h-4 w-4" aria-hidden />;
}
