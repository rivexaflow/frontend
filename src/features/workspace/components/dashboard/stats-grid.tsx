import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { 
  Users, 
  Target, 
  TrendingUp, 
  Zap,
  ArrowUpRight,
  ArrowDownRight,
  Briefcase
} from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { apiClient } from "@/lib/api/client";
import { useHrCompanyId } from "@/features/workspace/hooks/use-hr-company-id";
import { workspaceStore } from "@/stores/workspace.store";

export function StatsGrid() {
  const companyId = useHrCompanyId();
  const themeConfig = workspaceStore((s) => s.themeConfig);
  const primaryColor = themeConfig?.primaryColor || "#191970";
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    if (!companyId) return;
    async function loadStats() {
      try {
        const res = await apiClient.get(`/api/dashboard/${companyId}/overview`);
        if (res.data?.success && res.data.data) {
          setData(res.data.data);
        }
      } catch (err) {
        console.error("Dashboard overview stats error:", err);
      }
    }
    void loadStats();
  }, [companyId]);

  const kpis = data?.kpis;

  const stats = [
    {
      label: "Total Leads",
      value: kpis?.totalLeads ? Number(kpis.totalLeads.value).toLocaleString() : "1,284",
      change: kpis?.totalLeads?.change ? `+${kpis.totalLeads.change}` : "+12.5%",
      isUp: true,
      icon: Target
    },
    {
      label: "Active Projects",
      value: kpis?.activeProjects ? String(kpis.activeProjects.value) : "8",
      change: "+3.2%",
      isUp: true,
      icon: Briefcase
    },
    {
      label: "Open Tasks",
      value: kpis?.openTasks ? String(kpis.openTasks.value) : "14",
      change: "+5.4%",
      isUp: true,
      icon: Zap
    },
    {
      label: "Monthly Revenue",
      value: kpis?.monthlyRevenue ? `₹${Number(kpis.monthlyRevenue.value).toLocaleString()}` : "$42.5k",
      change: kpis?.monthlyRevenue?.growth !== undefined ? `${kpis.monthlyRevenue.growth >= 0 ? "+" : ""}${kpis.monthlyRevenue.growth}%` : "-2.1%",
      isUp: kpis?.monthlyRevenue?.growth !== undefined ? kpis.monthlyRevenue.growth >= 0 : false,
      icon: TrendingUp
    }
  ];

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
            <div 
              className="flex h-12 w-12 items-center justify-center rounded-2xl shadow-lg"
              style={{ background: `linear-gradient(135deg, ${primaryColor}, ${primaryColor}dd)` }}
            >
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
          
          {/* Decorative theme color background overlay */}
          <div 
            className="absolute -right-4 -bottom-4 h-24 w-24 rounded-full opacity-[0.03] transition-transform group-hover:scale-150"
            style={{ background: `linear-gradient(135deg, ${primaryColor}, ${primaryColor}cc)` }}
          />
        </motion.div>
      ))}
    </div>
  );
}
