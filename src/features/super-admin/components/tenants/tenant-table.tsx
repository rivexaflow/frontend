"use client";

import React from "react";
import { motion } from "framer-motion";
import { 
  MoreVertical, 
  ExternalLink, 
  ShieldCheck, 
  AlertCircle,
  Activity,
  ArrowUpRight
} from "lucide-react";
import { cn } from "@/lib/utils/cn";

const tenants = [
  {
    id: "1",
    name: "Acme Corp",
    slug: "acme-corp",
    plan: "ENTERPRISE",
    status: "ACTIVE",
    users: 124,
    health: "EXCELLENT",
    created: "Oct 12, 2023"
  },
  {
    id: "2",
    name: "TechFlow Systems",
    slug: "techflow",
    plan: "GROWTH",
    status: "ACTIVE",
    users: 42,
    health: "GOOD",
    created: "Jan 05, 2024"
  },
  {
    id: "3",
    name: "Global Logistics",
    slug: "global-log",
    plan: "TRIAL",
    status: "EXPIRING",
    users: 8,
    health: "FAIR",
    created: "May 01, 2024"
  },
  {
    id: "4",
    name: "Stark Industries",
    slug: "stark-ind",
    plan: "ENTERPRISE",
    status: "SUSPENDED",
    users: 560,
    health: "CRITICAL",
    created: "Feb 14, 2023"
  },
  {
    id: "5",
    name: "Cyberdyne",
    slug: "cyberdyne",
    plan: "GROWTH",
    status: "ACTIVE",
    users: 12,
    health: "GOOD",
    created: "Mar 22, 2024"
  }
];

export function TenantTable() {
  return (
    <div className="overflow-hidden rounded-[32px] border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-slate-100 bg-slate-50/50 dark:border-slate-800 dark:bg-slate-950/50">
              <th className="px-6 py-4 text-xs font-black uppercase tracking-wider text-slate-400">Organization</th>
              <th className="px-6 py-4 text-xs font-black uppercase tracking-wider text-slate-400">Plan</th>
              <th className="px-6 py-4 text-xs font-black uppercase tracking-wider text-slate-400">Users</th>
              <th className="px-6 py-4 text-xs font-black uppercase tracking-wider text-slate-400">Health</th>
              <th className="px-6 py-4 text-xs font-black uppercase tracking-wider text-slate-400">Status</th>
              <th className="px-6 py-4 text-xs font-black uppercase tracking-wider text-slate-400 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50 dark:divide-slate-800/50">
            {tenants.map((tenant, i) => (
              <motion.tr
                key={tenant.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="group hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition-colors"
              >
                <td className="px-6 py-5">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-tr from-slate-100 to-slate-200 font-bold text-slate-600 dark:from-slate-800 dark:to-slate-700 dark:text-slate-400">
                      {tenant.name.charAt(0)}
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5 font-bold text-slate-900 dark:text-white">
                        {tenant.name}
                        <ExternalLink className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer text-blue-600" />
                      </div>
                      <div className="text-xs font-medium text-slate-500">/{tenant.slug}</div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-5">
                  <span className={cn(
                    "rounded-full px-3 py-1 text-[10px] font-black tracking-widest",
                    tenant.plan === "ENTERPRISE" ? "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400" :
                    tenant.plan === "GROWTH" ? "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400" :
                    "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400"
                  )}>
                    {tenant.plan}
                  </span>
                </td>
                <td className="px-6 py-5">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-700 dark:text-slate-300">{tenant.users}</span>
                    <div className="h-1 w-12 rounded-full bg-slate-100 dark:bg-slate-800">
                       <div 
                        className="h-full rounded-full bg-blue-500" 
                        style={{ width: `${Math.min((tenant.users/500)*100, 100)}%` }}
                       />
                    </div>
                  </div>
                </td>
                <td className="px-6 py-5">
                  <div className="flex items-center gap-2">
                    <div className={cn(
                        "h-2 w-2 rounded-full",
                        tenant.health === "EXCELLENT" ? "bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" :
                        tenant.health === "GOOD" ? "bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.5)]" :
                        tenant.health === "FAIR" ? "bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.5)]" :
                        "bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.5)]"
                    )} />
                    <span className="text-xs font-bold text-slate-600 dark:text-slate-400">{tenant.health}</span>
                  </div>
                </td>
                <td className="px-6 py-5">
                   <div className={cn(
                    "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-black",
                    tenant.status === "ACTIVE" ? "bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20 dark:text-emerald-400" :
                    tenant.status === "EXPIRING" ? "bg-amber-50 text-amber-600 dark:bg-amber-900/20 dark:text-amber-400" :
                    "bg-rose-50 text-rose-600 dark:bg-rose-900/20 dark:text-rose-400"
                   )}>
                    {tenant.status === "ACTIVE" && <ShieldCheck className="h-3 w-3" />}
                    {tenant.status === "EXPIRING" && <Activity className="h-3 w-3 animate-pulse" />}
                    {tenant.status === "SUSPENDED" && <AlertCircle className="h-3 w-3" />}
                    {tenant.status}
                   </div>
                </td>
                <td className="px-6 py-5 text-right">
                  <button className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800">
                    <MoreVertical className="h-5 w-5" />
                  </button>
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>
      
      <div className="flex items-center justify-between border-t border-slate-100 px-6 py-4 dark:border-slate-800">
        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Showing 5 of 42 tenants</p>
        <div className="flex gap-2">
          <button className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-50 dark:border-slate-800 dark:text-slate-400 dark:hover:bg-slate-800">
            Previous
          </button>
          <button className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-50 dark:border-slate-800 dark:text-slate-400 dark:hover:bg-slate-800">
            Next
          </button>
        </div>
      </div>
    </div>
  );
}
