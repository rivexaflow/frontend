"use client";

import React from "react";
import { motion } from "framer-motion";
import { 
  CheckCircle2, 
  XCircle, 
  AlertCircle,
  ExternalLink,
  Eye,
  Clock
} from "lucide-react";
import { cn } from "@/lib/utils/cn";

const queue = [
  {
    id: "KYC-8824",
    user: "Robert Fox",
    email: "robert@acme.com",
    type: "Individual",
    provider: "Onfido",
    score: 92,
    status: "PENDING",
    time: "12 mins ago"
  },
  {
    id: "KYC-8823",
    user: "Jenny Wilson",
    email: "jenny@techflow.io",
    type: "Business",
    provider: "Onfido",
    score: 98,
    status: "APPROVED",
    time: "2 hours ago"
  },
  {
    id: "KYC-8822",
    user: "Cody Fisher",
    email: "cody@stark.com",
    type: "Individual",
    provider: "Sumsub",
    score: 42,
    status: "REJECTED",
    time: "5 hours ago"
  },
  {
    id: "KYC-8821",
    user: "Esther Howard",
    email: "esther@global.net",
    type: "Business",
    provider: "Onfido",
    score: 78,
    status: "REVIEW",
    time: "Yesterday"
  }
];

export function KYCQueueTable() {
  return (
    <div className="overflow-hidden rounded-[32px] border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-slate-100 bg-slate-50/50 dark:border-slate-800 dark:bg-slate-950/50">
              <th className="px-6 py-4 text-xs font-black uppercase tracking-wider text-slate-400">ID / User</th>
              <th className="px-6 py-4 text-xs font-black uppercase tracking-wider text-slate-400">Type</th>
              <th className="px-6 py-4 text-xs font-black uppercase tracking-wider text-slate-400">Provider</th>
              <th className="px-6 py-4 text-xs font-black uppercase tracking-wider text-slate-400">AI Score</th>
              <th className="px-6 py-4 text-xs font-black uppercase tracking-wider text-slate-400">Status</th>
              <th className="px-6 py-4 text-xs font-black uppercase tracking-wider text-slate-400 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50 dark:divide-slate-800/50">
            {queue.map((item, i) => (
              <motion.tr
                key={item.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="group hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition-colors"
              >
                <td className="px-6 py-5">
                  <div>
                    <div className="text-[10px] font-black text-blue-600 uppercase tracking-widest">{item.id}</div>
                    <div className="font-bold text-slate-900 dark:text-white">{item.user}</div>
                    <div className="text-[10px] text-slate-400">{item.email}</div>
                  </div>
                </td>
                <td className="px-6 py-5">
                  <span className="text-xs font-bold text-slate-600 dark:text-slate-400">{item.type}</span>
                </td>
                <td className="px-6 py-5">
                  <div className="flex items-center gap-2">
                    <div className="h-6 w-6 rounded-md bg-slate-100 flex items-center justify-center text-[10px] font-black dark:bg-slate-800">
                      {item.provider.charAt(0)}
                    </div>
                    <span className="text-xs font-semibold text-slate-600 dark:text-slate-400">{item.provider}</span>
                  </div>
                </td>
                <td className="px-6 py-5">
                  <div className="flex items-center gap-2">
                    <span className={cn(
                      "text-sm font-black",
                      item.score >= 80 ? "text-emerald-500" : item.score >= 60 ? "text-amber-500" : "text-rose-500"
                    )}>{item.score}%</span>
                    <div className="h-1 w-12 rounded-full bg-slate-100 dark:bg-slate-800">
                       <div 
                        className={cn(
                          "h-full rounded-full",
                          item.score >= 80 ? "bg-emerald-500" : item.score >= 60 ? "bg-amber-500" : "bg-rose-500"
                        )}
                        style={{ width: `${item.score}%` }}
                       />
                    </div>
                  </div>
                </td>
                <td className="px-6 py-5">
                   <div className={cn(
                    "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-black",
                    item.status === "APPROVED" ? "bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20 dark:text-emerald-400" :
                    item.status === "PENDING" ? "bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400" :
                    item.status === "REVIEW" ? "bg-amber-50 text-amber-600 dark:bg-amber-900/20 dark:text-amber-400" :
                    "bg-rose-50 text-rose-600 dark:bg-rose-900/20 dark:text-rose-400"
                   )}>
                    {item.status === "APPROVED" && <CheckCircle2 className="h-3 w-3" />}
                    {item.status === "PENDING" && <Clock className="h-3 w-3 animate-pulse" />}
                    {item.status === "REVIEW" && <AlertCircle className="h-3 w-3" />}
                    {item.status === "REJECTED" && <XCircle className="h-3 w-3" />}
                    {item.status}
                   </div>
                </td>
                <td className="px-6 py-5 text-right">
                  <div className="flex items-center justify-end gap-2">
                    <button className="rounded-lg p-2 text-slate-400 hover:bg-blue-50 hover:text-blue-600 dark:hover:bg-blue-900/20">
                      <Eye className="h-4 w-4" />
                    </button>
                    <button className="rounded-lg p-2 text-slate-400 hover:bg-emerald-50 hover:text-emerald-600 dark:hover:bg-emerald-900/20">
                      <CheckCircle2 className="h-4 w-4" />
                    </button>
                  </div>
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
