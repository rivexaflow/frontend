"use client";

import { useEffect, useState, useCallback } from "react";
import { BookOpen, Plus, FileText, CheckCircle2, AlertTriangle, Users, Layers, RefreshCw } from "lucide-react";
import { apiClient } from "@/lib/api/client";
import { useHrCompanyId } from "@/features/workspace/hooks/use-hr-company-id";

type Account = {
  id: string;
  name: string;
  code: string;
  type: string;
  subType?: string;
  balance: number;
  currency: string;
};

type JournalLine = {
  id?: string;
  accountId: string;
  description?: string;
  debit: number;
  credit: number;
  account?: Account;
};

type JournalEntry = {
  id: string;
  description: string;
  reference?: string;
  date: string;
  totalAmount: number;
  status: string;
  lines: JournalLine[];
};

export function AccountingView() {
  const companyId = useHrCompanyId();
  const [activeTab, setActiveTab] = useState<"accounts" | "journal">("accounts");
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [journalEntries, setJournalEntries] = useState<JournalEntry[]>([]);
  const [loading, setLoading] = useState(true);

  // Modals state
  const [accountModal, setAccountModal] = useState(false);
  const [journalModal, setJournalModal] = useState(false);

  // Form states
  const [newAccount, setNewAccount] = useState({ name: "", code: "", type: "ASSET", subType: "", currency: "INR" });
  const [newJournal, setNewJournal] = useState({
    description: "",
    reference: "",
    date: new Date().toISOString().split("T")[0],
    lines: [
      { accountId: "", description: "", debit: 0, credit: 0 },
      { accountId: "", description: "", debit: 0, credit: 0 }
    ]
  });

  const loadData = useCallback(async () => {
    if (!companyId) return;
    setLoading(true);
    try {
      const [accRes, jrRes] = await Promise.all([
        apiClient.get(`/api/accounting/${companyId}/accounts`),
        apiClient.get(`/api/accounting/${companyId}/journal-entries`),
      ]);
      setAccounts(accRes.data?.data || []);
      setJournalEntries(jrRes.data?.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [companyId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleCreateAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await apiClient.post(`/api/accounting/${companyId}/accounts`, newAccount);
      setAccountModal(false);
      setNewAccount({ name: "", code: "", type: "ASSET", subType: "", currency: "INR" });
      loadData();
    } catch (err) {
      alert("Failed to create GL account");
    }
  };

  const handleCreateJournal = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Parse values to floats
    const formattedLines = newJournal.lines.map(l => ({
      ...l,
      debit: parseFloat(String(l.debit || 0)),
      credit: parseFloat(String(l.credit || 0))
    }));

    const debitSum = formattedLines.reduce((s, l) => s + l.debit, 0);
    const creditSum = formattedLines.reduce((s, l) => s + l.credit, 0);

    if (Math.abs(debitSum - creditSum) > 0.01) {
      alert(`Double-entry imbalanced! Total Debits (₹${debitSum}) must equal Total Credits (₹${creditSum})`);
      return;
    }

    try {
      await apiClient.post(`/api/accounting/${companyId}/journal-entries`, {
        ...newJournal,
        lines: formattedLines
      });
      setJournalModal(false);
      setNewJournal({
        description: "",
        reference: "",
        date: new Date().toISOString().split("T")[0],
        lines: [
          { accountId: "", description: "", debit: 0, credit: 0 },
          { accountId: "", description: "", debit: 0, credit: 0 }
        ]
      });
      loadData();
    } catch (err: any) {
      alert(err.response?.data?.error || "Failed to create journal entry");
    }
  };

  const handleAddLine = () => {
    setNewJournal(p => ({
      ...p,
      lines: [...p.lines, { accountId: "", description: "", debit: 0, credit: 0 }]
    }));
  };

  const handleLineChange = (index: number, field: string, value: any) => {
    setNewJournal(p => {
      const copy = [...p.lines];
      copy[index] = { ...copy[index], [field]: value };
      return { ...p, lines: copy };
    });
  };

  return (
    <div className="space-y-6">
      {/* Header bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200/60 pb-4 dark:border-slate-800">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">General Ledger & Accounts</h1>
          <p className="mt-1 text-sm text-slate-500">Double-entry accounting journal entries ledger logs, trial balance and chart of accounts.</p>
        </div>
        <div className="flex gap-2">
          {activeTab === "accounts" && (
            <button onClick={() => setAccountModal(true)} className="flex items-center gap-1.5 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700">
              <Plus className="h-4 w-4" /> Create Account
            </button>
          )}
          {activeTab === "journal" && (
            <button onClick={() => setJournalModal(true)} className="flex items-center gap-1.5 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700">
              <Plus className="h-4 w-4" /> Post Journal Entry
            </button>
          )}
          <button onClick={loadData} className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 bg-white hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900">
            <RefreshCw className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-4 border-b border-slate-200 dark:border-slate-800">
        <button onClick={() => setActiveTab("accounts")} className={`pb-3 text-sm font-semibold ${activeTab === "accounts" ? "border-b-2 border-indigo-600 text-indigo-600" : "text-slate-500 hover:text-slate-900"}`}>
          Chart of accounts
        </button>
        <button onClick={() => setActiveTab("journal")} className={`pb-3 text-sm font-semibold ${activeTab === "journal" ? "border-b-2 border-indigo-600 text-indigo-600" : "text-slate-500 hover:text-slate-900"}`}>
          Journal entries (GL)
        </button>
      </div>

      {loading ? (
        <div className="flex h-64 items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent" />
        </div>
      ) : (
        <div>
          {/* Chart of Accounts */}
          {activeTab === "accounts" && (
            <div className="rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900 overflow-hidden">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-50 text-xs uppercase text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                  <tr>
                    <th className="px-6 py-4">Account Code</th>
                    <th className="px-6 py-4">Account Name</th>
                    <th className="px-6 py-4">GL Type</th>
                    <th className="px-6 py-4">Balance</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {accounts.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="px-6 py-12 text-center text-slate-500">No chart accounts found.</td>
                    </tr>
                  ) : (
                    accounts.map((a) => (
                      <tr key={a.id} className="hover:bg-slate-50 dark:hover:bg-slate-850">
                        <td className="px-6 py-4 font-mono font-bold text-slate-900 dark:text-white">{a.code}</td>
                        <td className="px-6 py-4">{a.name}</td>
                        <td className="px-6 py-4 text-xs font-semibold text-slate-500">{a.type}</td>
                        <td className="px-6 py-4 font-bold">₹{a.balance.toFixed(2)}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}

          {/* Journal Entries */}
          {activeTab === "journal" && (
            <div className="space-y-4">
              {journalEntries.length === 0 ? (
                <div className="rounded-xl border border-dashed border-slate-300 p-12 text-center dark:border-slate-800 bg-white dark:bg-slate-900">
                  <BookOpen className="mx-auto h-12 w-12 text-slate-400" />
                  <p className="text-slate-500 mt-4">No double-entry journal logs reported.</p>
                </div>
              ) : (
                journalEntries.map((entry) => (
                  <div key={entry.id} className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h4 className="font-bold text-slate-900 dark:text-white">{entry.description}</h4>
                        <p className="text-xs text-slate-500 mt-1">Ref: {entry.reference || "N/A"} | Date: {new Date(entry.date).toLocaleDateString()}</p>
                      </div>
                      <span className="font-bold text-indigo-600">₹{entry.totalAmount.toFixed(2)}</span>
                    </div>

                    <div className="rounded bg-slate-50 p-3 text-xs dark:bg-slate-800/50">
                      <div className="grid grid-cols-3 font-semibold text-slate-500 border-b pb-1 mb-1">
                        <span>Account</span>
                        <span className="text-right">Debit (DR)</span>
                        <span className="text-right">Credit (CR)</span>
                      </div>
                      {entry.lines?.map((line, idx) => (
                        <div key={idx} className="grid grid-cols-3 py-1 font-mono">
                          <span>{line.account?.name} ({line.account?.code})</span>
                          <span className="text-right text-emerald-600">{line.debit > 0 ? `₹${line.debit.toFixed(2)}` : "—"}</span>
                          <span className="text-right text-rose-600">{line.credit > 0 ? `₹${line.credit.toFixed(2)}` : "—"}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      )}

      {/* Account Creation Modal */}
      {accountModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <form onSubmit={handleCreateAccount} className="w-full max-w-md rounded-xl bg-white p-6 dark:bg-slate-900">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4">Create General Ledger Account</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-500">Account Code (GL Number)</label>
                <input required type="text" value={newAccount.code} onChange={e => setNewAccount(p => ({ ...p, code: e.target.value }))} className="mt-1 w-full rounded-lg border border-slate-200 p-2.5 dark:border-slate-800" placeholder="e.g. 10100" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-500">Account Name</label>
                <input required type="text" value={newAccount.name} onChange={e => setNewAccount(p => ({ ...p, name: e.target.value }))} className="mt-1 w-full rounded-lg border border-slate-200 p-2.5 dark:border-slate-800" placeholder="e.g. Cash drawer" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-500">Account Type</label>
                <select value={newAccount.type} onChange={e => setNewAccount(p => ({ ...p, type: e.target.value }))} className="mt-1 w-full rounded-lg border border-slate-200 p-2.5 dark:border-slate-800 dark:bg-slate-800">
                  <option value="ASSET">ASSET</option>
                  <option value="LIABILITY">LIABILITY</option>
                  <option value="EQUITY">EQUITY</option>
                  <option value="REVENUE">REVENUE</option>
                  <option value="EXPENSE">EXPENSE</option>
                </select>
              </div>
            </div>
            <div className="mt-6 flex justify-end gap-3">
              <button type="button" onClick={() => setAccountModal(false)} className="rounded-lg px-4 py-2 text-sm border border-slate-200 hover:bg-slate-50">Cancel</button>
              <button type="submit" className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700">Save Account</button>
            </div>
          </form>
        </div>
      )}

      {/* Journal Entry Modal */}
      {journalModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <form onSubmit={handleCreateJournal} className="w-full max-w-2xl rounded-xl bg-white p-6 dark:bg-slate-900 max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4">Post Double-Entry Journal Record</h3>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-500">Description</label>
                  <input required type="text" value={newJournal.description} onChange={e => setNewJournal(p => ({ ...p, description: e.target.value }))} className="mt-1 w-full rounded-lg border border-slate-200 p-2.5 dark:border-slate-800" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-500">Reference #</label>
                  <input type="text" value={newJournal.reference} onChange={e => setNewJournal(p => ({ ...p, reference: e.target.value }))} className="mt-1 w-full rounded-lg border border-slate-200 p-2.5 dark:border-slate-800" />
                </div>
              </div>

              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mt-4">Transaction Lines</h4>
              <div className="space-y-3">
                {newJournal.lines.map((line, idx) => (
                  <div key={idx} className="grid grid-cols-4 gap-3 items-end">
                    <div className="col-span-2">
                      <label className="block text-[10px] font-semibold text-slate-400">Account</label>
                      <select required value={line.accountId} onChange={e => handleLineChange(idx, "accountId", e.target.value)} className="mt-1 w-full rounded-lg border border-slate-200 p-2 text-xs dark:border-slate-800 dark:bg-slate-800">
                        <option value="">Select Account</option>
                        {accounts.map(a => (
                          <option key={a.id} value={a.id}>{a.code} — {a.name}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-[10px] font-semibold text-slate-400">Debit (DR)</label>
                      <input type="number" step="0.01" value={line.debit} onChange={e => handleLineChange(idx, "debit", e.target.value)} className="mt-1 w-full rounded-lg border border-slate-200 p-2 text-xs dark:border-slate-800" />
                    </div>
                    <div>
                      <label className="block text-[10px] font-semibold text-slate-400">Credit (CR)</label>
                      <input type="number" step="0.01" value={line.credit} onChange={e => handleLineChange(idx, "credit", e.target.value)} className="mt-1 w-full rounded-lg border border-slate-200 p-2 text-xs dark:border-slate-800" />
                    </div>
                  </div>
                ))}
              </div>

              <button type="button" onClick={handleAddLine} className="text-xs text-indigo-600 font-semibold hover:underline mt-2">
                + Add Line Item
              </button>
            </div>

            <div className="mt-6 flex justify-end gap-3 border-t pt-4">
              <button type="button" onClick={() => setJournalModal(false)} className="rounded-lg px-4 py-2 text-sm border border-slate-200 hover:bg-slate-50">Cancel</button>
              <button type="submit" className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700">Post Transaction</button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
