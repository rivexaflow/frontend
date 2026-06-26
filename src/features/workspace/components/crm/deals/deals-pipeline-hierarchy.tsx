"use client";

import { useMemo } from "react";
import { ChevronRight } from "lucide-react";

import {
  DEAL_STAGE_META,
  formatDealValue,
  type DealRecord,
  type DealStage,
} from "@/features/workspace/data/deals-demo";
import { cn } from "@/lib/utils/cn";

export type DealPipelinePhase = {
  id: string;
  label: string;
  description: string;
  stageIds: DealStage[];
};

export const DEAL_PIPELINE_PHASES: DealPipelinePhase[] = [
  {
    id: "discovery",
    label: "Discovery",
    description: "Qualification & discovery stages",
    stageIds: ["qualification", "discovery"],
  },
  {
    id: "negotiation",
    label: "Negotiation",
    description: "Proposals & active negotiations",
    stageIds: ["proposal", "negotiation"],
  },
  {
    id: "closing",
    label: "Closing",
    description: "Closed won & closed lost results",
    stageIds: ["closed_won", "closed_lost"],
  },
];

const phaseTone: Record<string, string> = {
  discovery: "border-[#2277FF]/20 bg-gradient-to-br from-[#2277FF]/[0.08] to-[#2277FF]/[0.01] text-[#191970] dark:border-[#2277FF]/30 dark:text-blue-300",
  negotiation: "border-amber-500/20 bg-gradient-to-br from-amber-500/[0.08] to-amber-500/[0.01] text-amber-950 dark:border-amber-500/30 dark:text-amber-300",
  closing: "border-emerald-500/20 bg-gradient-to-br from-emerald-500/[0.08] to-emerald-500/[0.01] text-emerald-950 dark:border-emerald-500/30 dark:text-emerald-300",
};

const activePhaseStyle: Record<string, string> = {
  discovery: "border-[#2277FF] bg-gradient-to-br from-[#2277FF]/15 to-[#2277FF]/5 text-[#191970] ring-2 ring-[#2277FF]/35 shadow-[#2277FF]/10 shadow-md dark:border-blue-450 dark:text-blue-200",
  negotiation: "border-amber-500 bg-gradient-to-br from-amber-500/15 to-amber-500/5 text-amber-950 ring-2 ring-amber-500/35 shadow-amber-500/10 shadow-md dark:border-amber-450 dark:text-amber-200",
  closing: "border-emerald-500 bg-gradient-to-br from-emerald-500/15 to-emerald-500/5 text-emerald-950 ring-2 ring-emerald-500/35 shadow-emerald-500/10 shadow-md dark:border-emerald-450 dark:text-emerald-200",
};

const stageToneClass: Record<string, string> = {
  blue: "border-[#2277FF]/30 bg-white text-[#191970] dark:bg-slate-900 dark:text-blue-300 dark:border-blue-900/40",
  purple: "border-purple-200 bg-white text-purple-950 dark:bg-slate-900 dark:text-purple-300 dark:border-purple-900/40",
  amber: "border-amber-200 bg-white text-amber-950 dark:bg-slate-900 dark:text-amber-300 dark:border-amber-900/40",
  emerald: "border-emerald-200 bg-white text-emerald-950 dark:bg-slate-900 dark:text-emerald-300 dark:border-emerald-900/40",
  rose: "border-rose-200 bg-white text-rose-850 dark:bg-slate-900 dark:text-rose-350 dark:border-rose-900/40",
};

type Props = {
  phases: DealPipelinePhase[];
  stages: DealStage[];
  deals: DealRecord[];
  activeStageId?: string | null;
  onStageSelect?: (stageId: DealStage) => void;
  selectedPhaseId?: string | null;
  onPhaseSelect?: (phaseId: string | null) => void;
};

export function DealsPipelineHierarchy({
  phases,
  stages,
  deals,
  activeStageId,
  onStageSelect,
  selectedPhaseId,
  onPhaseSelect,
}: Props) {
  const counts = useMemo(() => {
    const map = new Map<DealStage, number>();
    for (const deal of deals) {
      map.set(deal.stage, (map.get(deal.stage) ?? 0) + 1);
    }
    return map;
  }, [deals]);

  const valueCounts = useMemo(() => {
    const map = new Map<DealStage, number>();
    for (const deal of deals) {
      map.set(deal.stage, (map.get(deal.stage) ?? 0) + deal.value);
    }
    return map;
  }, [deals]);

  const phaseCounts = useMemo(() => {
    const map = new Map<string, { count: number; value: number }>();
    for (const phase of phases) {
      let count = 0;
      let value = 0;
      for (const stage of phase.stageIds) {
        count += counts.get(stage) ?? 0;
        value += valueCounts.get(stage) ?? 0;
      }
      map.set(phase.id, { count, value });
    }
    return map;
  }, [phases, counts, valueCounts]);

  const visibleStages = useMemo(() => {
    if (!selectedPhaseId) return stages;
    const phase = phases.find((p) => p.id === selectedPhaseId);
    if (!phase) return stages;
    return stages.filter((s) => phase.stageIds.includes(s));
  }, [stages, selectedPhaseId, phases]);

  return (
    <div className="space-y-4 border-b border-slate-100 bg-gradient-to-b from-slate-50/80 to-white px-4 py-3.5 dark:border-slate-800 dark:from-slate-950/40 dark:to-slate-900">
      <div className="flex items-stretch gap-2 overflow-x-auto pb-1.5">
        {phases.map((phase, index) => {
          const stats = phaseCounts.get(phase.id) ?? { count: 0, value: 0 };
          const isActive = selectedPhaseId === phase.id;
          return (
            <div key={phase.id} className="flex shrink-0 items-center gap-2">
              <button
                type="button"
                onClick={() => onPhaseSelect?.(isActive ? null : phase.id)}
                className={cn(
                  "min-w-[170px] rounded-xl border px-3.5 py-3 text-left shadow-sm transition-all duration-300 hover:scale-[1.02] hover:shadow-md focus:outline-none focus:ring-2 focus:ring-[#191970]/30",
                  isActive ? activePhaseStyle[phase.id] : phaseTone[phase.id] ?? "border-slate-200 bg-white text-slate-800"
                )}
              >
                <div className="flex items-center justify-between gap-3">
                  <p className="text-[10.5px] font-bold uppercase tracking-[0.14em] opacity-75 truncate">{phase.label}</p>
                  <span className={cn(
                    "inline-flex h-5 min-w-5 items-center justify-center rounded-md px-1.5 text-[10px] font-bold tabular-nums",
                    isActive ? "bg-white text-[#191970] shadow-sm" : "bg-[#191970]/10 text-[#191970] dark:bg-white/10 dark:text-white"
                  )}>
                    {stats.count}
                  </span>
                </div>
                <p className="mt-1.5 text-base font-extrabold tabular-nums leading-none tracking-tight">
                  {formatDealValue(stats.value)}
                </p>
                <p className="mt-1 text-[10px] leading-snug opacity-75">{phase.description}</p>
              </button>
              {index < phases.length - 1 ? (
                <ChevronRight className="h-4 w-4 shrink-0 text-slate-300" aria-hidden />
              ) : null}
            </div>
          );
        })}
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between gap-4">
          <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-slate-400">
            {selectedPhaseId ? "Phase Stages" : "All Pipeline Stages"}
          </p>
          {!selectedPhaseId ? (
            <p className="text-[10.5px] text-slate-400/80">
              💡 Click a phase card above to filter the board columns
            </p>
          ) : (
            <button
              type="button"
              onClick={() => onPhaseSelect?.(null)}
              className="text-[10.5px] font-semibold text-[#191970] hover:text-[#12124a] dark:text-blue-400"
            >
              Clear phase filter
            </button>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-1.5 pb-0.5">
          {visibleStages.map((stage, index) => {
            const count = counts.get(stage) ?? 0;
            const value = valueCounts.get(stage) ?? 0;
            const meta = DEAL_STAGE_META[stage];
            const active = activeStageId === stage;
            return (
              <div key={stage} className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => onStageSelect?.(stage)}
                  className={cn(
                    "inline-flex items-center gap-2 rounded-lg border px-2.5 py-1.5 text-left text-[11px] font-semibold shadow-sm transition",
                    stageToneClass[meta.tone],
                    active && "ring-2 ring-[#191970]/35 ring-offset-1",
                    onStageSelect && "hover:border-[#191970]/30 hover:shadow-md",
                  )}
                >
                  <span className="max-w-[140px] truncate">{meta.label}</span>
                  <span className="inline-flex h-5 min-w-5 items-center justify-center rounded-md bg-[#191970] px-1 text-[10px] font-bold tabular-nums text-white">
                    {count}
                  </span>
                  <span className="text-[10px] text-slate-550 font-bold">
                    {formatDealValue(value)}
                  </span>
                </button>
                {index < visibleStages.length - 1 ? (
                  <span className="text-[10px] font-medium text-slate-300" aria-hidden>
                    →
                  </span>
                ) : null}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
