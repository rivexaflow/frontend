"use client";

import { Building2 } from "lucide-react";

import { workspaceStore } from "@/stores/workspace.store";
import { cn } from "@/lib/utils/cn";

export function WorkspaceSwitcher({ className }: { className?: string }) {
  const { workspaceName, plan } = workspaceStore();

  return (
    <div
      className={cn(
        "inline-flex max-w-[200px] items-center gap-2 rounded-lg border border-slate-200/80 bg-slate-50/80 px-2.5 py-1.5 dark:border-slate-700 dark:bg-slate-900/80",
        className,
      )}
    >
      <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-blue-600/10 text-blue-600">
        <Building2 className="h-3.5 w-3.5" />
      </span>
      <span className="min-w-0 truncate text-left">
        <span className="block truncate text-xs font-semibold text-slate-800 dark:text-slate-200">
          {workspaceName ?? "Workspace"}
        </span>
        {plan ? (
          <span className="block truncate text-[10px] font-medium uppercase tracking-wide text-slate-500">
            {plan}
          </span>
        ) : null}
      </span>
    </div>
  );
}
