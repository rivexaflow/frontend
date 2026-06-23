"use client";

import { useEffect, useState } from "react";
import { apiClient } from "@/lib/api/client";
import { crm } from "@/features/workspace/components/crm/crm-styles";
import { cn } from "@/lib/utils/cn";
import { uiStore } from "@/stores/ui.store";
import { AdminModal } from "@/features/super-admin/components/admin-modal";
import { AlertTriangle } from "lucide-react";

type Props = {
  companyId: string;
};

const INDUSTRIES = [
  { value: "real_estate", label: "Real Estate" },
  { value: "agency", label: "Agency" },
  { value: "consulting", label: "Consulting" },
  { value: "ecommerce", label: "E-Commerce" },
  { value: "saas", label: "SaaS / Tech" },
  { value: "healthcare", label: "Healthcare" },
  { value: "education", label: "Education" },
  { value: "shop", label: "Retail / Shop" },
  { value: "hospital", label: "Hospital" },
  { value: "import_export", label: "Import / Export" },
  { value: "other", label: "Other" },
];

const SIZES = [
  { value: "STARTUP", label: "Startup (1-10)" },
  { value: "SMALL", label: "Small (11-50)" },
  { value: "MEDIUM", label: "Medium (51-200)" },
  { value: "LARGE", label: "Large (201-1000)" },
  { value: "ENTERPRISE", label: "Enterprise (1000+)" },
];

const LANGUAGES = [
  { value: "en", label: "English" },
  { value: "es", label: "Español (Spanish)" },
  { value: "ar", label: "العربية (Arabic)" },
  { value: "hi", label: "हिन्दी (Hindi)" },
  { value: "ur", label: "اردو (Urdu)" },
];

const CURRENCIES = [
  { value: "USD", label: "USD - US Dollar ($)" },
  { value: "EUR", label: "EUR - Euro (€)" },
  { value: "INR", label: "INR - Indian Rupee (₹)" },
  { value: "GBP", label: "GBP - British Pound (£)" },
];

const TIMEZONES = [
  { value: "UTC", label: "UTC (GMT+00:00)" },
  { value: "EST", label: "EST (GMT-05:00)" },
  { value: "GMT", label: "GMT (GMT+00:00)" },
  { value: "IST", label: "IST (GMT+05:30)" },
  { value: "PST", label: "PST (GMT-08:00)" },
];

export function SettingsProfileTab({ companyId }: Props) {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [rawThemeConfig, setRawThemeConfig] = useState<Record<string, unknown>>({});

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [confirmBackup, setConfirmBackup] = useState(true);
  const [confirmName, setConfirmName] = useState("");
  const [deleting, setDeleting] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    website: "",
    industry: "other",
    size: "STARTUP",
    defaultLanguage: "en",
    defaultCurrency: "INR",
    timezone: "IST",
  });

  useEffect(() => {
    async function loadCompany() {
      try {
        setLoading(true);
        const { data } = await apiClient.get(`/company/${companyId}`);
        if (data.success && data.data) {
          const c = data.data;
          const configObj = c.themeConfig && typeof c.themeConfig === "object"
            ? (c.themeConfig as Record<string, unknown>)
            : {};
          setRawThemeConfig(configObj);
          
          setFormData({
            name: c.name || "",
            description: c.description || "",
            website: c.website || "",
            industry: c.industry || "other",
            size: c.size || "STARTUP",
            defaultLanguage: c.defaultLanguage || "en",
            defaultCurrency: c.defaultCurrency || "INR",
            timezone: (configObj.timezone as string) || "IST",
          });
        }
      } catch (err: unknown) {
        const errorMsg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message || (err as Error).message || "Failed to load company profile.";
        setError(errorMsg);
      } finally {
        setLoading(false);
      }
    }
    loadCompany();
  }, [companyId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.industry) return;
    try {
      setSaving(true);
      setError(null);
      
      const themeConfig = {
        ...rawThemeConfig,
        timezone: formData.timezone,
      };

      const payload = {
        name: formData.name,
        description: formData.description,
        website: formData.website,
        industry: formData.industry,
        size: formData.size,
        defaultLanguage: formData.defaultLanguage,
        defaultCurrency: formData.defaultCurrency,
        themeConfig,
      };

      const { data } = await apiClient.put(`/company/${companyId}`, payload);
      if (data.success) {
        uiStore.getState().pushNotification("Company profile updated successfully.");
      }
    } catch (err: unknown) {
      const errorMsg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message || (err as Error).message || "Failed to update profile.";
      setError(errorMsg);
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteWorkspace = async (e: React.FormEvent) => {
    e.preventDefault();
    if (confirmName !== formData.name) return;
    try {
      setDeleting(true);
      setError(null);

      if (confirmBackup) {
        // Trigger file download of backup
        const response = await apiClient.get(`/company/${companyId}/backup`, { responseType: "blob" });
        const blob = new Blob([response.data], { type: "application/json" });
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = `backup-${formData.name.toLowerCase().replace(/\s+/g, "-")}.json`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
      }

      // Execute soft-delete
      await apiClient.delete(`/company/${companyId}`);
      uiStore.getState().pushNotification("Workspace deleted successfully.");
      
      setShowDeleteModal(false);
      // Redirect to onboarding page
      window.location.href = "/onboarding";

    } catch (err: unknown) {
      const errorMsg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message || (err as Error).message || "Failed to delete workspace.";
      uiStore.getState().pushNotification(errorMsg);
      setError(errorMsg);
    } finally {
      setDeleting(false);
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
      <div className={cn(crm.panel, "p-6")}>
      <div className="border-b border-slate-100 pb-4 dark:border-slate-800">
        <h2 className="text-base font-bold text-slate-900 dark:text-white">General Settings</h2>
        <p className="text-xs text-slate-500">Configure your company name, website, timezone, and defaults.</p>
      </div>

      <form onSubmit={handleSubmit} className="mt-6 space-y-4 max-w-xl">
        {error && (
          <div className="rounded-xl border border-rose-100 bg-rose-50 p-3.5 text-xs font-semibold text-rose-700 dark:border-rose-950/30 dark:bg-rose-950/20">
            {error}
          </div>
        )}

        <div>
          <label htmlFor="company-name" className="mb-1.5 block text-xs font-bold uppercase tracking-[0.14em] text-slate-400">
            Company Name
          </label>
          <input
            id="company-name"
            type="text"
            className={cn(crm.input, "w-full")}
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required
            placeholder="e.g. Acme Corporation"
          />
        </div>

        <div>
          <label htmlFor="company-website" className="mb-1.5 block text-xs font-bold uppercase tracking-[0.14em] text-slate-400">
            Website URL
          </label>
          <input
            id="company-website"
            type="url"
            className={cn(crm.input, "w-full")}
            value={formData.website}
            onChange={(e) => setFormData({ ...formData, website: e.target.value })}
            placeholder="https://example.com"
          />
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label htmlFor="company-industry" className="mb-1.5 block text-xs font-bold uppercase tracking-[0.14em] text-slate-400">
              Industry
            </label>
            <div className="relative">
              <select
                id="company-industry"
                className={cn(crm.select, "w-full h-9 text-sm")}
                value={formData.industry}
                onChange={(e) => setFormData({ ...formData, industry: e.target.value })}
              >
                {INDUSTRIES.map((ind) => (
                  <option key={ind.value} value={ind.value}>
                    {ind.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label htmlFor="company-size" className="mb-1.5 block text-xs font-bold uppercase tracking-[0.14em] text-slate-400">
              Company Size
            </label>
            <div className="relative">
              <select
                id="company-size"
                className={cn(crm.select, "w-full h-9 text-sm")}
                value={formData.size}
                onChange={(e) => setFormData({ ...formData, size: e.target.value })}
              >
                {SIZES.map((sz) => (
                  <option key={sz.value} value={sz.value}>
                    {sz.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Timezone, Default Language & Currency */}
        <div className="grid gap-4 md:grid-cols-3">
          <div>
            <label htmlFor="company-language" className="mb-1.5 block text-xs font-bold uppercase tracking-[0.14em] text-slate-400">
              Default Language
            </label>
            <div className="relative">
              <select
                id="company-language"
                className={cn(crm.select, "w-full h-9 text-sm")}
                value={formData.defaultLanguage}
                onChange={(e) => setFormData({ ...formData, defaultLanguage: e.target.value })}
              >
                {LANGUAGES.map((lang) => (
                  <option key={lang.value} value={lang.value}>
                    {lang.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label htmlFor="company-currency" className="mb-1.5 block text-xs font-bold uppercase tracking-[0.14em] text-slate-400">
              Default Currency
            </label>
            <div className="relative">
              <select
                id="company-currency"
                className={cn(crm.select, "w-full h-9 text-sm")}
                value={formData.defaultCurrency}
                onChange={(e) => setFormData({ ...formData, defaultCurrency: e.target.value })}
              >
                {CURRENCIES.map((curr) => (
                  <option key={curr.value} value={curr.value}>
                    {curr.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label htmlFor="company-timezone" className="mb-1.5 block text-xs font-bold uppercase tracking-[0.14em] text-slate-400">
              Timezone
            </label>
            <div className="relative">
              <select
                id="company-timezone"
                className={cn(crm.select, "w-full h-9 text-sm")}
                value={formData.timezone}
                onChange={(e) => setFormData({ ...formData, timezone: e.target.value })}
              >
                {TIMEZONES.map((tz) => (
                  <option key={tz.value} value={tz.value}>
                    {tz.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        <div>
          <label htmlFor="company-description" className="mb-1.5 block text-xs font-bold uppercase tracking-[0.14em] text-slate-400">
            Description
          </label>
          <textarea
            id="company-description"
            rows={4}
            className={cn(crm.input, "w-full h-auto py-2 px-3 text-sm resize-none")}
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            placeholder="Brief description of your business..."
          />
        </div>

        <div className="pt-2">
          <button
            type="submit"
            disabled={saving || !formData.name.trim()}
            className={cn(crm.btnPrimary, "px-6")}
          >
            {saving ? "Saving Changes..." : "Save Changes"}
          </button>
        </div>
      </form>
    </div>

    {/* Danger Zone */}
    <div className={cn(crm.panel, "p-6 border-rose-200 bg-rose-50/5 dark:bg-rose-950/5 dark:border-rose-900/30")}>
      <div className="border-b border-rose-100 pb-4 dark:border-rose-950/20">
        <h2 className="text-base font-bold text-rose-700 dark:text-rose-400 flex items-center gap-2">
          <AlertTriangle className="h-5 w-5 text-rose-600" />
          Danger Zone
        </h2>
        <p className="text-xs text-slate-500 mt-1">Irreversible operations on your workspace.</p>
      </div>

      <div className="mt-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="max-w-xl">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">Delete Workspace</h3>
          <p className="text-xs text-slate-500 mt-1">
            Soft-deletes this workspace. You can request recovery from a Super Admin within 30 days. You can optionally download a backup configuration first.
          </p>
        </div>
        <button
          type="button"
          onClick={() => {
            setConfirmName("");
            setShowDeleteModal(true);
          }}
          className="rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold uppercase tracking-wider py-2.5 px-5 transition duration-200 shrink-0 shadow-sm"
        >
          Delete Workspace
        </button>
      </div>
    </div>

    {/* Delete Workspace Confirmation Modal */}
    <AdminModal
      open={showDeleteModal}
      title="Delete Workspace"
      description={`Are you sure you want to delete "${formData.name}"? This action is irreversible for users without backups.`}
      onClose={() => {
        if (!deleting) setShowDeleteModal(false);
      }}
      className="sm:max-w-md"
    >
      <form onSubmit={handleDeleteWorkspace} className="space-y-4">
        <label className="flex items-center gap-3 rounded-xl border border-slate-200/90 bg-slate-50/60 px-4 py-3 dark:border-slate-800 dark:bg-slate-950/40">
          <input
            type="checkbox"
            checked={confirmBackup}
            onChange={(e) => setConfirmBackup(e.target.checked)}
            className="h-4 w-4 rounded border-slate-300 text-[#191970] focus:ring-[#191970] dark:border-slate-700 dark:bg-slate-900"
            disabled={deleting}
          />
          <div className="text-xs">
            <span className="block font-bold text-slate-700 dark:text-slate-300">Download structural backup config</span>
            <span className="block text-slate-400 mt-0.5">Recommended: download to restore this setup on a new workspace.</span>
          </div>
        </label>

        <div>
          <label htmlFor="confirm-workspace-name" className="mb-1.5 block text-xs font-bold uppercase tracking-[0.14em] text-slate-400">
            Confirm Workspace Name
          </label>
          <input
            id="confirm-workspace-name"
            value={confirmName}
            onChange={(e) => setConfirmName(e.target.value)}
            placeholder={`Type "${formData.name}" to confirm`}
            className={cn(crm.input, "w-full")}
            required
            disabled={deleting}
            autoComplete="off"
          />
        </div>

        <div className="flex flex-col-reverse gap-2.5 pt-2 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={() => setShowDeleteModal(false)}
            disabled={deleting}
            className="rounded-xl bg-slate-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-700 disabled:opacity-60"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={deleting || confirmName !== formData.name}
            className="rounded-xl bg-rose-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-rose-700 disabled:opacity-60"
          >
            {deleting ? "Deleting..." : "Backup & Delete"}
          </button>
        </div>
      </form>
    </AdminModal>
  </div>
  );
}
