"use client";

import { FormEvent, useEffect, useState } from "react";

import {
  EnterpriseFormModal,
  FormField,
  inputClassName,
  selectClassName,
} from "@/features/workspace/components/enterprise/enterprise-form-modal";
import { HRM_POLICY_CATEGORIES } from "@/features/workspace/data/hrm-policies-demo";
import type { CreatePolicyPayload, HrmPolicyCategory } from "@/types/hrm";

type Props = {
  open: boolean;
  onClose: () => void;
  onSubmit: (payload: CreatePolicyPayload) => Promise<void>;
};

export function PolicyCreateModal({ open, onClose, onSubmit }: Props) {
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState<HrmPolicyCategory>("hr");
  const [summary, setSummary] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!open) return;
    setTitle("");
    setCategory("hr");
    setSummary("");
    setError(null);
  }, [open]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !summary.trim()) {
      setError("Title and summary are required.");
      return;
    }
    setSubmitting(true);
    try {
      await onSubmit({
        title: title.trim(),
        category,
        summary: summary.trim(),
        sections: [
          { heading: "1. Overview", body: summary.trim() },
          {
            heading: "2. Scope",
            body: "Add detailed clauses before publishing this policy to the workforce.",
          },
        ],
      });
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not create policy.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <EnterpriseFormModal
      open={open}
      title="New policy"
      description="Draft a policy with sections. Expand content in the reader before publishing."
      onClose={onClose}
      size="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <FormField label="Policy title" htmlFor="pol-title">
          <input
            id="pol-title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className={inputClassName}
          />
        </FormField>
        <FormField label="Category" htmlFor="pol-cat">
          <select
            id="pol-cat"
            value={category}
            onChange={(e) => setCategory(e.target.value as HrmPolicyCategory)}
            className={selectClassName}
          >
            {HRM_POLICY_CATEGORIES.map((c) => (
              <option key={c.id} value={c.id}>
                {c.label}
              </option>
            ))}
          </select>
        </FormField>
        <FormField label="Executive summary" htmlFor="pol-summary">
          <textarea
            id="pol-summary"
            value={summary}
            onChange={(e) => setSummary(e.target.value)}
            rows={4}
            className={`${inputClassName} min-h-[100px] py-2`}
          />
        </FormField>
        {error ? <p className="text-sm text-rose-600">{error}</p> : null}
        <div className="flex justify-end gap-2 border-t pt-4">
          <button
            type="button"
            onClick={onClose}
            className="h-10 rounded-lg px-4 text-sm font-medium text-slate-600 hover:bg-slate-100"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={submitting}
            className="h-10 rounded-lg bg-[#191970] px-5 text-sm font-semibold text-white disabled:opacity-50"
          >
            {submitting ? "Saving…" : "Save draft"}
          </button>
        </div>
      </form>
    </EnterpriseFormModal>
  );
}
