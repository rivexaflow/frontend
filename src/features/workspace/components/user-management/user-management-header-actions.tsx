"use client";

import { FileDown, LayoutGrid, List, Plus, UserPlus } from "lucide-react";

import { cn } from "@/lib/utils/cn";

type Props = {
  viewMode: "grid" | "list";
  onViewModeChange: (mode: "grid" | "list") => void;
  onAddUser: () => void;
  onExport?: () => void;
};

export function UserManagementHeaderActions({
  viewMode,
  onViewModeChange,
  onAddUser,
  onExport,
}: Props) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <button
        type="button"
        onClick={onAddUser}
        className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 shadow-sm transition hover:border-blue-200 hover:text-blue-600 dark:border-slate-700 dark:bg-slate-900"
        aria-label="Invite user"
      >
        <UserPlus className="h-4 w-4" />
      </button>
      <button
        type="button"
        onClick={onExport}
        className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 shadow-sm transition hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900"
        aria-label="Export users"
      >
        <FileDown className="h-4 w-4" />
      </button>
      <div className="flex items-center gap-0.5 rounded-xl border border-slate-200 bg-white p-1 shadow-sm dark:border-slate-700 dark:bg-slate-900">
        <button
          type="button"
          onClick={() => onViewModeChange("list")}
          className={cn(
            "inline-flex h-8 w-8 items-center justify-center rounded-lg transition",
            viewMode === "list" ? "bg-blue-600 text-white" : "text-slate-500 hover:bg-slate-100",
          )}
          aria-label="List view"
        >
          <List className="h-4 w-4" />
        </button>
        <button
          type="button"
          onClick={() => onViewModeChange("grid")}
          className={cn(
            "inline-flex h-8 w-8 items-center justify-center rounded-lg transition",
            viewMode === "grid" ? "bg-blue-600 text-white" : "text-slate-500 hover:bg-slate-100",
          )}
          aria-label="Grid view"
        >
          <LayoutGrid className="h-4 w-4" />
        </button>
      </div>
      <button
        type="button"
        onClick={onAddUser}
        className="inline-flex h-10 items-center gap-2 rounded-xl bg-blue-600 px-4 text-sm font-semibold text-white shadow-md shadow-blue-600/25 transition hover:bg-blue-700"
      >
        <Plus className="h-4 w-4" />
        <span className="hidden sm:inline">Add user</span>
      </button>
    </div>
  );
}
