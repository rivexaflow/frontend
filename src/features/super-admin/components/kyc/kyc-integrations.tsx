"use client";

import React from "react";
import { Shield, Zap, Globe, Cpu } from "lucide-react";
import { cn } from "@/lib/utils/cn";

const providers = [
  {
    id: "onfido",
    name: "Onfido",
    description: "Enterprise-grade identity verification with AI-powered document & facial analysis.",
    icon: Shield,
    status: "ACTIVE",
    color: "blue"
  },
  {
    id: "sumsub",
    name: "Sumsub",
    description: "All-in-one verification platform for KYC, KYB, and AML compliance.",
    icon: Zap,
    status: "AVAILABLE",
    color: "purple"
  },
  {
    id: "custom",
    name: "Internal Engine",
    description: "Rivexaflow's proprietary OCR and manual review workflow.",
    icon: Cpu,
    status: "DEVELOPMENT",
    color: "emerald"
  }
];

export function KYCIntegrations() {
  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
      {providers.map((provider) => (
        <div 
          key={provider.id}
          className="group rounded-[32px] border border-slate-200 bg-white p-8 shadow-sm transition-all hover:shadow-xl dark:border-slate-800 dark:bg-slate-900"
        >
          <div className="flex items-center justify-between mb-6">
            <div className={cn(
              "flex h-12 w-12 items-center justify-center rounded-2xl",
              provider.color === "blue" && "bg-blue-50 text-blue-600 dark:bg-blue-900/20",
              provider.color === "purple" && "bg-purple-50 text-purple-600 dark:bg-purple-900/20",
              provider.color === "emerald" && "bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20"
            )}>
              <provider.icon className="h-6 w-6" />
            </div>
            <div className={cn(
              "rounded-full px-3 py-1 text-[10px] font-black tracking-widest",
              provider.status === "ACTIVE" ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30" :
              provider.status === "AVAILABLE" ? "bg-blue-100 text-blue-700 dark:bg-blue-900/30" :
              "bg-slate-100 text-slate-500 dark:bg-slate-800"
            )}>
              {provider.status}
            </div>
          </div>
          
          <h3 className="text-xl font-black text-slate-900 dark:text-white">{provider.name}</h3>
          <p className="mt-2 text-sm text-slate-500 leading-relaxed">
            {provider.description}
          </p>
          
          <div className="mt-8 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-400">Auto-Pass</span>
              <button className="h-5 w-9 rounded-full bg-blue-600 relative">
                <div className="absolute right-1 top-1 h-3 w-3 rounded-full bg-white" />
              </button>
            </div>
            <button className="w-full rounded-xl border border-slate-200 py-2.5 text-xs font-bold text-slate-600 transition-colors hover:bg-slate-50 dark:border-slate-800 dark:text-slate-400 dark:hover:bg-slate-800">
              Configure Keys
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
