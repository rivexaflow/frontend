"use client";

import { useEffect, useState } from "react";
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
} from "lucide-react";

type Props = {
  companyId: string;
};

type CustomDomain = {
  id: string;
  domain: string;
  module: string;
  createdAt: string;
  dnsStatus?: "verified" | "pending" | "checking" | "unknown";
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
  ALL: "bg-blue-50 text-blue-700 dark:bg-blue-950/30 dark:text-blue-400",
  CRM: "bg-violet-50 text-violet-700 dark:bg-violet-950/30 dark:text-violet-400",
  HR: "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400",
  SUPPORT: "bg-amber-50 text-amber-700 dark:bg-amber-950/30 dark:text-amber-400",
};

function DnsStatusBadge({ status }: { status: CustomDomain["dnsStatus"] }) {
  if (status === "checking") {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-semibold text-slate-500 dark:bg-slate-800">
        <Loader2 className="h-3 w-3 animate-spin" />
        Checking…
      </span>
    );
  }
  if (status === "verified") {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[11px] font-semibold text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400">
        <CheckCircle2 className="h-3 w-3" />
        DNS Verified
      </span>
    );
  }
  if (status === "pending") {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2 py-0.5 text-[11px] font-semibold text-amber-700 dark:bg-amber-950/30 dark:text-amber-400">
        <AlertTriangle className="h-3 w-3" />
        DNS Pending
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-semibold text-slate-400 dark:bg-slate-800">
      <WifiOff className="h-3 w-3" />
      Not Checked
    </span>
  );
}

function DnsResultPanel({
  result,
  onClose,
}: {
  result: DnsResult;
  onClose: () => void;
}) {
  return (
    <div
      className={cn(
        "mt-3 rounded-xl border p-4 text-xs",
        result.isVerified
          ? "border-emerald-200 bg-emerald-50/50 dark:border-emerald-900/30 dark:bg-emerald-950/10"
          : "border-amber-200 bg-amber-50/50 dark:border-amber-900/30 dark:bg-amber-950/10"
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-2">
          {result.isVerified ? (
            <Wifi className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
          ) : (
            <WifiOff className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" />
          )}
          <div className="space-y-2">
            <p
              className={cn(
                "font-bold",
                result.isVerified ? "text-emerald-800 dark:text-emerald-300" : "text-amber-800 dark:text-amber-300"
              )}
            >
              {result.message}
            </p>

            <div className="space-y-1.5 text-slate-600 dark:text-slate-400">
              <div className="flex items-center gap-2">
                {result.aMatch ? (
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                ) : (
                  <XCircle className="h-3.5 w-3.5 text-slate-400" />
                )}
                <span>
                  <strong>A Record:</strong>{" "}
                  {result.aRecords.length > 0
                    ? result.aRecords.join(", ")
                    : result.resolvedA || "Not found"}
                  {result.aMatch && (
                    <span className="ml-1 text-emerald-600 font-semibold">✓ Matches {result.platformIp}</span>
                  )}
                </span>
              </div>

              <div className="flex items-center gap-2">
                {result.cnameMatch ? (
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                ) : (
                  <XCircle className="h-3.5 w-3.5 text-slate-400" />
                )}
                <span>
                  <strong>CNAME:</strong>{" "}
                  {result.cnameRecords.length > 0
                    ? result.cnameRecords.join(", ")
                    : result.resolvedCname || "Not found"}
                  {result.cnameMatch && (
                    <span className="ml-1 text-emerald-600 font-semibold">✓ Matches {result.platformCname}</span>
                  )}
                </span>
              </div>
            </div>

            {!result.isVerified && (
              <div className="mt-2 rounded-lg border border-amber-200 bg-white/60 p-2.5 dark:border-amber-900/30 dark:bg-slate-950/40">
                <p className="font-bold text-slate-700 dark:text-slate-300 mb-1">Required DNS Records:</p>
                <div className="space-y-1 font-mono text-[11px]">
                  <div className="flex items-center gap-2">
                    <span className="rounded bg-slate-100 px-1 dark:bg-slate-800">A</span>
                    <span className="text-slate-500">{result.domain}</span>
                    <span className="text-slate-400">→</span>
                    <span className="font-bold text-slate-800 dark:text-slate-200">{result.platformIp}</span>
                  </div>
                  <p className="text-slate-400 text-center text-[10px]">— OR —</p>
                  <div className="flex items-center gap-2">
                    <span className="rounded bg-slate-100 px-1 dark:bg-slate-800">CNAME</span>
                    <span className="text-slate-500">{result.domain}</span>
                    <span className="text-slate-400">→</span>
                    <span className="font-bold text-slate-800 dark:text-slate-200">{result.platformCname}</span>
                  </div>
                </div>
                <p className="mt-2 text-[10px] text-slate-400">
                  ⚠ DNS propagation can take up to 24 hours after making changes.
                </p>
              </div>
            )}
          </div>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="shrink-0 rounded p-0.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition dark:hover:bg-slate-800"
        >
          ✕
        </button>
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
      className="ml-1 inline-flex items-center gap-1 rounded px-1 py-0.5 text-[10px] text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition dark:hover:bg-slate-800"
      title="Copy"
    >
      {copied ? "✓ Copied" : <Copy className="h-3 w-3" />}
    </button>
  );
}

export function SettingsDomainsTab({ companyId }: Props) {
  const [loading, setLoading] = useState(true);
  const [updatingMain, setUpdatingMain] = useState(false);
  const [connectingModule, setConnectingModule] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // States
  const [mainDomain, setMainDomain] = useState("");
  const [domainsList, setDomainsList] = useState<CustomDomain[]>([]);

  // DNS verification
  const [verifyingDomain, setVerifyingDomain] = useState<string | null>(null);
  const [dnsResults, setDnsResults] = useState<Record<string, DnsResult>>({});

  // Main domain DNS check
  const [verifyingMain, setVerifyingMain] = useState(false);
  const [mainDnsResult, setMainDnsResult] = useState<DnsResult | null>(null);

  // New module domain inputs
  const [newDomain, setNewDomain] = useState("");
  const [newModule, setNewModule] = useState("ALL");

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        const companyRes = await apiClient.get(`/company/${companyId}`);
        if (companyRes.data.success && companyRes.data.data) {
          setMainDomain(companyRes.data.data.customDomain || "");
        }

        const domainsRes = await apiClient.get(`/company/${companyId}/custom-domains`);
        if (domainsRes.data.success) {
          setDomainsList(
            (domainsRes.data.data || []).map((d: CustomDomain) => ({ ...d, dnsStatus: "unknown" }))
          );
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
  }, [companyId]);

  const handleUpdateMainDomain = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setUpdatingMain(true);
      setError(null);
      setMainDnsResult(null);
      const targetDomain = mainDomain.trim() ? mainDomain.trim().toLowerCase() : null;
      const { data } = await apiClient.patch(`/company/${companyId}/branding`, {
        customDomain: targetDomain,
      });
      if (data.success) {
        uiStore.getState().pushNotification("Main custom domain updated successfully.");
      }
    } catch (err: unknown) {
      const errorMsg =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        (err as Error).message ||
        "Failed to update main custom domain.";
      setError(errorMsg);
    } finally {
      setUpdatingMain(false);
    }
  };

  const handleVerifyMainDns = async () => {
    if (!mainDomain.trim()) return;
    try {
      setVerifyingMain(true);
      setMainDnsResult(null);
      const { data } = await apiClient.post(`/company/${companyId}/verify-dns`, {
        domain: mainDomain.trim().toLowerCase(),
      });
      if (data.success) {
        setMainDnsResult(data.data);
      }
    } catch (err: unknown) {
      const errorMsg =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        (err as Error).message ||
        "DNS verification failed.";
      setError(errorMsg);
    } finally {
      setVerifyingMain(false);
    }
  };

  const handleVerifyDns = async (domain: CustomDomain) => {
    try {
      setVerifyingDomain(domain.id);
      setDomainsList((prev) =>
        prev.map((d) => (d.id === domain.id ? { ...d, dnsStatus: "checking" } : d))
      );
      const { data } = await apiClient.post(`/company/${companyId}/verify-dns`, {
        domain: domain.domain,
      });
      if (data.success) {
        const result: DnsResult = data.data;
        setDnsResults((prev) => ({ ...prev, [domain.id]: result }));
        setDomainsList((prev) =>
          prev.map((d) =>
            d.id === domain.id
              ? { ...d, dnsStatus: result.isVerified ? "verified" : "pending" }
              : d
          )
        );
      }
    } catch (err: unknown) {
      setDomainsList((prev) =>
        prev.map((d) => (d.id === domain.id ? { ...d, dnsStatus: "unknown" } : d))
      );
      const errorMsg =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        (err as Error).message ||
        "DNS verification failed.";
      setError(errorMsg);
    } finally {
      setVerifyingDomain(null);
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
        setDomainsList([{ ...data.data, dnsStatus: "unknown" }, ...domainsList]);
        setNewDomain("");
        setNewModule("ALL");
      }
    } catch (err: unknown) {
      const errorMsg =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        (err as Error).message ||
        "Failed to connect module domain.";
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
        setDnsResults((prev) => {
          const next = { ...prev };
          delete next[domainId];
          return next;
        });
      }
    } catch (err: unknown) {
      const errorMsg =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        (err as Error).message ||
        "Failed to delete domain connection.";
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
        <div className="rounded-xl border border-rose-100 bg-rose-50 p-3.5 text-xs font-semibold text-rose-700 dark:border-rose-950/30 dark:bg-rose-950/20 flex items-start gap-2">
          <XCircle className="h-4 w-4 shrink-0 mt-0.5" />
          {error}
          <button onClick={() => setError(null)} className="ml-auto shrink-0 text-rose-400 hover:text-rose-700">✕</button>
        </div>
      )}

      {/* ── Main Custom Domain ── */}
      <div className={cn(crm.panel, "p-6")}>
        <div className="border-b border-slate-100 pb-4 dark:border-slate-800">
          <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Globe className="h-5 w-5 text-blue-600" />
            Main Custom Domain
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Map a custom domain to point directly to your primary workspace portal.
          </p>
        </div>

        <form onSubmit={handleUpdateMainDomain} className="mt-5 max-w-2xl space-y-3">
          <div>
            <label htmlFor="main-custom-domain" className="mb-1.5 block text-xs font-bold uppercase tracking-[0.14em] text-slate-400">
              Custom Domain URL
            </label>
            <div className="flex gap-2">
              <input
                id="main-custom-domain"
                type="text"
                className={cn(crm.input, "flex-1")}
                value={mainDomain}
                onChange={(e) => { setMainDomain(e.target.value); setMainDnsResult(null); }}
                placeholder="e.g. portal.mycompany.com"
              />
              <button
                type="button"
                onClick={handleVerifyMainDns}
                disabled={verifyingMain || !mainDomain.trim()}
                className={cn(
                  crm.btnSecondary,
                  "gap-1.5 whitespace-nowrap",
                  verifyingMain && "opacity-70 cursor-not-allowed"
                )}
              >
                {verifyingMain ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <RefreshCw className="h-3.5 w-3.5" />
                )}
                {verifyingMain ? "Checking…" : "Verify DNS"}
              </button>
              <button
                type="submit"
                disabled={updatingMain}
                className={cn(crm.btnPrimary)}
              >
                {updatingMain ? "Saving…" : "Save Domain"}
              </button>
            </div>
          </div>

          {mainDnsResult && (
            <DnsResultPanel result={mainDnsResult} onClose={() => setMainDnsResult(null)} />
          )}
        </form>
      </div>

      {/* ── Module-Specific Domains ── */}
      <div className={cn(crm.panel, "p-6")}>
        <div className="border-b border-slate-100 pb-4 dark:border-slate-800">
          <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <ShieldCheck className="h-5 w-5 text-emerald-600" />
            Module-Specific Domains
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Connect distinct domains to specific modules (e.g.{" "}
            <code>crm.mycompany.com</code> → CRM only).
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
            {connectingModule ? "Connecting…" : "Connect Domain"}
          </button>
        </form>

        {/* DNS Configuration Help */}
        <div className="mt-6 rounded-xl border border-blue-100 bg-blue-50/50 p-4 dark:border-blue-950/20 dark:bg-blue-950/10">
          <div className="flex gap-2.5">
            <Info className="h-5 w-5 text-blue-600 shrink-0 mt-0.5" />
            <div className="text-xs text-slate-600 dark:text-slate-400 space-y-2">
              <p className="font-bold text-slate-900 dark:text-white">DNS Configuration Checklist:</p>
              <p>Go to your domain registrar (GoDaddy, Namecheap, Cloudflare, etc.) and add one of these records:</p>
              <div className="rounded-lg border border-blue-100 bg-white/70 p-3 font-mono text-[11px] space-y-2 dark:border-blue-950/20 dark:bg-slate-950/40">
                <div className="flex items-center justify-between gap-2 flex-wrap">
                  <div className="flex items-center gap-2">
                    <span className="rounded bg-blue-100 px-1.5 py-0.5 font-bold text-blue-700 dark:bg-blue-900/30 dark:text-blue-300">A Record</span>
                    <span className="text-slate-500">your-subdomain</span>
                    <span className="text-slate-400">→</span>
                    <span className="font-bold text-slate-800 dark:text-slate-200">193.203.184.192</span>
                  </div>
                  <CopyButton text="193.203.184.192" />
                </div>
                <div className="text-center text-slate-400 text-[10px]">— OR —</div>
                <div className="flex items-center justify-between gap-2 flex-wrap">
                  <div className="flex items-center gap-2">
                    <span className="rounded bg-blue-100 px-1.5 py-0.5 font-bold text-blue-700 dark:bg-blue-900/30 dark:text-blue-300">CNAME</span>
                    <span className="text-slate-500">your-subdomain</span>
                    <span className="text-slate-400">→</span>
                    <span className="font-bold text-slate-800 dark:text-slate-200">rivexaflow.in</span>
                  </div>
                  <CopyButton text="rivexaflow.in" />
                </div>
              </div>
              <p className="text-[11px] text-slate-400 flex items-center gap-1">
                <AlertTriangle className="h-3 w-3 text-amber-500" />
                DNS propagation takes 5 minutes to 24 hours. Use <strong>Verify DNS</strong> to check anytime.
              </p>
            </div>
          </div>
        </div>

        {/* Active Domain Mappings */}
        <div className="mt-6">
          <h3 className="text-xs font-bold uppercase tracking-[0.14em] text-slate-400 mb-3">
            Active Domain Mappings
          </h3>

          {domainsList.length === 0 ? (
            <div className="rounded-xl border border-dashed border-slate-200 p-8 text-center text-xs text-slate-400 dark:border-slate-800">
              No module-specific domains mapped yet.
            </div>
          ) : (
            <div className="space-y-2">
              {domainsList.map((d) => (
                <div
                  key={d.id}
                  className="rounded-xl border border-slate-200/80 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900/40"
                >
                  <div className="flex items-center gap-3 px-4 py-3">
                    {/* Domain name + module badge */}
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-semibold text-sm text-slate-800 dark:text-slate-200 font-mono truncate">
                          {d.domain}
                        </span>
                        <a
                          href={`https://${d.domain}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-slate-400 hover:text-blue-600 transition"
                          title="Open in new tab"
                        >
                          <ExternalLink className="h-3.5 w-3.5" />
                        </a>
                        <span className={cn("inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-semibold", MODULE_COLORS[d.module] || MODULE_COLORS.ALL)}>
                          {d.module}
                        </span>
                        <DnsStatusBadge status={d.dnsStatus} />
                      </div>
                      <p className="mt-0.5 text-[11px] text-slate-400">
                        Connected {new Date(d.createdAt).toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" })}
                      </p>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-1.5 shrink-0">
                      <button
                        type="button"
                        onClick={() => handleVerifyDns(d)}
                        disabled={verifyingDomain === d.id}
                        className={cn(
                          "inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-[11px] font-semibold text-slate-600 transition hover:border-slate-300 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800",
                          verifyingDomain === d.id && "opacity-60 cursor-not-allowed"
                        )}
                        title="Check DNS configuration"
                      >
                        {verifyingDomain === d.id ? (
                          <Loader2 className="h-3 w-3 animate-spin" />
                        ) : (
                          <RefreshCw className="h-3 w-3" />
                        )}
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

                  {/* Expandable DNS Result */}
                  {dnsResults[d.id] && (
                    <div className="border-t border-slate-100 px-4 pb-4 dark:border-slate-800">
                      <DnsResultPanel
                        result={dnsResults[d.id]}
                        onClose={() =>
                          setDnsResults((prev) => {
                            const next = { ...prev };
                            delete next[d.id];
                            return next;
                          })
                        }
                      />
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
