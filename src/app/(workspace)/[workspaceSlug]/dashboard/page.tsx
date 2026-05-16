"use client";

import React from "react";
import { motion } from "framer-motion";
import { 
  Plus, 
  UserPlus, 
  ShieldCheck, 
  FileText,
  MessageSquare,
  BarChart3,
  Search
} from "lucide-react";
import { DashboardHeader } from "@/features/workspace/components/dashboard/dashboard-header";
import { StatsGrid } from "@/features/workspace/components/dashboard/stats-grid";
import { RecentActivity } from "@/features/workspace/components/dashboard/activity-feed";
import { cn } from "@/lib/utils/cn";

const quickActions = [
  { label: "New Lead", icon: Plus, color: "blue", href: "/crm/leads/new" },
  { label: "Add Contact", icon: UserPlus, color: "emerald", href: "/crm/contacts/new" },
  { label: "KYC Review", icon: ShieldCheck, color: "purple", href: "/kyc" },
  { label: "Invoice", icon: FileText, color: "amber", href: "/invoices/new" },
  { label: "Analytics", icon: BarChart3, color: "indigo", href: "/reports" },
  { label: "Support", icon: MessageSquare, color: "rose", href: "/support" },
];

export default function DashboardPage() {
  return (
    <div className="min-h-screen p-6 md:p-10">
      {/* Header Section */}
      <DashboardHeader />

      <div className="mt-8 flex flex-col gap-10">
        {/* Stats Grid */}
        <StatsGrid />

        <div className="grid grid-cols-1 gap-10 lg:grid-cols-3">
          {/* Main Content (2/3) */}
          <div className="lg:col-span-2 space-y-10">
            {/* Quick Actions Grid */}
            <section>
              <div className="mb-6 flex items-center justify-between">
                <h3 className="text-xl font-bold text-slate-900 dark:text-white">Quick Actions</h3>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <input 
                    type="text" 
                    placeholder="Search actions..." 
                    className="rounded-full border border-slate-200 bg-white px-9 py-2 text-xs outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/5 dark:border-slate-800 dark:bg-slate-950"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
                {quickActions.map((action, i) => (
                  <motion.button
                    key={action.label}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: i * 0.05 }}
                    whileHover={{ scale: 1.02, y: -2 }}
                    whileTap={{ scale: 0.98 }}
                    className="flex flex-col items-center gap-3 rounded-[24px] border border-slate-100 bg-white p-6 shadow-sm transition-all hover:border-blue-200 hover:shadow-md dark:border-slate-800 dark:bg-slate-900 dark:hover:border-blue-900/50"
                  >
                    <div className={cn(
                      "flex h-12 w-12 items-center justify-center rounded-2xl",
                      action.color === "blue" && "bg-blue-50 text-blue-600 dark:bg-blue-900/20",
                      action.color === "emerald" && "bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20",
                      action.color === "purple" && "bg-purple-50 text-purple-600 dark:bg-purple-900/20",
                      action.color === "amber" && "bg-amber-50 text-amber-600 dark:bg-amber-900/20",
                      action.color === "indigo" && "bg-indigo-50 text-indigo-600 dark:bg-indigo-900/20",
                      action.color === "rose" && "bg-rose-50 text-rose-600 dark:bg-rose-900/20"
                    )}>
                      <action.icon className="h-6 w-6" />
                    </div>
                    <span className="text-sm font-bold text-slate-700 dark:text-slate-300">{action.label}</span>
                  </motion.button>
                ))}
              </div>
            </section>

            {/* Performance Visual (Placeholder) */}
            <div className="rounded-[40px] bg-slate-900 p-10 text-white overflow-hidden relative group">
               <div className="absolute top-0 right-0 h-full w-1/2 bg-gradient-to-l from-blue-600/20 to-transparent pointer-events-none" />
               <div className="relative z-10">
                 <h3 className="text-2xl font-bold">Operational Performance</h3>
                 <p className="mt-2 text-slate-400 max-w-md">Your workspace is operating at peak efficiency. AI automation has saved 12.4 hours this week.</p>
                 <div className="mt-8 flex gap-8">
                    <div>
                      <p className="text-3xl font-black text-blue-400">99.8%</p>
                      <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Uptime</p>
                    </div>
                    <div>
                      <p className="text-3xl font-black text-emerald-400">12ms</p>
                      <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Latency</p>
                    </div>
                 </div>
               </div>
               {/* Decorative Circles */}
               <div className="absolute -bottom-20 -right-20 h-64 w-64 rounded-full bg-blue-600/10 blur-3xl group-hover:bg-blue-600/20 transition-colors" />
            </div>
          </div>

          {/* Sidebar Content (1/3) */}
          <div className="space-y-10">
            <RecentActivity />
            
            {/* System Status Card */}
            <div className="rounded-[32px] bg-gradient-to-br from-slate-50 to-slate-100 p-8 dark:from-slate-900/50 dark:to-slate-800/50">
               <h4 className="text-sm font-bold uppercase tracking-widest text-slate-400">System Status</h4>
               <div className="mt-6 space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-semibold text-slate-600 dark:text-slate-400">API Gateway</span>
                    <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-500">
                      <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                      OPERATIONAL
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-semibold text-slate-600 dark:text-slate-400">Database Cluster</span>
                    <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-500">
                      <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                      HEALTHY
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-semibold text-slate-600 dark:text-slate-400">AI Worker Nodes</span>
                    <span className="flex items-center gap-1 text-[10px] font-bold text-amber-500">
                      <div className="h-1.5 w-1.5 rounded-full bg-amber-500 animate-pulse" />
                      HIGH LOAD
                    </span>
                  </div>
               </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
