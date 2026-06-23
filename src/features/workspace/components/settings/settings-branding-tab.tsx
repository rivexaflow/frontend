"use client";

import { useEffect, useState } from "react";
import { apiClient } from "@/lib/api/client";
import { crm } from "@/features/workspace/components/crm/crm-styles";
import { cn } from "@/lib/utils/cn";
import { uiStore } from "@/stores/ui.store";
import { Globe, Trash2, ShieldCheck, Info, Palette } from "lucide-react";

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
    <div className="space-y-6">
      {error && (
        <div className="rounded-xl border border-rose-100 bg-rose-50 p-3.5 text-xs font-semibold text-rose-700 dark:border-rose-950/30 dark:bg-rose-950/20">
          {error}
        </div>
      )}

      {/* Visual Identity / Colors & Logo */}
      <div className={cn(crm.panel, "p-6")}>
        <div className="border-b border-slate-100 pb-4 dark:border-slate-800">
          <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Palette className="h-5 w-5 text-purple-600" />
            Visual Branding & Theme
          </h2>
          <p className="text-xs text-slate-500">Configure logo branding, branding label, and primary portal themes.</p>
        </div>

        <form onSubmit={handleSaveBranding} className="mt-5 space-y-4 max-w-xl">
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label htmlFor="brand-name" className="mb-1.5 block text-xs font-bold uppercase tracking-[0.14em] text-slate-400">
                Brand Name
              </label>
              <input
                id="brand-name"
                type="text"
                className={cn(crm.input, "w-full")}
                value={brandName}
                onChange={(e) => setBrandName(e.target.value)}
                placeholder="e.g. Acme Inc."
              />
            </div>

            <div>
              <label htmlFor="theme-color" className="mb-1.5 block text-xs font-bold uppercase tracking-[0.14em] text-slate-400">
                Primary Theme Color
              </label>
              <div className="flex gap-2">
                <input
                  id="theme-color"
                  type="color"
                  className="h-9 w-12 shrink-0 cursor-pointer rounded-lg border border-slate-200 p-0.5 dark:border-slate-700 bg-white dark:bg-slate-900"
                  value={primaryColor}
                  onChange={(e) => setPrimaryColor(e.target.value)}
                />
                <input
                  type="text"
                  className={cn(crm.input, "flex-1 uppercase font-mono")}
                  value={primaryColor}
                  onChange={(e) => setPrimaryColor(e.target.value)}
                  placeholder="#191970"
                  maxLength={7}
                />
              </div>
            </div>
          </div>

          <div>
            <label htmlFor="logo-url" className="mb-1.5 block text-xs font-bold uppercase tracking-[0.14em] text-slate-400">
              Logo Image URL
            </label>
            <input
              id="logo-url"
              type="url"
              className={cn(crm.input, "w-full")}
              value={logoUrl}
              onChange={(e) => setLogoUrl(e.target.value)}
              placeholder="https://example.com/logo.png"
            />
          </div>

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

          <div className="pt-2 flex justify-end">
            <button
              type="submit"
              disabled={savingBranding}
              className={cn(crm.btnPrimary, "px-6")}
            >
              {savingBranding ? "Saving Identity..." : "Save Identity Settings"}
            </button>
          </div>
        </form>
      </div>

      {/* Main Custom Domain */}
      <div className={cn(crm.panel, "p-6")}>
        <div className="border-b border-slate-100 pb-4 dark:border-slate-800">
          <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Globe className="h-5 w-5 text-blue-600" />
            Main Custom Domain
          </h2>
          <p className="text-xs text-slate-500">
            Map a custom domain to point directly to your primary workspace portal (e.g. <code>mycompany.com</code>).
          </p>
        </div>

        <form onSubmit={handleUpdateMainDomain} className="mt-5 max-w-xl space-y-4">
          <div>
            <label htmlFor="main-custom-domain" className="mb-1.5 block text-xs font-bold uppercase tracking-[0.14em] text-slate-400">
              Custom Domain URL
            </label>
            <div className="flex gap-3">
              <input
                id="main-custom-domain"
                type="text"
                className={cn(crm.input, "flex-1")}
                value={mainDomain}
                onChange={(e) => setMainDomain(e.target.value)}
                placeholder="e.g. portal.mycompany.com"
              />
              <button
                type="submit"
                disabled={updatingMain}
                className={cn(crm.btnPrimary)}
              >
                {updatingMain ? "Saving..." : "Save Domain"}
              </button>
            </div>
          </div>
        </form>
      </div>

      {/* Module Specific Custom Domains */}
      <div className={cn(crm.panel, "p-6")}>
        <div className="border-b border-slate-100 pb-4 dark:border-slate-800">
          <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <ShieldCheck className="h-5 w-5 text-emerald-600" />
            Module-Specific Domains
          </h2>
          <p className="text-xs text-slate-500">
            Connect distinct domains to specific modules (e.g. pointing <code>crm.mycompany.com</code> only to the CRM platform).
          </p>
        </div>

        {/* Connect Domain Form */}
        <form onSubmit={handleConnectModuleDomain} className="mt-5 grid gap-4 md:grid-cols-3 items-end max-w-3xl">
          <div>
            <label htmlFor="module-domain" className="mb-1.5 block text-xs font-bold uppercase tracking-[0.14em] text-slate-400">
              Domain / Subdomain
            </label>
            <input
              id="module-domain"
              type="text"
              className={cn(crm.input, "w-full")}
              value={newDomain}
              onChange={(e) => setNewDomain(e.target.value)}
              placeholder="e.g. crm.mycompany.com"
              required
            />
          </div>

          <div>
            <label htmlFor="module-target" className="mb-1.5 block text-xs font-bold uppercase tracking-[0.14em] text-slate-400">
              Target Module Scope
            </label>
            <select
              id="module-target"
              className={cn(crm.select, "w-full h-9 text-sm")}
              value={newModule}
              onChange={(e) => setNewModule(e.target.value)}
            >
              {MODULE_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          <button
            type="submit"
            disabled={connectingModule || !newDomain.trim()}
            className={cn(crm.btnPrimary, "w-full")}
          >
            {connectingModule ? "Connecting..." : "Connect Domain"}
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
      </div>
    </div>
  );
}
