"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { AnimatePresence } from "framer-motion";
import { AlertCircle, DollarSign, Loader2, Play, RefreshCw, TrendingUp, Wallet } from "lucide-react";

import type { HrmViewMode } from "@/features/workspace/components/hrm/hrm-directory-view-toggle";
import { PayrollDetailPanel } from "@/features/workspace/components/hrm/payroll/payroll-detail-panel";
import { PayrollDirectoryGrid } from "@/features/workspace/components/hrm/payroll/payroll-directory-grid";
import {
  PayrollDirectoryToolbar,
  type PayrollFilters,
} from "@/features/workspace/components/hrm/payroll/payroll-directory-toolbar";
import { PayrollRunModal } from "@/features/workspace/components/hrm/payroll/payroll-run-modal";
import { PayrollTable } from "@/features/workspace/components/hrm/payroll/payroll-table";
import { useHrCompanyId } from "@/features/workspace/hooks/use-hr-company-id";
import { MISSING_COMPANY_CONTEXT_MESSAGE } from "@/lib/workspace/company-context";
import type { PayrollRecord } from "@/types/hrm";
import { fetchHrPayrollRuns, triggerHrPayrollRun } from "@/lib/api/hrm";

const EMPTY_FILTERS: PayrollFilters = { query: "", period: "", status: "" };

export function HrmPayrollView() {
  const companyId = useHrCompanyId();
  const [records, setRecords] = useState<PayrollRecord[]>([]);
  const [filters, setFilters] = useState<PayrollFilters>(EMPTY_FILTERS);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<HrmViewMode>("grid");
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [runOpen, setRunOpen] = useState(false);

  const load = useCallback(async () => {
    if (!companyId) {
      setLoading(false);
      return;
    }
    setError(null);
    try {
      const list = await fetchHrPayrollRuns(companyId, {
        period: filters.period || undefined,
        status: filters.status || undefined,
      });
      setRecords(list);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not load payroll.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [companyId, filters.period, filters.status]);

  useEffect(() => {
    setLoading(true);
    void load();
  }, [load]);

  const filtered = useMemo(() => {
    const q = filters.query.trim().toLowerCase();
    return records.filter((r) => {
      if (q) {
        const hay = `${r.employeeName} ${r.employeeCode} ${r.payslipId} ${r.department}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
  }, [records, filters.query]);

  const periods = useMemo(
    () => [...new Set(records.map((r) => r.period))].sort().reverse(),
    [records],
  );

  const selected = selectedId ? records.find((r) => r.id === selectedId) ?? null : null;
  const paidCount = records.filter((r) => r.status === "completed").length;
  const processingCount = records.filter((r) => r.status === "processing").length;
  const draftCount = records.filter((r) => r.status === "draft").length;

  const handleRefresh = () => {
    setRefreshing(true);
    void load();
  };

  const handleRunPayroll = async (payload: Parameters<typeof triggerHrPayrollRun>[1]) => {
    if (!companyId) throw new Error("No company workspace found.");
    const created = await triggerHrPayrollRun(companyId, payload);
    setRecords((prev) => [...created, ...prev]);
  };

  const handleRecordUpdate = (updated: PayrollRecord) => {
    setRecords((prev) => prev.map((r) => (r.id === updated.id ? { ...r, ...updated } : r)));
  };

  return (
    <div className="pb-10">
      <header className="mb-6">
        <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">People · HRM</p>
        <div className="mt-1 flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">Payroll</h1>
            <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
              Pay runs, payslips, and disbursement status across your workforce.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {[
              { label: "Payslips", value: records.length, icon: Wallet },
              { label: "Paid", value: paidCount, icon: DollarSign },
              { label: "Processing", value: processingCount, icon: TrendingUp },
              { label: "Draft", value: draftCount, icon: Play },
            ].map((stat) => (
              <div
                key={stat.label}
                className="flex items-center gap-2 rounded-xl border border-slate-200/80 bg-white px-3 py-2 shadow-sm dark:border-slate-800 dark:bg-slate-900"
              >
                <stat.icon className="h-3.5 w-3.5 text-slate-400" />
                <span className="text-xs text-slate-500">{stat.label}</span>
                <span className="text-sm font-bold text-slate-900 dark:text-white">{stat.value}</span>
              </div>
            ))}
            <button
              type="button"
              onClick={handleRefresh}
              disabled={refreshing || !companyId}
              className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 text-sm font-medium text-slate-600 hover:bg-slate-50 disabled:opacity-50"
            >
              <RefreshCw className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`} />
              Refresh
            </button>
          </div>
        </div>
      </header>

      {!companyId ? (
        <div className="mb-4 flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
          <p>{MISSING_COMPANY_CONTEXT_MESSAGE}</p>
        </div>
      ) : null}

      {error ? (
        <div className="mb-4 flex items-start gap-3 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
          <p>{error}</p>
        </div>
      ) : null}

      <div className="overflow-hidden rounded-2xl border border-slate-200/90 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <PayrollDirectoryToolbar
          filters={filters}
          onChange={setFilters}
          periods={periods}
          resultCount={filtered.length}
          viewMode={viewMode}
          onViewModeChange={setViewMode}
          onRunPayroll={companyId ? () => setRunOpen(true) : undefined}
        />
        {loading ? (
          <div className="flex items-center justify-center gap-2 px-4 py-20 text-sm text-slate-500">
            <Loader2 className="h-4 w-4 animate-spin" />
            Loading payroll…
          </div>
        ) : viewMode === "grid" ? (
          <PayrollDirectoryGrid
            records={filtered}
            selectedId={selectedId}
            onSelect={(r) => setSelectedId(r.id)}
          />
        ) : (
          <PayrollTable records={filtered} selectedId={selectedId} onSelect={(r) => setSelectedId(r.id)} />
        )}
      </div>

      <AnimatePresence>
        {selected && companyId ? (
          <PayrollDetailPanel
            key={selected.id}
            companyId={companyId}
            record={selected}
            onClose={() => setSelectedId(null)}
            onUpdate={handleRecordUpdate}
          />
        ) : null}
      </AnimatePresence>

      <PayrollRunModal
        open={runOpen}
        onClose={() => setRunOpen(false)}
        onSubmit={handleRunPayroll}
      />
    </div>
  );
}
