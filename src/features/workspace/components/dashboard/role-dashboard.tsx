"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import {
  ArrowRight,
  BarChart3,
  Calendar,
  FileText,
  ShieldCheck,
  Sparkles,
  UserPlus,
  Users,
} from "lucide-react";

import { authStore } from "@/stores/auth.store";
import { effectiveNavRole } from "@/types/auth";
import { WorkspaceGraphPanel } from "@/features/workspace/components/workspace-graph/workspace-graph-panel";
import { DashboardHeader } from "@/features/workspace/components/dashboard/dashboard-header";
import { StatsGrid } from "@/features/workspace/components/dashboard/stats-grid";
import { RecentActivity } from "@/features/workspace/components/dashboard/activity-feed";

import { DashboardTodoPanel } from "@/features/workspace/components/dashboard/dashboard-todo-panel";
import {
  buildTodosFromModules,
  resolveDashboardModules,
} from "@/features/workspace/data/dashboard-modules";
import { workspacePaths } from "@/lib/workspace/paths";
import { cn } from "@/lib/utils/cn";

const PROFILE_COPY: Record<string, { title: string; subtitle: string }> = {
  owner: {
    title: "Executive command center",
    subtitle: "Full visibility across CRM, compliance, billing, AI, and team performance.",
  },
  manager: {
    title: "Operations command center",
    subtitle: "Track pipelines, KYC queues, invoices, and team activity in one place.",
  },
  freelancer: {
    title: "Focused workspace",
    subtitle: "Essential modules for contacts, compliance, and AI — without the noise.",
  },
};

export function RoleDashboard({ workspaceSlug }: { workspaceSlug: string }) {
  const user = authStore((s) => s.user);
  const navRole = effectiveNavRole(user) ?? "USER";
  const profile = (user?.profileRole as string) ?? "freelancer";
  const copy = PROFILE_COPY[profile] ?? PROFILE_COPY.freelancer;

  const modules = resolveDashboardModules(user?.selectedModules ?? []);
  const todos = buildTodosFromModules(modules);

  const quickLinks =
    navRole === "ADMIN"
      ? [
          { label: "New lead", icon: Sparkles, href: workspacePaths.leads, color: "blue" },
          { label: "Add contact", icon: UserPlus, href: workspacePaths.contacts, color: "emerald" },
          { label: "KYC review", icon: ShieldCheck, href: workspacePaths.kyc, color: "purple" },
          { label: "New invoice", icon: FileText, href: workspacePaths.invoices, color: "amber" },
        ]
      : [
          { label: "My contacts", icon: UserPlus, href: workspacePaths.contacts, color: "emerald" },
          { label: "My KYC", icon: ShieldCheck, href: `${workspacePaths.kyc}/submissions`, color: "purple" },
          { label: "AI tools", icon: Sparkles, href: `${workspacePaths.ai}/tools`, color: "blue" },
          { label: "Reports", icon: BarChart3, href: workspacePaths.reports, color: "indigo" },
        ];

  return (
    <div className="space-y-8">
      <DashboardHeader />

      {navRole === "ADMIN" && <StatsGrid />}

      <div className="grid grid-cols-1 gap-8 xl:grid-cols-3">
        <div className="space-y-8 xl:col-span-2">


          <section>
            <h3 className="mb-4 text-lg font-bold text-slate-900 dark:text-white">Quick actions</h3>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              {quickLinks.map((action) => (
                <Link
                  key={action.label}
                  href={action.href}
                  className="flex flex-col items-center gap-2 rounded-2xl border border-slate-200/80 bg-white p-4 text-center shadow-sm transition hover:border-blue-200 hover:shadow-md dark:border-slate-800 dark:bg-slate-900"
                >
                  <div
                    className={cn(
                      "flex h-10 w-10 items-center justify-center rounded-xl",
                      action.color === "blue" && "bg-blue-50 text-blue-600",
                      action.color === "emerald" && "bg-emerald-50 text-emerald-600",
                      action.color === "purple" && "bg-purple-50 text-purple-600",
                      action.color === "amber" && "bg-amber-50 text-amber-600",
                      action.color === "indigo" && "bg-indigo-50 text-indigo-600",
                    )}
                  >
                    <action.icon className="h-5 w-5" />
                  </div>
                  <span className="text-xs font-bold text-slate-700 dark:text-slate-300">{action.label}</span>
                </Link>
              ))}
            </div>
          </section>

          {navRole === "ADMIN" && (
            <div className="overflow-hidden rounded-[28px] bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-950 p-8 text-white">
              <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div>
                  <h3 className="text-xl font-bold">Operational performance</h3>
                  <p className="mt-2 max-w-lg text-sm text-slate-400">
                    AI automation and module workflows are active. Review analytics for cross-team
                    insights.
                  </p>
                </div>
                <Link
                  href={workspacePaths.reports}
                  className="inline-flex items-center gap-2 rounded-xl bg-white/10 px-4 py-2.5 text-sm font-bold backdrop-blur transition hover:bg-white/20"
                >
                  View reports
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </div>
          )}
        </div>

        <div className="space-y-8">
          <DashboardTodoPanel todos={todos} />

          {navRole === "ADMIN" ? (
            <RecentActivity />
          ) : (
            <div className="rounded-[28px] border border-slate-200/80 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
              <div className="mb-4 flex items-center gap-2">
                <Users className="h-5 w-5 text-blue-600" />
                <h3 className="font-bold text-slate-900 dark:text-white">Team pulse</h3>
              </div>
              <p className="text-sm text-slate-500">
                Your manager has shared 4 updates today. Open team activity for assignments and
                mentions.
              </p>
              <Link
                href={workspacePaths.userActivity}
                className="mt-4 inline-flex text-sm font-bold text-blue-600 hover:underline"
              >
                Open team feed
              </Link>
            </div>
          )}
        </div>
      </div>

      {(navRole === "ADMIN" || navRole === "SUPER_ADMIN" || profile === "owner") && (
        <WorkspaceGraphPanel canManage={navRole === "ADMIN" || navRole === "SUPER_ADMIN" || profile === "owner"} />
      )}
    </div>
  );
}
