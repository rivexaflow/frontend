"use client";

import { useEffect, useState } from "react";
import { apiClient } from "@/lib/api/client";
import { crm } from "@/features/workspace/components/crm/crm-styles";
import { cn } from "@/lib/utils/cn";
import { uiStore } from "@/stores/ui.store";
import { Key, Copy, Check, Trash2, Info } from "lucide-react";

type Props = {
  companyId: string;
};

type ApiKey = {
  id: string;
  name: string;
  key: string;
  createdAt: string;
};

export function SettingsApiKeysTab({ companyId }: Props) {
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // States
  const [keysList, setKeysList] = useState<ApiKey[]>([]);
  const [newKeyName, setNewKeyName] = useState("");
  
  // Generated Key temporary storage (shown only once)
  const [generatedKey, setGeneratedKey] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    async function loadKeys() {
      try {
        setLoading(true);
        const { data } = await apiClient.get(`/company/${companyId}/api-keys`);
        if (data.success) {
          setKeysList(data.data || []);
        }
      } catch (err: unknown) {
        const errorMsg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message || (err as Error).message || "Failed to load API keys.";
        setError(errorMsg);
      } finally {
        setLoading(false);
      }
    }
    loadKeys();
  }, [companyId]);

  const handleGenerateKey = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newKeyName.trim()) return;
    try {
      setGenerating(true);
      setError(null);
      setGeneratedKey(null);
      setCopied(false);
      
      const { data } = await apiClient.post(`/company/${companyId}/api-keys`, {
        name: newKeyName.trim(),
      });
      
      if (data.success) {
        uiStore.getState().pushNotification("API Key generated successfully.");
        setGeneratedKey(data.data.key);
        setKeysList([data.data, ...keysList]);
        setNewKeyName("");
      }
    } catch (err: unknown) {
      const errorMsg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message || (err as Error).message || "Failed to generate API Key.";
      setError(errorMsg);
    } finally {
      setGenerating(false);
    }
  };

  const handleRevokeKey = async (keyId: string, keyName: string) => {
    if (!confirm(`Are you sure you want to revoke API Key "${keyName}"? This action cannot be undone.`)) return;
    try {
      setError(null);
      const { data } = await apiClient.delete(`/company/${companyId}/api-keys/${keyId}`);
      if (data.success) {
        uiStore.getState().pushNotification(`API Key "${keyName}" revoked.`);
        setKeysList(keysList.filter((k) => k.id !== keyId));
      }
    } catch (err: unknown) {
      const errorMsg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message || (err as Error).message || "Failed to revoke API Key.";
      setError(errorMsg);
    }
  };

  const copyToClipboard = () => {
    if (!generatedKey) return;
    navigator.clipboard.writeText(generatedKey);
    setCopied(true);
    uiStore.getState().pushNotification("API Key copied to clipboard.");
    setTimeout(() => setCopied(false), 2000);
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

      {/* Generate API Key Panel */}
      <div className={cn(crm.panel, "p-6")}>
        <div className="border-b border-slate-100 pb-4 dark:border-slate-800">
          <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Key className="h-5 w-5 text-indigo-600" />
            API Keys & Integrations
          </h2>
          <p className="text-xs text-slate-500">
            Generate and manage API keys to build workflows, query analytics or connect external applications.
          </p>
        </div>

        {/* Generate Form */}
        <form onSubmit={handleGenerateKey} className="mt-5 max-w-xl space-y-4">
          <div>
            <label htmlFor="api-key-name" className="mb-1.5 block text-xs font-bold uppercase tracking-[0.14em] text-slate-400">
              Key Name / Description
            </label>
            <div className="flex gap-3">
              <input
                id="api-key-name"
                type="text"
                className={cn(crm.input, "flex-1")}
                value={newKeyName}
                onChange={(e) => setNewKeyName(e.target.value)}
                placeholder="e.g. Zapier Production Key"
                required
              />
              <button
                type="submit"
                disabled={generating || !newKeyName.trim()}
                className={cn(crm.btnPrimary)}
              >
                {generating ? "Generating..." : "Generate Key"}
              </button>
            </div>
          </div>
        </form>

        {/* Generated Key Callout (Shown only once) */}
        {generatedKey && (
          <div className="mt-5 rounded-xl border border-emerald-100 bg-emerald-50/50 p-4 dark:border-emerald-950/20 dark:bg-emerald-950/10">
            <div className="flex flex-col gap-2.5">
              <div className="flex items-center gap-2 text-emerald-800 dark:text-emerald-400 text-xs font-bold">
                <Info className="h-4 w-4" />
                Please copy your API key now. It will not be shown again.
              </div>
              <div className="flex items-center gap-2 bg-white border border-slate-200/60 rounded-xl p-2.5 dark:border-slate-800 dark:bg-slate-950">
                <code className="flex-1 font-mono text-sm text-slate-900 break-all select-all dark:text-slate-100">
                  {generatedKey}
                </code>
                <button
                  type="button"
                  onClick={copyToClipboard}
                  className="shrink-0 p-1.5 rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 transition dark:border-slate-800 dark:bg-slate-900"
                  title="Copy Key"
                >
                  {copied ? <Check className="h-4 w-4 text-emerald-600" /> : <Copy className="h-4 w-4 text-slate-600" />}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Active API Keys List */}
      <div className={cn(crm.panel, "p-6")}>
        <div className="border-b border-slate-100 pb-4 dark:border-slate-800">
          <h2 className="text-base font-bold text-slate-900 dark:text-white">Active API Keys</h2>
          <p className="text-xs text-slate-500">Revoke keys that are no longer in use to prevent unauthorized access.</p>
        </div>

        <div className="mt-5">
          {keysList.length === 0 ? (
            <div className="rounded-xl border border-dashed border-slate-200 p-8 text-center text-xs text-slate-400 dark:border-slate-800">
              No API keys generated yet.
            </div>
          ) : (
            <div className="overflow-hidden border border-slate-200/60 rounded-xl dark:border-slate-800">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className={cn(crm.tableHead)}>
                    <th className="py-2.5 px-4">Key Name</th>
                    <th className="py-2.5 px-4">Token Preview</th>
                    <th className="py-2.5 px-4">Created At</th>
                    <th className="py-2.5 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {keysList.map((k) => (
                    <tr key={k.id} className={cn(crm.tableRow, "border-b border-slate-100 dark:border-slate-800/80")}>
                      <td className="py-3 px-4 font-semibold text-slate-800 dark:text-slate-200">{k.name}</td>
                      <td className="py-3 px-4">
                        <code className="text-xs bg-slate-100 px-2 py-0.5 rounded font-mono dark:bg-slate-800/50">
                          {k.key ? k.key.slice(0, 12) + "..." : "rvx_free_..."}
                        </code>
                      </td>
                      <td className="py-3 px-4 text-xs text-slate-400">
                        {new Date(k.createdAt).toLocaleDateString(undefined, {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                        })}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <button
                          type="button"
                          onClick={() => handleRevokeKey(k.id, k.name)}
                          className="text-slate-400 hover:text-rose-600 transition"
                          title="Revoke Key"
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
