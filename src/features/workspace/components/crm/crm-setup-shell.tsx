"use client";

import type { ElementType, ReactNode } from "react";
import {
  Briefcase,
  GitBranch,
  Settings2,
  Tag,
  Target,
  TrendingUp,
  XCircle,
} from "lucide-react";

import { crm } from "@/features/workspace/components/crm/crm-styles";
import type { CrmSetupSection } from "@/features/workspace/data/crm-nav";
import { CRM_SETUP_SECTIONS } from "@/features/workspace/data/crm-nav";
import { cn } from "@/lib/utils/cn";

const SECTION_ICONS: Record<CrmSetupSection, ElementType> = {
  lead_stages: GitBranch,
  deal_stages: TrendingUp,
  lost_reasons: XCircle,
  sources: Target,
  deal_types: Briefcase,
  labels: Tag,
  general: Settings2,
};

type SetupGroup = "pipeline" | "picklists" | "defaults";

const SETUP_GROUP_LABELS: Record<SetupGroup, string> = {
  pipeline: "Pipeline",
  picklists: "Picklists",
  defaults: "Defaults",
};

const SETUP_GROUPS: SetupGroup[] = ["pipeline", "picklists", "defaults"];

type Props = {
  section: CrmSetupSection;
  onSectionChange: (section: CrmSetupSection) => void;
  children: ReactNode;
  actions?: ReactNode;
};

export function CrmSetupShell({ section, onSectionChange, children, actions }: Props) {
  const active = CRM_SETUP_SECTIONS.find((s) => s.id === section)!;
  const ActiveIcon = SECTION_ICONS[section];

  return (
    <div className={crm.shell}>
      <div className="flex flex-col lg:flex-row">
        <nav className="shrink-0 border-b border-slate-100 p-4 lg:w-60 lg:border-b-0 lg:border-r dark:border-slate-800">
          {SETUP_GROUPS.map((group) => (
            <div key={group} className="mb-4 last:mb-0">
              <p className={cn(crm.sectionLabel, "mb-2 px-2")}>{SETUP_GROUP_LABELS[group]}</p>
              <ul className="space-y-0.5">
                {CRM_SETUP_SECTIONS.filter((s) => s.group === group).map((item) => {
                  const Icon = SECTION_ICONS[item.id];
                  const isActive = item.id === section;
                  return (
                    <li key={item.id}>
                      <button
                        type="button"
                        onClick={() => onSectionChange(item.id)}
                        className={cn(
                          "flex w-full items-center gap-2.5 rounded-xl px-3 py-2.5 text-left text-sm font-medium transition",
                          isActive
                            ? "bg-[#191970] text-white shadow-md shadow-[#191970]/20"
                            : "text-slate-600 hover:bg-slate-50 dark:text-slate-300 dark:hover:bg-slate-800/80",
                        )}
                      >
                        <Icon className="h-4 w-4 shrink-0 opacity-90" />
                        <span className="truncate">{item.label}</span>
                      </button>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </nav>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-start justify-between gap-3 border-b border-slate-100 bg-gradient-to-r from-[#191970]/[0.04] via-transparent to-transparent px-5 py-5 dark:border-slate-800">
            <div className="flex gap-3">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#191970]/10 text-[#191970]">
                <ActiveIcon className="h-5 w-5" />
              </span>
              <div>
                <h2 className="text-base font-semibold text-slate-900 dark:text-white">{active.label}</h2>
                <p className="mt-1 max-w-xl text-sm leading-relaxed text-slate-500">{active.description}</p>
              </div>
            </div>
            {actions}
          </div>
          <div className="p-5 md:p-6">{children}</div>
        </div>
      </div>
    </div>
  );
}

export function CrmSetupTable({
  columns,
  children,
  footer,
}: {
  columns: string[];
  children: ReactNode;
  footer?: ReactNode;
}) {
  return (
    <div className="overflow-hidden rounded-xl border border-slate-200/80 shadow-sm dark:border-slate-800">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[520px] text-left text-sm">
          <thead>
            <tr className={crm.tableHead}>
              {columns.map((col) => (
                <th key={col} className="px-4 py-3 font-bold">
                  {col}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">{children}</tbody>
        </table>
      </div>
      {footer ? (
        <div className="border-t border-slate-100 bg-slate-50/60 px-4 py-3 dark:border-slate-800">{footer}</div>
      ) : null}
    </div>
  );
}

export function CrmSetupHint({ children }: { children: ReactNode }) {
  return (
    <div className="mb-5 rounded-xl border border-slate-200/80 bg-slate-50/80 px-4 py-3 text-xs leading-relaxed text-slate-600 dark:border-slate-800 dark:bg-slate-950/40 dark:text-slate-400">
      {children}
    </div>
  );
}
