"use client";

import { FormEvent, useEffect, useState } from "react";
import { Loader2 } from "lucide-react";

import {
  EnterpriseFormModal,
  FormField,
  inputClassName,
  selectClassName,
} from "@/features/workspace/components/enterprise/enterprise-form-modal";
import { HRM_EMPLOYMENT_TYPES } from "@/features/workspace/data/hrm-employees-demo";
import type { CreateEmployeePayload, HrmDepartment, HrmEmploymentType, HrmRole } from "@/types/hrm";

type FormValues = {
  name: string;
  email: string;
  phone: string;
  designation: string;
  departmentId: string;
  departmentName: string;
  location: string;
  employmentType: HrmEmploymentType;
  managerId: string;
  hrRoleId: string;
};

const EMPTY: FormValues = {
  name: "",
  email: "",
  phone: "",
  designation: "",
  departmentId: "",
  departmentName: "",
  location: "",
  employmentType: "full_time",
  managerId: "",
  hrRoleId: "",
};

type Props = {
  open: boolean;
  onClose: () => void;
  onSubmit: (payload: CreateEmployeePayload) => Promise<void>;
  managers: { id: string; name: string; designation: string }[];
  departments: HrmDepartment[];
  roles: HrmRole[];
  locations: string[];
  nextEmployeeCode: string;
};

export function AddEmployeeModal({
  open,
  onClose,
  onSubmit,
  managers,
  departments,
  roles,
  locations,
  nextEmployeeCode,
}: Props) {
  const [values, setValues] = useState<FormValues>(EMPTY);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (open) {
      setValues(EMPTY);
      setError(null);
      setSubmitting(false);
    }
  }, [open]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!values.name.trim()) {
      setError("Full name is required.");
      return;
    }
    if (!values.email.trim() || !values.email.includes("@")) {
      setError("A valid work email is required.");
      return;
    }
    if (!values.designation.trim()) {
      setError("Designation is required.");
      return;
    }
    if (!values.departmentId && !values.departmentName.trim()) {
      setError("Select or enter a department.");
      return;
    }

    const selectedDept = departments.find((d) => d.id === values.departmentId);

    setSubmitting(true);
    setError(null);
    try {
      await onSubmit({
        fullName: values.name.trim(),
        email: values.email.trim().toLowerCase(),
        phone: values.phone.trim() || undefined,
        employeeCode: nextEmployeeCode,
        designation: values.designation.trim(),
        departmentId: values.departmentId || undefined,
        department: selectedDept?.name ?? (values.departmentName.trim() || undefined),
        location: values.location.trim() || undefined,
        managerId: values.managerId || null,
        hrRoleId: values.hrRoleId || null,
        employmentType: values.employmentType,
        status: "probation",
        workMode: "hybrid",
      });
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not create employee.");
    } finally {
      setSubmitting(false);
    }
  };

  const set = <K extends keyof FormValues>(key: K, value: FormValues[K]) =>
    setValues((v) => ({ ...v, [key]: value }));

  return (
    <EnterpriseFormModal
      open={open}
      title="Add employee"
      description="Create a new employee record. They will start in probation until onboarding is complete."
      onClose={onClose}
      size="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <FormField label="Full name" htmlFor="emp-name" error={error && !values.name.trim() ? error : undefined}>
            <input
              id="emp-name"
              value={values.name}
              onChange={(e) => {
                set("name", e.target.value);
                if (error) setError(null);
              }}
              className={inputClassName}
              placeholder="e.g. Alex Morgan"
              disabled={submitting}
            />
          </FormField>
          <FormField label="Work email" htmlFor="emp-email">
            <input
              id="emp-email"
              type="email"
              value={values.email}
              onChange={(e) => {
                set("email", e.target.value);
                if (error) setError(null);
              }}
              className={inputClassName}
              placeholder="alex.morgan@acme.com"
              disabled={submitting}
            />
          </FormField>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <FormField label="Phone" htmlFor="emp-phone">
            <input
              id="emp-phone"
              value={values.phone}
              onChange={(e) => set("phone", e.target.value)}
              className={inputClassName}
              placeholder="+91 98765 43210"
              disabled={submitting}
            />
          </FormField>
          <FormField label="Designation" htmlFor="emp-designation">
            <input
              id="emp-designation"
              value={values.designation}
              onChange={(e) => set("designation", e.target.value)}
              className={inputClassName}
              placeholder="e.g. Sales Executive"
              disabled={submitting}
            />
          </FormField>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <FormField label="Employee ID" htmlFor="emp-code">
            <input id="emp-code" value={nextEmployeeCode} readOnly className={cnReadOnly(inputClassName)} />
          </FormField>
          <FormField label="HR role" htmlFor="emp-hr-role">
            <select
              id="emp-hr-role"
              value={values.hrRoleId}
              onChange={(e) => set("hrRoleId", e.target.value)}
              className={selectClassName}
              disabled={submitting}
            >
              <option value="">No custom role</option>
              {roles.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.name}
                </option>
              ))}
            </select>
          </FormField>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <FormField label="Department" htmlFor="emp-department">
            <select
              id="emp-department"
              value={values.departmentId}
              onChange={(e) => {
                set("departmentId", e.target.value);
                const dept = departments.find((d) => d.id === e.target.value);
                if (dept) set("departmentName", dept.name);
              }}
              className={selectClassName}
              disabled={submitting}
            >
              <option value="">Select department…</option>
              {departments.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.name}
                </option>
              ))}
            </select>
          </FormField>
          <FormField label="Or new department" htmlFor="emp-department-name">
            <input
              id="emp-department-name"
              value={values.departmentName}
              onChange={(e) => {
                set("departmentName", e.target.value);
                if (e.target.value) set("departmentId", "");
              }}
              className={inputClassName}
              placeholder="e.g. Revenue"
              disabled={submitting || Boolean(values.departmentId)}
            />
          </FormField>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <FormField label="Location" htmlFor="emp-location">
            <input
              id="emp-location"
              list="emp-locations"
              value={values.location}
              onChange={(e) => set("location", e.target.value)}
              className={inputClassName}
              placeholder="e.g. Mumbai, IN"
              disabled={submitting}
            />
            <datalist id="emp-locations">
              {locations.map((l) => (
                <option key={l} value={l} />
              ))}
            </datalist>
          </FormField>
          <FormField label="Employment type" htmlFor="emp-type">
            <select
              id="emp-type"
              value={values.employmentType}
              onChange={(e) => set("employmentType", e.target.value as HrmEmploymentType)}
              className={selectClassName}
              disabled={submitting}
            >
              {HRM_EMPLOYMENT_TYPES.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.label}
                </option>
              ))}
            </select>
          </FormField>
        </div>

        <FormField label="Reports to" htmlFor="emp-manager">
          <select
            id="emp-manager"
            value={values.managerId}
            onChange={(e) => set("managerId", e.target.value)}
            className={selectClassName}
            disabled={submitting}
          >
            <option value="">No manager (top level)</option>
            {managers.map((m) => (
              <option key={m.id} value={m.id}>
                {m.name} · {m.designation}
              </option>
            ))}
          </select>
        </FormField>

        {error ? <p className="text-sm font-medium text-rose-600">{error}</p> : null}

        <div className="flex justify-end gap-2 border-t border-slate-100 pt-4 dark:border-slate-800">
          <button
            type="button"
            onClick={onClose}
            disabled={submitting}
            className="h-10 rounded-lg px-4 text-sm font-medium text-slate-600 transition hover:bg-slate-100 disabled:opacity-50 dark:text-slate-300 dark:hover:bg-slate-800"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={submitting}
            className="inline-flex h-10 items-center gap-2 rounded-lg bg-[#191970] px-5 text-sm font-semibold text-white transition hover:bg-[#12124a] disabled:opacity-60"
          >
            {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
            Add employee
          </button>
        </div>
      </form>
    </EnterpriseFormModal>
  );
}

function cnReadOnly(base: string) {
  return `${base} cursor-not-allowed bg-slate-50 text-slate-500 dark:bg-slate-900/60`;
}
