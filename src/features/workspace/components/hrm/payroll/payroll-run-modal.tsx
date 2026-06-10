"use client";

import { FormEvent, useState } from "react";
import { Play } from "lucide-react";

import {
  EnterpriseFormModal,
  FormField,
  inputClassName,
} from "@/features/workspace/components/enterprise/enterprise-form-modal";
import type { TriggerPayrollRunPayload } from "@/types/hrm";

type Props = {
  open: boolean;
  onClose: () => void;
  onSubmit: (payload: TriggerPayrollRunPayload) => Promise<void>;
};

export function PayrollRunModal({ open, onClose, onSubmit }: Props) {
  const now = new Date();
  const [period, setPeriod] = useState(
    now.toLocaleDateString("en-US", { month: "long", year: "numeric" }),
  );
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [year, setYear] = useState(now.getFullYear());
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!period.trim()) {
      setError("Period label is required.");
      return;
    }
    setError(null);
    setSubmitting(true);
    try {
      await onSubmit({ period: period.trim(), month, year });
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Payroll run failed.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <EnterpriseFormModal
      open={open}
      title="Run payroll"
      description="Trigger a pay run for the selected salary period."
      onClose={onClose}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <FormField label="Period label" htmlFor="pay-period">
          <input id="pay-period" value={period} onChange={(e) => setPeriod(e.target.value)} className={inputClassName} />
        </FormField>
        <div className="grid grid-cols-2 gap-3">
          <FormField label="Month" htmlFor="pay-month">
            <input
              id="pay-month"
              type="number"
              min={1}
              max={12}
              value={month}
              onChange={(e) => setMonth(Number(e.target.value))}
              className={inputClassName}
            />
          </FormField>
          <FormField label="Year" htmlFor="pay-year">
            <input
              id="pay-year"
              type="number"
              min={2020}
              max={2100}
              value={year}
              onChange={(e) => setYear(Number(e.target.value))}
              className={inputClassName}
            />
          </FormField>
        </div>
        {error ? <p className="text-sm text-rose-600">{error}</p> : null}
        <div className="flex justify-end gap-2 border-t pt-4">
          <button type="button" onClick={onClose} className="h-10 rounded-lg px-4 text-sm font-medium text-slate-600 hover:bg-slate-100">
            Cancel
          </button>
          <button
            type="submit"
            disabled={submitting}
            className="inline-flex h-10 items-center gap-2 rounded-lg bg-[#191970] px-5 text-sm font-semibold text-white disabled:opacity-60"
          >
            <Play className="h-4 w-4" />
            {submitting ? "Starting…" : "Run payroll"}
          </button>
        </div>
      </form>
    </EnterpriseFormModal>
  );
}
