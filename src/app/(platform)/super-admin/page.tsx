"use client";

import React from "react";
import { motion } from "framer-motion";
import { 
  Building2, 
  Activity, 
  AlertCircle, 
  ShieldCheck, 
  TrendingUp, 
  Zap,
  Clock,
  ExternalLink
} from "lucide-react";
import { DashboardHeader } from "@/features/workspace/components/dashboard/dashboard-header";
import { ChangePasswordForm } from "@/features/auth/components/change-password-form";
import { cn } from "@/lib/utils/cn";

export default function SuperAdminHomePage() {
  const stats = [
    { label: "Active Tenants", value: "42", hint: "Across all plans", icon: Building2, color: "blue" },
    { label: "Platform Uptime", value: "99.98%", hint: "Rolling 30 days", icon: Activity, color: "emerald" },
    { label: "Open Incidents", value: "0", hint: "No sev-1 events", icon: AlertCircle, color: "rose" },
  ];

  return (
    <div className="min-h-screen p-6 md:p-10 space-y-10">
      {/* Header */}
      <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-slate-900 dark:text-white uppercase">
            Platform <span className="text-blue-600">Command Center</span>
          </h1>
          <p className="mt-1 text-slate-500">
            Cross-tenant health, billing posture, and reliability signals for Rivexaflow operators.
          </p>
        </div>
        <div className="flex items-center gap-2 rounded-full border border-emerald-100 bg-emerald-50 px-4 py-2 text-[10px] font-black text-emerald-600 dark:border-emerald-900/20 dark:bg-emerald-900/10 dark:text-emerald-400">
          <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
          ALL SYSTEMS NOMINAL
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        {stats.map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="group rounded-[32px] border border-slate-200 bg-white p-8 shadow-sm transition-all hover:shadow-xl dark:border-slate-800 dark:bg-slate-900"
          >
            <div className="flex items-center justify-between mb-4">
              <div className={cn(
                "flex h-10 w-10 items-center justify-center rounded-xl",
                stat.color === "blue" && "bg-blue-50 text-blue-600",
                stat.color === "emerald" && "bg-emerald-50 text-emerald-600",
                stat.color === "rose" && "bg-rose-50 text-rose-600"
              )}>
                <stat.icon className="h-5 w-5" />
              </div>
              <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">{stat.hint}</span>
            </div>
            <p className="text-sm font-bold text-slate-500">{stat.label}</p>
            <h3 className="mt-1 text-4xl font-black text-slate-900 dark:text-white">{stat.value}</h3>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-10 lg:grid-cols-2">
        {/* Signals Section */}
        <div className="space-y-6">
          <div className="rounded-[40px] border border-slate-200 bg-white p-10 dark:border-slate-800 dark:bg-slate-900">
            <h2 className="flex items-center gap-2 text-xl font-black uppercase text-slate-900 dark:text-white">
              <TrendingUp className="h-5 w-5 text-blue-600" />
              Commercial Signals
            </h2>
            <p className="mt-4 text-slate-500 leading-relaxed">
              Net revenue retention is trending above target. Trials converting at <span className="font-bold text-slate-900 dark:text-white">38%</span> with strongest uptake in the Growth tier. Expansion revenue from existing tenants is up 12% MoM.
            </p>
            <button className="mt-6 flex items-center gap-2 text-sm font-bold text-blue-600 hover:underline">
              View Billing Dashboard <ExternalLink className="h-4 w-4" />
            </button>
          </div>

          <div className="rounded-[40px] border border-slate-200 bg-white p-10 dark:border-slate-800 dark:bg-slate-900">
            <h2 className="flex items-center gap-2 text-xl font-black uppercase text-slate-900 dark:text-white">
              <Zap className="h-5 w-5 text-amber-500" />
              Infrastructure
            </h2>
            <div className="mt-6 space-y-4">
              {[
                "API latency p99 stable at 182ms.",
                "Database replicas healthy in all regions.",
                "Background workers cleared nightly backlog."
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-3">
                  <ShieldCheck className="h-4 w-4 text-emerald-500" />
                  <span className="text-sm font-semibold text-slate-600 dark:text-slate-400">{item}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Security Section */}
        <div className="rounded-[40px] border border-slate-200 bg-white p-10 shadow-sm dark:border-slate-800 dark:bg-slate-900">
           <div className="mb-8 flex items-center justify-between">
              <h2 className="text-xl font-black uppercase text-slate-900 dark:text-white">Security & Access</h2>
              <span className="rounded-full bg-slate-100 px-3 py-1 text-[10px] font-black uppercase tracking-widest text-slate-500">ADMIN ONLY</span>
           </div>
           <ChangePasswordForm />
        </div>
      </div>
    </div>
  );
}
