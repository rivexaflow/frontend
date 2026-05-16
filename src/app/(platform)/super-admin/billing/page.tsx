"use client";

import React from "react";
import { motion } from "framer-motion";
import { 
  CreditCard, 
  TrendingUp, 
  DollarSign, 
  ArrowUpRight,
  Receipt,
  Download,
  Calendar
} from "lucide-react";
import { cn } from "@/lib/utils/cn";

const invoices = [
  { id: "INV-2024-001", tenant: "Acme Corp", amount: "$1,200", status: "PAID", date: "May 10, 2024" },
  { id: "INV-2024-002", tenant: "TechFlow", amount: "$450", status: "PENDING", date: "May 12, 2024" },
  { id: "INV-2024-003", tenant: "Stark Ind", amount: "$8,500", status: "PAID", date: "May 14, 2024" },
  { id: "INV-2024-004", tenant: "Global Log", amount: "$2,100", status: "OVERDUE", date: "May 01, 2024" },
];

export default function BillingPage() {
  return (
    <div className="min-h-screen p-6 md:p-10 space-y-10">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-slate-900 dark:text-white uppercase">
            Global <span className="text-blue-600">Billing</span>
          </h1>
          <p className="mt-1 text-slate-500">Monitor revenue trends, manage global invoices, and track subscription health.</p>
        </div>
        <div className="flex gap-3">
          <button className="flex items-center gap-2 rounded-2xl border border-slate-200 dark:border-slate-800 px-4 py-3 text-sm font-bold text-slate-600 dark:text-slate-400"><Download className="h-4 w-4" /> Export Report</button>
          <button className="rounded-2xl bg-blue-600 px-6 py-3 text-sm font-bold text-white shadow-lg shadow-blue-600/20">New Invoice</button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-4">
        {[
          { label: "Total Revenue", value: "$124.5k", change: "+12%", icon: DollarSign, color: "blue" },
          { label: "Active Subs", value: "38", change: "+4", icon: CreditCard, color: "purple" },
          { label: "Pending", value: "$4.2k", change: "-2%", icon: Receipt, color: "amber" },
          { label: "Growth", value: "+22%", change: "+2%", icon: TrendingUp, color: "emerald" },
        ].map((stat) => (
          <div key={stat.label} className="rounded-3xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
            <div className="flex items-center justify-between mb-4">
              <div className={cn("flex h-10 w-10 items-center justify-center rounded-xl", stat.color === "blue" && "bg-blue-50 text-blue-600", stat.color === "purple" && "bg-purple-50 text-purple-600", stat.color === "amber" && "bg-amber-50 text-amber-600", stat.color === "emerald" && "bg-emerald-50 text-emerald-600")}>
                <stat.icon className="h-5 w-5" />
              </div>
              <span className="flex items-center gap-0.5 text-[10px] font-black text-emerald-500"><ArrowUpRight className="h-3 w-3" /> {stat.change}</span>
            </div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">{stat.label}</p>
            <h3 className="text-2xl font-black text-slate-900 dark:text-white mt-1">{stat.value}</h3>
          </div>
        ))}
      </div>

      <div className="overflow-hidden rounded-[32px] border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div className="px-6 py-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
           <h3 className="text-sm font-black uppercase tracking-widest text-slate-900 dark:text-white">Recent Transactions</h3>
           <button className="text-xs font-bold text-blue-600 hover:underline">View all invoices</button>
        </div>
        <table className="w-full text-left">
          <thead>
            <tr className="bg-slate-50/50 dark:bg-slate-950/50 border-b border-slate-100 dark:border-slate-800">
              <th className="px-6 py-4 text-xs font-black uppercase text-slate-400">Invoice ID</th>
              <th className="px-6 py-4 text-xs font-black uppercase text-slate-400">Tenant</th>
              <th className="px-6 py-4 text-xs font-black uppercase text-slate-400">Amount</th>
              <th className="px-6 py-4 text-xs font-black uppercase text-slate-400">Date</th>
              <th className="px-6 py-4 text-xs font-black uppercase text-slate-400">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50 dark:divide-slate-800/50">
            {invoices.map((inv) => (
              <tr key={inv.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                <td className="px-6 py-5 font-bold text-slate-900 dark:text-white">{inv.id}</td>
                <td className="px-6 py-5 text-sm font-semibold text-slate-600 dark:text-slate-400">{inv.tenant}</td>
                <td className="px-6 py-5 text-sm font-black text-slate-900 dark:text-white">{inv.amount}</td>
                <td className="px-6 py-5">
                   <div className="flex items-center gap-2 text-xs font-medium text-slate-400">
                    <Calendar className="h-3.5 w-3.5" />
                    {inv.date}
                   </div>
                </td>
                <td className="px-6 py-5">
                   <div className={cn("inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-black", inv.status === "PAID" ? "bg-emerald-50 text-emerald-600" : inv.status === "PENDING" ? "bg-amber-50 text-amber-600" : "bg-rose-50 text-rose-600")}>
                    {inv.status}
                   </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
