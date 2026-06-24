"use client";

import { useEffect, useState, useCallback } from "react";
import { apiClient } from "@/lib/api/client";
import { crm } from "@/features/workspace/components/crm/crm-styles";
import { cn } from "@/lib/utils/cn";
import { uiStore } from "@/stores/ui.store";
import {
  Globe,
  Trash2,
  ShieldCheck,
  Info,
  CheckCircle2,
  XCircle,
  Loader2,
  RefreshCw,
  Copy,
  ExternalLink,
  AlertTriangle,
  Wifi,
  WifiOff,
  CircleDot,
  Zap,
} from "lucide-react";

type Props = {
  companyId: string;
};

type DnsStatus = "verified" | "pending" | "checking" | "unknown";

type CustomDomain = {
  id: string;
  domain: string;
  module: string;
  createdAt: string;
  dnsStatus: DnsStatus;
  dnsCheckedAt?: string;
  aRecords?: string[];
  cnameRecords?: string[];
  aMatch?: boolean;
  cnameMatch?: boolean;
};

type DnsResult = {
  domain: string;
  isVerified: boolean;
  aRecords: string[];
  cnameRecords: string[];
  platformIp: string;
  platformCname: string;
  aMatch: boolean;
  cnameMatch: boolean;
  status: "verified" | "pending";
  message: string;
  resolvedA: string | null;
  resolvedCname: string | null;
};

const MODULE_OPTIONS = [
  { value: "ALL", label: "All Modules (Unified Portal)" },
  { value: "CRM", label: "CRM Portal Only" },
  { value: "HR", label: "HRM Portal Only" },
  { value: "SUPPORT", label: "Support Ticket Portal Only" },
];

const MODULE_COLORS: Record<string, string> = {
  ALL: "bg-blue-50 text-blue-700 dark:bg-blue-950/30 dark:text-blue-400 ring-blue-200 dark:ring-blue-900/30",
  CRM: "bg-violet-50 text-violet-700 dark:bg-violet-950/30 dark:text-violet-400 ring-violet-200 dark:ring-violet-900/30",
  HR: "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400 ring-emerald-200 dark:ring-emerald-900/30",
  SUPPORT: "bg-amber-50 text-amber-700 dark:bg-amber-950/30 dark:text-amber-400 ring-amber-200 dark:ring-amber-900/30",
};

// ── Big prominent connection status badge ──────────────────────────────
function ConnectionStatusBadge({ status }: { status: DnsStatus }) {
  if (status === "checking") {
    return (
      <div className="flex items-center gap-2 rounded-xl border border-blue-200 bg-blue-50 px-3 py-2 dark:border-blue-900/30 dark:bg-blue-950/20">
        <Loader2 className="h-4 w-4 animate-spin text-blue-500" />
        <div>
          <p className="text-xs font-bold text-blue-700 dark:text-blue-400">Checking DNS…</p>
          <p className="text-[10px] text-blue-500">Verifying domain connection</p>
        </div>
      </div>
    );
  }

  if (status === "verified") {
    return (
      <div className="flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 dark:border-emerald-900/30 dark:bg-emerald-950/20">
        <div className="relative flex h-4 w-4 shrink-0">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-40"></span>
          <CheckCircle2 className="relative h-4 w-4 text-emerald-600" />
        </div>
        <div>
          <p className="text-xs font-bold text-emerald-700 dark:text-emerald-400">Domain Connected ✓</p>
          <p className="text-[10px] text-emerald-600">DNS is correctly configured</p>
        </div>
      </div>
    );
  }

  if (status === "pending") {
    return (
      <div className="flex items-center gap-2 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 dark:border-amber-900/30 dark:bg-amber-950/20">
        <AlertTriangle className="h-4 w-4 shrink-0 text-amber-500" />
        <div>
          <p className="text-xs font-bold text-amber-700 dark:text-amber-400">DNS Not Connected</p>
          <p className="text-[10px] text-amber-600">A record / CNAME not pointing to server yet</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 dark:border-slate-800 dark:bg-slate-900/40">
      <CircleDot className="h-4 w-4 shrink-0 text-slate-400" />
      <div>
        <p className="text-xs font-bold text-slate-500">Not Checked Yet</p>
        <p className="text-[10px] text-slate-400">Click Verify DNS to check status</p>
      </div>
    </div>
  );
}

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  const handleCopy = () => {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };
  return (
    <button
      type="button"
      onClick={handleCopy}
      className="ml-1 inline-flex items-center gap-1 rounded px-1.5 py-0.5 text-[10px] font-semibold text-slate-500 hover:bg-slate-200 hover:text-slate-800 transition dark:hover:bg-slate-700"
      title="Copy to clipboard"
    >
      {copied ? (
        <span className="text-emerald-600">✓ Copied!</span>
      ) : (
        <><Copy className="h-2.5 w-2.5" /> Copy</>
      )}
    </button>
  );
}

export function SettingsDomainsTab({ companyId }: Props) {
  const [loading, setLoading] = useState(true);
  const [updatingMain, setUpdatingMain] = useState(false);
  const [connectingModule, setConnectingModule] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [mainDomain, setMainDomain] = useState("");
  const [mainDnsStatus, setMainDnsStatus] = useState<DnsStatus>("unknown");
  const [mainDnsResult, setMainDnsResult] = useState<DnsResult | null>(null);
  const [verifyingMain, setVerifyingMain] = useState(false);

  const [domainsList, setDomainsList] = useState<CustomDomain[]>([]);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [newDomain, setNewDomain] = useState("");
  const [newModule, setNewModule] = useState("ALL");

  // ── Auto-check DNS for a single domain ────────────────────────────
  const checkDns = useCallback(async (domain: string, domainId: string) => {
    try {
      setDomainsList((prev) =>
        prev.map((d) => (d.id === domainId ? { ...d, dnsStatus: "checking" } : d))
      );
      const { data } = await apiClient.post(`/company/${companyId}/verify-dns`, { domain });
      if (data.success) {
        const r: DnsResult = data.data;
        setDomainsList((prev) =>
          prev.map((d) =>
            d.id === domainId
              ? {
                  ...d,
                  dnsStatus: r.isVerified ? "verified" : "pending",
                  dnsCheckedAt: new Date().toLocaleTimeString(),
                  aRecords: r.aRecords,
                  cnameRecords: r.cnameRecords,
                  aMatch: r.aMatch,
                  cnameMatch: r.cnameMatch,
                }
              : d
          )
        );
        return r;
      }
    } catch {
      setDomainsList((prev) =>
        prev.map((d) => (d.id === domainId ? { ...d, dnsStatus: "unknown" } : d))
      );
    }
    return null;
  }, [companyId]);

  // ── Load data + auto-verify all domains ───────────────────────────
  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        const companyRes = await apiClient.get(`/company/${companyId}`);
        if (companyRes.data.success && companyRes.data.data) {
          const savedDomain = companyRes.data.data.customDomain || "";
          setMainDomain(savedDomain);

          // Auto-check main domain if set
          if (savedDomain) {
            setMainDnsStatus("checking");
            try {
              const { data } = await apiClient.post(`/company/${companyId}/verify-dns`, { domain: savedDomain });
              if (data.success) {
                setMainDnsResult(data.data);
                setMainDnsStatus(data.data.isVerified ? "verified" : "pending");
              }
            } catch {
              setMainDnsStatus("unknown");
            }
          }
        }

        const domainsRes = await apiClient.get(`/company/${companyId}/custom-domains`);
        if (domainsRes.data.success) {
          const list: CustomDomain[] = (domainsRes.data.data || []).map((d: CustomDomain) => ({
            ...d,
            dnsStatus: "checking" as DnsStatus,
          }));
          setDomainsList(list);

          // Auto-verify each domain in parallel (non-blocking)
          list.forEach((d) => {
            checkDns(d.domain, d.id);
          });
        }
      } catch (err: unknown) {
        const errorMsg =
          (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
          (err as Error).message ||
          "Failed to load domain settings.";
        setError(errorMsg);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [companyId, checkDns]);

  // ── Main domain verify ─────────────────────────────────────────────
  const handleVerifyMainDns = async () => {
    if (!mainDomain.trim()) return;
    try {
      setVerifyingMain(true);
      setMainDnsStatus("checking");
      const { data } = await apiClient.post(`/company/${companyId}/verify-dns`, {
        domain: mainDomain.trim().toLowerCase(),
      });
      if (data.success) {
        setMainDnsResult(data.data);
        setMainDnsStatus(data.data.isVerified ? "verified" : "pending");
      }
    } catch (err: unknown) {
      setMainDnsStatus("unknown");
      setError(
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        (err as Error).message || "DNS verification failed."
      );
    } finally {
      setVerifyingMain(false);
    }
  };

  const handleUpdateMainDomain = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setUpdatingMain(true);
      setError(null);
      setMainDnsResult(null);
      setMainDnsStatus("unknown");
      const targetDomain = mainDomain.trim() ? mainDomain.trim().toLowerCase() : null;
      const { data } = await apiClient.patch(`/company/${companyId}/branding`, {
        customDomain: targetDomain,
      });
      if (data.success) {
        uiStore.getState().pushNotification("Main custom domain saved. Verifying DNS…");
        if (targetDomain) {
          setMainDnsStatus("checking");
          const vRes = await apiClient.post(`/company/${companyId}/verify-dns`, { domain: targetDomain });
          if (vRes.data.success) {
            setMainDnsResult(vRes.data.data);
            setMainDnsStatus(vRes.data.data.isVerified ? "verified" : "pending");
          }
        }
      }
    } catch (err: unknown) {
      setError(
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        (err as Error).message || "Failed to update main custom domain."
      );
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
        uiStore.getState().pushNotification(`Domain ${cleanDomain} connected. Checking DNS…`);
        const newEntry: CustomDomain = { ...data.data, dnsStatus: "checking" };
        setDomainsList((prev) => [newEntry, ...prev]);
        setNewDomain("");
        setNewModule("ALL");
        // Auto-verify the newly added domain
        checkDns(cleanDomain, newEntry.id);
      }
    } catch (err: unknown) {
      setError(
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        (err as Error).message || "Failed to connect module domain."
      );
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
        setDomainsList((prev) => prev.filter((d) => d.id !== domainId));
      }
    } catch (err: unknown) {
      setError(
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        (err as Error).message || "Failed to disconnect domain."
      );
    }
  };

  const PLATFORM_IP = "193.203.184.192";
  const PLATFORM_CNAME = "rivexaflow.in";

  if (loading) {
    return (
      <div className="flex h-48 items-center justify-center gap-3">
        <Loader2 className="h-6 w-6 animate-spin text-blue-500" />
        <span className="text-sm text-slate-500">Loading domain settings…</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Error banner */}
      {error && (
        <div className="flex items-start gap-2 rounded-xl border border-rose-100 bg-rose-50 p-3.5 text-xs font-semibold text-rose-700 dark:border-rose-950/30 dark:bg-rose-950/20">
          <XCircle className="h-4 w-4 shrink-0 mt-0.5" />
          <span className="flex-1">{error}</span>
          <button onClick={() => setError(null)} className="text-rose-400 hover:text-rose-700 transition">✕</button>
        </div>
      )}

      {/* ══════════════════════════════════════════
          MAIN CUSTOM DOMAIN
      ══════════════════════════════════════════ */}
      <div className={cn(crm.panel, "p-6")}>
        <div className="border-b border-slate-100 pb-4 dark:border-slate-800">
          <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Globe className="h-5 w-5 text-blue-600" />
            Main Custom Domain
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Point your root domain to the workspace portal (e.g. <code>portal.mycompany.com</code>).
          </p>
        </div>

        <div className="mt-5 space-y-4 max-w-2xl">
          {/* Connection status for main domain */}
          {mainDomain && (
            <ConnectionStatusBadge status={mainDnsStatus} />
          )}

          <form onSubmit={handleUpdateMainDomain} className="space-y-3">
            <div>
              <label htmlFor="main-custom-domain" className="mb-1.5 block text-xs font-bold uppercase tracking-[0.14em] text-slate-400">
                Custom Domain URL
              </label>
              <div className="flex gap-2">
                <input
                  id="main-custom-domain"
                  type="text"
                  className={cn(crm.input, "flex-1 font-mono text-sm")}
                  value={mainDomain}
                  onChange={(e) => { setMainDomain(e.target.value); setMainDnsStatus("unknown"); setMainDnsResult(null); }}
                  placeholder="e.g. portal.mycompany.com"
                />
                <button
                  type="button"
                  onClick={handleVerifyMainDns}
                  disabled={verifyingMain || !mainDomain.trim()}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-600 transition hover:border-blue-300 hover:bg-blue-50 hover:text-blue-700 disabled:opacity-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300"
                >
                  {verifyingMain ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <RefreshCw className="h-3.5 w-3.5" />}
                  {verifyingMain ? "Checking…" : "Verify DNS"}
                </button>
                <button
                  type="submit"
                  disabled={updatingMain}
                  className={cn(crm.btnPrimary, "whitespace-nowrap")}
                >
                  {updatingMain ? "Saving…" : "Save Domain"}
                </button>
              </div>
            </div>
          </form>

          {/* Main domain DNS result detail */}
          {mainDnsResult && (
            <div className={cn(
              "rounded-xl border p-4 text-xs space-y-3",
              mainDnsResult.isVerified
                ? "border-emerald-200 bg-emerald-50/40 dark:border-emerald-900/30 dark:bg-emerald-950/10"
                : "border-amber-200 bg-amber-50/40 dark:border-amber-900/30 dark:bg-amber-950/10"
            )}>
              <div className="flex items-center gap-2 font-bold text-sm">
                {mainDnsResult.isVerified
                  ? <><CheckCircle2 className="h-4 w-4 text-emerald-600" /><span className="text-emerald-700 dark:text-emerald-300">DNS Verified — Domain is connected!</span></>
                  : <><WifiOff className="h-4 w-4 text-amber-500" /><span className="text-amber-700 dark:text-amber-300">DNS Not Configured — Domain not connected yet</span></>
                }
              </div>

              <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-600 dark:text-slate-400">
                <div className={cn("rounded-lg border p-2", mainDnsResult.aMatch ? "border-emerald-200 bg-white dark:bg-slate-950/40" : "border-slate-200 bg-white dark:bg-slate-950/40")}>
                  <div className="flex items-center gap-1 font-bold mb-1">
                    {mainDnsResult.aMatch ? <CheckCircle2 className="h-3 w-3 text-emerald-600" /> : <XCircle className="h-3 w-3 text-slate-400" />}
                    A Record
                  </div>
                  <p className="font-mono">{mainDnsResult.aRecords.length > 0 ? mainDnsResult.aRecords.join(", ") : "Not found"}</p>
                  {mainDnsResult.aMatch && <p className="mt-1 text-emerald-600 font-semibold">✓ Matches {PLATFORM_IP}</p>}
                </div>
                <div className={cn("rounded-lg border p-2", mainDnsResult.cnameMatch ? "border-emerald-200 bg-white dark:bg-slate-950/40" : "border-slate-200 bg-white dark:bg-slate-950/40")}>
                  <div className="flex items-center gap-1 font-bold mb-1">
                    {mainDnsResult.cnameMatch ? <CheckCircle2 className="h-3 w-3 text-emerald-600" /> : <XCircle className="h-3 w-3 text-slate-400" />}
                    CNAME
                  </div>
                  <p className="font-mono">{mainDnsResult.cnameRecords.length > 0 ? mainDnsResult.cnameRecords.join(", ") : "Not found"}</p>
                  {mainDnsResult.cnameMatch && <p className="mt-1 text-emerald-600 font-semibold">✓ Matches {PLATFORM_CNAME}</p>}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ══════════════════════════════════════════
          MODULE-SPECIFIC DOMAINS
      ══════════════════════════════════════════ */}
      <div className={cn(crm.panel, "p-6")}>
        <div className="border-b border-slate-100 pb-4 dark:border-slate-800">
          <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <ShieldCheck className="h-5 w-5 text-emerald-600" />
            Module-Specific Domains
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Connect distinct domains to specific modules.
          </p>
        </div>

        {/* Connect form */}
        <form onSubmit={handleConnectModuleDomain} className="mt-5 grid gap-4 md:grid-cols-3 items-end max-w-3xl">
          <div>
            <label htmlFor="module-domain" className="mb-1.5 block text-xs font-bold uppercase tracking-[0.14em] text-slate-400">Domain / Subdomain</label>
            <input
              id="module-domain"
              type="text"
              className={cn(crm.input, "w-full font-mono text-sm")}
              value={newDomain}
              onChange={(e) => setNewDomain(e.target.value)}
              placeholder="e.g. crm.mycompany.com"
              required
            />
          </div>
          <div>
            <label htmlFor="module-target" className="mb-1.5 block text-xs font-bold uppercase tracking-[0.14em] text-slate-400">Target Module</label>
            <select
              id="module-target"
              className={cn(crm.select, "w-full h-9 text-sm")}
              value={newModule}
              onChange={(e) => setNewModule(e.target.value)}
            >
              {MODULE_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>
          <button type="submit" disabled={connectingModule || !newDomain.trim()} className={cn(crm.btnPrimary, "w-full gap-1.5")}>
            {connectingModule ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Zap className="h-3.5 w-3.5" />}
            {connectingModule ? "Connecting…" : "Connect Domain"}
          </button>
        </form>

        {/* DNS Checklist info */}
        <div className="mt-5 rounded-xl border border-blue-100 bg-blue-50/50 p-4 dark:border-blue-950/20 dark:bg-blue-950/10">
          <div className="flex gap-2.5">
            <Info className="h-5 w-5 text-blue-600 shrink-0 mt-0.5" />
            <div className="text-xs text-slate-600 dark:text-slate-400 space-y-2">
              <p className="font-bold text-slate-900 dark:text-white">GoDaddy me ye DNS record add karo:</p>
              <div className="rounded-lg border border-blue-100 bg-white/80 p-3 dark:border-blue-950/20 dark:bg-slate-950/40 font-mono text-[11px] space-y-2">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="rounded bg-blue-100 px-1.5 py-0.5 font-bold text-blue-700 dark:bg-blue-900/30 dark:text-blue-300">TYPE</span>
                  <span className="rounded bg-slate-100 px-1.5 py-0.5 dark:bg-slate-800">HOST</span>
                  <span className="rounded bg-slate-100 px-1.5 py-0.5 dark:bg-slate-800">POINTS TO</span>
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="rounded bg-emerald-100 px-1.5 py-0.5 font-bold text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300">A</span>
                  <span className="text-slate-600">newcrm</span>
                  <span className="text-slate-400">→</span>
                  <span className="font-bold text-slate-800 dark:text-slate-200">{PLATFORM_IP}</span>
                  <CopyButton text={PLATFORM_IP} />
                </div>
                <p className="text-slate-400 text-center text-[10px]">— OR (CNAME alternative) —</p>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="rounded bg-purple-100 px-1.5 py-0.5 font-bold text-purple-700 dark:bg-purple-900/30 dark:text-purple-300">CNAME</span>
                  <span className="text-slate-600">newcrm</span>
                  <span className="text-slate-400">→</span>
                  <span className="font-bold text-slate-800 dark:text-slate-200">{PLATFORM_CNAME}</span>
                  <CopyButton text={PLATFORM_CNAME} />
                </div>
              </div>
              <p className="flex items-center gap-1.5 text-[11px] text-slate-400">
                <AlertTriangle className="h-3 w-3 text-amber-500 shrink-0" />
                DNS propagation takes 5–30 min. Page load karne pe auto-check hoga.
              </p>
            </div>
          </div>
        </div>

        {/* ── Active Domain Mappings ── */}
        <div className="mt-6">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-xs font-bold uppercase tracking-[0.14em] text-slate-400">
              Active Domain Mappings
            </h3>
            {domainsList.length > 0 && (
              <button
                type="button"
                onClick={() => domainsList.forEach((d) => checkDns(d.domain, d.id))}
                className="inline-flex items-center gap-1 text-[11px] text-slate-400 hover:text-blue-600 transition"
              >
                <RefreshCw className="h-3 w-3" /> Refresh All
              </button>
            )}
          </div>

          {domainsList.length === 0 ? (
            <div className="rounded-xl border border-dashed border-slate-200 p-8 text-center dark:border-slate-800">
              <Globe className="h-8 w-8 text-slate-300 mx-auto mb-2 dark:text-slate-700" />
              <p className="text-xs text-slate-400">No module-specific domains mapped yet.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {domainsList.map((d) => {
                const isExpanded = expandedId === d.id;
                return (
                  <div
                    key={d.id}
                    className="rounded-xl border border-slate-200/80 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900/40 overflow-hidden transition-all"
                  >
                    {/* Main row */}
                    <div className="flex items-center gap-3 px-4 py-3.5">
                      {/* Status icon */}
                      <div className="shrink-0">
                        {d.dnsStatus === "checking" && <Loader2 className="h-5 w-5 animate-spin text-blue-400" />}
                        {d.dnsStatus === "verified" && (
                          <div className="relative">
                            <span className="absolute inline-flex h-5 w-5 animate-ping rounded-full bg-emerald-400 opacity-30"></span>
                            <CheckCircle2 className="relative h-5 w-5 text-emerald-500" />
                          </div>
                        )}
                        {d.dnsStatus === "pending" && <XCircle className="h-5 w-5 text-amber-500" />}
                        {d.dnsStatus === "unknown" && <WifiOff className="h-5 w-5 text-slate-300 dark:text-slate-600" />}
                      </div>

                      {/* Domain + badges */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-semibold text-sm text-slate-800 dark:text-slate-200 font-mono truncate">
                            {d.domain}
                          </span>
                          <a
                            href={`http://${d.domain}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-slate-400 hover:text-blue-600 transition"
                            title="Open domain in new tab"
                          >
                            <ExternalLink className="h-3.5 w-3.5" />
                          </a>
                          <span className={cn("inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-semibold ring-1", MODULE_COLORS[d.module] || MODULE_COLORS.ALL)}>
                            {d.module}
                          </span>
                          {/* Compact status pill */}
                          {d.dnsStatus === "verified" && (
                            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[11px] font-bold text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400">
                              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                              Connected
                            </span>
                          )}
                          {d.dnsStatus === "pending" && (
                            <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2 py-0.5 text-[11px] font-bold text-amber-700 dark:bg-amber-950/30 dark:text-amber-400">
                              <span className="h-1.5 w-1.5 rounded-full bg-amber-400"></span>
                              DNS Pending
                            </span>
                          )}
                          {d.dnsStatus === "checking" && (
                            <span className="inline-flex items-center gap-1 rounded-full bg-blue-50 px-2 py-0.5 text-[11px] font-bold text-blue-600 dark:bg-blue-950/30 dark:text-blue-400">
                              <Loader2 className="h-2.5 w-2.5 animate-spin" />
                              Checking…
                            </span>
                          )}
                        </div>
                        <div className="mt-0.5 flex items-center gap-3 text-[11px] text-slate-400">
                          <span>Added {new Date(d.createdAt).toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" })}</span>
                          {d.dnsCheckedAt && <span>Last checked: {d.dnsCheckedAt}</span>}
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-1.5 shrink-0">
                        <button
                          type="button"
                          onClick={() => {
                            checkDns(d.domain, d.id);
                            setExpandedId(isExpanded ? null : d.id);
                          }}
                          disabled={d.dnsStatus === "checking"}
                          className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-[11px] font-semibold text-slate-600 transition hover:border-blue-300 hover:bg-blue-50 hover:text-blue-700 disabled:opacity-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300"
                        >
                          {d.dnsStatus === "checking" ? <Loader2 className="h-3 w-3 animate-spin" /> : <RefreshCw className="h-3 w-3" />}
                          Verify DNS
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteDomain(d.id, d.domain)}
                          className="rounded-lg border border-transparent p-1.5 text-slate-400 hover:border-rose-200 hover:bg-rose-50 hover:text-rose-600 transition dark:hover:border-rose-900/30 dark:hover:bg-rose-950/20"
                          title="Disconnect domain"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>

                    {/* Expanded DNS detail */}
                    {isExpanded && (
                      <div className="border-t border-slate-100 bg-slate-50/50 px-4 py-4 dark:border-slate-800 dark:bg-slate-950/20">
                        {d.dnsStatus === "checking" ? (
                          <div className="flex items-center gap-2 text-xs text-slate-500">
                            <Loader2 className="h-3.5 w-3.5 animate-spin" /> Checking DNS records…
                          </div>
                        ) : d.dnsStatus === "unknown" ? (
                          <p className="text-xs text-slate-400">Click Verify DNS to check status.</p>
                        ) : (
                          <div className="space-y-3">
                            <p className={cn("text-xs font-bold", d.dnsStatus === "verified" ? "text-emerald-700 dark:text-emerald-400" : "text-amber-700 dark:text-amber-400")}>
                              {d.dnsStatus === "verified" ? "✅ DNS Verified — Domain is connected and working!" : "⚠️ DNS not configured correctly yet. Add the records below:"}
                            </p>
                            <div className="grid grid-cols-2 gap-2 text-[11px]">
                              <div className={cn("rounded-lg border p-2.5 bg-white dark:bg-slate-950/40", d.aMatch ? "border-emerald-200" : "border-slate-200 dark:border-slate-800")}>
                                <div className="flex items-center gap-1 font-bold mb-1.5 text-slate-600 dark:text-slate-400">
                                  {d.aMatch ? <CheckCircle2 className="h-3 w-3 text-emerald-500" /> : <XCircle className="h-3 w-3 text-slate-400" />}
                                  A Record
                                </div>
                                <p className="font-mono text-slate-700 dark:text-slate-300">{(d.aRecords || []).length > 0 ? (d.aRecords || []).join(", ") : "Not found"}</p>
                                <p className="mt-1 text-slate-400">Expected: <span className="font-mono font-bold">{PLATFORM_IP}</span></p>
                              </div>
                              <div className={cn("rounded-lg border p-2.5 bg-white dark:bg-slate-950/40", d.cnameMatch ? "border-emerald-200" : "border-slate-200 dark:border-slate-800")}>
                                <div className="flex items-center gap-1 font-bold mb-1.5 text-slate-600 dark:text-slate-400">
                                  {d.cnameMatch ? <CheckCircle2 className="h-3 w-3 text-emerald-500" /> : <XCircle className="h-3 w-3 text-slate-400" />}
                                  CNAME
                                </div>
                                <p className="font-mono text-slate-700 dark:text-slate-300">{(d.cnameRecords || []).length > 0 ? (d.cnameRecords || []).join(", ") : "Not found"}</p>
                                <p className="mt-1 text-slate-400">Expected: <span className="font-mono font-bold">{PLATFORM_CNAME}</span></p>
                              </div>
                            </div>
                            {d.dnsStatus === "pending" && (
                              <div className="rounded-lg bg-amber-50 border border-amber-200 p-2.5 text-[11px] dark:border-amber-900/30 dark:bg-amber-950/10">
                                <p className="font-bold text-amber-800 dark:text-amber-300 mb-1.5">GoDaddy me add karo:</p>
                                <div className="space-y-1 font-mono text-slate-700 dark:text-slate-300">
                                  <div className="flex items-center gap-2">
                                    <span className="bg-amber-100 rounded px-1 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300">A</span>
                                    <span className="text-slate-500">{d.domain.split(".")[0]}</span>
                                    <span>→</span>
                                    <span className="font-bold">{PLATFORM_IP}</span>
                                    <CopyButton text={PLATFORM_IP} />
                                  </div>
                                </div>
                                <p className="mt-1.5 text-slate-400 text-[10px]">⏳ Changes take 5–30 min to propagate. Click Verify DNS again after.</p>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
