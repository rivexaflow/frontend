"use client";

import { ReactNode } from "react";
import { motion } from "framer-motion";
import { Check } from "lucide-react";

import { ONBOARDING_UI_STEPS } from "@/types/onboarding";
import { cn } from "@/lib/utils";

type OnboardingShellProps = {
  children: ReactNode;
  activeStepId: (typeof ONBOARDING_UI_STEPS)[number]["id"];
  stepIndex: number;
};

export function OnboardingShell({ children, activeStepId, stepIndex }: OnboardingShellProps) {
  return (
    <div className="min-h-screen bg-[#f0f4ff] px-4 py-8 sm:px-6 lg:py-12">
      <div className="mx-auto w-full max-w-5xl">
        <header className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-600 text-lg font-bold text-white shadow-lg shadow-blue-500/25">
              R
            </div>
            <div>
              <p className="text-lg font-bold tracking-tight text-slate-900">Rivexaflow</p>
              <p className="text-sm text-slate-500">Account setup · ~3 minutes</p>
            </div>
          </div>
          <p className="text-sm font-medium text-slate-500">
            Step {stepIndex + 1} of {ONBOARDING_UI_STEPS.length}
          </p>
        </header>

        <div className="overflow-hidden rounded-3xl border border-slate-200/80 bg-white shadow-xl shadow-slate-200/50 lg:flex">
          <aside className="border-b border-slate-100 bg-slate-950 p-8 text-white lg:w-72 lg:border-b-0 lg:border-r">
            <nav className="space-y-6" aria-label="Onboarding progress">
              {ONBOARDING_UI_STEPS.map((step, idx) => {
                const isActive = step.id === activeStepId;
                const isComplete = idx < stepIndex;

                return (
                  <div key={step.id} className="flex items-start gap-3">
                    <div
                      className={cn(
                        "mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full border-2 text-sm font-bold transition-all",
                        isComplete && "border-emerald-400 bg-emerald-500 text-white",
                        isActive && !isComplete && "border-blue-400 bg-blue-500/20 text-blue-300",
                        !isActive && !isComplete && "border-slate-700 text-slate-500",
                      )}
                    >
                      {isComplete ? <Check className="h-4 w-4" aria-hidden /> : idx + 1}
                    </div>
                    <div>
                      <p
                        className={cn(
                          "text-xs font-bold uppercase tracking-wider",
                          isActive ? "text-blue-300" : "text-slate-500",
                        )}
                      >
                        {step.short}
                      </p>
                      <p className={cn("font-semibold", isActive ? "text-white" : "text-slate-400")}>
                        {step.title}
                      </p>
                    </div>
                  </div>
                );
              })}
            </nav>

            <div className="mt-10 hidden rounded-2xl bg-slate-800/60 p-5 text-sm leading-relaxed text-slate-400 lg:block">
              Your workspace is configured as you go. When you&apos;re done, sign in to access your
              personalized dashboard.
            </div>
          </aside>

          <motion.main
            key={activeStepId}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25 }}
            className="flex-1 p-8 lg:p-10"
          >
            {children}
          </motion.main>
        </div>
      </div>
    </div>
  );
}
