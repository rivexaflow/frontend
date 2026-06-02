"use client";

import { FormEvent, useState } from "react";

import { leadFormSchema, type LeadFormValues } from "@/features/crm/schemas/crm.schema";
import {
  EnterpriseFormModal,
  FormField,
  inputClassName,
  selectClassName,
} from "@/features/workspace/components/enterprise/enterprise-form-modal";
import {
  scoreBandFromTotal,
  type LeadRecord,
} from "@/features/workspace/data/crm-demo";

const SOURCES = [
  "Inbound",
  "Outbound",
  "Partner",
  "Webinar",
  "Referral",
  "Paid ads",
  "Event",
] as const;

type Props = {
  open: boolean;
  onClose: () => void;
  onSubmit: (lead: LeadRecord) => void;
  defaultOwner?: string;
};

export function LeadFormModal({ open, onClose, onSubmit, defaultOwner = "Priya Singh" }: Props) {
  const [values, setValues] = useState<LeadFormValues>({
    name: "",
    title: "",
    company: "",
    email: "",
    phone: "",
    country: "",
    source: "Inbound",
    owner: defaultOwner,
  });
  const [errors, setErrors] = useState<Partial<Record<keyof LeadFormValues, string>>>({});
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const parsed = leadFormSchema.safeParse(values);
    if (!parsed.success) {
      const fieldErrors: Partial<Record<keyof LeadFormValues, string>> = {};
      for (const issue of parsed.error.issues) {
        const key = issue.path[0] as keyof LeadFormValues;
        if (!fieldErrors[key]) fieldErrors[key] = issue.message;
      }
      setErrors(fieldErrors);
      return;
    }
    setErrors({});
    setSubmitting(true);
    const fitScore = Math.floor(50 + Math.random() * 45);
    const engagementScore = Math.floor(40 + Math.random() * 50);
    const score = Math.min(100, Math.round((fitScore + engagementScore) / 2));
    const refNum = `LEAD-2026-${2200 + Math.floor(Math.random() * 99)}`;
    const lead: LeadRecord = {
      id: `l${Date.now()}`,
      reference: refNum,
      name: parsed.data.name,
      title: parsed.data.title,
      company: parsed.data.company,
      email: parsed.data.email,
      phone: parsed.data.phone || undefined,
      country: parsed.data.country,
      source: parsed.data.source,
      owner: parsed.data.owner,
      status: "new",
      lifecycle: "lead",
      score,
      fitScore,
      engagementScore,
      scoreBand: scoreBandFromTotal(score),
      slaStatus: "on_track",
      slaDue: "24h left",
      firstTouchDue: "Due today",
      lastActivity: "Created",
      updatedAt: "Just now",
      touchCount: 0,
    };
    onSubmit(lead);
    setValues({
      name: "",
      title: "",
      company: "",
      email: "",
      phone: "",
      country: "",
      source: "Inbound",
      owner: defaultOwner,
    });
    setSubmitting(false);
    onClose();
  };

  return (
    <EnterpriseFormModal
      open={open}
      onClose={onClose}
      title="New lead"
      description="Capture lead for scoring, routing, and SLA-tracked follow-up."
      size="lg"
    >
      <form onSubmit={handleSubmit} className="grid gap-4" noValidate>
        <div className="grid gap-4 sm:grid-cols-2">
          <FormField label="Full name" htmlFor="lead-name" error={errors.name}>
            <input
              id="lead-name"
              value={values.name}
              onChange={(e) => setValues((v) => ({ ...v, name: e.target.value }))}
              className={inputClassName}
            />
          </FormField>
          <FormField label="Job title" htmlFor="lead-title" error={errors.title}>
            <input
              id="lead-title"
              value={values.title}
              onChange={(e) => setValues((v) => ({ ...v, title: e.target.value }))}
              className={inputClassName}
              placeholder="VP Sales"
            />
          </FormField>
        </div>
        <FormField label="Company" htmlFor="lead-company" error={errors.company}>
          <input
            id="lead-company"
            value={values.company}
            onChange={(e) => setValues((v) => ({ ...v, company: e.target.value }))}
            className={inputClassName}
          />
        </FormField>
        <FormField label="Work email" htmlFor="lead-email" error={errors.email}>
          <input
            id="lead-email"
            type="email"
            value={values.email}
            onChange={(e) => setValues((v) => ({ ...v, email: e.target.value }))}
            className={inputClassName}
          />
        </FormField>
        <div className="grid gap-4 sm:grid-cols-2">
          <FormField label="Phone (optional)" htmlFor="lead-phone" error={errors.phone}>
            <input
              id="lead-phone"
              value={values.phone ?? ""}
              onChange={(e) => setValues((v) => ({ ...v, phone: e.target.value }))}
              className={inputClassName}
            />
          </FormField>
          <FormField label="Country" htmlFor="lead-country" error={errors.country}>
            <input
              id="lead-country"
              value={values.country}
              onChange={(e) => setValues((v) => ({ ...v, country: e.target.value }))}
              className={inputClassName}
              placeholder="United States"
            />
          </FormField>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <FormField label="Source" htmlFor="lead-source" error={errors.source}>
            <select
              id="lead-source"
              value={values.source}
              onChange={(e) =>
                setValues((v) => ({ ...v, source: e.target.value as LeadFormValues["source"] }))
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
          <FormField label="Owner" htmlFor="lead-owner" error={errors.owner}>
            <input
              id="lead-owner"
              value={values.owner}
              onChange={(e) => setValues((v) => ({ ...v, owner: e.target.value }))}
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
            className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-70"
          >
            Create lead
          </button>
        </div>
      </form>
    </EnterpriseFormModal>
  );
}
