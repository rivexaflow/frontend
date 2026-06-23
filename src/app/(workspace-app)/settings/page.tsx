"use client";

import { useEffect, useState } from "react";
import { useHrCompanyId } from "@/features/workspace/hooks/use-hr-company-id";
import { SettingsProfileTab } from "@/features/workspace/components/settings/settings-profile-tab";
import { SettingsModulesTab } from "@/features/workspace/components/settings/settings-modules-tab";
import { SettingsBrandingTab } from "@/features/workspace/components/settings/settings-branding-tab";
import { SettingsApiKeysTab } from "@/features/workspace/components/settings/settings-apikeys-tab";
import { SettingsMembersTab } from "@/features/workspace/components/settings/settings-members-tab";
import { ChangePasswordCard } from "@/components/auth/change-password-card";
import { PageHeader } from "@/components/shared/page-header/page-header";
import { MISSING_COMPANY_CONTEXT_MESSAGE } from "@/lib/workspace/company-context";
import { apiClient } from "@/lib/api/client";
import { crm } from "@/features/workspace/components/crm/crm-styles";
import { cn } from "@/lib/utils/cn";
import { Users, Puzzle, Key, Shield, Palette, Building2, Lock, ArrowRight } from "lucide-react";

export default function SettingsPage() {
  const companyId = useHrCompanyId();
  const [activeTab, setActiveTab] = useState("profile");
  const [counts, setCounts] = useState({
    memberCount: 0,
    activeModuleCount: 0,
    apiKeyCount: 0,
    policyCount: 0,
  });

  useEffect(() => {
    if (!companyId) return;
    async function loadStats() {
      try {
        const { data } = await apiClient.get(`/company/${companyId}`);
        if (data.success && data.data) {
          const c = data.data;
          setCounts({
            memberCount: c.memberCount || 0,
            activeModuleCount: c.activeModuleCount || 0,
            apiKeyCount: c.apiKeyCount || 0,
            policyCount: c.policyCount || 0,
          });
        }
      } catch (err) {
        console.error("Failed to load company stats:", err);
      }
    }
    loadStats();
  }, [companyId, activeTab]);

  if (!companyId) {
    return (
      <div className="space-y-6">
        <PageHeader title="Workspace Settings" description="Workspace configuration and governance." />
        <div className="rounded-xl border border-amber-100 bg-amber-50 p-4 text-xs font-semibold text-amber-800 dark:border-amber-950/20 dark:bg-amber-950/10">
          {MISSING_COMPANY_CONTEXT_MESSAGE}
        </div>
      </div>
    );
  }

  const statCards = [
    {
      title: "Team members",
      value: counts.memberCount,
      icon: Users,
      iconColor: "text-blue-600 bg-blue-50 dark:bg-blue-950/30 dark:text-blue-400",
    },
    {
      title: "Active modules",
      value: counts.activeModuleCount,
      icon: Puzzle,
      iconColor: "text-purple-600 bg-purple-50 dark:bg-purple-950/30 dark:text-purple-400",
    },
    {
      title: "API keys",
      value: counts.apiKeyCount,
      icon: Key,
      iconColor: "text-amber-600 bg-amber-50 dark:bg-amber-950/30 dark:text-amber-400",
    },
    {
      title: "Policy packs",
      value: counts.policyCount,
      icon: Shield,
      iconColor: "text-emerald-600 bg-emerald-50 dark:bg-emerald-950/30 dark:text-emerald-400",
    },
  ];

  return (
    <div className="space-y-8 pb-12">
      <div>
        <span className="text-[10px] font-extrabold uppercase tracking-[0.2em] text-[#191970] dark:text-[#2277ff]">
          System
        </span>
        <h1 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white mt-1">
          Settings
        </h1>
        <p className="text-sm text-slate-500 mt-1.5 leading-relaxed">
          Workspace configuration, security, branding, and module governance.
        </p>
      </div>

      {/* 4 Top Stats Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {statCards.map((card) => (
          <div
            key={card.title}
            className={cn(
              crm.panel,
              "flex items-center gap-4 p-5 hover:shadow-md transition-all duration-300"
            )}
          >
            <span className={cn("flex h-11 w-11 shrink-0 items-center justify-center rounded-xl", card.iconColor)}>
              <card.icon className="h-5 w-5" />
            </span>
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">{card.title}</p>
              <p className="text-2xl font-black text-slate-800 dark:text-white mt-1">{card.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Two Column Cards Navigation Grid */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Left Column: Workspace */}
        <div className={cn(crm.panel, "p-6")}>
          <h2 className="text-sm font-bold uppercase tracking-wider text-slate-400 mb-4">Workspace</h2>
          <div className="space-y-2">
            {[
              {
                id: "profile",
                name: "General",
                desc: "Name, timezone, and defaults",
                icon: Building2,
                colorClass: "bg-blue-50 text-blue-600 dark:bg-blue-950/30 dark:text-blue-400",
              },
              {
                id: "domains",
                name: "Branding",
                desc: "Logo, colors, and email theme",
                icon: Palette,
                colorClass: "bg-purple-50 text-purple-600 dark:bg-purple-950/30 dark:text-purple-400",
              },
              {
                id: "modules",
                name: "Modules",
                desc: "Enabled product modules",
                icon: Puzzle,
                colorClass: "bg-emerald-50 text-emerald-600 dark:bg-emerald-950/30 dark:text-emerald-400",
              },
            ].map((item) => {
              const active = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setActiveTab(item.id)}
                  className={cn(
                    "flex w-full items-center justify-between rounded-xl border p-4 text-left transition-all duration-200 hover:shadow-sm",
                    active
                      ? "border-[#191970]/30 bg-[#191970]/[0.02] dark:border-[#2277ff]/30 dark:bg-[#2277ff]/[0.02]"
                      : "border-slate-100 bg-white hover:bg-slate-50/50 dark:border-slate-800 dark:bg-slate-900"
                  )}
                >
                  <div className="flex items-center gap-3.5">
                    <span className={cn("flex h-9 w-9 shrink-0 items-center justify-center rounded-lg", item.colorClass)}>
                      <item.icon className="h-4.5 w-4.5" />
                    </span>
                    <div>
                      <span className="block text-sm font-bold text-slate-800 dark:text-slate-200">{item.name}</span>
                      <span className="block text-xs text-slate-400 mt-0.5">{item.desc}</span>
                    </div>
                  </div>
                  <ArrowRight className={cn("h-4 w-4 text-slate-300 transition-transform", active && "translate-x-1 text-[#191970] dark:text-[#2277ff]")} />
                </button>
              );
            })}
          </div>
        </div>

        {/* Right Column: Security & access */}
        <div className={cn(crm.panel, "p-6")}>
          <h2 className="text-sm font-bold uppercase tracking-wider text-slate-400 mb-4">Security & access</h2>
          <div className="space-y-2">
            {[
              {
                id: "members",
                name: "Team members",
                desc: "Roles and invitations",
                icon: Users,
                colorClass: "bg-blue-50 text-blue-600 dark:bg-blue-950/30 dark:text-blue-400",
              },
              {
                id: "api-keys",
                name: "API keys",
                desc: "Integrations and webhooks",
                icon: Key,
                colorClass: "bg-amber-50 text-amber-600 dark:bg-amber-950/30 dark:text-amber-400",
              },
              {
                id: "security",
                name: "Password",
                desc: "Credentials and MFA",
                icon: Lock,
                colorClass: "bg-emerald-50 text-emerald-600 dark:bg-emerald-950/30 dark:text-emerald-400",
              },
            ].map((item) => {
              const active = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setActiveTab(item.id)}
                  className={cn(
                    "flex w-full items-center justify-between rounded-xl border p-4 text-left transition-all duration-200 hover:shadow-sm",
                    active
                      ? "border-[#191970]/30 bg-[#191970]/[0.02] dark:border-[#2277ff]/30 dark:bg-[#2277ff]/[0.02]"
                      : "border-slate-100 bg-white hover:bg-slate-50/50 dark:border-slate-800 dark:bg-slate-900"
                  )}
                >
                  <div className="flex items-center gap-3.5">
                    <span className={cn("flex h-9 w-9 shrink-0 items-center justify-center rounded-lg", item.colorClass)}>
                      <item.icon className="h-4.5 w-4.5" />
                    </span>
                    <div>
                      <span className="block text-sm font-bold text-slate-800 dark:text-slate-200">{item.name}</span>
                      <span className="block text-xs text-slate-400 mt-0.5">{item.desc}</span>
                    </div>
                  </div>
                  <ArrowRight className={cn("h-4 w-4 text-slate-300 transition-transform", active && "translate-x-1 text-[#191970] dark:text-[#2277ff]")} />
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Details View Area */}
      <div className="mt-8">
        {activeTab === "profile" && <SettingsProfileTab companyId={companyId} />}
        {activeTab === "domains" && <SettingsBrandingTab companyId={companyId} />}
        {activeTab === "modules" && <SettingsModulesTab companyId={companyId} />}
        {activeTab === "members" && <SettingsMembersTab companyId={companyId} />}
        {activeTab === "api-keys" && <SettingsApiKeysTab companyId={companyId} />}
        {activeTab === "security" && (
          <div className="max-w-xl">
            <ChangePasswordCard />
          </div>
        )}
      </div>
    </div>
  );
}
