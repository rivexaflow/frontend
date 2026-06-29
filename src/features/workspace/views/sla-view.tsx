"use client";

import { useEffect, useState, useCallback } from "react";
import { ShieldCheck, Plus, CheckCircle, RefreshCw, AlertCircle, Clock, Trash2 } from "lucide-react";
import { apiClient } from "@/lib/api/client";
import { useHrCompanyId } from "@/features/workspace/hooks/use-hr-company-id";

type SlaPolicy = {
  id: string;
  name: string;
  department?: string;
  priority: string;
  maxFirstResponseMin: number;
  maxResolutionMin: number;
  warningLeadMin: number;
  businessHoursOnly: boolean;
  isActive: boolean;
  escalationManager?: { fullName: string; email: string };
};

export function SlaView() {
  const companyId = useHrCompanyId();
  const [policies, setPolicies] = useState<SlaPolicy[]>([]);
  const [loading, setLoading] = useState(true);
  const [policyModal, setPolicyModal] = useState(false);

  // Form state
  const [newPolicy, setNewPolicy] = useState({
    name: "",
    department: "",
    priority: "HIGH",
    maxFirstResponseMin: "30",
    maxResolutionMin: "240",
    warningLeadMin: "15",
    escalationManagerId: "",
    businessHoursOnly: true
  });
  const [users, setUsers] = useState<any[]>([]);

  const loadData = useCallback(async () => {
    if (!companyId) return;
    setLoading(true);
    try {
      const [polRes, usrRes] = await Promise.all([
        apiClient.get(`/support/sla/policies/${companyId}`),
        apiClient.get(`/admin/users`).catch(() => ({ data: { data: [] } }))
      ]);
      setPolicies(polRes.data?.data || []);
      setUsers(usrRes.data?.data || []);
      if (usrRes.data?.data?.length > 0) {
        setNewPolicy(p => ({ ...p, escalationManagerId: usrRes.data.data[0].id }));
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [companyId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleCreatePolicy = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await apiClient.post("/support/sla/policies", {
        ...newPolicy,
        companyId,
        maxFirstResponseMin: parseFloat(newPolicy.maxFirstResponseMin),
        maxResolutionMin: parseFloat(newPolicy.maxResolutionMin),
        warningLeadMin: parseFloat(newPolicy.warningLeadMin)
      });
      setPolicyModal(false);
      setNewPolicy({
        name: "",
        department: "",
        priority: "HIGH",
        maxFirstResponseMin: "30",
        maxResolutionMin: "240",
        warningLeadMin: "15",
        escalationManagerId: users[0]?.id || "",
        businessHoursOnly: true
      });
      loadData();
    } catch (err: any) {
      alert("Failed to create policy: " + (err.response?.data?.error || err.message));
    }
  };

  return (
    <div className="space-y-6">
      {/* Header bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200/60 pb-4 dark:border-slate-800">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">Service Level Agreements (SLA)</h1>
          <p className="mt-1 text-sm text-slate-500">Configure escalation criteria, response milestones, and monitor ticket breach timings.</p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => setPolicyModal(true)} className="flex items-center gap-1.5 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700">
            <Plus className="h-4 w-4" /> Create SLA Policy
          </button>
          <button onClick={loadData} className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 bg-white hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900">
            <RefreshCw className="h-4 w-4" />
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex h-64 items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent" />
        </div>
      ) : (
        <div className="rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900 overflow-hidden">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-xs uppercase text-slate-700 dark:bg-slate-800 dark:text-slate-300">
              <tr>
                <th className="px-6 py-4">Policy Name</th>
                <th className="px-6 py-4">Department / Priority</th>
                <th className="px-6 py-4">First Response Limit</th>
                <th className="px-6 py-4">Resolution Limit</th>
                <th className="px-6 py-4">Escalation Manager</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {policies.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-slate-500">No active SLA policies configured.</td>
                </tr>
              ) : (
                policies.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-50 dark:hover:bg-slate-850">
                    <td className="px-6 py-4 font-semibold text-slate-900 dark:text-white">{p.name}</td>
                    <td className="px-6 py-4">
                      <span className="text-xs uppercase bg-slate-100 text-slate-800 rounded px-1.5 py-0.5 mr-1 font-bold">{p.department || "All"}</span>
                      <span className={`text-xs rounded px-1.5 py-0.5 font-bold ${p.priority === "URGENT" || p.priority === "HIGH" ? "bg-red-50 text-red-700" : "bg-amber-50 text-amber-700"}`}>{p.priority}</span>
                    </td>
                    <td className="px-6 py-4 font-mono font-bold text-slate-700 dark:text-slate-300">{p.maxFirstResponseMin} mins</td>
                    <td className="px-6 py-4 font-mono text-slate-500">{p.maxResolutionMin} mins</td>
                    <td className="px-6 py-4 text-xs text-slate-500">{p.escalationManager?.fullName || "Not assigned"}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Policy Modal */}
      {policyModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <form onSubmit={handleCreatePolicy} className="w-full max-w-md rounded-xl bg-white p-6 dark:bg-slate-900">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4">Create Support SLA Policy</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-500">Policy Name</label>
                <input required type="text" value={newPolicy.name} onChange={e => setNewPolicy(p => ({ ...p, name: e.target.value }))} className="mt-1 w-full rounded-lg border border-slate-200 p-2.5 dark:border-slate-800" placeholder="e.g. VIP Customer Urgent SLA" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-500">Priority Tier</label>
                  <select value={newPolicy.priority} onChange={e => setNewPolicy(p => ({ ...p, priority: e.target.value }))} className="mt-1 w-full rounded-lg border border-slate-200 p-2.5 dark:border-slate-800 dark:bg-slate-800">
                    <option value="LOW">LOW</option>
                    <option value="MEDIUM">MEDIUM</option>
                    <option value="HIGH">HIGH</option>
                    <option value="URGENT">URGENT</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-500">Department</label>
                  <input type="text" value={newPolicy.department} onChange={e => setNewPolicy(p => ({ ...p, department: e.target.value }))} className="mt-1 w-full rounded-lg border border-slate-200 p-2.5 dark:border-slate-800" placeholder="e.g. Support" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-500">First Resp. (Mins)</label>
                  <input required type="number" value={newPolicy.maxFirstResponseMin} onChange={e => setNewPolicy(p => ({ ...p, maxFirstResponseMin: e.target.value }))} className="mt-1 w-full rounded-lg border border-slate-200 p-2.5 dark:border-slate-800" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-500">Resolution (Mins)</label>
                  <input required type="number" value={newPolicy.maxResolutionMin} onChange={e => setNewPolicy(p => ({ ...p, maxResolutionMin: e.target.value }))} className="mt-1 w-full rounded-lg border border-slate-200 p-2.5 dark:border-slate-800" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-500">Escalation Contact</label>
                <select required value={newPolicy.escalationManagerId} onChange={e => setNewPolicy(p => ({ ...p, escalationManagerId: e.target.value }))} className="mt-1 w-full rounded-lg border border-slate-200 p-2.5 dark:border-slate-800 dark:bg-slate-800">
                  <option value="">Select Manager</option>
                  {users.map(u => (
                    <option key={u.id} value={u.id}>{u.fullName} ({u.email})</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="mt-6 flex justify-end gap-3 border-t pt-4">
              <button type="button" onClick={() => setPolicyModal(false)} className="rounded-lg px-4 py-2 text-sm border border-slate-200 hover:bg-slate-50">Cancel</button>
              <button type="submit" className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700">Save SLA Policy</button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
