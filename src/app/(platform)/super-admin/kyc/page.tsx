"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Users, 
  Settings2, 
  ShieldCheck, 
  Activity,
  Layers,
  Zap
} from "lucide-react";
import { KYCIntegrations } from "@/features/super-admin/components/kyc/kyc-integrations";
import { KYCRules } from "@/features/super-admin/components/kyc/kyc-rules";
import { KYCQueueTable } from "@/features/super-admin/components/kyc/kyc-queue-table";
import { cn } from "@/lib/utils/cn";

type TabType = "queue" | "integrations" | "rules";

export default function KycPage() {
  const [activeTab, setActiveTab] = useState<TabType>("queue");

  const tabs = [
    { id: "queue", label: "Review Queue", icon: Activity },
    { id: "integrations", label: "Integrations", icon: Zap },
    { id: "rules", label: "Automation Rules", icon: Settings2 },
  ];

  return (
    <div className="min-h-screen p-6 md:p-10 space-y-8">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-slate-900 dark:text-white uppercase">
            KYC <span className="text-blue-600">Management</span>
          </h1>
          <p className="mt-1 text-slate-500">
            Configure identity verification workflows, manage providers, and review user submissions.
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 overflow-x-auto rounded-[24px] bg-slate-100 p-1.5 dark:bg-slate-950 w-fit">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as TabType)}
            className={cn(
              "flex items-center gap-2.5 rounded-[20px] px-6 py-3 text-sm font-black transition-all",
              activeTab === tab.id
                ? "bg-white text-blue-600 shadow-sm dark:bg-slate-900"
                : "text-slate-500 hover:bg-slate-200/50 dark:hover:bg-slate-900/50"
            )}
          >
            <tab.icon className={cn("h-4 w-4", activeTab === tab.id ? "text-blue-600" : "text-slate-400")} />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <motion.div
        key={activeTab}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2 }}
        className="mt-8"
      >
        {activeTab === "queue" && (
          <div className="space-y-6">
             <div className="flex items-center justify-between">
                <h2 className="text-xl font-black uppercase text-slate-900 dark:text-white">Active Submissions</h2>
                <div className="flex gap-2">
                   <span className="rounded-full bg-blue-50 px-3 py-1 text-[10px] font-black text-blue-600">12 PENDING</span>
                </div>
             </div>
             <KYCQueueTable />
          </div>
        )}
        
        {activeTab === "integrations" && (
          <div className="space-y-6">
             <h2 className="text-xl font-black uppercase text-slate-900 dark:text-white">Provider Configuration</h2>
             <KYCIntegrations />
          </div>
        )}
        
        {activeTab === "rules" && (
          <div className="space-y-6">
             <h2 className="text-xl font-black uppercase text-slate-900 dark:text-white">System Logic</h2>
             <KYCRules />
          </div>
        )}
      </motion.div>
    </div>
  );
}
