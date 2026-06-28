"use client";

import { useEffect, useState, useCallback } from "react";
import { CreditCard, Plus, ArrowLeft, Calendar, FileText, CheckCircle, RefreshCw, BarChart2 } from "lucide-react";
import { apiClient } from "@/lib/api/client";
import { useHrCompanyId } from "@/features/workspace/hooks/use-hr-company-id";

type BudgetLine = {
  id: string;
  category: string;
  planned: number;
  actual?: number;
  variance?: number;
  utilization?: string;
};

type Budget = {
  id: string;
  name: string;
  description?: string;
  period: string;
  startDate: string;
  endDate: string;
  totalAmount: number;
  currency: string;
  status: string;
  lines?: BudgetLine[];
};

export function BudgetingView() {
  const companyId = useHrCompanyId();
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [selectedBudget, setSelectedBudget] = useState<Budget | null>(null);
  const [loading, setLoading] = useState(true);
  const [budgetModal, setBudgetModal] = useState(false);

  // Form states
  const [newBudget, setNewBudget] = useState({
    name: "",
    description: "",
    period: "QUARTERLY",
    startDate: new Date().toISOString().split("T")[0],
    endDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
    lines: [
      { category: "Marketing", planned: 50000 },
      { category: "Operations", planned: 100000 },
      { category: "Engineering", planned: 150000 }
    ]
  });

  const loadBudgets = useCallback(async () => {
    if (!companyId) return;
    setLoading(true);
    try {
      const res = await apiClient.get(`/api/budgeting/${companyId}/budgets`);
      if (res.data?.success) {
        setBudgets(res.data.data || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [companyId]);

  const loadBudgetDetails = useCallback(async (budgetId: string) => {
    try {
      const res = await apiClient.get(`/api/budgeting/${companyId}/budgets/${budgetId}`);
      if (res.data?.success) {
        setSelectedBudget(res.data.data);
      }
    } catch (err) {
      console.error(err);
    }
  }, [companyId]);

  useEffect(() => {
    loadBudgets();
  }, [loadBudgets]);

  const handleSelectBudget = (budget: Budget) => {
    setSelectedBudget(budget);
    loadBudgetDetails(budget.id);
  };

  const handleCreateBudget = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await apiClient.post(`/api/budgeting/${companyId}/budgets`, newBudget);
      setBudgetModal(false);
      setNewBudget({
        name: "",
        description: "",
        period: "QUARTERLY",
        startDate: new Date().toISOString().split("T")[0],
        endDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
        lines: [
          { category: "Marketing", planned: 50000 },
          { category: "Operations", planned: 100000 },
          { category: "Engineering", planned: 150000 }
        ]
      });
      loadBudgets();
    } catch (err) {
      alert("Failed to create budget plan");
    }
  };

  const handleLineChange = (index: number, field: string, value: any) => {
    setNewBudget(p => {
      const copy = [...p.lines];
      copy[index] = { ...copy[index], [field]: value };
      return { ...p, lines: copy };
    });
  };

  const handleAddLine = () => {
    setNewBudget(p => ({
      ...p,
      lines: [...p.lines, { category: "", planned: 0 }]
    }));
  };

  return (
    <div className="space-y-6">
      {/* Header bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200/60 pb-4 dark:border-slate-800">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            {selectedBudget ? `Budget Plan: ${selectedBudget.name}` : "Budgeting & Financial Allocation"}
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            {selectedBudget ? selectedBudget.description : "Formulate target budgets, monitor department limits, and review variances."}
          </p>
        </div>
        <div className="flex gap-2">
          {selectedBudget ? (
            <button onClick={() => setSelectedBudget(null)} className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-semibold hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900">
              <ArrowLeft className="h-4 w-4" /> All Budgets
            </button>
          ) : (
            <button onClick={() => setBudgetModal(true)} className="flex items-center gap-1.5 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700">
              <Plus className="h-4 w-4" /> Create Budget
            </button>
          )}
          <button onClick={loadBudgets} className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 bg-white hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900">
            <RefreshCw className="h-4 w-4" />
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex h-64 items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent" />
        </div>
      ) : !selectedBudget ? (
        // Grid of Budget Plans
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {budgets.length === 0 ? (
            <div className="col-span-full rounded-xl border border-dashed border-slate-300 p-12 text-center dark:border-slate-800">
              <BarChart2 className="mx-auto h-12 w-12 text-slate-400" />
              <h3 className="mt-4 text-lg font-semibold text-slate-900 dark:text-white">No budgets configured</h3>
              <p className="mt-2 text-sm text-slate-500">Plan out quarterly or annual department spending models.</p>
            </div>
          ) : (
            budgets.map((b) => (
              <div key={b.id} onClick={() => handleSelectBudget(b)} className="cursor-pointer rounded-xl border border-slate-200 bg-white p-5 shadow-sm hover:shadow-md dark:border-slate-800 dark:bg-slate-900 transition-all">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-slate-950 dark:text-white">{b.name}</h3>
                  <span className="text-xs font-semibold px-2 py-0.5 rounded bg-indigo-50 text-indigo-700">{b.period}</span>
                </div>
                <p className="text-xs text-slate-400 mt-1 font-mono">
                  {new Date(b.startDate).toLocaleDateString()} — {new Date(b.endDate).toLocaleDateString()}
                </p>
                <div className="mt-4 flex justify-between items-center text-sm">
                  <span className="text-slate-500">Total Allocated</span>
                  <span className="font-bold text-slate-900 dark:text-white">₹{b.totalAmount.toLocaleString()}</span>
                </div>
              </div>
            ))
          )}
        </div>
      ) : (
        // Budget detail table
        <div className="rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900 overflow-hidden">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-xs uppercase text-slate-700 dark:bg-slate-800 dark:text-slate-300">
              <tr>
                <th className="px-6 py-4">Expense Category</th>
                <th className="px-6 py-4">Planned Allocation</th>
                <th className="px-6 py-4">Actual Spending</th>
                <th className="px-6 py-4">Variance</th>
                <th className="px-6 py-4">Utilization</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {selectedBudget.lines?.map((line) => (
                <tr key={line.id} className="hover:bg-slate-50 dark:hover:bg-slate-850">
                  <td className="px-6 py-4 font-semibold text-slate-900 dark:text-white">{line.category}</td>
                  <td className="px-6 py-4 font-mono font-bold text-slate-700 dark:text-slate-300">₹{line.planned.toLocaleString()}</td>
                  <td className="px-6 py-4 font-mono text-rose-600">₹{(line.actual || 0).toLocaleString()}</td>
                  <td className="px-6 py-4 font-mono text-emerald-600">₹{(line.variance || 0).toLocaleString()}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <div className="w-24 bg-slate-100 dark:bg-slate-800 h-2 rounded overflow-hidden">
                        <div className="bg-indigo-600 h-full" style={{ width: line.utilization }} />
                      </div>
                      <span className="text-xs font-bold text-slate-700 dark:text-slate-400">{line.utilization}</span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Create Budget Modal */}
      {budgetModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <form onSubmit={handleCreateBudget} className="w-full max-w-lg rounded-xl bg-white p-6 dark:bg-slate-900 max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4">Create Budget Plan</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-500">Plan Name</label>
                <input required type="text" value={newBudget.name} onChange={e => setNewBudget(p => ({ ...p, name: e.target.value }))} className="mt-1 w-full rounded-lg border border-slate-200 p-2.5 dark:border-slate-800" placeholder="e.g. FY2026 Q3 Marketing Budget" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-500">Description</label>
                <input type="text" value={newBudget.description} onChange={e => setNewBudget(p => ({ ...p, description: e.target.value }))} className="mt-1 w-full rounded-lg border border-slate-200 p-2.5 dark:border-slate-800" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-500">Start Date</label>
                  <input required type="date" value={newBudget.startDate} onChange={e => setNewBudget(p => ({ ...p, startDate: e.target.value }))} className="mt-1 w-full rounded-lg border border-slate-200 p-2.5 dark:border-slate-800" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-500">End Date</label>
                  <input required type="date" value={newBudget.endDate} onChange={e => setNewBudget(p => ({ ...p, endDate: e.target.value }))} className="mt-1 w-full rounded-lg border border-slate-200 p-2.5 dark:border-slate-800" />
                </div>
              </div>

              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mt-4">Category Allocations</h4>
              <div className="space-y-3">
                {newBudget.lines.map((line, idx) => (
                  <div key={idx} className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] font-semibold text-slate-400">Category</label>
                      <input required type="text" value={line.category} onChange={e => handleLineChange(idx, "category", e.target.value)} className="mt-1 w-full rounded-lg border border-slate-200 p-2.5 dark:border-slate-800" placeholder="e.g. Advertising" />
                    </div>
                    <div>
                      <label className="block text-[10px] font-semibold text-slate-400">Planned Allocation (INR)</label>
                      <input required type="number" value={line.planned} onChange={e => handleLineChange(idx, "planned", parseFloat(e.target.value || "0"))} className="mt-1 w-full rounded-lg border border-slate-200 p-2.5 dark:border-slate-800" />
                    </div>
                  </div>
                ))}
              </div>
              <button type="button" onClick={handleAddLine} className="text-xs text-indigo-600 font-semibold hover:underline mt-2">
                + Add Category Line
              </button>
            </div>
            <div className="mt-6 flex justify-end gap-3 border-t pt-4">
              <button type="button" onClick={() => setBudgetModal(false)} className="rounded-lg px-4 py-2 text-sm border border-slate-200 hover:bg-slate-50">Cancel</button>
              <button type="submit" className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700">Save Plan</button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
