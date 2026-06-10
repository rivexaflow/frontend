"use client";

import { FormEvent, useEffect, useState } from "react";

import {
  EnterpriseFormModal,
  FormField,
  inputClassName,
  selectClassName,
} from "@/features/workspace/components/enterprise/enterprise-form-modal";
import { LEAVE_TYPES } from "@/features/workspace/data/hrm-leave-demo";
import { fetchHrEmployees } from "@/lib/api/hrm";
import type { ApplyLeavePayload, HrmEmployeeRecord, LeaveType } from "@/types/hrm";

type FormValues = {
  employeeId: string;
  leaveType: LeaveType;
  from: string;
  to: string;
  reason: string;
};

const EMPTY: FormValues = {
  employeeId: "",
  leaveType: "annual",
  from: "",
  to: "",
  reason: "",
};

type Props = {
  open: boolean;
  companyId: string | null;
  onClose: () => void;
  onSubmit: (payload: ApplyLeavePayload) => Promise<void>;
};

export function ApplyLeaveModal({ open, companyId, onClose, onSubmit }: Props) {
  const [values, setValues] = useState<FormValues>(EMPTY);
  const [employees, setEmployees] = useState<HrmEmployeeRecord[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (open) {
      setValues(EMPTY);
      setError(null);
    }
  }, [open]);

  useEffect(() => {
    if (!open || !companyId) return;
    void fetchHrEmployees(companyId, { status: "active" })
      .then(setEmployees)
      .catch(() => setEmployees([]));
  }, [open, companyId]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!values.employeeId) {
      setError("Select a valid employee.");
      return;
    }
    if (!values.from || !values.to) {
      setError("Start and end dates are required.");
      return;
    }

    const fromDate = new Date(values.from);
    const toDate = new Date(values.to);
    if (toDate < fromDate) {
      setError("End date must be on or after start date.");
      return;
    }
    const days = Math.max(1, Math.round((toDate.getTime() - fromDate.getTime()) / 86400000) + 1);

    setSubmitting(true);
    setError(null);
    try {
      await onSubmit({
        employeeId: values.employeeId,
        leaveType: values.leaveType,
        from: values.from,
        to: values.to,
        days,
        reason: values.reason.trim() || undefined,
      });
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not submit leave request.");
    } finally {
      setSubmitting(false);
    }
  };

  const set = <K extends keyof FormValues>(key: K, value: FormValues[K]) =>
    setValues((v) => ({ ...v, [key]: value }));

  return (
    <EnterpriseFormModal
      open={open}
      title="Apply for leave"
      description="Submit a leave request for approval by the employee's manager."
      onClose={onClose}
      size="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <FormField label="Employee" htmlFor="lv-employee">
          <select
            id="lv-employee"
            value={values.employeeId}
            onChange={(e) => {
              set("employeeId", e.target.value);
              if (error) setError(null);
            }}
            className={selectClassName}
          >
            <option value="">Select employee</option>
            {employees.map((emp) => (
              <option key={emp.id} value={emp.id}>
                {emp.name} · {emp.employeeCode}
              </option>
            ))}
          </select>
        </FormField>

        <FormField label="Leave type" htmlFor="lv-type">
          <select
            id="lv-type"
            value={values.leaveType}
            onChange={(e) => set("leaveType", e.target.value as LeaveType)}
            className={selectClassName}
          >
            {LEAVE_TYPES.map((t) => (
              <option key={t.id} value={t.id}>{t.label}</option>
            ))}
          </select>
        </FormField>

        <div className="grid gap-4 sm:grid-cols-2">
          <FormField label="From" htmlFor="lv-from">
            <input id="lv-from" type="date" value={values.from} onChange={(e) => set("from", e.target.value)} className={inputClassName} />
          </FormField>
          <FormField label="To" htmlFor="lv-to">
            <input id="lv-to" type="date" value={values.to} onChange={(e) => set("to", e.target.value)} className={inputClassName} />
          </FormField>
        </div>

        <FormField label="Reason (optional)" htmlFor="lv-reason">
          <textarea
            id="lv-reason"
            value={values.reason}
            onChange={(e) => set("reason", e.target.value)}
            rows={3}
            className={`${inputClassName} min-h-[80px] resize-y py-2`}
            placeholder="Brief reason for the request"
          />
        </FormField>

        {error ? <p className="text-sm font-medium text-rose-600">{error}</p> : null}

        <div className="flex justify-end gap-2 border-t border-slate-100 pt-4 dark:border-slate-800">
          <button type="button" onClick={onClose} className="h-10 rounded-lg px-4 text-sm font-medium text-slate-600 hover:bg-slate-100">
            Cancel
          </button>
          <button
            type="submit"
            disabled={submitting}
            className="h-10 rounded-lg bg-[#191970] px-5 text-sm font-semibold text-white hover:bg-[#12124a] disabled:opacity-50"
          >
            {submitting ? "Submitting…" : "Submit request"}
          </button>
        </div>
      </form>
    </EnterpriseFormModal>
  );
}
