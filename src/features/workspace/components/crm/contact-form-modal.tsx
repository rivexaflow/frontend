"use client";

import { FormEvent, useState } from "react";

import { contactFormSchema, type ContactFormValues } from "@/features/crm/schemas/crm.schema";
import {
  EnterpriseFormModal,
  FormField,
  inputClassName,
} from "@/features/workspace/components/enterprise/enterprise-form-modal";
import type { ContactRecord } from "@/features/workspace/data/crm-demo";

type Props = {
  open: boolean;
  onClose: () => void;
  onSubmit: (contact: ContactRecord) => void;
  defaultOwner?: string;
};

export function ContactFormModal({ open, onClose, onSubmit, defaultOwner = "Priya Singh" }: Props) {
  const [values, setValues] = useState<ContactFormValues>({
    name: "",
    company: "",
    email: "",
    role: "",
    owner: defaultOwner,
  });
  const [errors, setErrors] = useState<Partial<Record<keyof ContactFormValues, string>>>({});
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const parsed = contactFormSchema.safeParse(values);
    if (!parsed.success) {
      const fieldErrors: Partial<Record<keyof ContactFormValues, string>> = {};
      for (const issue of parsed.error.issues) {
        const key = issue.path[0] as keyof ContactFormValues;
        if (!fieldErrors[key]) fieldErrors[key] = issue.message;
      }
      setErrors(fieldErrors);
      return;
    }
    setErrors({});
    setSubmitting(true);
    const contact: ContactRecord = {
      id: `c${Date.now()}`,
      ...parsed.data,
      engagement: "medium",
      lastTouch: "Just now",
    };
    onSubmit(contact);
    setValues({ name: "", company: "", email: "", role: "", owner: defaultOwner });
    setSubmitting(false);
    onClose();
  };

  return (
    <EnterpriseFormModal
      open={open}
      onClose={onClose}
      title="Add contact"
      description="Add a stakeholder to your account directory with owner assignment."
    >
      <form onSubmit={handleSubmit} className="grid gap-4" noValidate>
        <FormField label="Full name" htmlFor="contact-name" error={errors.name}>
          <input
            id="contact-name"
            value={values.name}
            onChange={(e) => setValues((v) => ({ ...v, name: e.target.value }))}
            className={inputClassName}
          />
        </FormField>
        <FormField label="Company" htmlFor="contact-company" error={errors.company}>
          <input
            id="contact-company"
            value={values.company}
            onChange={(e) => setValues((v) => ({ ...v, company: e.target.value }))}
            className={inputClassName}
          />
        </FormField>
        <FormField label="Email" htmlFor="contact-email" error={errors.email}>
          <input
            id="contact-email"
            type="email"
            value={values.email}
            onChange={(e) => setValues((v) => ({ ...v, email: e.target.value }))}
            className={inputClassName}
          />
        </FormField>
        <FormField label="Role / title" htmlFor="contact-role" error={errors.role}>
          <input
            id="contact-role"
            value={values.role}
            onChange={(e) => setValues((v) => ({ ...v, role: e.target.value }))}
            className={inputClassName}
            placeholder="VP Operations"
          />
        </FormField>
        <FormField label="Owner" htmlFor="contact-owner" error={errors.owner}>
          <input
            id="contact-owner"
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
            Save contact
          </button>
        </div>
      </form>
    </EnterpriseFormModal>
  );
}
