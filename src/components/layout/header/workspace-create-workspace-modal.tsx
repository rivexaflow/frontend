"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { AdminModal } from "@/features/super-admin/components/admin-modal";
import { crm } from "@/features/workspace/components/crm/crm-styles";
import { uiStore } from "@/stores/ui.store";
import { cn } from "@/lib/utils/cn";
import { apiClient } from "@/lib/api/client";

type Props = {
  open: boolean;
  onClose: () => void;
  onSuccess?: () => void;
};

export function WorkspaceCreateWorkspaceModal({ open, onClose, onSuccess }: Props) {
  const router = useRouter();
  const [mode, setMode] = useState<"create" | "restore">("create");
  const [name, setName] = useState("");
  const [customDomain, setCustomDomain] = useState(false);
  const [domainName, setDomainName] = useState("");
  const [industry, setIndustry] = useState("other");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Restore backup state variables
  type BackupCompany = {
    name: string;
    industry: string;
    description?: string | null;
    logo?: string | null;
    website?: string | null;
    size?: string | null;
    modules?: string[];
    defaultLanguage?: string;
    defaultCurrency?: string;
    brandName?: string | null;
    themeConfig?: Record<string, unknown> | null;
    salaryCycleStartDay?: number;
  };

  type BackupData = {
    version: string;
    backupDate: string;
    company: BackupCompany;
    roles?: unknown[];
    branches?: unknown[];
    departments?: unknown[];
    teams?: unknown[];
  };

  const [backupData, setBackupData] = useState<BackupData | null>(null);
  const [backupError, setBackupError] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setBackupError(null);
    setBackupData(null);

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target?.result as string;
        const parsed = JSON.parse(text) as BackupData;
        if (!parsed || !parsed.company || !parsed.company.name) {
          setBackupError("Invalid backup file: Missing company configuration data.");
          return;
        }
        setBackupData(parsed);
      } catch {
        setBackupError("Invalid backup file: Failed to parse JSON configuration.");
      }
    };
    reader.readAsText(file);
  };

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    try {
      setIsSubmitting(true);
      setError(null);
      
      const payload = {
        name: name.trim(),
        industry,
        customDomain: customDomain && domainName.trim() ? domainName.trim().toLowerCase() : null,
      };

      const { data } = await apiClient.post("/company", payload);
      
      if (data.success && data.data) {
        uiStore.getState().pushNotification(`Workspace “${name.trim()}” created successfully.`);
        setName("");
        setCustomDomain(false);
        setDomainName("");
        setIndustry("other");
        onClose();
        
        if (onSuccess) {
          onSuccess();
        }
        
        router.push(`/${data.data.slug}/dashboard`);
      }
    } catch (err: unknown) {
      const errorMsg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message || (err as Error).message || "Failed to create workspace.";
      setError(errorMsg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const onRestoreSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!backupData) return;
    try {
      setIsSubmitting(true);
      setError(null);

      const { data } = await apiClient.post("/company/restore", {
        backup: backupData
      });

      if (data.success && data.data) {
        uiStore.getState().pushNotification(`Workspace “${data.data.name}” restored successfully.`);
        setBackupData(null);
        onClose();
        if (onSuccess) onSuccess();
        router.push(`/${data.data.slug}/dashboard`);
      }
    } catch (err: unknown) {
      const errorMsg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message || (err as Error).message || "Failed to restore workspace.";
      setError(errorMsg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AdminModal
      open={open}
      title={mode === "create" ? "Create new workspace" : "Restore from backup"}
      description={mode === "create" 
        ? "Spin up a separate workspace for another team or business unit." 
        : "Upload your backup file to recreate your workspace structure."
      }
      onClose={onClose}
      className="sm:max-w-md"
    >
      <div className="flex border-b border-slate-100 dark:border-slate-800 mb-4">
        <button
          type="button"
          onClick={() => { setMode("create"); setError(null); }}
          className={cn(
            "flex-1 pb-2 text-sm font-bold border-b-2 transition duration-200",
            mode === "create"
              ? "border-[#191970] text-[#191970] dark:border-[#2277ff] dark:text-[#2277ff]"
              : "border-transparent text-slate-400 hover:text-slate-600"
          )}
        >
          Create New
        </button>
        <button
          type="button"
          onClick={() => { setMode("restore"); setError(null); }}
          className={cn(
            "flex-1 pb-2 text-sm font-bold border-b-2 transition duration-200",
            mode === "restore"
              ? "border-[#191970] text-[#191970] dark:border-[#2277ff] dark:text-[#2277ff]"
              : "border-transparent text-slate-400 hover:text-slate-600"
          )}
        >
          Restore Backup
        </button>
      </div>

      {mode === "create" ? (
        <form onSubmit={onSubmit} className="space-y-4">
          {error && (
            <div className="rounded-xl border border-rose-100 bg-rose-50 p-3 text-xs font-semibold text-rose-700">
              {error}
            </div>
          )}

          <div>
            <label htmlFor="workspace-name" className="mb-1.5 block text-sm font-semibold text-slate-800">
              Name
            </label>
            <input
              id="workspace-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter workspace name"
              className={cn(crm.input, "w-full")}
              required
              disabled={isSubmitting}
            />
          </div>

          <div>
            <label htmlFor="workspace-industry" className="mb-1.5 block text-sm font-semibold text-slate-800">
              Industry
            </label>
            <select
              id="workspace-industry"
              className={cn(crm.select, "w-full h-9 text-sm")}
              value={industry}
              onChange={(e) => setIndustry(e.target.value)}
              disabled={isSubmitting}
            >
              <option value="other">Other / General</option>
              <option value="saas">SaaS / Tech</option>
              <option value="ecommerce">E-Commerce</option>
              <option value="real_estate">Real Estate</option>
              <option value="agency">Agency / Consulting</option>
            </select>
          </div>

          <label className="flex items-center justify-between gap-3 rounded-xl border border-slate-200/90 bg-slate-50/60 px-4 py-3">
            <span className="text-sm font-medium text-slate-700">Custom domain enable</span>
            <button
              type="button"
              role="switch"
              aria-checked={customDomain}
              onClick={() => setCustomDomain((v) => !v)}
              className={cn(
                "relative h-6 w-11 shrink-0 rounded-full transition",
                customDomain ? "bg-[#191970]" : "bg-slate-200",
              )}
              disabled={isSubmitting}
            >
              <span
                className={cn(
                  "absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition",
                  customDomain ? "left-[22px]" : "left-0.5",
                )}
              />
            </button>
          </label>

          {customDomain && (
            <div>
              <label htmlFor="custom-domain-name" className="mb-1.5 block text-sm font-semibold text-slate-800">
                Domain Name
              </label>
              <input
                id="custom-domain-name"
                value={domainName}
                onChange={(e) => setDomainName(e.target.value)}
                placeholder="e.g. portal.mycompany.com"
                className={cn(crm.input, "w-full")}
                required
                disabled={isSubmitting}
              />
            </div>
          )}

          <div className="flex flex-col-reverse gap-2.5 pt-2 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="rounded-xl bg-slate-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-700 disabled:opacity-60"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !name.trim()}
              className="rounded-xl bg-[#191970] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#050a1f] disabled:opacity-60"
            >
              {isSubmitting ? "Creating…" : "Create"}
            </button>
          </div>
        </form>
      ) : (
        <form onSubmit={onRestoreSubmit} className="space-y-4">
          {error && (
            <div className="rounded-xl border border-rose-100 bg-rose-50 p-3 text-xs font-semibold text-rose-700">
              {error}
            </div>
          )}

          {backupError && (
            <div className="rounded-xl border border-rose-100 bg-rose-50 p-3 text-xs font-semibold text-rose-700">
              {backupError}
            </div>
          )}

          <div>
            <label htmlFor="backup-file" className="mb-1.5 block text-sm font-semibold text-slate-800">
              Select Backup JSON File
            </label>
            <input
              id="backup-file"
              type="file"
              accept=".json"
              onChange={handleFileChange}
              className={cn(crm.input, "w-full py-1.5")}
              required
              disabled={isSubmitting}
            />
          </div>

          {backupData && (
            <div className="rounded-xl border border-blue-100 bg-blue-50/50 p-4 dark:border-blue-950/20 dark:bg-blue-950/10 text-xs space-y-2">
              <span className="block font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wide">Backup Summary</span>
              <div className="grid grid-cols-2 gap-2 text-slate-600 dark:text-slate-400 font-medium">
                <div>Workspace Name:</div>
                <div className="font-bold text-slate-800 dark:text-slate-200">{backupData.company.name}</div>

                <div>Industry:</div>
                <div className="capitalize">{backupData.company.industry}</div>

                <div>Custom Roles:</div>
                <div>{backupData.roles?.length || 0}</div>

                <div>Branches:</div>
                <div>{backupData.branches?.length || 0}</div>

                <div>Departments:</div>
                <div>{backupData.departments?.length || 0}</div>

                <div>Teams:</div>
                <div>{backupData.teams?.length || 0}</div>
              </div>
            </div>
          )}

          <div className="flex flex-col-reverse gap-2.5 pt-2 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="rounded-xl bg-slate-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-700 disabled:opacity-60"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !backupData}
              className="rounded-xl bg-[#191970] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#050a1f] disabled:opacity-60"
            >
              {isSubmitting ? "Restoring…" : "Restore"}
            </button>
          </div>
        </form>
      )}
    </AdminModal>
  );
}

