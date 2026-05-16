"use client";

import React from "react";
import { authStore } from "@/stores/auth.store";

export function DashboardHeader() {
  const user = authStore((s) => s.user);
  
  const greeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good Morning";
    if (hour < 18) return "Good Afternoon";
    return "Good Evening";
  };

  return (
    <div className="mb-10 flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
          {greeting()}, <span className="text-blue-600">{user?.fullName?.split(" ")[0] || "there"}!</span>
        </h1>
        <p className="mt-1 text-slate-500">
          Here&apos;s what&apos;s happening with your workspace today.
        </p>
      </div>
      
      <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white/50 px-4 py-2 backdrop-blur-md dark:border-slate-800 dark:bg-slate-900/50">
        <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
        <span className="text-sm font-semibold text-slate-600 dark:text-slate-400">
          {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
        </span>
      </div>
    </div>
  );
}
