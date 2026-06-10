"use client";

import { useMemo, useState } from "react";
import { ChevronRight } from "lucide-react";

import { CrmStageAccessModal } from "@/features/workspace/components/roles/crm-stage-access-modal";
import { CRM_PIPELINE_STAGES } from "@/features/workspace/data/workspace-permissions-catalog";
import type { StageAccessRule } from "@/features/workspace/data/workspace-roles-demo";

type Props = {
  stageAccess: Record<string, StageAccessRule>;
  onChange: (next: Record<string, StageAccessRule>) => void;
};

function summarizeAccess(stageAccess: Record<string, StageAccessRule>) {
  let view = 0;
  let move = 0;
  let edit = 0;
  let configured = 0;

  for (const stage of CRM_PIPELINE_STAGES) {
    const rule = stageAccess[stage.id];
    if (!rule?.view && !rule?.move && !rule?.edit) continue;
    configured += 1;
    if (rule.view) view += 1;
    if (rule.move) move += 1;
    if (rule.edit) edit += 1;
  }

  return { configured, view, move, edit, total: CRM_PIPELINE_STAGES.length };
}

export function CrmStageAccessPanel({ stageAccess, onChange }: Props) {
  const [open, setOpen] = useState(false);
  const summary = useMemo(() => summarizeAccess(stageAccess), [stageAccess]);

  return (
    <>
      <div className="flex items-center justify-between gap-4 border-t border-slate-200/90 px-5 py-3 dark:border-slate-800">
        <div className="min-w-0">
          <p className="text-sm font-medium text-slate-900 dark:text-white">Pipeline stages</p>
          <p className="mt-0.5 text-xs text-slate-500">
            {summary.configured === 0
              ? "No stage access configured"
              : `${summary.configured} of ${summary.total} stages · View ${summary.view} · Move ${summary.move} · Edit ${summary.edit}`}
          </p>
        </div>
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="inline-flex shrink-0 items-center gap-1 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-sm font-semibold text-[#191970] transition hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-blue-300 dark:hover:bg-slate-800"
        >
          Configure
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>

      <CrmStageAccessModal
        open={open}
        stageAccess={stageAccess}
        onClose={() => setOpen(false)}
        onApply={onChange}
      />
    </>
  );
}
