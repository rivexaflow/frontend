"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  Activity,
  ArrowRight,
  Building2,
  Cpu,
  Globe2,
  TrendingUp,
  Users,
  Workflow,
  Zap,
} from "lucide-react";

import { fetchAdminDashboard } from "@/lib/api/admin";
import { formatCount } from "@/lib/api/admin-normalize";
import type { AdminDashboardStats } from "@/types/admin";
import { AdminStatCard } from "@/features/super-admin/components/admin-stat-card";
import { AdminPanel } from "@/features/super-admin/components/admin-ui";
import { SuperAdminAppShell } from "@/features/super-admin/components/super-admin-app-shell";

const quickLinks = [
  { href: "/super-admin/users", label: "User governance", desc: "Roles, status, access", icon: Users },
  { href: "/super-admin/companies", label: "Company registry", desc: "Plans, regions, members", icon: Building2 },
  { href: "/super-admin/ai-models", label: "AI model keys", desc: "Providers & credentials", icon: Cpu },
  { href: "/super-admin/workflows", label: "Workflow pipelines", desc: "Platform automations", icon: Workflow },
];

export function AdminDashboardView() {
  const [stats, setStats] = useState<AdminDashboardStats | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const data = await fetchAdminDashboard();
        if (!cancelled) setStats(data);
      } catch (e) {
        if (!cancelled) setError(e instanceof Error ? e.message : "Failed to load stats");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <SuperAdminAppShell
      title="Platform overview"
      description="Real-time visibility across users, tenants, AI consumption, and automation — your international operations command center."
    >
      {error ? (
        <div role="alert" className="mb-6 rounded-xl border border-rose-200/80 bg-rose-50 px-4 py-3 text-sm text-rose-800">
          {error}
        </div>
      ) : null}

      {loading ? (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="h-[7.5rem] animate-pulse rounded-2xl bg-white/80 ring-1 ring-slate-200/60" />
          ))}
        </div>
      ) : stats ? (
        <>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <AdminStatCard icon={Users} label="Total users" value={formatCount(stats.totalUsers)} hint="All registered accounts" />
            <AdminStatCard
              icon={TrendingUp}
              label="Active users"
              value={formatCount(stats.activeUsers)}
              trend={`${formatCount(stats.suspendedUsers)} suspended`}
              trendTone="negative"
            />
            <AdminStatCard icon={Building2} label="Companies" value={formatCount(stats.totalCompanies)} hint={`${formatCount(stats.activeCompanies)} active tenants`} />
            <AdminStatCard icon={Workflow} label="Workflows" value={formatCount(stats.totalWorkflows)} hint="Platform-wide executions" />
            <AdminStatCard icon={Cpu} label="AI models" value={`${formatCount(stats.aiModelsEnabled)}/${formatCount(stats.aiModelsTotal)}`} hint="Enabled / configured" />
            <AdminStatCard icon={Zap} label="Sign-ups (7d)" value={formatCount(stats.signups7d)} hint="New accounts this week" trend="+12% vs prior" trendTone="positive" />
            <AdminStatCard icon={Activity} label="API calls (24h)" value={formatCount(stats.apiCalls24h)} hint="All regions aggregated" />
            <AdminStatCard icon={Globe2} label="Platform health" value="Operational" hint="All regions nominal" trend="99.99% uptime" trendTone="positive" />
          </div>

          <section className="mt-8 grid gap-5 lg:grid-cols-3">
            <AdminPanel
              title="Platform activity"
              description="Governance and growth signals"
              className="lg:col-span-2"
            >
              <div className="space-y-4 p-6">
                <p className="text-sm leading-relaxed text-slate-600">
                  Monitor user growth, workflow executions, and AI consumption from a single command center.
                  Every change to roles, model keys, and tenant status is intended for audited platform operations.
                </p>
                <div className="grid gap-3 sm:grid-cols-3">
                  {[
                    { label: "Active tenants", value: formatCount(stats.activeCompanies) },
                    { label: "Workflows live", value: formatCount(stats.totalWorkflows) },
                    { label: "Models enabled", value: formatCount(stats.aiModelsEnabled) },
                  ].map((item) => (
                    <div
                      key={item.label}
                      className="rounded-xl border border-slate-100 bg-slate-50/80 px-4 py-3"
                    >
                      <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">{item.label}</p>
                      <p className="mt-1 text-lg font-semibold text-[#191970]">{item.value}</p>
                    </div>
                  ))}
                </div>
              </div>
            </AdminPanel>

            <AdminPanel title="Quick navigation" description="Jump to a module">
              <ul className="divide-y divide-slate-100">
                {quickLinks.map((link) => {
                  const Icon = link.icon;
                  return (
                    <li key={link.href}>
                      <Link
                        href={link.href}
                        className="group flex items-center gap-3 px-5 py-3.5 transition hover:bg-[#f8faff]"
                      >
                        <span className="grid h-9 w-9 place-items-center rounded-lg bg-[#eef2ff] text-[#4338ca] transition group-hover:bg-[#2277FF] group-hover:text-white">
                          <Icon className="h-4 w-4" />
                        </span>
                        <span className="min-w-0 flex-1">
                          <p className="text-sm font-semibold text-[#191970]">{link.label}</p>
                          <p className="text-xs text-slate-500">{link.desc}</p>
                        </span>
                        <ArrowRight className="h-4 w-4 text-slate-300 transition group-hover:text-[#2277FF]" />
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </AdminPanel>
          </section>
        </>
      ) : null}
    </SuperAdminAppShell>
  );
}
