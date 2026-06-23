"use client";

import { useEffect, useState } from "react";
import { apiClient } from "@/lib/api/client";
import { workspaceStore } from "@/stores/workspace.store";
import { crm } from "@/features/workspace/components/crm/crm-styles";
import { cn } from "@/lib/utils/cn";
import { uiStore } from "@/stores/ui.store";
import { Target, Network, ShieldCheck, FileText, Sparkles, Zap } from "lucide-react";

type Props = {
  companyId: string;
};

type ModuleItem = {
  id: string;
  name: string;
  description: string;
  icon: typeof Target;
  badge?: string;
};

const AVAILABLE_MODULES: ModuleItem[] = [
  {
    id: "crm",
    name: "CRM (Customer Relationship Management)",
    description: "Manage leads, contacts, customer deals, pipelines, and track communication history.",
    icon: Target,
  },
  {
    id: "team",
    name: "HRM & workforce",
    description: "Manage employee directories, performance, attendance logs, departments, and payroll.",
    icon: Network,
  },
  {
    id: "kyc",
    name: "KYC Center",
    description: "Manage Know-Your-Customer operations, document uploads, and identity verification gates.",
    icon: ShieldCheck,
    badge: "Security",
  },
  {
    id: "invoices",
    name: "Invoicing & Billing",
    description: "Generate quotes, send invoices, configure custom taxing, and track client payments.",
    icon: FileText,
  },
  {
    id: "ai",
    name: "AI Agents & Automation",
    description: "Deploy automated AI helpdesk bots, context embeddings, and workflow automations.",
    icon: Sparkles,
    badge: "Beta",
  },
  {
    id: "reports",
    name: "Analytics & Reports",
    description: "Visualize operations data, generate business intelligence summaries, and export logs.",
    icon: Zap,
  },
];

export function SettingsModulesTab({ companyId }: Props) {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [enabledModules, setEnabledModules] = useState<string[]>([]);

  useEffect(() => {
    async function loadCompanyModules() {
      try {
        setLoading(true);
        const { data } = await apiClient.get(`/company/${companyId}`);
        if (data.success && data.data) {
          setEnabledModules(data.data.modules || []);
        }
      } catch (err: unknown) {
        const errorMsg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message || (err as Error).message || "Failed to load workspace modules.";
        setError(errorMsg);
      } finally {
        setLoading(false);
      }
    }
    loadCompanyModules();
  }, [companyId]);

  const toggleModule = (id: string) => {
    setEnabledModules((prev) =>
      prev.includes(id) ? prev.filter((m) => m !== id) : [...prev, id]
    );
  };

  const handleSaveChanges = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSaving(true);
      setError(null);
      const { data } = await apiClient.put(`/company/${companyId}`, {
        modules: enabledModules,
      });
      if (data.success && data.data) {
        uiStore.getState().pushNotification("Workspace modules updated successfully.");
        // Sync locally inside store to update sidebar instantly
        workspaceStore.getState().setWorkspace({
          workspaceId: data.data.id,
          workspaceName: data.data.name,
          workspaceSlug: data.data.slug,
          plan: data.data.size,
          modules: data.data.modules || [],
        });
      }
    } catch (err: unknown) {
      const errorMsg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message || (err as Error).message || "Failed to update workspace modules.";
      setError(errorMsg);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-48 items-center justify-center">
        <svg className="h-8 w-8 animate-spin text-[#191970]" viewBox="0 0 24 24" fill="none">
          <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2.4" strokeOpacity="0.3" />
          <path d="M21 12a9 9 0 0 0-9-9" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" />
        </svg>
      </div>
    );
  }

  return (
    <div className={cn(crm.panel, "p-6")}>
      <div className="border-b border-slate-100 pb-4 dark:border-slate-800">
        <h2 className="text-base font-bold text-slate-900 dark:text-white">Workspace Modules</h2>
        <p className="text-xs text-slate-500">Enable or disable specific features for this workspace portal.</p>
      </div>

      <form onSubmit={handleSaveChanges} className="mt-6 space-y-6">
        {error && (
          <div className="rounded-xl border border-rose-100 bg-rose-50 p-3.5 text-xs font-semibold text-rose-700 dark:border-rose-950/30 dark:bg-rose-950/20">
            {error}
          </div>
        )}

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {AVAILABLE_MODULES.map((mod) => {
            const isEnabled = enabledModules.includes(mod.id);
            return (
              <div
                key={mod.id}
                onClick={() => toggleModule(mod.id)}
                className={cn(
                  "group relative flex cursor-pointer flex-col justify-between rounded-xl border p-4 transition-all duration-300 hover:shadow-md",
                  isEnabled
                    ? "border-[#191970]/30 bg-gradient-to-br from-white to-[#191970]/[0.02] dark:border-slate-700 dark:from-slate-900 dark:to-slate-900/80"
                    : "border-slate-200/80 bg-white hover:border-slate-300 dark:border-slate-800 dark:bg-slate-900"
                )}
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span
                      className={cn(
                        "flex h-10 w-10 items-center justify-center rounded-xl transition-all duration-300 group-hover:scale-105",
                        isEnabled
                          ? "bg-[#191970]/10 text-[#191970] dark:bg-[#2277ff]/10 dark:text-[#2277ff]"
                          : "bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400"
                      )}
                    >
                      <mod.icon className="h-5 w-5" />
                    </span>
                    {mod.badge && (
                      <span
                        className={cn(
                          "rounded-full px-2 py-0.5 text-[10px] font-bold",
                          isEnabled
                            ? "bg-[#191970]/8 text-[#191970] dark:bg-[#2277ff]/20 dark:text-[#2277ff]"
                            : "bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400"
                        )}
                      >
                        {mod.badge}
                      </span>
                    )}
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100">{mod.name}</h3>
                    <p className="mt-1 text-xs leading-relaxed text-slate-500 dark:text-slate-400">
                      {mod.description}
                    </p>
                  </div>
                </div>

                <div className="mt-6 flex items-center justify-between border-t border-slate-50 pt-3 dark:border-slate-800/60">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    {isEnabled ? "Enabled" : "Disabled"}
                  </span>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleModule(mod.id);
                    }}
                    className={cn(
                      "relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none",
                      isEnabled ? "bg-[#191970] dark:bg-[#2277ff]" : "bg-slate-200 dark:bg-slate-800"
                    )}
                  >
                    <span
                      className={cn(
                        "pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out",
                        isEnabled ? "translate-x-5" : "translate-x-0"
                      )}
                    />
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        <div className="border-t border-slate-100 pt-4 dark:border-slate-800 flex justify-end">
          <button
            type="submit"
            disabled={saving}
            className={cn(crm.btnPrimary, "px-6")}
          >
            {saving ? "Saving Configurations..." : "Save Configurations"}
          </button>
        </div>
      </form>
    </div>
  );
}
