"use client";

import React from "react";
import { motion } from "framer-motion";
import { 
  MessageSquare, 
  Clock, 
  CheckCircle2, 
  AlertCircle,
  MoreVertical,
  User,
  Star
} from "lucide-react";
import { cn } from "@/lib/utils/cn";

const tickets = [
  { id: "T-1024", user: "John Doe", subject: "Billing issue with growth plan", priority: "HIGH", status: "OPEN", time: "10m ago" },
  { id: "T-1023", user: "Sarah Smith", subject: "KYC verification pending for 3 days", priority: "MEDIUM", status: "IN_PROGRESS", time: "45m ago" },
  { id: "T-1022", user: "Mike Jones", subject: "API key not working for integration", priority: "HIGH", status: "OPEN", time: "1h ago" },
  { id: "T-1021", user: "Emma Wilson", subject: "How to add new workspace members?", priority: "LOW", status: "RESOLVED", time: "2h ago" },
];

export default function SupportPage() {
  return (
    <div className="min-h-screen p-6 md:p-10 space-y-10">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-slate-900 dark:text-white uppercase">
            Support <span className="text-blue-600">Command Center</span>
          </h1>
          <p className="mt-1 text-slate-500">Manage platform-wide tickets, agent performance, and customer satisfaction.</p>
        </div>
        <button className="rounded-2xl bg-blue-600 px-6 py-3 text-sm font-bold text-white shadow-lg shadow-blue-600/20">New Ticket</button>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
        {[
          { label: "Open Tickets", value: "12", icon: MessageSquare, color: "blue" },
          { label: "Avg Response", value: "14m", icon: Clock, color: "amber" },
          { label: "Satisfaction", value: "4.8", icon: Star, color: "emerald" },
        ].map((stat) => (
          <div key={stat.label} className="rounded-3xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
            <div className="flex items-center justify-between mb-4">
              <div className={cn("flex h-10 w-10 items-center justify-center rounded-xl", stat.color === "blue" && "bg-blue-50 text-blue-600", stat.color === "amber" && "bg-amber-50 text-amber-600", stat.color === "emerald" && "bg-emerald-50 text-emerald-600")}>
                <stat.icon className="h-5 w-5" />
              </div>
            </div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">{stat.label}</p>
            <h3 className="text-3xl font-black text-slate-900 dark:text-white mt-1">{stat.value}</h3>
          </div>
        ))}
      </div>

      <div className="overflow-hidden rounded-[32px] border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <table className="w-full text-left">
          <thead>
            <tr className="bg-slate-50/50 dark:bg-slate-950/50 border-b border-slate-100 dark:border-slate-800">
              <th className="px-6 py-4 text-xs font-black uppercase text-slate-400">Ticket / User</th>
              <th className="px-6 py-4 text-xs font-black uppercase text-slate-400">Subject</th>
              <th className="px-6 py-4 text-xs font-black uppercase text-slate-400">Priority</th>
              <th className="px-6 py-4 text-xs font-black uppercase text-slate-400">Status</th>
              <th className="px-6 py-4 text-xs font-black uppercase text-slate-400 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50 dark:divide-slate-800/50">
            {tickets.map((ticket, i) => (
              <tr key={ticket.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                <td className="px-6 py-5">
                  <div className="font-bold text-slate-900 dark:text-white">{ticket.id}</div>
                  <div className="text-xs text-slate-400">{ticket.user}</div>
                </td>
                <td className="px-6 py-5 text-sm font-semibold text-slate-600 dark:text-slate-400">{ticket.subject}</td>
                <td className="px-6 py-5">
                   <span className={cn("rounded-full px-2 py-0.5 text-[10px] font-black", ticket.priority === "HIGH" ? "bg-rose-50 text-rose-600" : "bg-blue-50 text-blue-600")}>
                    {ticket.priority}
                   </span>
                </td>
                <td className="px-6 py-5">
                   <div className="flex items-center gap-1.5 text-[10px] font-black text-slate-500">
                    <div className={cn("h-1.5 w-1.5 rounded-full", ticket.status === "OPEN" ? "bg-blue-500 animate-pulse" : "bg-emerald-500")} />
                    {ticket.status}
                   </div>
                </td>
                <td className="px-6 py-5 text-right">
                  <button className="text-slate-400 hover:text-slate-600"><MoreVertical className="h-4 w-4" /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
