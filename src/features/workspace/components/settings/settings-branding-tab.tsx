"use client";

import { useEffect, useState } from "react";
import { apiClient } from "@/lib/api/client";
import { crm } from "@/features/workspace/components/crm/crm-styles";
import { cn } from "@/lib/utils/cn";
import { uiStore } from "@/stores/ui.store";
import {
  SettingsErrorBanner,
  SettingsField,
  SettingsLoading,
  SettingsSection,
} from "@/features/workspace/components/settings/settings-ui-primitives";
import { Globe, Info, Palette, ShieldCheck, Trash2 } from "lucide-react";

type Props = {
  companyId: string;
};

type CustomDomain = {
  id: string;
  domain: string;
  module: string;
  createdAt: string;
};

const MODULE_OPTIONS = [
  { value: "ALL", label: "All Modules (Unified Portal)" },
  { value: "CRM", label: "CRM Portal Only" },
  { value: "HR", label: "HRM Portal Only" },
  { value: "SUPPORT", label: "Support Ticket Portal Only" },
];

export function SettingsBrandingTab({ companyId }: Props) {
  const [loading, setLoading] = useState(true);
  const [savingBranding, setSavingBranding] = useState(false);
  const [updatingMain, setUpdatingMain] = useState(false);
  const [connectingModule, setConnectingModule] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Branding States
  const [brandName, setBrandName] = useState("");
  const [logoUrl, setLogoUrl] = useState("");
  const [primaryColor, setPrimaryColor] = useState("#191970");
  const [rawThemeConfig, setRawThemeConfig] = useState<Record<string, unknown>>({});

  // Domains States
  const [mainDomain, setMainDomain] = useState("");
  const [domainsList, setDomainsList] = useState<CustomDomain[]>([]);

  // New module domain inputs
  const [newDomain, setNewDomain] = useState("");
  const [newModule, setNewModule] = useState("ALL");

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        // Load company branding + main domain
        const companyRes = await apiClient.get(`/company/${companyId}`);
        if (companyRes.data.success && companyRes.data.data) {
          const c = companyRes.data.data;
          setBrandName(c.brandName || "");
          setLogoUrl(c.logo || "");
          setMainDomain(c.customDomain || "");
          
          const configObj = c.themeConfig && typeof c.themeConfig === "object"
            ? (c.themeConfig as Record<string, unknown>)
            : {};
          setRawThemeConfig(configObj);
          setPrimaryColor((configObj.primaryColor as string) || "#191970");
        }

        // Load custom domains mapping list
        const domainsRes = await apiClient.get(`/company/${companyId}/custom-domains`);
        if (domainsRes.data.success) {
          setDomainsList(domainsRes.data.data || []);
        }
      } catch (err: unknown) {
        const errorMsg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message || (err as Error).message || "Failed to load branding settings.";
        setError(errorMsg);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [companyId]);

  const handleSaveBranding = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSavingBranding(true);
      setError(null);

      const themeConfig = {
        ...rawThemeConfig,
        primaryColor,
      };

      const payload = {
        brandName: brandName.trim() || null,
        logo: logoUrl.trim() || null,
        themeConfig,
      };

      const { data } = await apiClient.put(`/company/${companyId}`, payload);
      if (data.success) {
        uiStore.getState().pushNotification("Workspace branding settings saved.");
      }
    } catch (err: unknown) {
      const errorMsg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message || (err as Error).message || "Failed to save branding.";
      setError(errorMsg);
    } finally {
      setSavingBranding(false);
    }
  };

  const handleUpdateMainDomain = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setUpdatingMain(true);
      setError(null);
      const targetDomain = mainDomain.trim() ? mainDomain.trim().toLowerCase() : null;
      const { data } = await apiClient.patch(`/company/${companyId}/branding`, {
        customDomain: targetDomain,
      });
      if (data.success) {
        uiStore.getState().pushNotification("Main custom domain updated successfully.");
      }
    } catch (err: unknown) {
      const errorMsg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message || (err as Error).message || "Failed to update main custom domain.";
      setError(errorMsg);
    } finally {
      setUpdatingMain(false);
    }
  };

  const handleConnectModuleDomain = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDomain.trim()) return;
    try {
      setConnectingModule(true);
      setError(null);
      const cleanDomain = newDomain.trim().toLowerCase();
      const { data } = await apiClient.post(`/company/${companyId}/custom-domains`, {
        domain: cleanDomain,
        module: newModule,
      });
      if (data.success) {
        uiStore.getState().pushNotification(`Domain ${cleanDomain} connected successfully.`);
        setDomainsList([data.data, ...domainsList]);
        setNewDomain("");
        setNewModule("ALL");
      }
    } catch (err: unknown) {
      const errorMsg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message || (err as Error).message || "Failed to connect module domain.";
      setError(errorMsg);
    } finally {
      setConnectingModule(false);
    }
  };

  const handleDeleteDomain = async (domainId: string, domainName: string) => {
    if (!confirm(`Are you sure you want to disconnect ${domainName}?`)) return;
    try {
      setError(null);
      const { data } = await apiClient.delete(`/company/${companyId}/custom-domains/${domainId}`);
      if (data.success) {
        uiStore.getState().pushNotification(`Domain ${domainName} disconnected.`);
        setDomainsList(domainsList.filter((d) => d.id !== domainId));
      }
    } catch (err: unknown) {
      const errorMsg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message || (err as Error).message || "Failed to delete domain connection.";
      setError(errorMsg);
    }
  };

  if (loading) return <SettingsLoading />;

  return (
    <div className="space-y-5">
      {error ? <SettingsErrorBanner message={error} /> : null}

      <SettingsSection
        title="Visual branding & theme"
        description="Configure logo branding, brand label, and primary portal themes."
        icon={Palette}
      >
        <form onSubmit={handleSaveBranding} className="max-w-2xl space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <SettingsField label="Brand name" htmlFor="brand-name">
              <input
                id="brand-name"
                type="text"
                className={cn(crm.input, "w-full")}
                value={brandName}
                onChange={(e) => setBrandName(e.target.value)}
                placeholder="e.g. Acme Inc."
              />
            </SettingsField>

            <SettingsField label="Primary theme color" htmlFor="theme-color">
              <div className="flex gap-2">
                <input
                  id="theme-color"
                  type="color"
                  className="h-9 w-12 shrink-0 cursor-pointer rounded-lg border border-slate-200 bg-white p-0.5 dark:border-slate-700 dark:bg-slate-900"
                  value={primaryColor}
                  onChange={(e) => setPrimaryColor(e.target.value)}
                />
                <input
                  type="text"
                  className={cn(crm.input, "flex-1 font-mono uppercase")}
                  value={primaryColor}
                  onChange={(e) => setPrimaryColor(e.target.value)}
                  placeholder="#191970"
                  maxLength={7}
                />
              </div>
            </SettingsField>
          </div>

          <SettingsField label="Logo image URL" htmlFor="logo-url">
            <input
              id="logo-url"
              type="url"
              className={cn(crm.input, "w-full")}
              value={logoUrl}
              onChange={(e) => setLogoUrl(e.target.value)}
              placeholder="https://example.com/logo.png"
            />
          </SettingsField>

          {logoUrl.trim() && (
            <div className="rounded-xl border border-slate-100 bg-slate-50/50 p-4 dark:border-slate-800 flex items-center gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg border border-slate-200 bg-white p-1.5 dark:border-slate-700">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={logoUrl}
                  alt="Branding Logo Preview"
                  className="max-h-full max-w-full object-contain"
                  onError={(e) => {
                    (e.target as HTMLElement).style.display = "none";
                  }}
                />
              </div>
              <div>
                <span className="block text-xs font-bold text-slate-700 dark:text-slate-300">Logo Preview</span>
                <span className="block text-[10px] text-slate-400 mt-0.5 truncate max-w-xs">{logoUrl}</span>
              </div>
            </div>
          )}

          <div className="flex justify-end pt-1">
            <button type="submit" disabled={savingBranding} className={cn(crm.btnPrimary, "px-6")}>
              {savingBranding ? "Saving identity…" : "Save identity settings"}
            </button>
          </div>
        </form>
      </SettingsSection>

      <SettingsSection
        title="Main custom domain"
        description="Map a custom domain to point directly to your primary workspace portal."
        icon={Globe}
      >
        <form onSubmit={handleUpdateMainDomain} className="max-w-2xl space-y-4">
          <SettingsField label="Custom domain URL" htmlFor="main-custom-domain">
            <div className="flex flex-col gap-3 sm:flex-row">
              <input
                id="main-custom-domain"
                type="text"
                className={cn(crm.input, "flex-1")}
                value={mainDomain}
                onChange={(e) => setMainDomain(e.target.value)}
                placeholder="e.g. portal.mycompany.com"
              />
              <button type="submit" disabled={updatingMain} className={cn(crm.btnPrimary, "shrink-0")}>
                {updatingMain ? "Saving…" : "Save domain"}
              </button>
            </div>
          </SettingsField>
        </form>
      </SettingsSection>

      <SettingsSection
        title="Module-specific domains"
        description="Connect distinct domains to specific modules (e.g. crm.mycompany.com → CRM only)."
        icon={ShieldCheck}
      >
        <form onSubmit={handleConnectModuleDomain} className="grid max-w-3xl items-end gap-4 md:grid-cols-3">
          <SettingsField label="Domain / subdomain" htmlFor="module-domain">
            <input
              id="module-domain"
              type="text"
              className={cn(crm.input, "w-full")}
              value={newDomain}
              onChange={(e) => setNewDomain(e.target.value)}
              placeholder="e.g. crm.mycompany.com"
              required
            />
          </SettingsField>

          <SettingsField label="Target module scope" htmlFor="module-target">
            <select
              id="module-target"
              className={cn(crm.select, "h-9 w-full text-sm")}
              value={newModule}
              onChange={(e) => setNewModule(e.target.value)}
            >
              {MODULE_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </SettingsField>

          <button
            type="submit"
            disabled={connectingModule || !newDomain.trim()}
            className={cn(crm.btnPrimary, "w-full")}
          >
            {connectingModule ? "Connecting…" : "Connect domain"}
          </button>
        </form>

        {/* DNS Configuration Help Alert */}
        <div className="mt-6 rounded-xl border border-blue-100 bg-blue-50/50 p-4 dark:border-blue-950/20 dark:bg-blue-950/10">
          <div className="flex gap-2.5">
            <Info className="h-5 w-5 text-blue-600 shrink-0 mt-0.5" />
            <div className="text-xs text-slate-600 dark:text-slate-400 space-y-1">
              <p className="font-bold text-slate-900 dark:text-white">DNS Configuration Checklist:</p>
              <p>To fully link your custom domains, ensure the following DNS records are configured in your domain registrar:</p>
              <ul className="list-disc list-inside mt-1 space-y-0.5">
                <li>Create an <strong>A record</strong> pointing to the platform IP: <code className="bg-slate-100 px-1 py-0.5 rounded font-mono dark:bg-slate-800">193.203.184.192</code></li>
                <li>Or create a <strong>CNAME record</strong> pointing to: <code className="bg-slate-100 px-1 py-0.5 rounded font-mono dark:bg-slate-800">rivexaflow.in</code></li>
              </ul>
            </div>
          </div>
        </div>

        {/* List of Connected Custom Domains */}
        <div className="mt-6">
          <h3 className="text-xs font-bold uppercase tracking-[0.14em] text-slate-400 mb-3">Active Domain Mappings</h3>
          {domainsList.length === 0 ? (
            <div className="rounded-xl border border-dashed border-slate-200 p-8 text-center text-xs text-slate-400 dark:border-slate-800">
              No module-specific domains mapped yet.
            </div>
          ) : (
            <div className="overflow-hidden border border-slate-200/60 rounded-xl dark:border-slate-800">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className={cn(crm.tableHead)}>
                    <th className="py-2.5 px-4">Domain</th>
                    <th className="py-2.5 px-4">Module Scope</th>
                    <th className="py-2.5 px-4">Connected At</th>
                    <th className="py-2.5 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {domainsList.map((d) => (
                    <tr key={d.id} className={cn(crm.tableRow, "border-b border-slate-100 dark:border-slate-800/80")}>
                      <td className="py-3 px-4 font-semibold text-slate-800 dark:text-slate-200">{d.domain}</td>
                      <td className="py-3 px-4">
                        <span className="inline-flex items-center rounded-full bg-blue-50 px-2 py-0.5 text-xs font-semibold text-blue-700 dark:bg-blue-950/30 dark:text-blue-400">
                          {d.module}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-xs text-slate-400">
                        {new Date(d.createdAt).toLocaleDateString(undefined, {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                        })}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <button
                          type="button"
                          onClick={() => handleDeleteDomain(d.id, d.domain)}
                          className="text-slate-400 hover:text-rose-600 transition"
                          title="Disconnect Domain"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </SettingsSection>
    </div>
  );
}
