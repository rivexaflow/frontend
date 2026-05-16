"use client";

import React from "react";
import { Building2, Clock, Ban, Rocket } from "lucide-react";
import { cn } from "@/lib/utils/cn";

export function TenantStats() {
  const stats = [
    { label: "Active Tenants", value: "32", icon: Building2, color: "blue" },
    { label: "Growth Plan", value: "18", icon: Rocket, color: "emerald" },
    { label: "Trials", value: "4", icon: Clock, color: "amber" },
    { label: "Suspended", value: "3", icon: Ban, color: "rose" },
  ];

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat) => (
        <div 
          key={stat.label}
          className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900"
        >
          <div className="flex items-center justify-between">
            <div className={cn(
              "flex h-8 w-8 items-center justify-center rounded-lg",
              stat.color === "blue" && "bg-blue-50 text-blue-600 dark:bg-blue-900/20",
              stat.color === "emerald" && "bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20",
              stat.color === "amber" && "bg-amber-50 text-amber-600 dark:bg-amber-900/20",
              stat.color === "rose" && "bg-rose-50 text-rose-600 dark:bg-rose-900/20"
            )}>
              <stat.icon className="h-4 w-4" />
            </div>
            <span className="text-2xl font-black text-slate-900 dark:text-white">{stat.value}</span>
          </div>
          <p className="mt-3 text-xs font-bold uppercase tracking-wider text-slate-400">{stat.label}</p>
        </div>
      ))}
    </div>
  );
}
