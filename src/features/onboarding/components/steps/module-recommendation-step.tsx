"use client";

import { Sparkles } from "lucide-react";

import { cn } from "@/lib/utils";

type ModuleRecommendationStepProps = {
  recommended: string[];
  descriptions: Record<string, string>;
  selectedModules: string[];
  isLoading: boolean;
  error: string | null;
  onContinue: () => void;
  onToggle: (mod: string) => void;
};

export function ModuleRecommendationStep({
  recommended,
  descriptions,
  selectedModules,
  isLoading,
  error,
  onContinue,
  onToggle,
}: ModuleRecommendationStepProps) {
  const list = recommended.length > 0 ? recommended : ["CRM"];

  return (
    <div className="space-y-8">
      <div>
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-indigo-50 px-3 py-1 text-xs font-bold uppercase tracking-wide text-indigo-700">
          <Sparkles className="h-3.5 w-3.5" />
          AI recommendations
        </div>
        <h2 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
          Recommended for your business
        </h2>
        <p className="mt-2 max-w-lg text-slate-500">
          Based on your industry and team size, we suggest starting with these modules. You can
          adjust selections on the next step.
        </p>
      </div>

      <ul className="space-y-3">
        {list.map((mod) => {
          const on = selectedModules.includes(mod);
          return (
            <li key={mod}>
              <button
                type="button"
                onClick={() => onToggle(mod)}
                className={cn(
                  "flex w-full items-start justify-between gap-4 rounded-xl border-2 p-4 text-left transition",
                  on ? "border-indigo-500 bg-indigo-50/50" : "border-slate-100 hover:border-slate-200",
                )}
              >
                <div>
                  <p className="font-semibold text-slate-900">{mod}</p>
                  {descriptions[mod] && (
                    <p className="mt-1 text-sm text-slate-500">{descriptions[mod]}</p>
                  )}
                </div>
                <span
                  className={cn(
                    "mt-1 flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-bold",
                    on ? "bg-indigo-600 text-white" : "border border-slate-200 text-slate-400",
                  )}
                >
                  {on ? "✓" : "+"}
                </span>
              </button>
            </li>
          );
        })}
      </ul>

      {error && (
        <p className="rounded-lg bg-rose-50 px-4 py-3 text-sm font-medium text-rose-700" role="alert">
          {error}
        </p>
      )}

      <button
        type="button"
        onClick={onContinue}
        disabled={isLoading}
        className="w-full rounded-xl bg-blue-600 py-3.5 text-sm font-bold text-white shadow-lg shadow-blue-500/25 transition hover:bg-blue-700 disabled:opacity-60"
      >
        Customize modules
      </button>
    </div>
  );
}
