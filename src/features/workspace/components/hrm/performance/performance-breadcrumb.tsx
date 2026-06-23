"use client";

import { ChevronRight, Search } from "lucide-react";

import { inputClassName } from "@/features/workspace/components/enterprise/enterprise-form-modal";
import { cn } from "@/lib/utils/cn";

export type PerformanceDrillPath = {
  departmentId?: string;
  departmentName?: string;
  teamId?: string;
  teamName?: string;
};

type Props = {
  path: PerformanceDrillPath;
  query: string;
  onQueryChange: (q: string) => void;
  onNavigate: (path: PerformanceDrillPath) => void;
  resultCount?: number;
};

export function PerformanceBreadcrumb({ path, query, onQueryChange, onNavigate, resultCount }: Props) {
  const crumbs: { label: string; path: PerformanceDrillPath }[] = [
    { label: "All departments", path: {} },
  ];
  if (path.departmentId) {
    crumbs.push({
      label: path.departmentName ?? "Department",
      path: { departmentId: path.departmentId, departmentName: path.departmentName },
    });
  }
  if (path.teamId) {
    crumbs.push({
      label: path.teamName ?? "Team",
      path: {
        departmentId: path.departmentId,
        departmentName: path.departmentName,
        teamId: path.teamId,
        teamName: path.teamName,
      },
    });
  }

  return (
    <div className="flex flex-wrap items-center justify-between gap-3">
      <nav className="flex flex-wrap items-center gap-1 text-sm" aria-label="Performance navigation">
        {crumbs.map((crumb, i) => {
          const isLast = i === crumbs.length - 1;
          return (
            <span key={crumb.label} className="flex items-center gap-1">
              {i > 0 ? <ChevronRight className="h-3.5 w-3.5 text-slate-300" /> : null}
              <button
                type="button"
                disabled={isLast}
                onClick={() => onNavigate(crumb.path)}
                className={cn(
                  "rounded-md px-1.5 py-0.5 font-medium transition",
                  isLast
                    ? "cursor-default text-[#191970]"
                    : "text-slate-500 hover:bg-slate-100 hover:text-slate-800",
                )}
              >
                {crumb.label}
              </button>
            </span>
          );
        })}
      </nav>

      <div className="flex items-center gap-2">
        {resultCount != null ? (
          <span className="text-xs text-slate-400">{resultCount} results</span>
        ) : null}
        <div className="relative">
          <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
          <input
            type="search"
            value={query}
            onChange={(e) => onQueryChange(e.target.value)}
            placeholder="Search departments, teams, employees…"
            className={cn(inputClassName, "h-8 w-56 pl-8 text-xs sm:w-64")}
          />
        </div>
      </div>
    </div>
  );
}
