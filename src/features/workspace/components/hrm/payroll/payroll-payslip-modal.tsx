"use client";

import { useEffect, useRef, useState } from "react";
import { Download, ExternalLink, Loader2, Printer, X } from "lucide-react";

import { PayrollPayslipDocument } from "@/features/workspace/components/hrm/payroll/payroll-payslip-document";
import { getDemoPayslipDetail } from "@/features/workspace/data/hrm-payroll-demo";
import { fetchHrPayrollRun, downloadHrPayrollRun } from "@/lib/api/hrm";
import {
  downloadPayslipHtml,
  openPayslipInNewTab,
  payslipDocumentTitle,
  printPayslipElement,
} from "@/lib/hrm/payslip-export";
import type { PayrollRecord, PayrollRunDetail } from "@/types/hrm";

type Props = {
  open: boolean;
  companyId: string;
  record: PayrollRecord | null;
  onClose: () => void;
};

export function PayrollPayslipModal({ open, companyId, record, onClose }: Props) {
  const [detail, setDetail] = useState<PayrollRunDetail | null>(null);
  const [loading, setLoading] = useState(false);
  const slipRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open || !record) {
      setDetail(null);
      return;
    }

    let cancelled = false;
    setLoading(true);

    void fetchHrPayrollRun(companyId, record.id)
      .then((data) => {
        if (!cancelled) setDetail(data);
      })
      .catch(() => {
        if (!cancelled) setDetail(getDemoPayslipDetail(record));
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [open, companyId, record]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open || !record) return null;

  const active = detail ?? getDemoPayslipDetail(record);
  const title = payslipDocumentTitle(active);

  const getSlipElement = () => slipRef.current?.querySelector<HTMLElement>("#payslip-document");

  const handlePrint = () => {
    const el = getSlipElement();
    if (el) printPayslipElement(el, title);
  };

  const handleDownload = async () => {
    if (!record || !companyId) return;
    try {
      await downloadHrPayrollRun(companyId, record.id);
    } catch {
      const el = getSlipElement();
      if (el) downloadPayslipHtml(active, el);
    }
  };

  const handleNewTab = () => {
    const el = getSlipElement();
    if (el) openPayslipInNewTab(active, el);
  };

  return (
    <div className="fixed inset-0 z-[120] flex items-end justify-center bg-slate-900/60 p-0 backdrop-blur-sm sm:items-center sm:p-4">
      <button type="button" className="absolute inset-0" aria-label="Close payslip" onClick={onClose} />

      <div
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className="relative z-[1] flex max-h-[96vh] w-full max-w-4xl flex-col overflow-hidden rounded-t-2xl border border-slate-700 bg-slate-100 shadow-2xl sm:rounded-2xl"
      >
        <div className="flex shrink-0 flex-wrap items-center justify-between gap-3 bg-slate-900 px-4 py-3 sm:px-5">
          <p className="min-w-0 truncate text-sm font-semibold text-white">{title}</p>
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={handleNewTab}
              className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-slate-600 bg-slate-800 px-3 text-xs font-semibold text-slate-100 hover:bg-slate-700"
            >
              <ExternalLink className="h-3.5 w-3.5" />
              New tab
            </button>
            <button
              type="button"
              onClick={handlePrint}
              className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-slate-600 bg-slate-800 px-3 text-xs font-semibold text-slate-100 hover:bg-slate-700"
            >
              <Printer className="h-3.5 w-3.5" />
              Print
            </button>
            <button
              type="button"
              onClick={handleDownload}
              className="inline-flex h-9 items-center gap-1.5 rounded-lg bg-amber-400 px-3 text-xs font-bold text-slate-900 hover:bg-amber-300"
            >
              <Download className="h-3.5 w-3.5" />
              Download
            </button>
            <button
              type="button"
              onClick={onClose}
              className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-slate-600 text-slate-300 hover:bg-slate-800"
              aria-label="Close"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        <div ref={slipRef} className="min-h-0 flex-1 overflow-y-auto bg-slate-200/80 px-4 py-5 sm:px-6 sm:py-6">
          {loading ? (
            <div className="flex items-center justify-center gap-2 py-20 text-sm text-slate-500">
              <Loader2 className="h-4 w-4 animate-spin" />
              Loading payslip…
            </div>
          ) : (
            <PayrollPayslipDocument detail={active} />
          )}
        </div>
      </div>
    </div>
  );
}
