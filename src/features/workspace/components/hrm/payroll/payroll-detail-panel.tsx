"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Building2, Calendar, Download, Loader2, MapPin, X } from "lucide-react";

import { PayrollStatusBadge } from "@/features/workspace/components/hrm/payroll/payroll-status-badge";
import { formatPayrollAmount } from "@/features/workspace/data/hrm-payroll-demo";
import {
  downloadHrPayrollRun,
  fetchHrPayrollRun,
  updateHrPayrollRunStatus,
} from "@/lib/api/hrm";
import type { PayrollRecord, PayrollRunDetail } from "@/types/hrm";

type Props = {
  companyId: string;
  record: PayrollRecord;
  onClose: () => void;
  onUpdate: (record: PayrollRecord) => void;
};

function Row({ label, value, bold }: { label: string; value: string; bold?: boolean }) {
  return (
    <div className="flex items-center justify-between py-2.5 text-sm">
      <span className="text-slate-500">{label}</span>
      <span className={bold ? "font-semibold text-slate-900 dark:text-white" : "font-medium text-slate-800 dark:text-slate-200"}>
        {value}
      </span>
    </div>
  );
}

export function PayrollDetailPanel({ companyId, record, onClose, onUpdate }: Props) {
  const [detail, setDetail] = useState<PayrollRunDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    void fetchHrPayrollRun(companyId, record.id)
      .then((data) => {
        if (!cancelled) setDetail(data);
      })
      .catch((err) => {
        if (!cancelled) setError(err instanceof Error ? err.message : "Could not load payslip details.");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [companyId, record.id]);

  const active = detail ?? record;

  const handleDownload = async () => {
    setDownloading(true);
    try {
      await downloadHrPayrollRun(companyId, record.id);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Download failed.");
    } finally {
      setDownloading(false);
    }
  };

  const handleMarkPaid = async () => {
    try {
      const updated = await updateHrPayrollRunStatus(companyId, record.id, "completed");
      setDetail((prev) => (prev ? { ...prev, ...updated } : { ...record, ...updated }));
      onUpdate(updated);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not update status.");
    }
  };

  return (
    <>
      <motion.button
        type="button"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        aria-label="Close"
        className="fixed inset-0 z-[100] bg-slate-900/40 backdrop-blur-[2px]"
        onClick={onClose}
      />
      <motion.aside
        initial={{ x: "100%" }}
        animate={{ x: 0 }}
        exit={{ x: "100%" }}
        transition={{ type: "spring", stiffness: 420, damping: 38 }}
        className="fixed inset-y-0 right-0 z-[110] flex w-full max-w-[400px] flex-col border-l border-slate-200/90 bg-white shadow-2xl dark:border-slate-800 dark:bg-slate-950"
        role="dialog"
      >
        <div className="shrink-0 border-b border-slate-200/90 px-5 py-4 dark:border-slate-800">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="font-mono text-[11px] text-slate-400">{active.payslipId}</p>
              <h2 className="mt-1 text-base font-semibold text-slate-900 dark:text-white">{active.employeeName}</h2>
              <p className="text-sm text-slate-500">{active.period} payroll</p>
            </div>
            <button type="button" onClick={onClose} className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100" aria-label="Close">
              <X className="h-4 w-4" />
            </button>
          </div>
          <div className="mt-3">
            <PayrollStatusBadge status={active.status} />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-5">
          {loading ? (
            <div className="flex items-center justify-center gap-2 py-12 text-sm text-slate-500">
              <Loader2 className="h-4 w-4 animate-spin" />
              Loading payslip…
            </div>
          ) : (
            <>
              <section className="rounded-lg border border-slate-200/90 dark:border-slate-800">
                <div className="border-b border-slate-100 px-4 py-2 dark:border-slate-800">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Pay breakdown</p>
                </div>
                <div className="divide-y divide-slate-100 px-4 dark:divide-slate-800">
                  {detail?.lineItems && detail.lineItems.length > 0 ? (
                    detail.lineItems.map((item) => (
                      <Row
                        key={item.label}
                        label={item.label}
                        value={formatPayrollAmount(item.amount, active.currency)}
                      />
                    ))
                  ) : (
                    <>
                      <Row label="Gross pay" value={formatPayrollAmount(active.grossPay, active.currency)} />
                      <Row label="Deductions" value={formatPayrollAmount(active.deductions, active.currency)} />
                    </>
                  )}
                  <Row label="Net pay" value={formatPayrollAmount(active.netPay, active.currency)} bold />
                </div>
              </section>

              <section className="mt-4 space-y-0 rounded-lg border border-slate-200/90 px-4 dark:border-slate-800">
                <div className="flex items-start gap-3 py-2.5 text-sm">
                  <Building2 className="mt-0.5 h-4 w-4 text-slate-400" />
                  <div>
                    <p className="text-[10px] font-semibold uppercase text-slate-400">Department</p>
                    <p className="font-medium text-slate-900 dark:text-white">{active.department}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 border-t border-slate-100 py-2.5 text-sm dark:border-slate-800">
                  <MapPin className="mt-0.5 h-4 w-4 text-slate-400" />
                  <div>
                    <p className="text-[10px] font-semibold uppercase text-slate-400">Location</p>
                    <p className="font-medium text-slate-900 dark:text-white">{active.location}</p>
                  </div>
                </div>
                {active.paidOn ? (
                  <div className="flex items-start gap-3 border-t border-slate-100 py-2.5 text-sm dark:border-slate-800">
                    <Calendar className="mt-0.5 h-4 w-4 text-slate-400" />
                    <div>
                      <p className="text-[10px] font-semibold uppercase text-slate-400">Paid on</p>
                      <p className="font-medium text-slate-900 dark:text-white">{active.paidOn}</p>
                    </div>
                  </div>
                ) : null}
              </section>
            </>
          )}
          {error ? <p className="mt-4 text-sm text-rose-600">{error}</p> : null}
        </div>

        <div className="shrink-0 space-y-2 border-t border-slate-200/90 px-5 py-3 dark:border-slate-800">
          {active.status !== "completed" ? (
            <button
              type="button"
              onClick={handleMarkPaid}
              className="inline-flex h-9 w-full items-center justify-center rounded-lg bg-[#191970] text-sm font-semibold text-white hover:bg-[#12124a]"
            >
              Mark as paid
            </button>
          ) : null}
          <button
            type="button"
            onClick={handleDownload}
            disabled={downloading}
            className="inline-flex h-9 w-full items-center justify-center gap-2 rounded-lg border border-slate-200 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:opacity-50 dark:border-slate-700 dark:text-slate-300"
          >
            <Download className="h-4 w-4" />
            {downloading ? "Downloading…" : "Download payslip PDF"}
          </button>
        </div>
      </motion.aside>
    </>
  );
}
