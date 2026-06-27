"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Key,
  Server,
  Users,
  ShieldCheck,
  Plus,
  RefreshCw,
  Copy,
  Check,
  AlertCircle,
  Loader2,
  Activity,
  Globe,
  Palette,
  ExternalLink,
  Sliders,
  CheckCircle2,
  XCircle,
  Clock,
} from "lucide-react";
import {
  fetchAdminLicenses,
  createAdminLicense,
  updateAdminLicenseStatus,
  fetchPlatformCompanies,
  fetchWhitelabelConfig,
  updateWhitelabelConfig,
  type AdminLicenseRecord,
} from "@/lib/api/admin-licenses";

export function SuperAdminLicensesView() {
  const [mounted, setMounted] = useState(false);
  const [activeTab, setActiveTab] = useState<"licenses" | "whitelabel">("licenses");

  // License management state
  const [licenses, setLicenses] = useState<AdminLicenseRecord[]>([]);
  const [companies, setCompanies] = useState<Array<{ id: string; name: string }>>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // Modals state
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [inspectLicense, setInspectLicense] = useState<AdminLicenseRecord | null>(null);

  // Form state for creating license
  const [formCompanyId, setFormCompanyId] = useState("");
  const [formTier, setFormTier] = useState("ENTERPRISE");
  const [formMaxUsers, setFormMaxUsers] = useState(50);
  const [formMaxInstances, setFormMaxInstances] = useState(2);
  const [formAllowedModules, setFormAllowedModules] = useState<string[]>(["CRM", "HRM", "KYC"]);
  const [formExpiresInDays, setFormExpiresInDays] = useState(365);
  const [submitting, setSubmitting] = useState(false);

  // Whitelabel state
  const [selectedCompanyId, setSelectedCompanyId] = useState("");
  const [wlBrandName, setWlBrandName] = useState("");
  const [wlAppTitle, setWlAppTitle] = useState("");
  const [wlPrimaryColor, setWlPrimaryColor] = useState("#0F172A");
  const [wlSecondaryColor, setWlSecondaryColor] = useState("#3B82F6");
  const [wlCustomDomain, setWlCustomDomain] = useState("");
  const [wlLoading, setWlLoading] = useState(false);
  const [wlSaving, setWlSaving] = useState(false);
  const [wlSuccess, setWlSuccess] = useState<string | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  const loadData = useCallback(async () => {
    setError(null);
    try {
      const [licRes, compList] = await Promise.all([
        fetchAdminLicenses({ limit: 50 }),
        fetchPlatformCompanies(),
      ]);
      setLicenses(licRes.licenses);
      setCompanies(compList);
      if (compList.length > 0 && !formCompanyId) {
        setFormCompanyId(compList[0].id);
        setSelectedCompanyId(compList[0].id);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load license data.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [formCompanyId]);

  useEffect(() => {
    if (mounted) {
      loadData();
    }
  }, [mounted, loadData]);

  const handleRefresh = () => {
    setRefreshing(true);
    loadData();
  };

  const handleCopyKey = (key: string) => {
    navigator.clipboard.writeText(key);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formCompanyId) return;
    setSubmitting(true);
    try {
      await createAdminLicense({
        companyId: formCompanyId,
        tier: formTier,
        maxUsers: formMaxUsers,
        maxInstances: formMaxInstances,
        allowedModules: formAllowedModules,
        expiresInDays: formExpiresInDays,
      });
      setCreateModalOpen(false);
      loadData();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to generate license key.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleStatusToggle = async (license: AdminLicenseRecord, newStatus: string) => {
    try {
      await updateAdminLicenseStatus(license.id, newStatus);
      loadData();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to update status.");
    }
  };

  // Load Whitelabel config when selected company changes
  const loadWhitelabel = useCallback(async (companyId: string) => {
    if (!companyId) return;
    setWlLoading(true);
    setWlSuccess(null);
    try {
      const config = await fetchWhitelabelConfig(companyId);
      setWlBrandName(config.brandName || "");
      setWlAppTitle(config.appTitle || "");
      setWlPrimaryColor(config.primaryColor || "#0F172A");
      setWlSecondaryColor(config.secondaryColor || "#3B82F6");
      setWlCustomDomain(config.customDomain || "");
    } catch {
      // ignore
    } finally {
      setWlLoading(false);
    }
  }, []);

  useEffect(() => {
    if (activeTab === "whitelabel" && selectedCompanyId) {
      loadWhitelabel(selectedCompanyId);
    }
  }, [activeTab, selectedCompanyId, loadWhitelabel]);

  const handleSaveWhitelabel = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCompanyId) return;
    setWlSaving(true);
    setWlSuccess(null);
    try {
      await updateWhitelabelConfig(selectedCompanyId, {
        brandName: wlBrandName,
        appTitle: wlAppTitle,
        primaryColor: wlPrimaryColor,
        secondaryColor: wlSecondaryColor,
        customDomain: wlCustomDomain || undefined,
      });
      setWlSuccess("Whitelabel branding updated successfully!");
      setTimeout(() => setWlSuccess(null), 3000);
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to update whitelabel branding.");
    } finally {
      setWlSaving(false);
    }
  };

  // Calculated Stats
  const stats = useMemo(() => {
    const activeLicenses = licenses.filter((l) => l.status === "ACTIVE").length;
    const totalNodes = licenses.reduce((acc, l) => acc + (l.instances?.filter((i) => i.status === "ONLINE").length || 0), 0);
    const totalUsersAllocated = licenses.reduce((acc, l) => acc + (l.maxUsers || 0), 0);
    const suspendedRevoked = licenses.filter((l) => l.status !== "ACTIVE").length;
    return { activeLicenses, totalNodes, totalUsersAllocated, suspendedRevoked };
  }, [licenses]);

  if (!mounted) return null;

  return (
    <div className="min-h-screen bg-slate-50/50 p-4 md:p-8 dark:bg-slate-950">
      <div className="mx-auto max-w-7xl space-y-6">
        {/* Top Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="flex items-center gap-2.5">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 to-indigo-700 text-white shadow-md shadow-blue-500/20">
                <Key className="h-5 w-5" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-slate-900 dark:text-white">License & Infrastructure Control</h1>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Manage cryptographically signed On-Premises licenses, cluster node telemetry, and whitelabeling
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={handleRefresh}
              disabled={refreshing}
              className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-700 shadow-sm transition hover:bg-slate-50 disabled:opacity-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${refreshing ? "animate-spin" : ""}`} />
              Refresh
            </button>
            <button
              type="button"
              onClick={() => setCreateModalOpen(true)}
              className="flex items-center gap-1.5 rounded-lg bg-blue-600 px-3.5 py-2 text-xs font-semibold text-white shadow-md shadow-blue-600/20 transition hover:bg-blue-700"
            >
              <Plus className="h-4 w-4" />
              Issue License Key
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex border-b border-slate-200 dark:border-slate-800">
          <button
            type="button"
            onClick={() => setActiveTab("licenses")}
            className={`flex items-center gap-2 border-b-2 px-4 py-2.5 text-sm font-semibold transition ${
              activeTab === "licenses"
                ? "border-blue-600 text-blue-600 dark:border-blue-500 dark:text-blue-400"
                : "border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
            }`}
          >
            <ShieldCheck className="h-4 w-4" />
            Active Licenses & Clusters ({licenses.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("whitelabel")}
            className={`flex items-center gap-2 border-b-2 px-4 py-2.5 text-sm font-semibold transition ${
              activeTab === "whitelabel"
                ? "border-blue-600 text-blue-600 dark:border-blue-500 dark:text-blue-400"
                : "border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
            }`}
          >
            <Palette className="h-4 w-4" />
            Tenant Whitelabel Management
          </button>
        </div>

        {activeTab === "licenses" ? (
          <>
            {/* Metric KPI Cards */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm dark:border-slate-800/80 dark:bg-slate-900">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Active License Keys</span>
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400">
                    <CheckCircle2 className="h-4 w-4" />
                  </div>
                </div>
                <div className="mt-3 flex items-baseline gap-2">
                  <span className="text-2xl font-bold text-slate-900 dark:text-white">{stats.activeLicenses}</span>
                  <span className="text-xs text-slate-400">keys verified</span>
                </div>
              </div>

              <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm dark:border-slate-800/80 dark:bg-slate-900">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Live Edge Server Nodes</span>
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-50 text-blue-600 dark:bg-blue-950/40 dark:text-blue-400">
                    <Server className="h-4 w-4" />
                  </div>
                </div>
                <div className="mt-3 flex items-baseline gap-2">
                  <span className="text-2xl font-bold text-slate-900 dark:text-white">{stats.totalNodes}</span>
                  <span className="text-xs text-emerald-600 font-medium">online containers</span>
                </div>
              </div>

              <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm dark:border-slate-800/80 dark:bg-slate-900">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Allocated User Quota</span>
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-purple-50 text-purple-600 dark:bg-purple-950/40 dark:text-purple-400">
                    <Users className="h-4 w-4" />
                  </div>
                </div>
                <div className="mt-3 flex items-baseline gap-2">
                  <span className="text-2xl font-bold text-slate-900 dark:text-white">{stats.totalUsersAllocated}</span>
                  <span className="text-xs text-slate-400">users across tenants</span>
                </div>
              </div>

              <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm dark:border-slate-800/80 dark:bg-slate-900">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Suspended / Expired Keys</span>
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-50 text-amber-600 dark:bg-amber-950/40 dark:text-amber-400">
                    <XCircle className="h-4 w-4" />
                  </div>
                </div>
                <div className="mt-3 flex items-baseline gap-2">
                  <span className="text-2xl font-bold text-slate-900 dark:text-white">{stats.suspendedRevoked}</span>
                  <span className="text-xs text-slate-400">restricted keys</span>
                </div>
              </div>
            </div>

            {/* Main Table Card */}
            <div className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm dark:border-slate-800/80 dark:bg-slate-900">
              {error ? (
                <div className="m-4 flex items-center gap-2 rounded-xl border border-rose-200 bg-rose-50 p-4 text-xs text-rose-800 dark:border-rose-900/40 dark:bg-rose-950/40 dark:text-rose-300">
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  <span>{error}</span>
                </div>
              ) : null}

              {loading ? (
                <div className="flex flex-col items-center justify-center py-20 text-slate-400">
                  <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
                  <span className="mt-2 text-xs">Loading platform licenses...</span>
                </div>
              ) : licenses.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 text-center">
                  <Key className="h-10 w-10 text-slate-300 dark:text-slate-700" />
                  <h3 className="mt-2 text-sm font-semibold text-slate-800 dark:text-slate-200">No License Keys Issued</h3>
                  <p className="mt-1 text-xs text-slate-500">Generate your first On-Premises license key to get started.</p>
                  <button
                    type="button"
                    onClick={() => setCreateModalOpen(true)}
                    className="mt-4 flex items-center gap-1.5 rounded-lg bg-blue-600 px-3.5 py-2 text-xs font-semibold text-white shadow-md shadow-blue-600/20 hover:bg-blue-700"
                  >
                    <Plus className="h-4 w-4" />
                    Issue License Key
                  </button>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="border-b border-slate-200 bg-slate-50/80 text-slate-500 uppercase font-semibold dark:border-slate-800 dark:bg-slate-800/50 dark:text-slate-400">
                      <tr>
                        <th className="py-3.5 px-4">Company & License Key</th>
                        <th className="py-3.5 px-4">Tier</th>
                        <th className="py-3.5 px-4">Node Instances</th>
                        <th className="py-3.5 px-4">User Quota</th>
                        <th className="py-3.5 px-4">Expires At</th>
                        <th className="py-3.5 px-4">Status</th>
                        <th className="py-3.5 px-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200/70 dark:divide-slate-800/70">
                      {licenses.map((lic) => {
                        const onlineCount = lic.instances?.filter((i) => i.status === "ONLINE").length || 0;
                        const modules = JSON.parse(lic.allowedModules || "[]");
                        return (
                          <tr key={lic.id} className="hover:bg-slate-50/50 transition dark:hover:bg-slate-800/30">
                            <td className="py-4 px-4">
                              <div className="font-semibold text-slate-900 dark:text-white">
                                {lic.company?.name || "Unknown Company"}
                              </div>
                              <div className="mt-1 flex items-center gap-1.5">
                                <code className="rounded bg-slate-100 px-2 py-0.5 font-mono text-[11px] font-bold text-blue-700 dark:bg-slate-800 dark:text-blue-400">
                                  {lic.key}
                                </code>
                                <button
                                  type="button"
                                  onClick={() => handleCopyKey(lic.key)}
                                  className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                                  title="Copy License Key"
                                >
                                  {copiedKey === lic.key ? <Check className="h-3.5 w-3.5 text-emerald-600" /> : <Copy className="h-3.5 w-3.5" />}
                                </button>
                              </div>
                            </td>
                            <td className="py-4 px-4">
                              <span className="inline-flex items-center rounded-md bg-indigo-50 px-2 py-1 text-[10px] font-bold text-indigo-700 dark:bg-indigo-950/50 dark:text-indigo-300">
                                {lic.tier}
                              </span>
                            </td>
                            <td className="py-4 px-4">
                              <div className="flex items-center gap-1.5">
                                <span className={`h-2 w-2 rounded-full ${onlineCount > 0 ? "bg-emerald-500 animate-pulse" : "bg-slate-300"}`} />
                                <span className="font-semibold text-slate-800 dark:text-slate-200">
                                  {onlineCount} / {lic.maxInstances}
                                </span>
                                <span className="text-slate-400">nodes</span>
                              </div>
                            </td>
                            <td className="py-4 px-4 font-medium text-slate-700 dark:text-slate-300">
                              {lic.maxUsers} max users
                            </td>
                            <td className="py-4 px-4 text-slate-500 dark:text-slate-400">
                              {lic.expiresAt ? new Date(lic.expiresAt).toLocaleDateString() : "Never (Lifetime)"}
                            </td>
                            <td className="py-4 px-4">
                              <span
                                className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] font-bold ${
                                  lic.status === "ACTIVE"
                                    ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-400"
                                    : "bg-rose-50 text-rose-700 dark:bg-rose-950/50 dark:text-rose-400"
                                }`}
                              >
                                {lic.status}
                              </span>
                            </td>
                            <td className="py-4 px-4 text-right">
                              <div className="flex items-center justify-end gap-2">
                                <button
                                  type="button"
                                  onClick={() => setInspectLicense(lic)}
                                  className="flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-[11px] font-medium text-slate-700 shadow-sm hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300"
                                >
                                  <Activity className="h-3.5 w-3.5 text-blue-600" />
                                  Inspect Cluster
                                </button>
                                {lic.status === "ACTIVE" ? (
                                  <button
                                    type="button"
                                    onClick={() => handleStatusToggle(lic, "SUSPENDED")}
                                    className="rounded-lg border border-rose-200 px-2.5 py-1.5 text-[11px] font-medium text-rose-700 hover:bg-rose-50 dark:border-rose-900/50 dark:text-rose-400"
                                  >
                                    Suspend
                                  </button>
                                ) : (
                                  <button
                                    type="button"
                                    onClick={() => handleStatusToggle(lic, "ACTIVE")}
                                    className="rounded-lg border border-emerald-200 px-2.5 py-1.5 text-[11px] font-medium text-emerald-700 hover:bg-emerald-50 dark:border-emerald-900/50 dark:text-emerald-400"
                                  >
                                    Activate
                                  </button>
                                )}
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </>
        ) : (
          /* Whitelabel Tab */
          <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm dark:border-slate-800/80 dark:bg-slate-900">
            <div className="max-w-3xl space-y-6">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">Tenant Whitelabeling & Custom Branding</h3>
                <p className="mt-1 text-xs text-slate-500">Configure client custom domain, app titles, and brand colors</p>
              </div>

              {wlSuccess ? (
                <div className="flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-xs font-semibold text-emerald-800 dark:border-emerald-900/50 dark:bg-emerald-950/40 dark:text-emerald-300">
                  <CheckCircle2 className="h-4 w-4" />
                  <span>{wlSuccess}</span>
                </div>
              ) : null}

              <form onSubmit={handleSaveWhitelabel} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">Select Client Company</label>
                  <select
                    value={selectedCompanyId}
                    onChange={(e) => setSelectedCompanyId(e.target.value)}
                    className="mt-1.5 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-900 dark:border-slate-800 dark:bg-slate-950 dark:text-white"
                  >
                    {companies.map((c) => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>

                {wlLoading ? (
                  <div className="py-8 text-center text-xs text-slate-400">Loading company branding...</div>
                ) : (
                  <>
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">Custom Brand Name</label>
                        <input
                          type="text"
                          value={wlBrandName}
                          onChange={(e) => setWlBrandName(e.target.value)}
                          placeholder="e.g. Acme Flow Workspace"
                          className="mt-1.5 w-full rounded-xl border border-slate-200 px-3 py-2 text-xs text-slate-900 dark:border-slate-800 dark:bg-slate-950 dark:text-white"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">App Window Title</label>
                        <input
                          type="text"
                          value={wlAppTitle}
                          onChange={(e) => setWlAppTitle(e.target.value)}
                          placeholder="e.g. Acme Portal — Workspace"
                          className="mt-1.5 w-full rounded-xl border border-slate-200 px-3 py-2 text-xs text-slate-900 dark:border-slate-800 dark:bg-slate-950 dark:text-white"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">Primary Brand Color</label>
                        <div className="mt-1.5 flex items-center gap-2">
                          <input
                            type="color"
                            value={wlPrimaryColor}
                            onChange={(e) => setWlPrimaryColor(e.target.value)}
                            className="h-8 w-12 rounded border border-slate-200 cursor-pointer"
                          />
                          <input
                            type="text"
                            value={wlPrimaryColor}
                            onChange={(e) => setWlPrimaryColor(e.target.value)}
                            className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs font-mono text-slate-900 dark:border-slate-800 dark:bg-slate-950 dark:text-white"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">Secondary Accent Color</label>
                        <div className="mt-1.5 flex items-center gap-2">
                          <input
                            type="color"
                            value={wlSecondaryColor}
                            onChange={(e) => setWlSecondaryColor(e.target.value)}
                            className="h-8 w-12 rounded border border-slate-200 cursor-pointer"
                          />
                          <input
                            type="text"
                            value={wlSecondaryColor}
                            onChange={(e) => setWlSecondaryColor(e.target.value)}
                            className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs font-mono text-slate-900 dark:border-slate-800 dark:bg-slate-950 dark:text-white"
                          />
                        </div>
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">Custom Domain / Subdomain Override</label>
                      <input
                        type="text"
                        value={wlCustomDomain}
                        onChange={(e) => setWlCustomDomain(e.target.value)}
                        placeholder="e.g. crm.acmecompany.com"
                        className="mt-1.5 w-full rounded-xl border border-slate-200 px-3 py-2 text-xs text-slate-900 dark:border-slate-800 dark:bg-slate-950 dark:text-white"
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={wlSaving}
                      className="flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-xs font-semibold text-white shadow-md shadow-blue-600/20 hover:bg-blue-700 disabled:opacity-50"
                    >
                      {wlSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                      Save Whitelabel Settings
                    </button>
                  </>
                )}
              </form>
            </div>
          </div>
        )}
      </div>

      {/* Modal: Create License Key */}
      {createModalOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-2xl border border-slate-200 bg-white p-6 shadow-xl dark:border-slate-800 dark:bg-slate-900">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 dark:border-slate-800">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">Issue On-Premises License Key</h3>
              <button type="button" onClick={() => setCreateModalOpen(false)} className="text-slate-400 hover:text-slate-600">✕</button>
            </div>

            <form onSubmit={handleCreateSubmit} className="mt-4 space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300">Client Company</label>
                <select
                  value={formCompanyId}
                  onChange={(e) => setFormCompanyId(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-slate-200 p-2.5 text-slate-900 dark:border-slate-800 dark:bg-slate-950 dark:text-white"
                >
                  {companies.map((c) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300">License Tier</label>
                  <select
                    value={formTier}
                    onChange={(e) => setFormTier(e.target.value)}
                    className="mt-1 w-full rounded-xl border border-slate-200 p-2.5 text-slate-900 dark:border-slate-800 dark:bg-slate-950 dark:text-white"
                  >
                    <option value="STARTER">STARTER</option>
                    <option value="BUSINESS">BUSINESS</option>
                    <option value="ENTERPRISE">ENTERPRISE</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300">Max Users Quota</label>
                  <input
                    type="number"
                    value={formMaxUsers}
                    onChange={(e) => setFormMaxUsers(Number(e.target.value))}
                    className="mt-1 w-full rounded-xl border border-slate-200 p-2.5 text-slate-900 dark:border-slate-800 dark:bg-slate-950 dark:text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300">Max Server Nodes</label>
                  <input
                    type="number"
                    value={formMaxInstances}
                    onChange={(e) => setFormMaxInstances(Number(e.target.value))}
                    className="mt-1 w-full rounded-xl border border-slate-200 p-2.5 text-slate-900 dark:border-slate-800 dark:bg-slate-950 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300">Validity (Days)</label>
                  <input
                    type="number"
                    value={formExpiresInDays}
                    onChange={(e) => setFormExpiresInDays(Number(e.target.value))}
                    className="mt-1 w-full rounded-xl border border-slate-200 p-2.5 text-slate-900 dark:border-slate-800 dark:bg-slate-950 dark:text-white"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setCreateModalOpen(false)}
                  className="rounded-xl border border-slate-200 px-4 py-2 font-semibold text-slate-600 hover:bg-slate-50 dark:border-slate-800 dark:text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex items-center gap-1.5 rounded-xl bg-blue-600 px-4 py-2 font-semibold text-white hover:bg-blue-700 disabled:opacity-50"
                >
                  {submitting ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : null}
                  Generate Key
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : null}

      {/* Modal: Inspect Live Cluster Nodes */}
      {inspectLicense ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm">
          <div className="w-full max-w-2xl rounded-2xl border border-slate-200 bg-white p-6 shadow-xl dark:border-slate-800 dark:bg-slate-900">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 dark:border-slate-800">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  Live Edge Server Nodes — {inspectLicense.company?.name}
                </h3>
                <code className="text-xs font-mono text-blue-600">{inspectLicense.key}</code>
              </div>
              <button type="button" onClick={() => setInspectLicense(null)} className="text-slate-400 hover:text-slate-600">✕</button>
            </div>

            <div className="mt-4 space-y-3 max-h-96 overflow-y-auto">
              {!inspectLicense.instances || inspectLicense.instances.length === 0 ? (
                <div className="py-8 text-center text-xs text-slate-400">No edge servers have connected for this license key yet.</div>
              ) : (
                inspectLicense.instances.map((inst) => (
                  <div key={inst.id} className="flex items-center justify-between rounded-xl border border-slate-200 p-3.5 text-xs dark:border-slate-800">
                    <div className="flex items-center gap-3">
                      <div className={`h-3 w-3 rounded-full ${inst.status === "ONLINE" ? "bg-emerald-500 animate-pulse" : "bg-slate-400"}`} />
                      <div>
                        <div className="font-bold text-slate-900 dark:text-white">{inst.hostname || inst.instanceId}</div>
                        <div className="text-slate-400">IP: {inst.serverIp || "127.0.0.1"} | Node: {inst.nodeVersion || "v20.x"}</div>
                      </div>
                    </div>
                    <div className="text-right text-slate-400">
                      <div>Last Heartbeat</div>
                      <div className="font-mono text-[11px]">{new Date(inst.lastHeartbeatAt).toLocaleTimeString()}</div>
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="mt-4 flex justify-end">
              <button
                type="button"
                onClick={() => setInspectLicense(null)}
                className="rounded-xl bg-slate-100 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-200"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
