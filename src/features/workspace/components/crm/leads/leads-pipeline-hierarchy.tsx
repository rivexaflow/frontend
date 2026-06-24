"use client";

import { ChevronRight } from "lucide-react";

import {
  resolveLeadBoardStageId,
  type LeadBoardStage,
  type LeadPipelinePhase,
  type LeadRecord,
} from "@/features/workspace/data/crm-demo";
import { cn } from "@/lib/utils/cn";

const phaseTone: Record<string, string> = {
  intake: "border-[#2277FF]/25 bg-[#2277FF]/[0.06] text-[#191970]",
  engagement: "border-emerald-200 bg-emerald-50/80 text-emerald-900",
  onboarding: "border-amber-200 bg-amber-50/80 text-amber-950",
  activation: "border-violet-200 bg-violet-50/80 text-violet-950",
};

const stageToneClass: Record<LeadBoardStage["tone"], string> = {
  blue: "border-[#2277FF]/30 bg-white text-[#191970]",
  amber: "border-amber-200 bg-white text-amber-900",
  emerald: "border-emerald-200 bg-white text-emerald-900",
  slate: "border-slate-200 bg-white text-slate-700",
  rose: "border-rose-200 bg-white text-rose-800",
};

type Props = {
  phases: LeadPipelinePhase[];
  stages: LeadBoardStage[];
  leads: LeadRecord[];
  activeStageId?: string | null;
  onStageSelect?: (stageId: string) => void;
};

function countForPhase(phase: LeadPipelinePhase, counts: Map<string, number>): number {
  return phase.stageIds.reduce((sum, id) => sum + (counts.get(id) ?? 0), 0);
}

export function LeadsPipelineHierarchy({
  phases,
  stages,
  leads,
  activeStageId,
  onStageSelect,
}: Props) {
  const stageIdSet = new Set(stages.map((s) => s.id));
  const counts = new Map<string, number>();
  for (const lead of leads) {
    const key = resolveLeadBoardStageId(lead, stageIdSet);
    counts.set(key, (counts.get(key) ?? 0) + 1);
  }

  return (
    <div className="space-y-3 border-b border-slate-100 bg-gradient-to-b from-slate-50/80 to-white px-4 py-3 dark:border-slate-800 dark:from-slate-950/40 dark:to-slate-900">
      <div className="flex items-stretch gap-1 overflow-x-auto pb-0.5">
        {phases.map((phase, index) => {
          const total = countForPhase(phase, counts);
          return (
            <div key={phase.id} className="flex shrink-0 items-center gap-1">
              <div
                className={cn(
                  "min-w-[132px] rounded-xl border px-3 py-2.5 shadow-sm",
                  phaseTone[phase.id] ?? "border-slate-200 bg-white text-slate-800",
                )}
              >
                <p className="text-[10px] font-bold uppercase tracking-[0.14em] opacity-70">{phase.label}</p>
                <p className="mt-0.5 text-lg font-bold tabular-nums leading-none">{total}</p>
                <p className="mt-1 text-[10px] leading-snug opacity-75">{phase.description}</p>
              </div>
              {index < phases.length - 1 ? (
                <ChevronRight className="h-4 w-4 shrink-0 text-slate-300" aria-hidden />
              ) : null}
            </div>
          );
        })}
      </div>

      <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5">
        {stages.map((stage, index) => {
          const count = counts.get(stage.id) ?? 0;
          const active = activeStageId === stage.id;
          return (
            <div key={stage.id} className="flex shrink-0 items-center gap-1.5">
              <button
                type="button"
                onClick={() => onStageSelect?.(stage.id)}
                className={cn(
                  "inline-flex items-center gap-2 rounded-lg border px-2.5 py-1.5 text-left text-[11px] font-semibold shadow-sm transition",
                  stageToneClass[stage.tone],
                  active && "ring-2 ring-[#2277FF]/35 ring-offset-1",
                  onStageSelect && "hover:border-[#191970]/30 hover:shadow-md",
                )}
              >
                <span className="max-w-[140px] truncate">{stage.name}</span>
                <span className="inline-flex h-5 min-w-5 items-center justify-center rounded-md bg-[#191970] px-1 text-[10px] font-bold tabular-nums text-white">
                  {count}
                </span>
              </button>
              {index < stages.length - 1 ? (
                <span className="text-[10px] font-medium text-slate-300" aria-hidden>
                  →
                </span>
              ) : null}
            </div>
          );
        })}
      </div>
    </div>
  );
}
