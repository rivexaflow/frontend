"use client";

import { FormEvent, useEffect, useState } from "react";

import { dealFormSchema, type DealFormValues } from "@/features/crm/schemas/crm.schema";
import {
  EnterpriseFormModal,
  FormField,
  inputClassName,
  selectClassName,
} from "@/features/workspace/components/enterprise/enterprise-form-modal";
import { DEAL_STAGE_META, type DealRecord, type DealStage } from "@/features/workspace/data/deals-demo";

const STAGES = Object.keys(DEAL_STAGE_META) as DealStage[];
const SOURCES = ["Inbound", "Outbound", "Partner", "Webinar", "Referral", "Event"] as const;

const DEFAULT_VALUES: DealFormValues = {
  title: "",
  company: "",
  contact: "",
  phone: "",
  value: 0,
  currency: "USD",
  stage: "qualification",
  owner: "Priya Singh",
  closeDate: "",
  priority: "medium",
  source: "Inbound",
};

type Props = {
  open: boolean;
  onClose: () => void;
  onSubmit: (deal: DealRecord) => void;
  initial?: DealRecord | null;
};

export function DealFormModal({ open, onClose, onSubmit, initial }: Props) {
  const isEdit = Boolean(initial);
  const [values, setValues] = useState<DealFormValues>(DEFAULT_VALUES);
  const [errors, setErrors] = useState<Partial<Record<keyof DealFormValues, string>>>({});
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!open) return;
    if (initial) {
      setValues({
        title: initial.title,
        company: initial.company,
        contact: initial.contact,
        phone: "",
        value: initial.value,
        currency: initial.currency as DealFormValues["currency"],
        stage: initial.stage,
        owner: initial.owner,
        closeDate: initial.closeDate,
        priority: initial.priority,
        source: initial.source as DealFormValues["source"],
      });
    } else {
      setValues(DEFAULT_VALUES);
    }
    setErrors({});
    setSubmitting(false);
  }, [open, initial]);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const parsed = dealFormSchema.safeParse(values);
    if (!parsed.success) {
      const fieldErrors: Partial<Record<keyof DealFormValues, string>> = {};
      for (const issue of parsed.error.issues) {
        const key = issue.path[0] as keyof DealFormValues;
        if (!fieldErrors[key]) fieldErrors[key] = issue.message;
      }
      setErrors(fieldErrors);
      return;
    }
    setErrors({});
    setSubmitting(true);

    const probabilityByStage: Record<DealStage, number> = {
      qualification: 15,
      discovery: 30,
      proposal: 50,
      negotiation: 70,
      closed_won: 100,
      closed_lost: 0,
    };

    const deal: DealRecord = {
      id: initial?.id ?? `d${Date.now()}`,
      reference: initial?.reference ?? `DEAL-2026-${String(Math.floor(Math.random() * 9000) + 1000)}`,
      title: parsed.data.title,
      company: parsed.data.company,
      contact: parsed.data.contact,
      value: parsed.data.value,
      currency: parsed.data.currency,
      stage: parsed.data.stage,
      probability: probabilityByStage[parsed.data.stage],
      owner: parsed.data.owner,
      closeDate: parsed.data.closeDate,
      lastActivity: "Just now",
      priority: parsed.data.priority,
      source: parsed.data.source,
    };

    onSubmit(deal);
    setSubmitting(false);
    onClose();
  };

  return (
    <EnterpriseFormModal
      open={open}
      onClose={onClose}
      title={isEdit ? "Edit deal" : "New deal"}
      description="Track revenue opportunities with stage, value, and ownership."
      size="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-4" noValidate>
        <FormField label="Deal name" htmlFor="deal-title" error={errors.title}>
          <input
            id="deal-title"
            value={values.title}
            onChange={(e) => setValues((v) => ({ ...v, title: e.target.value }))}
            className={inputClassName}
            placeholder="Enterprise rollout"
          />
        </FormField>

        <div className="grid gap-4 sm:grid-cols-2">
          <FormField label="Company" htmlFor="deal-company" error={errors.company}>
            <input
              id="deal-company"
              value={values.company}
              onChange={(e) => setValues((v) => ({ ...v, company: e.target.value }))}
              className={inputClassName}
            />
          </FormField>
          <FormField label="Primary contact" htmlFor="deal-contact" error={errors.contact}>
            <input
              id="deal-contact"
              value={values.contact}
              onChange={(e) => setValues((v) => ({ ...v, contact: e.target.value }))}
              className={inputClassName}
            />
          </FormField>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <FormField label="Phone (optional)" htmlFor="deal-phone" error={errors.phone}>
            <input
              id="deal-phone"
              value={values.phone ?? ""}
              onChange={(e) => setValues((v) => ({ ...v, phone: e.target.value }))}
              className={inputClassName}
            />
          </FormField>
          <FormField label="Owner" htmlFor="deal-owner" error={errors.owner}>
            <input
              id="deal-owner"
              value={values.owner}
              onChange={(e) => setValues((v) => ({ ...v, owner: e.target.value }))}
              className={inputClassName}
            />
          </FormField>
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          <FormField label="Value" htmlFor="deal-value" error={errors.value}>
            <input
              id="deal-value"
              type="number"
              min={0}
              step={1000}
              value={values.value || ""}
              onChange={(e) => setValues((v) => ({ ...v, value: Number(e.target.value) }))}
              className={inputClassName}
            />
          </FormField>
          <FormField label="Currency" htmlFor="deal-currency" error={errors.currency}>
            <select
              id="deal-currency"
              value={values.currency}
              onChange={(e) =>
                setValues((v) => ({ ...v, currency: e.target.value as DealFormValues["currency"] }))
              }
              className={selectClassName}
            >
              <option value="USD">USD</option>
              <option value="EUR">EUR</option>
              <option value="GBP">GBP</option>
              <option value="INR">INR</option>
            </select>
          </FormField>
          <FormField label="Priority" htmlFor="deal-priority" error={errors.priority}>
            <select
              id="deal-priority"
              value={values.priority}
              onChange={(e) =>
                setValues((v) => ({ ...v, priority: e.target.value as DealFormValues["priority"] }))
              }
              className={selectClassName}
            >
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>
          </FormField>
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          <FormField label="Stage" htmlFor="deal-stage" error={errors.stage}>
            <select
              id="deal-stage"
              value={values.stage}
              onChange={(e) =>
                setValues((v) => ({ ...v, stage: e.target.value as DealFormValues["stage"] }))
              }
              className={selectClassName}
            >
              {STAGES.map((s) => (
                <option key={s} value={s}>
                  {DEAL_STAGE_META[s].label}
                </option>
              ))}
            </select>
          </FormField>
          <FormField label="Source" htmlFor="deal-source" error={errors.source}>
            <select
              id="deal-source"
              value={values.source}
              onChange={(e) =>
                setValues((v) => ({ ...v, source: e.target.value as DealFormValues["source"] }))
              }
              className={selectClassName}
            >
              {SOURCES.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </FormField>
          <FormField label="Expected close" htmlFor="deal-close" error={errors.closeDate}>
            <input
              id="deal-close"
              type="date"
              value={values.closeDate}
              onChange={(e) => setValues((v) => ({ ...v, closeDate: e.target.value }))}
              className={inputClassName}
            />
          </FormField>
        </div>

        <div className="flex justify-end gap-2 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={submitting}
            className="rounded-lg bg-[#191970] px-4 py-2 text-sm font-semibold text-white hover:bg-[#12124a] disabled:opacity-70"
          >
            {isEdit ? "Save deal" : "Create deal"}
          </button>
        </div>
      </form>
    </EnterpriseFormModal>
  );
}
