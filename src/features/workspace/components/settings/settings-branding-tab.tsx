"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  ExternalLink,
  Globe,
  Info,
  Loader2,
  Palette,
  RefreshCw,
  ShieldCheck,
  Sparkles,
  Trash2,
  Zap,
} from "lucide-react";

import { BrandingPreviewPanel } from "@/features/workspace/components/settings/branding/branding-preview-panel";
import { BrandingSectionNav } from "@/features/workspace/components/settings/branding/branding-section-nav";
import { BrandingSeoPanel } from "@/features/workspace/components/settings/branding/branding-seo-panel";
import { BrandingWebsitePanel } from "@/features/workspace/components/settings/branding/branding-website-panel";
import {
  AssetPreview,
  ConnectionStatusBadge,
  CopyButton,
  DnsResultDetail,
  ImageUploadField,
  type DnsStatus,
} from "@/features/workspace/components/settings/branding/branding-shared";
import {
  SettingsErrorBanner,
  SettingsField,
  SettingsLoading,
  SettingsSection,
} from "@/features/workspace/components/settings/settings-ui-primitives";
import { crm } from "@/features/workspace/components/crm/crm-styles";
import {
  DEFAULT_THEME_CONFIG,
  FONT_OPTIONS,
  type BrandingSectionId,
  type WorkspaceThemeConfig,
} from "@/features/workspace/schemas/branding.schema";
import {
  brandingFromCompany,
  buildBrandingPayload,
  connectCustomDomain,
  disconnectCustomDomain,
  fetchCompanyBranding,
  fetchCustomDomains,
  PLATFORM_DNS,
  saveCompanyBranding,
  saveCompanyCustomDomain,
  verifyCompanyDns,
  type CustomDomainRecord,
  type DnsVerificationResult,
} from "@/lib/api/company-branding";
import { applyBrandTheme } from "@/lib/workspace/apply-brand-theme";
import { syncWorkspaceContext } from "@/lib/workspace/company-context";
import { cn } from "@/lib/utils/cn";
import { uiStore } from "@/stores/ui.store";

type Props = { companyId: string };

type DomainWithDns = CustomDomainRecord & {
  dnsStatus: DnsStatus;
  aRecords?: string[];
  cnameRecords?: string[];
  aMatch?: boolean;
  cnameMatch?: boolean;
};

const VALID_SECTIONS = new Set<BrandingSectionId>(["identity", "theme", "domains", "website", "seo"]);

const MODULE_OPTIONS = [
  { value: "ALL", label: "All modules" },
  { value: "CRM", label: "CRM only" },
  { value: "HR", label: "HRM only" },
  { value: "SUPPORT", label: "Support only" },
];

const MODULE_COLORS: Record<string, string> = {
  ALL: "bg-blue-50 text-blue-700 ring-blue-200 dark:bg-blue-950/30 dark:text-blue-400",
  CRM: "bg-violet-50 text-violet-700 ring-violet-200 dark:bg-violet-950/30 dark:text-violet-400",
  HR: "bg-emerald-50 text-emerald-700 ring-emerald-200 dark:bg-emerald-950/30 dark:text-emerald-400",
  SUPPORT: "bg-amber-50 text-amber-700 ring-amber-200 dark:bg-amber-950/30 dark:text-amber-400",
};

function normalizeSection(value: string | null): BrandingSectionId {
  if (value && VALID_SECTIONS.has(value as BrandingSectionId)) return value as BrandingSectionId;
  return "identity";
}

function isValidDomain(value: string): boolean {
  if (!value.trim()) return true;
  return /^[a-z0-9]([a-z0-9-]*[a-z0-9])?(\.[a-z0-9]([a-z0-9-]*[a-z0-9])?)+$/i.test(value.trim());
}

export function SettingsBrandingTab({ companyId }: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [section, setSection] = useState<BrandingSectionId>(() => normalizeSection(searchParams.get("section")));

  const [brandName, setBrandName] = useState("");
  const [logoUrl, setLogoUrl] = useState("");
  const [companySlug, setCompanySlug] = useState("");
  const [theme, setTheme] = useState<WorkspaceThemeConfig>(DEFAULT_THEME_CONFIG);
  const [logoError, setLogoError] = useState<string | null>(null);
  const [faviconError, setFaviconError] = useState<string | null>(null);

  const [mainDomain, setMainDomain] = useState("");
  const [mainDnsStatus, setMainDnsStatus] = useState<DnsStatus>("unknown");
  const [mainDnsResult, setMainDnsResult] = useState<DnsVerificationResult | null>(null);
  const [verifyingMain, setVerifyingMain] = useState(false);
  const [updatingMain, setUpdatingMain] = useState(false);

  const [domainsList, setDomainsList] = useState<DomainWithDns[]>([]);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [newDomain, setNewDomain] = useState("");
  const [newModule, setNewModule] = useState("ALL");
  const [connectingModule, setConnectingModule] = useState(false);

  const updateTheme = useCallback((patch: Partial<WorkspaceThemeConfig>) => {
    setTheme((prev) => ({ ...prev, ...patch }));
  }, []);

  const selectSection = useCallback(
    (id: BrandingSectionId) => {
      setSection(id);
      const params = new URLSearchParams(searchParams.toString());
      params.set("tab", "domains");
      params.set("section", id);
      router.replace(`/settings?${params.toString()}`, { scroll: false });
    },
    [router, searchParams],
  );

  useEffect(() => {
    setSection(normalizeSection(searchParams.get("section")));
  }, [searchParams]);

  const checkDns = useCallback(
    async (domain: string, domainId: string) => {
      try {
        setDomainsList((prev) =>
          prev.map((d) => (d.id === domainId ? { ...d, dnsStatus: "checking" } : d)),
        );
        const result = await verifyCompanyDns(companyId, domain);
        setDomainsList((prev) =>
          prev.map((d) =>
            d.id === domainId
              ? {
                  ...d,
                  dnsStatus: result.isVerified ? "verified" : "pending",
                  aRecords: result.aRecords,
                  cnameRecords: result.cnameRecords,
                  aMatch: result.aMatch,
                  cnameMatch: result.cnameMatch,
                }
              : d,
          ),
        );
      } catch {
        setDomainsList((prev) =>
          prev.map((d) => (d.id === domainId ? { ...d, dnsStatus: "unknown" } : d)),
        );
      }
    },
    [companyId],
  );

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        setError(null);
        const company = await fetchCompanyBranding(companyId);
        const parsed = brandingFromCompany(company);
        setBrandName(parsed.brandName);
        setLogoUrl(parsed.logo);
        setMainDomain(parsed.customDomain);
        setCompanySlug(parsed.slug);
        setTheme(parsed.theme);

        if (parsed.customDomain) {
          setMainDnsStatus("checking");
          try {
            const result = await verifyCompanyDns(companyId, parsed.customDomain);
            setMainDnsResult(result);
            setMainDnsStatus(result.isVerified ? "verified" : "pending");
          } catch {
            setMainDnsStatus("unknown");
          }
        }

        const domains = await fetchCustomDomains(companyId);
        const withDns: DomainWithDns[] = domains.map((d) => ({ ...d, dnsStatus: "checking" }));
        setDomainsList(withDns);
        withDns.forEach((d) => void checkDns(d.domain, d.id));
      } catch (err: unknown) {
        setError(
          (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
            (err as Error).message ||
            "Failed to load branding settings.",
        );
      } finally {
        setLoading(false);
      }
    }
    void loadData();
  }, [companyId, checkDns]);

  const handleSaveBranding = async () => {
    try {
      setSaving(true);
      setError(null);
      const payload = buildBrandingPayload({ brandName, logo: logoUrl, theme });
      await saveCompanyBranding(companyId, payload);
      syncWorkspaceContext({ logo: payload.logo, brandName: payload.brandName, themeConfig: payload.themeConfig });
      applyBrandTheme(payload.themeConfig);
      uiStore.getState().pushNotification("Branding settings saved and applied.");
    } catch (err: unknown) {
      setError(
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
          (err as Error).message ||
          "Failed to save branding.",
      );
    } finally {
      setSaving(false);
    }
  };

  const platformSubdomain = companySlug
    ? `${companySlug}.${PLATFORM_DNS.defaultSubdomainSuffix}`
    : `your-company.${PLATFORM_DNS.defaultSubdomainSuffix}`;

  if (loading) return <SettingsLoading />;

  return (
    <div className="space-y-4">
      {error ? <SettingsErrorBanner message={error} /> : null}

      <div className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3 dark:border-slate-800 dark:bg-slate-900 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <p className="text-sm font-bold text-slate-900 dark:text-white">White-label branding</p>
          <p className="text-xs text-slate-500">Identity, theme, domains, website, and SEO.</p>
        </div>
        <button
          type="button"
          disabled={saving}
          onClick={() => void handleSaveBranding()}
          className={cn(crm.btnPrimary, "w-full shrink-0 px-5 sm:w-auto")}
        >
          {saving ? "Saving…" : "Save all changes"}
        </button>
      </div>

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white p-3 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:p-4">
        <BrandingSectionNav active={section} onSelect={selectSection} />
      </div>

      <div className="min-w-0 max-w-full space-y-5 overflow-x-hidden">
          {section === "identity" ? (
            <>
              <BrandingPreviewPanel brandName={brandName} logo={logoUrl} theme={theme} />

              <SettingsSection title="Brand identity & core assets" description="Customize corporate logo, browser favicon, and workspace tab titles." icon={Sparkles}>
                <div className="grid gap-5 md:grid-cols-2">
                  <SettingsField label="Brand / Company name" htmlFor="brand-name">
                    <input
                      id="brand-name"
                      type="text"
                      className={cn(crm.input, "w-full text-xs font-semibold focus:ring-2 focus:ring-blue-500/20")}
                      value={brandName}
                      onChange={(e) => setBrandName(e.target.value)}
                      placeholder="Acme Enterprise Inc."
                    />
                  </SettingsField>
                  <SettingsField label="Browser tab title override" htmlFor="browser-title">
                    <input
                      id="browser-title"
                      type="text"
                      className={cn(crm.input, "w-full text-xs font-semibold focus:ring-2 focus:ring-blue-500/20")}
                      value={theme.browserTitle || ""}
                      onChange={(e) => updateTheme({ browserTitle: e.target.value })}
                      placeholder={`${brandName || "Company"} · Enterprise Workspace`}
                    />
                  </SettingsField>
                </div>

                <div className="mt-6 grid gap-6 md:grid-cols-2">
                  <div className="rounded-2xl border border-slate-200/80 bg-slate-50/50 p-4 transition-all hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900/50">
                    <ImageUploadField
                      id="logo-upload"
                      label="Primary corporate logo"
                      accept="image/png,image/svg+xml,image/jpeg"
                      value={logoUrl}
                      onChange={setLogoUrl}
                      onError={setLogoError}
                      hint="High-res PNG, SVG, or JPEG (Max 1 MB)"
                    />
                  </div>
                  <div className="rounded-2xl border border-slate-200/80 bg-slate-50/50 p-4 transition-all hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900/50">
                    <ImageUploadField
                      id="favicon-upload"
                      label="Browser favicon icon"
                      accept="image/png,image/x-icon,image/svg+xml"
                      value={theme.favicon || ""}
                      onChange={(v) => updateTheme({ favicon: v })}
                      onError={setFaviconError}
                      hint="32×32 or 64×64 PNG, ICO, or SVG"
                    />
                  </div>
                </div>

                {(logoError || faviconError) && (
                  <div className="mt-3 rounded-xl border border-rose-200 bg-rose-50 p-3 text-xs font-semibold text-rose-800 dark:border-rose-900/50 dark:bg-rose-950/40 dark:text-rose-300">
                    {logoError || faviconError}
                  </div>
                )}

                {(logoUrl || theme.favicon) && (
                  <div className="mt-5 flex items-center gap-6 rounded-2xl border border-slate-200/80 bg-gradient-to-br from-slate-50 to-white p-4.5 shadow-sm dark:border-slate-800 dark:from-slate-900 dark:to-slate-950">
                    {logoUrl ? (
                      <div className="space-y-1 text-center">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Logo preview</span>
                        <AssetPreview src={logoUrl} alt="Logo" size={60} />
                      </div>
                    ) : null}
                    {theme.favicon ? (
                      <div className="space-y-1 text-center">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Favicon preview</span>
                        <AssetPreview src={theme.favicon} alt="Favicon" size={36} />
                      </div>
                    ) : null}
                  </div>
                )}
              </SettingsSection>

              <SettingsSection title="Login portal customization" description="Whitelabel the client sign-in experience with custom titles and messages." icon={Sparkles}>
                <div className="grid gap-5 md:grid-cols-2">
                  <SettingsField label="Welcome portal title" htmlFor="login-title">
                    <input
                      id="login-title"
                      type="text"
                      className={cn(crm.input, "w-full text-xs font-semibold")}
                      value={theme.loginWelcomeTitle || ""}
                      onChange={(e) => updateTheme({ loginWelcomeTitle: e.target.value })}
                      placeholder="Welcome back"
                    />
                  </SettingsField>
                  <SettingsField label="Welcome subtitle message" htmlFor="login-message">
                    <input
                      id="login-message"
                      type="text"
                      className={cn(crm.input, "w-full text-xs font-semibold")}
                      value={theme.loginWelcomeMessage || ""}
                      onChange={(e) => updateTheme({ loginWelcomeMessage: e.target.value })}
                      placeholder="Sign in to your enterprise workspace portal"
                    />
                  </SettingsField>
                </div>

                <div className="mt-4">
                  <SettingsField label="Custom background image URL" htmlFor="login-bg">
                    <input
                      id="login-bg"
                      type="text"
                      className={cn(crm.input, "w-full text-xs font-mono")}
                      value={theme.loginBackgroundUrl || ""}
                      onChange={(e) => updateTheme({ loginBackgroundUrl: e.target.value })}
                      placeholder="https://images.unsplash.com/photo-..."
                    />
                  </SettingsField>
                </div>

                <div className="mt-6 flex items-center justify-between rounded-2xl border border-slate-200/80 bg-slate-50/70 p-4 transition-all hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900/50">
                  <div>
                    <p className="text-xs font-bold text-slate-900 dark:text-white">Whitelabel Copyright Footer</p>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">Remove &quot;Powered by Rivexaflow&quot; branding from the portal login screen</p>
                  </div>
                  <label className="relative inline-flex cursor-pointer items-center">
                    <input
                      type="checkbox"
                      checked={Boolean(theme.hidePoweredBy)}
                      onChange={(e) => updateTheme({ hidePoweredBy: e.target.checked })}
                      className="peer sr-only"
                    />
                    <div className="peer h-6 w-11 rounded-full bg-slate-200 after:absolute after:left-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:border after:border-gray-300 after:bg-white after:transition-all after:content-[''] peer-checked:bg-blue-600 peer-checked:after:translate-x-full peer-checked:after:border-white peer-focus:outline-none dark:border-gray-600 dark:bg-slate-700" />
                  </label>
                </div>
              </SettingsSection>
            </>
          ) : null}

          {section === "theme" ? (
            <>
              <BrandingPreviewPanel brandName={brandName} logo={logoUrl} theme={theme} />
              <SettingsSection title="Dashboard theme" description="Colors and typography for workspace chrome." icon={Palette}>
                <div className="grid gap-4 md:grid-cols-3">
                  {(["primaryColor", "secondaryColor", "accentColor"] as const).map((key) => (
                    <SettingsField key={key} label={key.replace("Color", " color")} htmlFor={key}>
                      <div className="flex gap-2">
                        <input type="color" className="h-9 w-12 cursor-pointer rounded-lg border border-slate-200 p-0.5" value={theme[key] || "#191970"} onChange={(e) => updateTheme({ [key]: e.target.value })} />
                        <input type="text" className={cn(crm.input, "flex-1 font-mono uppercase")} value={theme[key] || ""} onChange={(e) => updateTheme({ [key]: e.target.value })} maxLength={7} />
                      </div>
                    </SettingsField>
                  ))}
                </div>
                <div className="mt-4 max-w-md">
                  <SettingsField label="Font family" htmlFor="font-family">
                    <select id="font-family" className={cn(crm.select, "h-9 w-full text-sm")} value={theme.fontFamily || "Inter"} onChange={(e) => updateTheme({ fontFamily: e.target.value })}>
                      {FONT_OPTIONS.map((f) => <option key={f} value={f}>{f}</option>)}
                    </select>
                  </SettingsField>
                </div>
              </SettingsSection>
            </>
          ) : null}

          {section === "domains" ? (
            <div className="space-y-5">
              <SettingsSection title="Platform subdomain" description="Default URL for your company workspaces." icon={Globe}>
                <div className="rounded-xl border border-slate-200 bg-slate-50/80 px-4 py-3 font-mono text-sm dark:border-slate-800 dark:bg-slate-900/50">
                  https://{platformSubdomain}
                </div>
              </SettingsSection>

              <SettingsSection title="Custom domain" description="White-label portal on your own domain." icon={Globe}>
                {mainDomain ? <ConnectionStatusBadge status={mainDnsStatus} /> : null}
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    void (async () => {
                      if (mainDomain.trim() && !isValidDomain(mainDomain)) { setError("Invalid domain."); return; }
                      setUpdatingMain(true);
                      try {
                        const target = mainDomain.trim().toLowerCase() || null;
                        await saveCompanyCustomDomain(companyId, target);
                        if (target) {
                          setMainDnsStatus("checking");
                          const r = await verifyCompanyDns(companyId, target);
                          setMainDnsResult(r);
                          setMainDnsStatus(r.isVerified ? "verified" : "pending");
                        }
                        uiStore.getState().pushNotification("Domain saved.");
                      } catch (err: unknown) {
                        setError((err as Error).message);
                      } finally {
                        setUpdatingMain(false);
                      }
                    })();
                  }}
                  className="mt-4 space-y-3"
                >
                  <SettingsField label="Domain" htmlFor="main-domain">
                    <div className="flex flex-col gap-2 sm:flex-row">
                      <input id="main-domain" type="text" className={cn(crm.input, "flex-1 font-mono")} value={mainDomain} onChange={(e) => { setMainDomain(e.target.value); setMainDnsStatus("unknown"); setMainDnsResult(null); }} placeholder="portal.mycompany.com" />
                      <button type="button" disabled={verifyingMain || !mainDomain.trim()} onClick={() => void (async () => { setVerifyingMain(true); try { const r = await verifyCompanyDns(companyId, mainDomain.trim()); setMainDnsResult(r); setMainDnsStatus(r.isVerified ? "verified" : "pending"); } finally { setVerifyingMain(false); } })()} className="inline-flex items-center gap-1.5 rounded-lg border px-3 py-2 text-xs font-semibold">
                        {verifyingMain ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <RefreshCw className="h-3.5 w-3.5" />}
                        Verify DNS
                      </button>
                      <button type="submit" disabled={updatingMain} className={cn(crm.btnPrimary, "shrink-0")}>{updatingMain ? "Saving…" : "Save"}</button>
                    </div>
                  </SettingsField>
                </form>
                {mainDnsResult ? (
                  <div className="mt-4">
                    <DnsResultDetail isVerified={mainDnsResult.isVerified} aRecords={mainDnsResult.aRecords} cnameRecords={mainDnsResult.cnameRecords} aMatch={mainDnsResult.aMatch} cnameMatch={mainDnsResult.cnameMatch} platformIp={PLATFORM_DNS.ip} platformCname={PLATFORM_DNS.cname} />
                  </div>
                ) : null}
                <div className="mt-4 rounded-xl border border-blue-100 bg-blue-50/50 p-4 text-xs dark:border-blue-950/20 dark:bg-blue-950/10">
                  <div className="flex gap-2"><Info className="h-4 w-4 shrink-0 text-blue-600" /><div>
                    <p className="font-bold">DNS records</p>
                    <p className="mt-1 font-mono">A → {PLATFORM_DNS.ip} <CopyButton text={PLATFORM_DNS.ip} /></p>
                    <p className="mt-1 font-mono">CNAME → {PLATFORM_DNS.cname} <CopyButton text={PLATFORM_DNS.cname} /></p>
                  </div></div>
                </div>
              </SettingsSection>

              <SettingsSection title="Module domains" description="Route domains to specific modules." icon={ShieldCheck}>
                <form onSubmit={(e) => { e.preventDefault(); void (async () => { if (!isValidDomain(newDomain)) return; setConnectingModule(true); try { const r = await connectCustomDomain(companyId, newDomain.trim().toLowerCase(), newModule); setDomainsList((p) => [{ ...r, dnsStatus: "checking" }, ...p]); setNewDomain(""); void checkDns(r.domain, r.id); } catch (err: unknown) { setError((err as Error).message); } finally { setConnectingModule(false); } })(); }} className="grid gap-4 md:grid-cols-3 items-end">
                  <SettingsField label="Domain" htmlFor="mod-domain"><input id="mod-domain" required className={cn(crm.input, "w-full font-mono")} value={newDomain} onChange={(e) => setNewDomain(e.target.value)} placeholder="crm.company.com" /></SettingsField>
                  <SettingsField label="Module" htmlFor="mod-scope"><select id="mod-scope" className={cn(crm.select, "h-9 w-full")} value={newModule} onChange={(e) => setNewModule(e.target.value)}>{MODULE_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}</select></SettingsField>
                  <button type="submit" disabled={connectingModule} className={cn(crm.btnPrimary, "gap-1.5")}>{connectingModule ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Zap className="h-3.5 w-3.5" />}{connectingModule ? "Connecting…" : "Connect"}</button>
                </form>
                <div className="mt-5 space-y-3">
                  {domainsList.length === 0 ? <p className="text-center text-xs text-slate-400 py-6 border border-dashed rounded-xl">No module domains yet.</p> : domainsList.map((d) => (
                    <div key={d.id} className="rounded-xl border p-4 dark:border-slate-800">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-mono text-sm font-bold">{d.domain}</span>
                        <a href={`https://${d.domain}`} target="_blank" rel="noopener noreferrer"><ExternalLink className="h-3.5 w-3.5 text-slate-400" /></a>
                        <span className={cn("rounded-full px-2 py-0.5 text-[11px] font-semibold ring-1", MODULE_COLORS[d.module])}>{d.module}</span>
                        {d.dnsStatus === "verified" && <span className="text-[11px] font-bold text-emerald-600">Connected</span>}
                        {d.dnsStatus === "pending" && <span className="text-[11px] font-bold text-amber-600">DNS pending</span>}
                        {d.dnsStatus === "checking" && <Loader2 className="h-3.5 w-3.5 animate-spin text-blue-500" />}
                        <div className="ml-auto flex gap-1">
                          <button type="button" onClick={() => { void checkDns(d.domain, d.id); setExpandedId(expandedId === d.id ? null : d.id); }} className="text-xs font-semibold text-slate-500">Details</button>
                          <button type="button" onClick={() => void (async () => { if (!confirm(`Disconnect ${d.domain}?`)) return; await disconnectCustomDomain(companyId, d.id); setDomainsList((p) => p.filter((x) => x.id !== d.id)); })()} className="p-1 text-slate-400 hover:text-rose-600"><Trash2 className="h-3.5 w-3.5" /></button>
                        </div>
                      </div>
                      {expandedId === d.id && d.aRecords ? <div className="mt-3"><DnsResultDetail isVerified={d.dnsStatus === "verified"} aRecords={d.aRecords} cnameRecords={d.cnameRecords || []} aMatch={Boolean(d.aMatch)} cnameMatch={Boolean(d.cnameMatch)} platformIp={PLATFORM_DNS.ip} platformCname={PLATFORM_DNS.cname} /></div> : null}
                    </div>
                  ))}
                </div>
              </SettingsSection>
            </div>
          ) : null}

          {section === "website" ? (
            <BrandingWebsitePanel
              brandName={brandName}
              logo={logoUrl}
              companySlug={companySlug}
              mainDomain={mainDomain}
              platformSubdomain={platformSubdomain}
              theme={theme}
              onChange={updateTheme}
            />
          ) : null}

          {section === "seo" ? (
            <BrandingSeoPanel brandName={brandName} theme={theme} onChange={updateTheme} />
          ) : null}
      </div>
    </div>
  );
}
