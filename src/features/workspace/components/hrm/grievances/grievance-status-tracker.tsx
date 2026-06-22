"use client";

import { Check } from "lucide-react";

import { GRIEVANCE_STAGES, type GrievanceStage } from "@/features/workspace/data/hrm-grievances-demo";
import { cn } from "@/lib/utils/cn";

type Props = {
  stage: GrievanceStage;
  compact?: boolean;
};

function stageIndex(stage: GrievanceStage) {
  return GRIEVANCE_STAGES.findIndex((s) => s.id === stage);
}

export function GrievanceStatusTracker({ stage, compact }: Props) {
  const current = stageIndex(stage);

  return (
    <div className={cn("w-full", compact ? "py-1" : "py-2")}>
      <div className="flex items-center">
        {GRIEVANCE_STAGES.map((s, index) => {
          const done = index < current;
          const active = index === current;
          const last = index === GRIEVANCE_STAGES.length - 1;

          return (
            <div key={s.id} className={cn("flex items-center", last ? "" : "flex-1")}>
              <div className="flex flex-col items-center">
                <span
                  className={cn(
                    "flex items-center justify-center rounded-full border-2 font-bold transition",
                    compact ? "h-7 w-7 text-[10px]" : "h-9 w-9 text-xs",
                    done && "border-emerald-500 bg-emerald-500 text-white",
                    active && !done && "border-[#191970] bg-[#191970] text-white shadow-md shadow-[#191970]/20",
                    !done && !active && "border-slate-200 bg-white text-slate-400",
                  )}
                >
                  {done ? <Check className={compact ? "h-3.5 w-3.5" : "h-4 w-4"} /> : index + 1}
                </span>
                <span
                  className={cn(
                    "mt-1.5 max-w-[4.5rem] text-center font-semibold leading-tight",
                    compact ? "text-[9px]" : "text-[10px]",
                    active ? "text-[#191970]" : done ? "text-emerald-700" : "text-slate-400",
                  )}
                >
                  {s.label}
                </span>
              </div>
              {!last ? (
                <div
                  className={cn(
                    "mx-1 h-0.5 flex-1 rounded-full",
                    index < current ? "bg-emerald-400" : "bg-slate-200",
                  )}
                />
              ) : null}
            </div>
          );
        })}
      </div>
    </div>
  );
}
