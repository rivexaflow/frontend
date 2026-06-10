"use client";

import { FormEvent, useState } from "react";
import { Upload } from "lucide-react";

import {
  EnterpriseFormModal,
  FormField,
  inputClassName,
} from "@/features/workspace/components/enterprise/enterprise-form-modal";
import type { BulkImportEmployeeRow } from "@/types/hrm";

type Props = {
  open: boolean;
  onClose: () => void;
  onSubmit: (rows: BulkImportEmployeeRow[]) => Promise<void>;
};

function parseCsvRows(text: string): BulkImportEmployeeRow[] {
  const lines = text
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean);
  if (lines.length === 0) return [];

  const rows: BulkImportEmployeeRow[] = [];
  const startIdx = lines[0].toLowerCase().includes("email") ? 1 : 0;

  for (let i = startIdx; i < lines.length; i++) {
    const parts = lines[i].split(",").map((p) => p.trim().replace(/^"|"$/g, ""));
    if (parts.length < 2) continue;
    const fullName = parts[0];
    const email = parts[1];
    const salary = parts[2] ? Number(parts[2]) : undefined;
    if (!fullName || !email) continue;
    rows.push({
      fullName,
      email,
      salaryAmount: Number.isFinite(salary) ? salary : undefined,
    });
  }
  return rows;
}

export function BulkImportModal({ open, onClose, onSubmit }: Props) {
  const [csvText, setCsvText] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const rows = parseCsvRows(csvText);
    if (rows.length === 0) {
      setError("Add at least one row: Full Name, Email, Salary (optional).");
      return;
    }
    setError(null);
    setSubmitting(true);
    try {
      await onSubmit(rows);
      setCsvText("");
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Import failed.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <EnterpriseFormModal
      open={open}
      title="Bulk import employees"
      description="Paste CSV rows: Full Name, Email, Salary (optional). Header row is optional."
      onClose={onClose}
      size="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <FormField label="Employee rows" htmlFor="bulk-csv">
          <textarea
            id="bulk-csv"
            value={csvText}
            onChange={(e) => setCsvText(e.target.value)}
            rows={8}
            placeholder={"Priya Mehta, priya@acme.com, 285000\nAnil Yadav, anil@acme.com, 165000"}
            className={`${inputClassName} min-h-[180px] py-2 font-mono text-sm`}
          />
        </FormField>
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
            <Upload className="h-4 w-4" />
            {submitting ? "Importing…" : "Import employees"}
          </button>
        </div>
      </form>
    </EnterpriseFormModal>
  );
}
