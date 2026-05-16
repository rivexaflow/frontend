"use client";

import React from "react";
import { motion } from "framer-motion";
import { 
  Activity, 
  Cpu, 
  Database, 
  Cloud,
  Zap,
  ShieldCheck,
  AlertTriangle,
  RefreshCw,
  HardDrive
} from "lucide-react";
import { cn } from "@/lib/utils/cn";

const services = [
  { name: "API Gateway", status: "OPERATIONAL", uptime: "99.99%", latency: "42ms" },
  { name: "Auth Service", status: "OPERATIONAL", uptime: "100%", latency: "12ms" },
  { name: "CRM Database", status: "DEGRADED", uptime: "98.5%", latency: "450ms" },
  { name: "Worker Cluster", status: "OPERATIONAL", uptime: "99.95%", latency: "8ms" },
  { name: "Redis Cache", status: "OPERATIONAL", uptime: "100%", latency: "2ms" },
];

export default function SystemHealthPage() {
  return (
    <div className="min-h-screen p-6 md:p-10 space-y-10">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-slate-900 dark:text-white uppercase">
            System <span className="text-blue-600">Health</span>
          </h1>
          <p className="mt-1 text-slate-500">Real-time infrastructure monitoring and service status tracking.</p>
        </div>
        <button className="flex items-center gap-2 rounded-2xl border border-slate-200 dark:border-slate-800 px-4 py-3 text-sm font-bold text-slate-600 dark:text-slate-400">
          <RefreshCw className="h-4 w-4" /> Refresh Data
        </button>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-4">
        {[
          { label: "CPU Usage", value: "24%", icon: Cpu, color: "blue" },
          { label: "Memory", value: "4.2 GB", icon: HardDrive, color: "purple" },
          { label: "Total Requests", value: "1.2M", icon: Activity, color: "emerald" },
          { label: "Avg Latency", value: "182ms", icon: Zap, color: "amber" },
        ].map((stat) => (
          <div key={stat.label} className="rounded-3xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
            <div className="flex items-center justify-between mb-4">
              <div className={cn("flex h-10 w-10 items-center justify-center rounded-xl", stat.color === "blue" && "bg-blue-50 text-blue-600", stat.color === "purple" && "bg-purple-50 text-purple-600", stat.color === "emerald" && "bg-emerald-50 text-emerald-600", stat.color === "amber" && "bg-amber-50 text-amber-600")}>
                <stat.icon className="h-5 w-5" />
              </div>
            </div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">{stat.label}</p>
            <h3 className="text-2xl font-black text-slate-900 dark:text-white mt-1">{stat.value}</h3>
            <div className="mt-4 h-1.5 w-full rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
               <motion.div 
                initial={{ width: 0 }}
                animate={{ width: stat.value.includes("%") ? stat.value : "65%" }}
                className={cn("h-full rounded-full", stat.color === "blue" ? "bg-blue-500" : stat.color === "purple" ? "bg-purple-500" : stat.color === "emerald" ? "bg-emerald-500" : "bg-amber-500")}
               />
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-10 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
           <div className="rounded-[40px] border border-slate-200 bg-white p-10 dark:border-slate-800 dark:bg-slate-900">
              <h3 className="text-sm font-black uppercase tracking-widest text-slate-400 mb-8">Core Microservices</h3>
              <div className="space-y-4">
                 {services.map((svc) => (
                   <div key={svc.name} className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 dark:bg-slate-950/50">
                      <div className="flex items-center gap-4">
                         <Cloud className="h-5 w-5 text-slate-400" />
                         <div>
                            <p className="text-sm font-bold text-slate-900 dark:text-white">{svc.name}</p>
                            <p className="text-[10px] text-slate-500 uppercase tracking-widest">Uptime: {svc.uptime}</p>
                         </div>
                      </div>
                      <div className="flex items-center gap-8">
                         <div className="text-right">
                            <p className="text-xs font-black text-slate-900 dark:text-white">{svc.latency}</p>
                            <p className="text-[10px] text-slate-400">Latency</p>
                         </div>
                         <div className={cn("inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[10px] font-black", svc.status === "OPERATIONAL" ? "bg-emerald-50 text-emerald-600" : "bg-rose-50 text-rose-600")}>
                            <div className={cn("h-1.5 w-1.5 rounded-full", svc.status === "OPERATIONAL" ? "bg-emerald-500" : "bg-rose-500 animate-pulse")} />
                            {svc.status}
                         </div>
                      </div>
                   </div>
                 ))}
              </div>
           </div>
        </div>

        <div className="space-y-6">
           <div className="rounded-[40px] bg-slate-900 p-8 text-white relative overflow-hidden group">
              <div className="relative z-10">
                 <ShieldCheck className="h-8 w-8 text-blue-400 mb-4" />
                 <h3 className="text-xl font-bold">Security Posture</h3>
                 <p className="mt-2 text-sm text-slate-400">All firewall rules are up to date. No unauthorized access attempts detected in the last 24 hours.</p>
                 <div className="mt-6 flex items-center gap-2 text-emerald-400 font-bold text-xs">
                    <CheckCircle2 className="h-4 w-4" />
                    ENCRYPTION AT REST ACTIVE
                 </div>
              </div>
              <div className="absolute -bottom-10 -right-10 h-40 w-40 rounded-full bg-blue-600/10 blur-3xl group-hover:bg-blue-600/20 transition-all" />
           </div>

           <div className="rounded-[32px] border border-slate-200 bg-white p-8 dark:border-slate-800 dark:bg-slate-900">
              <h3 className="text-xs font-black uppercase tracking-widest text-slate-400 mb-6">Recent Alerts</h3>
              <div className="space-y-4">
                 <div className="flex gap-3">
                    <AlertTriangle className="h-4 w-4 text-amber-500 shrink-0 mt-0.5" />
                    <div>
                       <p className="text-xs font-bold text-slate-900 dark:text-white">High Latency in US-EAST-1</p>
                       <p className="text-[10px] text-slate-500 mt-1">2 hours ago</p>
                    </div>
                 </div>
                 <div className="flex gap-3">
                    <Database className="h-4 w-4 text-rose-500 shrink-0 mt-0.5" />
                    <div>
                       <p className="text-xs font-bold text-slate-900 dark:text-white">DB Replication Lag detected</p>
                       <p className="text-[10px] text-slate-500 mt-1">5 hours ago</p>
                    </div>
                 </div>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
}
