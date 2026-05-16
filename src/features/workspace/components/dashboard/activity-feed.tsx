"use client";

import React from "react";
import { motion } from "framer-motion";
import { 
  UserPlus, 
  CheckCircle2, 
  ShieldCheck, 
  FileText,
  Clock
} from "lucide-react";
import { cn } from "@/lib/utils/cn";

const activities = [
  {
    id: 1,
    type: "contact",
    title: "New contact added",
    description: "Sarah Jenkins from TechCorp was added to the CRM.",
    time: "2 mins ago",
    icon: UserPlus,
    color: "blue"
  },
  {
    id: 2,
    type: "kyc",
    title: "KYC Verified",
    description: "Global Logistics Ltd. completed business verification.",
    time: "45 mins ago",
    icon: ShieldCheck,
    color: "emerald"
  },
  {
    id: 3,
    type: "invoice",
    title: "Invoice Paid",
    description: "Invoice #INV-2024-001 has been marked as paid.",
    time: "2 hours ago",
    icon: FileText,
    color: "purple"
  },
  {
    id: 4,
    type: "system",
    title: "AI Analysis Complete",
    description: "Quarterly lead generation report is ready for review.",
    time: "5 hours ago",
    icon: CheckCircle2,
    color: "amber"
  }
];

export function RecentActivity() {
  return (
    <div className="rounded-[32px] border border-slate-200 bg-white p-8 shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <div className="mb-6 flex items-center justify-between">
        <h3 className="text-xl font-bold text-slate-900 dark:text-white">Recent Activity</h3>
        <button className="text-sm font-bold text-blue-600 hover:underline">View all</button>
      </div>
      
      <div className="space-y-6">
        {activities.map((activity, i) => (
          <motion.div
            key={activity.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.1 }}
            className="flex items-start gap-4"
          >
            <div className={cn(
              "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl",
              activity.color === "blue" && "bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400",
              activity.color === "emerald" && "bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20 dark:text-emerald-400",
              activity.color === "purple" && "bg-purple-50 text-purple-600 dark:bg-purple-900/20 dark:text-purple-400",
              activity.color === "amber" && "bg-amber-50 text-amber-600 dark:bg-amber-900/20 dark:text-amber-400"
            )}>
              <activity.icon className="h-5 w-5" />
            </div>
            
            <div className="flex-1 border-b border-slate-100 pb-4 dark:border-slate-800/50">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-bold text-slate-900 dark:text-white">{activity.title}</h4>
                <div className="flex items-center gap-1 text-[10px] font-medium text-slate-400">
                  <Clock className="h-3 w-3" />
                  {activity.time}
                </div>
              </div>
              <p className="mt-1 text-xs text-slate-500 leading-relaxed">
                {activity.description}
              </p>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
