"use client";

import { cn } from "@/lib/utils";

const FALLBACK_MODULES = ["CRM", "KYC", "Invoice", "AI Agents", "WhatsApp", "Email Marketing", "Analytics"];

type ModuleSelectStepProps = {
  available: string[];
  descriptions: Record<string, string>;
  selectedModules: string[];
  isLoading: boolean;
  error: string | null;
  onToggle: (mod: string) => void;
  onComplete: () => void;
};

export function ModuleSelectStep({
  available,
  descriptions,
  selectedModules,
  isLoading,
  error,
  onToggle,
  onComplete,
}: ModuleSelectStepProps) {
  const modules = available.length > 0 ? available : FALLBACK_MODULES;

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
          Choose your toolkit
        </h2>
        <p className="mt-2 max-w-lg text-slate-500">
          Select the modules to activate in your workspace. You&apos;ll sign in next to access your
          personalized dashboard.
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        {modules.map((mod) => {
          const on = selectedModules.includes(mod);
          return (
            <button
              key={mod}
              type="button"
              onClick={() => onToggle(mod)}
              className={cn(
                "rounded-xl border-2 p-4 text-left transition",
                on ? "border-emerald-500 bg-emerald-50/60 shadow-sm" : "border-slate-100 hover:border-slate-200",
              )}
            >
              <div className="flex items-center justify-between gap-2">
                <span className="font-semibold text-slate-900">{mod}</span>
                {on && <span className="text-emerald-600 font-bold">✓</span>}
              </div>
              {descriptions[mod] && (
                <p className="mt-1 text-xs text-slate-500">{descriptions[mod]}</p>
              )}
            </button>
          );
        })}
      </div>

      {error && (
        <p className="rounded-lg bg-rose-50 px-4 py-3 text-sm font-medium text-rose-700" role="alert">
          {error}
        </p>
      )}

      <button
        type="button"
        onClick={onComplete}
        disabled={isLoading || selectedModules.length === 0}
        className="w-full rounded-xl bg-emerald-600 py-3.5 text-sm font-bold text-white shadow-lg shadow-emerald-500/25 transition hover:bg-emerald-700 disabled:opacity-60"
      >
        {isLoading ? "Finishing setup…" : "Complete setup & go to sign in"}
      </button>
    </div>
  );
}
