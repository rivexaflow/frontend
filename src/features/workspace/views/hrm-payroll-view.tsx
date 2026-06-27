"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { AlertCircle, CreditCard, IndianRupee, Loader2, Play, RefreshCw, TrendingDown, Users } from "lucide-react";

import { PayrollPayslipModal } from "@/features/workspace/components/hrm/payroll/payroll-payslip-modal";
import { PayrollPayslipsTable } from "@/features/workspace/components/hrm/payroll/payroll-payslips-table";
import { PayrollRunModal } from "@/features/workspace/components/hrm/payroll/payroll-run-modal";
import { PayrollRunsTable } from "@/features/workspace/components/hrm/payroll/payroll-runs-table";
import { PayrollSalaryComponentsPanel } from "@/features/workspace/components/hrm/payroll/payroll-salary-components-panel";
import { HrmPageHeader, HrmStatCard } from "@/features/workspace/components/hrm/hrm-page-header";
import {
  aggregatePayrollBatchRuns,
  PAYROLL_PERIODS,
  PAYROLL_STATUSES,
  computePayrollSummary,
  formatPayrollAmount,
  formatPayrollInrCompact,
  type PayrollRunStatus,
} from "@/features/workspace/data/hrm-payroll-demo";
import { useHrCompanyId } from "@/features/workspace/hooks/use-hr-company-id";
import { fetchHrPayrollRuns, triggerHrPayrollRun } from "@/lib/api/hrm";
import { MISSING_COMPANY_CONTEXT_MESSAGE } from "@/lib/workspace/company-context";
import type { PayrollRecord } from "@/types/hrm";

type PayslipFilters = {
  query: string;
  period: string;
  status: PayrollRunStatus | "";
};

const EMPTY_FILTERS: PayslipFilters = { query: "", period: "", status: "" };

export function HrmPayrollView() {
  const companyId = useHrCompanyId();
  const [records, setRecords] = useState<PayrollRecord[]>([]);
  const [filters, setFilters] = useState<PayslipFilters>(EMPTY_FILTERS);
  const [viewRecord, setViewRecord] = useState<PayrollRecord | null>(null);
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
      if (filters.period && r.period !== filters.period) return false;
      if (filters.status && r.status !== filters.status) return false;
      if (!q) return true;
      const hay = `${r.employeeName} ${r.employeeCode} ${r.payslipId} ${r.department}`.toLowerCase();
      return hay.includes(q);
    });
  }, [records, filters]);

  const summary = useMemo(() => computePayrollSummary(records), [records]);
  const batchRuns = useMemo(() => aggregatePayrollBatchRuns(records), [records]);
  const latestPayslips = useMemo(() => filtered.slice(0, 12), [filtered]);

  const handleRefresh = () => {
    setRefreshing(true);
    void load();
  };

  const handleRunPayroll = async (payload: Parameters<typeof triggerHrPayrollRun>[1]) => {
    if (!companyId) throw new Error("No company workspace found.");
    const created = await triggerHrPayrollRun(companyId, payload);
    setRecords((prev) => [...created, ...prev]);
  };

  const selectClass =
    "h-9 rounded-lg border border-slate-200 bg-white px-2.5 text-sm text-slate-700 outline-none focus:border-[#191970] focus:ring-1 focus:ring-[#191970]/20 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-200";

  return (
    <div className="pb-10">
      <HrmPageHeader
        module="People · HRM"
        title="Payroll"
        description="Salary runs, payslips & cost."
        actions={
          <>
            <button
              type="button"
              onClick={handleRefresh}
              disabled={refreshing || !companyId}
              className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 text-sm font-medium text-slate-600 hover:bg-slate-50 disabled:opacity-50 dark:border-slate-700 dark:bg-slate-900"
            >
              <RefreshCw className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`} />
              Refresh
            </button>
            <button
              type="button"
              onClick={() => setRunOpen(true)}
              disabled={!companyId}
              className="inline-flex h-9 items-center gap-1.5 rounded-lg bg-amber-400 px-4 text-sm font-bold text-slate-900 shadow-sm hover:bg-amber-300 disabled:opacity-50"
            >
              <Play className="h-4 w-4" />
              Run payroll
            </button>
          </>
        }
      />

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

      <div className="mb-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <HrmStatCard
          label="Monthly cost"
          value={formatPayrollInrCompact(summary.monthlyCost)}
          hint="Net disbursement"
          trend="+0.8% vs last month"
          icon={IndianRupee}
          tone="success"
        />
        <HrmStatCard
          label="Employees paid"
          value={summary.employeesPaid.toLocaleString()}
          hint={`${records.length > 0 ? Math.round((summary.employeesPaid / records.length) * 100) : 0}% of roster`}
          icon={Users}
          tone="brand"
        />
        <HrmStatCard
          label="Deductions"
          value={formatPayrollInrCompact(summary.totalDeductions)}
          hint="Tax + PF + statutory"
          icon={TrendingDown}
          tone="warning"
        />
        <HrmStatCard
          label="Avg. net pay"
          value={formatPayrollAmount(summary.avgNet, "INR")}
          hint="Per paid employee"
          icon={CreditCard}
        />
      </div>

      <PayrollSalaryComponentsPanel />

      <section className="mb-6 overflow-hidden rounded-2xl border border-slate-200/90 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 px-5 py-4 dark:border-slate-800">
          <div>
            <h2 className="text-sm font-semibold text-slate-900 dark:text-white">Payroll runs</h2>
            <p className="mt-0.5 text-xs text-slate-500">Batch cycles · gross, deductions & net totals</p>
          </div>
        </div>
        <PayrollRunsTable runs={batchRuns} />
      </section>

      <section className="overflow-hidden rounded-2xl border border-slate-200/90 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div className="flex flex-col gap-3 border-b border-slate-100 px-4 py-4 sm:flex-row sm:flex-wrap sm:items-center dark:border-slate-800">
          <div className="min-w-0 flex-1">
            <h2 className="text-sm font-semibold text-slate-900 dark:text-white">Latest payslips</h2>
            <p className="mt-0.5 text-xs text-slate-500">View, print, or download individual salary slips</p>
          </div>
          <input
            type="search"
            value={filters.query}
            onChange={(e) => setFilters((f) => ({ ...f, query: e.target.value }))}
            placeholder="Search employee…"
            className="h-9 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm outline-none focus:border-[#191970] focus:ring-1 focus:ring-[#191970]/20 sm:max-w-xs dark:border-slate-700 dark:bg-slate-950"
          />
          <select
            value={filters.period}
            onChange={(e) => setFilters((f) => ({ ...f, period: e.target.value }))}
            className={selectClass}
          >
            <option value="">All periods</option>
            {PAYROLL_PERIODS.map((p) => (
              <option key={p} value={p}>
                {p}
              </option>
            ))}
          </select>
          <select
            value={filters.status}
            onChange={(e) => setFilters((f) => ({ ...f, status: e.target.value as PayslipFilters["status"] }))}
            className={selectClass}
          >
            <option value="">All statuses</option>
            {PAYROLL_STATUSES.map((s) => (
              <option key={s.id} value={s.id}>
                {s.label}
              </option>
            ))}
          </select>
        </div>

        {loading ? (
          <div className="flex items-center justify-center gap-2 px-4 py-20 text-sm text-slate-500">
            <Loader2 className="h-4 w-4 animate-spin" />
            Loading payslips…
          </div>
        ) : (
          <PayrollPayslipsTable records={latestPayslips} companyId={companyId} onView={setViewRecord} />
        )}
      </section>

      <PayrollPayslipModal
        open={!!viewRecord}
        companyId={companyId ?? ""}
        record={viewRecord}
        onClose={() => setViewRecord(null)}
      />

      <PayrollRunModal open={runOpen} onClose={() => setRunOpen(false)} onSubmit={handleRunPayroll} />
    </div>
  );
}
