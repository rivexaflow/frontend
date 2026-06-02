"use client";

import { FormEvent, useState } from "react";

import {
  opportunityFormSchema,
  type OpportunityFormValues,
} from "@/features/crm/schemas/crm.schema";
import {
  EnterpriseFormModal,
  FormField,
  inputClassName,
  selectClassName,
} from "@/features/workspace/components/enterprise/enterprise-form-modal";
import { PIPELINE_STAGES, type OpportunityRecord } from "@/features/workspace/data/crm-demo";

type Props = {
  open: boolean;
  onClose: () => void;
  onSubmit: (deal: OpportunityRecord) => void;
  defaultOwner?: string;
};

const defaultCloseDate = () => {
  const d = new Date();
  d.setDate(d.getDate() + 30);
  return d.toISOString().slice(0, 10);
};

export function OpportunityFormModal({
  open,
  onClose,
  onSubmit,
  defaultOwner = "Priya Singh",
}: Props) {
  const [values, setValues] = useState<OpportunityFormValues>({
    title: "",
    company: "",
    value: 50000,
    stageId: "discovery",
    owner: defaultOwner,
    closeDate: defaultCloseDate(),
    priority: "medium",
  });
  const [errors, setErrors] = useState<Partial<Record<keyof OpportunityFormValues, string>>>({});
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const parsed = opportunityFormSchema.safeParse(values);
    if (!parsed.success) {
      const fieldErrors: Partial<Record<keyof OpportunityFormValues, string>> = {};
      for (const issue of parsed.error.issues) {
        const key = issue.path[0] as keyof OpportunityFormValues;
        if (!fieldErrors[key]) fieldErrors[key] = issue.message;
      }
      setErrors(fieldErrors);
      return;
    }
    setErrors({});
    setSubmitting(true);
    const stageProb: Record<string, number> = {
      discovery: 20,
      qualified: 40,
      proposal: 55,
      negotiation: 75,
      closed_won: 100,
    };
    const deal: OpportunityRecord = {
      id: `o${Date.now()}`,
      title: parsed.data.title,
      company: parsed.data.company,
      value: parsed.data.value,
      stageId: parsed.data.stageId,
      owner: parsed.data.owner,
      closeDate: parsed.data.closeDate,
      priority: parsed.data.priority,
      probability: stageProb[parsed.data.stageId] ?? 25,
    };
    onSubmit(deal);
    setValues({
      title: "",
      company: "",
      value: 50000,
      stageId: "discovery",
      owner: defaultOwner,
      closeDate: defaultCloseDate(),
      priority: "medium",
    });
    setSubmitting(false);
    onClose();
  };

  return (
    <EnterpriseFormModal
      open={open}
      onClose={onClose}
      title="New opportunity"
      description="Add a deal to your pipeline. Drag cards between stages after creation."
      size="lg"
    >
      <form onSubmit={handleSubmit} className="grid gap-4" noValidate>
        <FormField label="Deal name" htmlFor="opp-title" error={errors.title}>
          <input
            id="opp-title"
            value={values.title}
            onChange={(e) => setValues((v) => ({ ...v, title: e.target.value }))}
            className={inputClassName}
            placeholder="Enterprise CRM rollout"
          />
        </FormField>
        <FormField label="Company" htmlFor="opp-company" error={errors.company}>
          <input
            id="opp-company"
            value={values.company}
            onChange={(e) => setValues((v) => ({ ...v, company: e.target.value }))}
            className={inputClassName}
          />
        </FormField>
        <div className="grid gap-4 sm:grid-cols-2">
          <FormField label="Amount (USD)" htmlFor="opp-value" error={errors.value}>
            <input
              id="opp-value"
              type="number"
              min={1}
              value={values.value}
              onChange={(e) => setValues((v) => ({ ...v, value: Number(e.target.value) }))}
              className={inputClassName}
            />
          </FormField>
          <FormField label="Stage" htmlFor="opp-stage" error={errors.stageId}>
            <select
              id="opp-stage"
              value={values.stageId}
              onChange={(e) => setValues((v) => ({ ...v, stageId: e.target.value }))}
              className={selectClassName}
            >
              {PIPELINE_STAGES.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
          </FormField>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <FormField label="Expected close" htmlFor="opp-close" error={errors.closeDate}>
            <input
              id="opp-close"
              type="date"
              value={values.closeDate}
              onChange={(e) => setValues((v) => ({ ...v, closeDate: e.target.value }))}
              className={inputClassName}
            />
          </FormField>
          <FormField label="Priority" htmlFor="opp-priority" error={errors.priority}>
            <select
              id="opp-priority"
              value={values.priority}
              onChange={(e) =>
                setValues((v) => ({
                  ...v,
                  priority: e.target.value as OpportunityFormValues["priority"],
                }))
              }
              className={selectClassName}
            >
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>
          </FormField>
        </div>
        <FormField label="Owner" htmlFor="opp-owner" error={errors.owner}>
          <input
            id="opp-owner"
            value={values.owner}
            onChange={(e) => setValues((v) => ({ ...v, owner: e.target.value }))}
            className={inputClassName}
          />
        </FormField>
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
            Create opportunity
          </button>
        </div>
      </form>
    </EnterpriseFormModal>
  );
}
