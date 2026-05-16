"use client";

import React from "react";
import { motion } from "framer-motion";
import { 
  History, 
  ShieldAlert, 
  User, 
  Globe,
  MoreVertical,
  Search,
  Filter
} from "lucide-react";
import { cn } from "@/lib/utils/cn";

const logs = [
  { id: "1", action: "Tenant Suspended", actor: "Alice Admin", resource: "Stark Industries", level: "DANGER", time: "5 mins ago", ip: "192.168.1.1" },
  { id: "2", action: "API Key Generated", actor: "Dave Operator", resource: "Acme Corp", level: "INFO", time: "1 hour ago", ip: "10.0.0.42" },
  { id: "3", action: "Role Updated", actor: "Alice Admin", resource: "Bob Support", level: "WARNING", time: "4 hours ago", ip: "192.168.1.1" },
  { id: "4", action: "Provider Config Changed", actor: "Alice Admin", resource: "KYC Engine", level: "WARNING", time: "Yesterday", ip: "192.168.1.1" },
];

export default function AuditPage() {
  return (
    <div className="min-h-screen p-6 md:p-10 space-y-10">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-slate-900 dark:text-white uppercase">
            Audit <span className="text-blue-600">Logs</span>
          </h1>
          <p className="mt-1 text-slate-500">Immutable record of all critical administrative actions and system changes.</p>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input type="text" placeholder="Search actor, action or resource..." className="w-full pl-11 pr-4 py-3 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-sm outline-none focus:ring-4 focus:ring-blue-500/10" />
        </div>
        <button className="flex items-center gap-2 rounded-2xl border border-slate-200 dark:border-slate-800 px-4 py-3 text-sm font-bold text-slate-600 dark:text-slate-400"><Filter className="h-4 w-4" /> Filters</button>
      </div>

      <div className="overflow-hidden rounded-[32px] border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <table className="w-full text-left">
          <thead>
            <tr className="bg-slate-50/50 dark:bg-slate-950/50 border-b border-slate-100 dark:border-slate-800">
              <th className="px-6 py-4 text-xs font-black uppercase text-slate-400">Action / Level</th>
              <th className="px-6 py-4 text-xs font-black uppercase text-slate-400">Actor</th>
              <th className="px-6 py-4 text-xs font-black uppercase text-slate-400">Resource</th>
              <th className="px-6 py-4 text-xs font-black uppercase text-slate-400">IP Address</th>
              <th className="px-6 py-4 text-xs font-black uppercase text-slate-400">Time</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50 dark:divide-slate-800/50">
            {logs.map((log) => (
              <tr key={log.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                <td className="px-6 py-5">
                  <div className="font-bold text-slate-900 dark:text-white">{log.action}</div>
                  <div className={cn("inline-flex items-center gap-1 text-[10px] font-black", log.level === "DANGER" ? "text-rose-600" : log.level === "WARNING" ? "text-amber-600" : "text-blue-600")}>
                    {log.level}
                  </div>
                </td>
                <td className="px-6 py-5">
                  <div className="flex items-center gap-2 text-sm font-semibold text-slate-600 dark:text-slate-400">
                    <User className="h-3.5 w-3.5" />
                    {log.actor}
                  </div>
                </td>
                <td className="px-6 py-5 text-sm font-bold text-slate-800 dark:text-slate-200">{log.resource}</td>
                <td className="px-6 py-5">
                   <div className="flex items-center gap-2 text-xs font-medium text-slate-400">
                    <Globe className="h-3.5 w-3.5" />
                    {log.ip}
                   </div>
                </td>
                <td className="px-6 py-5 text-xs font-bold text-slate-500">{log.time}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
