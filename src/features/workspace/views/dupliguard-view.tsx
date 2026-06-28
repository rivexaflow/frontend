"use client";

import { useEffect, useState, useCallback } from "react";
import { ShieldCheck, Play, RefreshCw, Settings, AlertTriangle, Layers, UserCheck } from "lucide-react";
import { apiClient } from "@/lib/api/client";
import { useHrCompanyId } from "@/features/workspace/hooks/use-hr-company-id";

type Scorecard = {
  totalGroups: number;
  leadDuplicates: number;
  customerDuplicates: number;
  contactDuplicates: number;
};

type ScanLog = {
  id: string;
  status: string;
  groupsFoundCount: number;
  duplicatesFoundCount: number;
  completedAt?: string;
};

type Activity = {
  id: string;
  type: string;
  message: string;
  timestamp: string;
};

export function DupliGuardView() {
  const companyId = useHrCompanyId();
  const [scorecard, setScorecard] = useState<Scorecard>({ totalGroups: 0, leadDuplicates: 0, customerDuplicates: 0, contactDuplicates: 0 });
  const [lastScan, setLastScan] = useState<ScanLog | null>(null);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [scanning, setScanning] = useState(false);
  const [settingsModal, setSettingsModal] = useState(false);

  // Settings states
  const [settings, setSettings] = useState({
    scanLeads: true,
    scanCustomers: true,
    scanContacts: true,
    ruleEmail: true,
    rulePhone: true,
    ruleDomain: true,
    minScore: "MEDIUM",
    cronEnabled: false
  });

  const loadDashboard = useCallback(async () => {
    if (!companyId) return;
    setLoading(true);
    try {
      const [dashRes, setRes] = await Promise.all([
        apiClient.get(`/api/dupliguard/dashboard/${companyId}`),
        apiClient.get(`/api/dupliguard/settings/${companyId}`),
      ]);
      if (dashRes.data?.success) {
        setScorecard(dashRes.data.data.scorecard || { totalGroups: 0, leadDuplicates: 0, customerDuplicates: 0, contactDuplicates: 0 });
        setLastScan(dashRes.data.data.lastScan);
        setActivities(dashRes.data.data.recentActivity || []);
      }
      if (setRes.data?.success) {
        setSettings(setRes.data.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [companyId]);

  useEffect(() => {
    loadDashboard();
  }, [loadDashboard]);

  const handleRunScan = async () => {
    if (!companyId) return;
    setScanning(true);
    try {
      await apiClient.post(`/api/dupliguard/scan/${companyId}`);
      alert("Manual scan triggered successfully!");
      // Poll status or reload
      setTimeout(() => {
        loadDashboard();
        setScanning(false);
      }, 3000);
    } catch (err) {
      alert("Failed to run database scan");
      setScanning(false);
    }
  };

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await apiClient.put(`/api/dupliguard/settings/${companyId}`, settings);
      setSettingsModal(false);
      loadDashboard();
    } catch (err) {
      alert("Failed to update scanner settings");
    }
  };

  return (
    <div className="space-y-6">
      {/* Header bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200/60 pb-4 dark:border-slate-800">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">DupliGuard Checker</h1>
          <p className="mt-1 text-sm text-slate-500">Scan lead databases for duplicate records, analyze scoring metrics, and auto-merge contact logs.</p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => setSettingsModal(true)} className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-semibold hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900">
            <Settings className="h-4 w-4" /> Config rules
          </button>
          <button onClick={handleRunScan} disabled={scanning} className="flex items-center gap-1.5 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700 disabled:opacity-50">
            <Play className="h-4 w-4" /> {scanning ? "Scanning..." : "Trigger Scan"}
          </button>
          <button onClick={loadDashboard} className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 bg-white hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900">
            <RefreshCw className="h-4 w-4" />
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex h-64 items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent" />
        </div>
      ) : (
        <div className="space-y-6">
          {/* Dashboard scorecards */}
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
              <span className="block text-xs font-bold text-slate-400 uppercase">Imbalanced Groups</span>
              <strong className="text-2xl font-extrabold text-slate-900 dark:text-white mt-1 block">{scorecard.totalGroups}</strong>
            </div>
            <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
              <span className="block text-xs font-bold text-slate-400 uppercase">Leads Duplicates</span>
              <strong className="text-2xl font-extrabold text-slate-900 dark:text-white mt-1 block">{scorecard.leadDuplicates}</strong>
            </div>
            <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
              <span className="block text-xs font-bold text-slate-400 uppercase">Customer Duplicates</span>
              <strong className="text-2xl font-extrabold text-slate-900 dark:text-white mt-1 block">{scorecard.customerDuplicates}</strong>
            </div>
            <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
              <span className="block text-xs font-bold text-slate-400 uppercase">Contact Duplicates</span>
              <strong className="text-2xl font-extrabold text-slate-900 dark:text-white mt-1 block">{scorecard.contactDuplicates}</strong>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Status & Settings */}
            <div className="lg:col-span-2 space-y-4">
              <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
                <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-4">Latest Scan Overview</h3>
                {lastScan ? (
                  <div className="space-y-4">
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-slate-500">Scan Status</span>
                      <span className="rounded bg-indigo-50 text-indigo-700 px-2 py-0.5 text-xs font-bold">{lastScan.status}</span>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-slate-500">Duplicates Checked</span>
                      <span className="font-bold text-slate-900 dark:text-white">{lastScan.duplicatesFoundCount}</span>
                    </div>
                    {lastScan.completedAt && (
                      <div className="text-xs text-slate-400 pt-2 border-t">
                        Ran on: {new Date(lastScan.completedAt).toLocaleString()}
                      </div>
                    )}
                  </div>
                ) : (
                  <p className="text-sm text-slate-500">No database scans run yet. Trigger a manual check.</p>
                )}
              </div>
            </div>

            {/* Recent Activity logs */}
            <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 space-y-4">
              <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider">Recent Activity Logs</h3>
              <div className="space-y-3 max-h-[300px] overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800">
                {activities.length === 0 ? (
                  <p className="text-xs text-slate-500 py-4">No scan operations logged.</p>
                ) : (
                  activities.map((act) => (
                    <div key={act.id} className="pt-3 text-xs space-y-1">
                      <span className="text-[9px] font-bold text-indigo-600 block uppercase">{act.type}</span>
                      <p className="text-slate-700 dark:text-slate-300">{act.message}</p>
                      <span className="text-[9px] text-slate-400 block">{new Date(act.timestamp).toLocaleDateString()}</span>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Settings Modal */}
      {settingsModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <form onSubmit={handleSaveSettings} className="w-full max-w-md rounded-xl bg-white p-6 dark:bg-slate-900">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4">Configure DupliGuard Rules</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-slate-600 dark:text-slate-400">Scan leads catalog</label>
                <input type="checkbox" checked={settings.scanLeads} onChange={e => setSettings(p => ({ ...p, scanLeads: e.target.checked }))} />
              </div>
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-slate-600 dark:text-slate-400">Scan customer records</label>
                <input type="checkbox" checked={settings.scanCustomers} onChange={e => setSettings(p => ({ ...p, scanCustomers: e.target.checked }))} />
              </div>
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-slate-600 dark:text-slate-400">Scan contact profiles</label>
                <input type="checkbox" checked={settings.scanContacts} onChange={e => setSettings(p => ({ ...p, scanContacts: e.target.checked }))} />
              </div>
              <div className="border-t border-slate-100 dark:border-slate-800 my-4" />
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-slate-600 dark:text-slate-400">Match by Email ID</label>
                <input type="checkbox" checked={settings.ruleEmail} onChange={e => setSettings(p => ({ ...p, ruleEmail: e.target.checked }))} />
              </div>
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-slate-600 dark:text-slate-400">Match by Phone Number</label>
                <input type="checkbox" checked={settings.rulePhone} onChange={e => setSettings(p => ({ ...p, rulePhone: e.target.checked }))} />
              </div>
            </div>
            <div className="mt-6 flex justify-end gap-3 border-t pt-4">
              <button type="button" onClick={() => setSettingsModal(false)} className="rounded-lg px-4 py-2 text-sm border border-slate-200 hover:bg-slate-50">Cancel</button>
              <button type="submit" className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700">Save Configuration</button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
