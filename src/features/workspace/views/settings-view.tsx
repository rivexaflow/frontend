"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Building2,
  Key,
  Lock,
  Palette,
  Puzzle,
  Shield,
  Users,
} from "lucide-react";

import { ChangePasswordCard } from "@/components/auth/change-password-card";
import { SettingsApiKeysTab } from "@/features/workspace/components/settings/settings-apikeys-tab";
import { SettingsBrandingTab } from "@/features/workspace/components/settings/settings-branding-tab";
import { SettingsMembersTab } from "@/features/workspace/components/settings/settings-members-tab";
import { SettingsModulesTab } from "@/features/workspace/components/settings/settings-modules-tab";
import { SettingsProfileTab } from "@/features/workspace/components/settings/settings-profile-tab";
import {
  SettingsNav,
  SettingsStatPill,
  type SettingsNavGroup,
} from "@/features/workspace/components/settings/settings-ui-primitives";
import { useHrCompanyId } from "@/features/workspace/hooks/use-hr-company-id";
import { MISSING_COMPANY_CONTEXT_MESSAGE } from "@/lib/workspace/company-context";
import { apiClient } from "@/lib/api/client";
import { cn } from "@/lib/utils/cn";

const NAV_GROUPS: SettingsNavGroup[] = [
  {
    title: "Workspace",
    items: [
      {
        id: "profile",
        label: "General",
        description: "Name, timezone, defaults",
        icon: Building2,
      },
      {
        id: "domains",
        label: "Branding",
        description: "Logo, colors, domains",
        icon: Palette,
      },
      {
        id: "modules",
        label: "Modules",
        description: "Enabled product modules",
        icon: Puzzle,
      },
    ],
  },
  {
    title: "Security & access",
    items: [
      {
        id: "members",
        label: "Team members",
        description: "Roles and directory",
        icon: Users,
      },
      {
        id: "api-keys",
        label: "API keys",
        description: "Integrations & webhooks",
        icon: Key,
      },
      {
        id: "security",
        label: "Password",
        description: "Credentials & MFA",
        icon: Lock,
      },
    ],
  },
];

const TAB_COPY: Record<string, { title: string; description: string }> = {
  profile: {
    title: "General settings",
    description: "Company profile, regional defaults, and workspace metadata.",
  },
  domains: {
    title: "Branding & domains",
    description: "Visual identity, custom domains, and module-specific routing.",
  },
  modules: {
    title: "Workspace modules",
    description: "Enable or disable product modules for this workspace.",
  },
  members: {
    title: "Team members",
    description: "Directory, roles, presence, and CRM performance metrics.",
  },
  "api-keys": {
    title: "API keys",
    description: "Generate and revoke keys for integrations and automations.",
  },
  security: {
    title: "Password & security",
    description: "Update your sign-in credentials and account protection.",
  },
};

const VALID_TABS = new Set(["profile", "domains", "branding", "modules", "members", "api-keys", "security"]);

function normalizeSettingsTab(tab: string | null): string {
  if (!tab) return "profile";
  if (tab === "branding") return "domains";
  return VALID_TABS.has(tab) ? tab : "profile";
}

export function SettingsView() {
  const companyId = useHrCompanyId();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [activeTab, setActiveTab] = useState(() => normalizeSettingsTab(searchParams.get("tab")));

  useEffect(() => {
    setActiveTab(normalizeSettingsTab(searchParams.get("tab")));
  }, [searchParams]);

  const selectTab = (tabId: string) => {
    setActiveTab(tabId);
    const params = new URLSearchParams(searchParams.toString());
    if (tabId === "profile") {
      params.delete("tab");
      params.delete("section");
    } else {
      params.set("tab", tabId);
      if (tabId !== "domains") params.delete("section");
      else if (!params.get("section")) params.set("section", "identity");
    }
    const query = params.toString();
    router.replace(query ? `/settings?${query}` : "/settings", { scroll: false });
  };
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
      } catch {
        /* keep demo zeros */
      }
    }
    void loadStats();
  }, [companyId]);

  const activeCopy = TAB_COPY[activeTab] ?? TAB_COPY.profile;

  const content = useMemo(() => {
    if (!companyId) return null;
    switch (activeTab) {
      case "profile":
        return <SettingsProfileTab companyId={companyId} />;
      case "domains":
        return <SettingsBrandingTab companyId={companyId} />;
      case "modules":
        return <SettingsModulesTab companyId={companyId} />;
      case "members":
        return <SettingsMembersTab companyId={companyId} />;
      case "api-keys":
        return <SettingsApiKeysTab companyId={companyId} />;
      case "security":
        return (
          <div className="max-w-xl">
            <ChangePasswordCard />
          </div>
        );
      default:
        return null;
    }
  }, [activeTab, companyId]);

  if (!companyId) {
    return (
      <div className="space-y-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">Settings</h1>
          <p className="mt-1 text-sm text-slate-500">Workspace configuration and governance.</p>
        </div>
        <div className="rounded-xl border border-amber-100 bg-amber-50 p-4 text-xs font-semibold text-amber-800 dark:border-amber-950/20 dark:bg-amber-950/10">
          {MISSING_COMPANY_CONTEXT_MESSAGE}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-10">
      <div className="overflow-hidden rounded-[28px] border border-slate-200/80 bg-gradient-to-br from-slate-50 via-white to-blue-50/40 shadow-sm dark:border-slate-800 dark:from-slate-950 dark:via-slate-900 dark:to-blue-950/20">
        <div className="border-b border-slate-200/70 px-5 py-5 dark:border-slate-800 sm:px-6">
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#191970] dark:text-[#2277FF]">
            System
          </p>
          <h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-900 dark:text-white">Settings</h1>
          <p className="mt-1 max-w-2xl text-sm text-slate-500">
            Workspace configuration, security, branding, and module governance.
          </p>
        </div>
        <div className="grid gap-3 p-4 sm:grid-cols-2 lg:grid-cols-4 sm:p-5">
          <SettingsStatPill label="Team members" value={counts.memberCount} icon={Users} tone="blue" />
          <SettingsStatPill label="Active modules" value={counts.activeModuleCount} icon={Puzzle} tone="purple" />
          <SettingsStatPill label="API keys" value={counts.apiKeyCount} icon={Key} tone="amber" />
          <SettingsStatPill label="Policy packs" value={counts.policyCount} icon={Shield} tone="emerald" />
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[272px_minmax(0,1fr)]">
        <aside className="lg:sticky lg:top-6 lg:self-start">
          <div className="rounded-2xl border border-slate-200/80 bg-white p-3 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <SettingsNav groups={NAV_GROUPS} activeId={activeTab} onSelect={selectTab} />
          </div>
        </aside>

        <main className="min-w-0 max-w-full space-y-4 overflow-x-hidden">
          {activeTab !== "domains" ? (
            <div className="rounded-2xl border border-slate-200/80 bg-white px-5 py-4 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:px-6">
              <h2 className="text-base font-bold text-slate-900 dark:text-white">{activeCopy.title}</h2>
              <p className="mt-0.5 text-sm text-slate-500">{activeCopy.description}</p>
            </div>
          ) : null}

          <div className={cn("min-w-0 max-w-full", activeTab === "security" && "max-w-2xl")}>{content}</div>
        </main>
      </div>
    </div>
  );
}
