"use client";

import React, { useState } from "react";
import { Settings2, ShieldAlert, CheckCircle2, Info } from "lucide-react";
import { cn } from "@/lib/utils/cn";

export function KYCRules() {
  const [threshold, setThreshold] = useState(85);

  return (
    <div className="grid grid-cols-1 gap-10 lg:grid-cols-2">
      {/* Automation Thresholds */}
      <div className="rounded-[40px] border border-slate-200 bg-white p-10 dark:border-slate-800 dark:bg-slate-900">
        <div className="mb-8 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
            <Settings2 className="h-5 w-5" />
          </div>
          <h2 className="text-xl font-black uppercase text-slate-900 dark:text-white">AI Thresholds</h2>
        </div>
        
        <div className="space-y-10">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Confidence Score</label>
              <span className="text-xl font-black text-blue-600">{threshold}%</span>
            </div>
            <input 
              type="range" 
              min="50" 
              max="100" 
              value={threshold}
              onChange={(e) => setThreshold(parseInt(e.target.value))}
              className="w-full h-2 rounded-lg bg-slate-100 appearance-none cursor-pointer accent-blue-600 dark:bg-slate-800"
            />
            <div className="flex justify-between text-[10px] font-bold text-slate-400 uppercase tracking-widest">
              <span>Riskier</span>
              <span>Safer</span>
            </div>
          </div>
          
          <div className="rounded-2xl bg-slate-50 p-6 dark:bg-slate-950">
            <div className="flex gap-3">
              <Info className="h-5 w-5 text-blue-500 shrink-0" />
              <p className="text-xs text-slate-500 leading-relaxed">
                Submissions with a confidence score above <span className="font-bold text-slate-900 dark:text-white">{threshold}%</span> will be automatically approved. Scores between <span className="font-bold text-slate-900 dark:text-white">{threshold - 15}%</span> and <span className="font-bold text-slate-900 dark:text-white">{threshold}%</span> will flag for manual review.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Required Steps */}
      <div className="rounded-[40px] border border-slate-200 bg-white p-10 dark:border-slate-800 dark:bg-slate-900">
        <div className="mb-8 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-50 text-purple-600">
            <ShieldAlert className="h-5 w-5" />
          </div>
          <h2 className="text-xl font-black uppercase text-slate-900 dark:text-white">Required Steps</h2>
        </div>
        
        <div className="space-y-4">
          {[
            { id: "id", label: "Government ID", desc: "Passport, License or National ID", active: true },
            { id: "selfie", label: "Liveness Check", desc: "Real-time selfie verification", active: true },
            { id: "poa", label: "Proof of Address", desc: "Utility bill or bank statement", active: false },
            { id: "pep", label: "PEP/Sanctions", desc: "Global watchlist screening", active: true },
          ].map((step) => (
            <div 
              key={step.id}
              className="flex items-center justify-between rounded-2xl border border-slate-50 p-4 dark:border-slate-800/50 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
            >
              <div>
                <p className="text-sm font-bold text-slate-900 dark:text-white">{step.label}</p>
                <p className="text-[10px] text-slate-500">{step.desc}</p>
              </div>
              <button className={cn(
                "h-6 w-11 rounded-full relative transition-colors",
                step.active ? "bg-blue-600" : "bg-slate-200 dark:bg-slate-700"
              )}>
                <div className={cn(
                  "absolute top-1 h-4 w-4 rounded-full bg-white transition-all",
                  step.active ? "right-1" : "left-1"
                )} />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
