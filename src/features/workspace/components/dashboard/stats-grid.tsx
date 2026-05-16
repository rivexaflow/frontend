"use client";

import React from "react";
import { motion } from "framer-motion";
import { 
  Users, 
  Target, 
  TrendingUp, 
  Zap,
  ArrowUpRight,
  ArrowDownRight
} from "lucide-react";
import { cn } from "@/lib/utils/cn";

const stats = [
  {
    label: "Total Leads",
    value: "1,284",
    change: "+12.5%",
    isUp: true,
    icon: Target,
    color: "blue",
    gradient: "from-blue-500 to-indigo-600"
  },
  {
    label: "Active Contacts",
    value: "842",
    change: "+3.2%",
    isUp: true,
    icon: Users,
    color: "emerald",
    gradient: "from-emerald-500 to-teal-600"
  },
  {
    label: "AI Efficiency",
    value: "94.2%",
    change: "+5.4%",
    isUp: true,
    icon: Zap,
    color: "amber",
    gradient: "from-amber-500 to-orange-600"
  },
  {
    label: "Monthly Revenue",
    value: "$42.5k",
    change: "-2.1%",
    isUp: false,
    icon: TrendingUp,
    color: "purple",
    gradient: "from-purple-500 to-pink-600"
  }
];

export function StatsGrid() {
  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat, i) => (
        <motion.div
          key={stat.label}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.1 }}
          whileHover={{ y: -5 }}
          className="group relative overflow-hidden rounded-[32px] border border-slate-200 bg-white p-6 shadow-sm transition-all hover:shadow-xl dark:border-slate-800 dark:bg-slate-900"
        >
          <div className="flex items-center justify-between">
            <div className={cn(
              "flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br shadow-lg",
              stat.gradient
            )}>
              <stat.icon className="h-6 w-6 text-white" />
            </div>
            <div className={cn(
              "flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-bold",
              stat.isUp 
                ? "bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20 dark:text-emerald-400" 
                : "bg-rose-50 text-rose-600 dark:bg-rose-900/20 dark:text-rose-400"
            )}>
              {stat.isUp ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
              {stat.change}
            </div>
          </div>
          
          <div className="mt-6">
            <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">{stat.label}</p>
            <h3 className="mt-1 text-3xl font-black tracking-tight text-slate-900 dark:text-white">
              {stat.value}
            </h3>
          </div>
          
          {/* Subtle background decoration */}
          <div className={cn(
            "absolute -right-4 -bottom-4 h-24 w-24 rounded-full bg-gradient-to-br opacity-[0.03] transition-transform group-hover:scale-150",
            stat.gradient
          )} />
        </motion.div>
      ))}
    </div>
  );
}
