"use client";

import { WORKSPACE_ACCESS_MODULES, type WorkspaceModuleId } from "@/features/workspace/data/workspace-user-modules";
import { cn } from "@/lib/utils/cn";

const moduleLabel = Object.fromEntries(
  WORKSPACE_ACCESS_MODULES.map((m) => [m.id, m.label.split(" ")[0]]),
) as Record<WorkspaceModuleId, string>;

type Props = {
  modules: WorkspaceModuleId[];
  max?: number;
  className?: string;
};

export function ModuleAccessChips({ modules, max = 3, className }: Props) {
  const visible = modules.slice(0, max);
  const rest = modules.length - visible.length;

  if (modules.length === 0) {
    return <span className="text-xs text-slate-400">No modules</span>;
  }

  return (
    <div className={cn("flex flex-wrap items-center gap-1", className)}>
      {visible.map((id) => (
        <span
          key={id}
          className="rounded-md border border-slate-200/90 bg-slate-50 px-1.5 py-0.5 text-[10px] font-semibold text-slate-600 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-400"
        >
          {moduleLabel[id] ?? id}
        </span>
      ))}
      {rest > 0 ? (
        <span className="text-[10px] font-semibold text-slate-400">+{rest}</span>
      ) : null}
    </div>
  );
}
