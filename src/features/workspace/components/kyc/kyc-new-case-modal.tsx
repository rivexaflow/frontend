"use client";

import { FormEvent, useState } from "react";

import { kycCaseFormSchema, type KycCaseFormValues } from "@/features/kyc/schemas/kyc.schema";
import {
  EnterpriseFormModal,
  FormField,
  inputClassName,
  selectClassName,
} from "@/features/workspace/components/enterprise/enterprise-form-modal";
import {
  VERIFICATION_TYPE_LABELS,
  type KycCase,
  type VerificationType,
} from "@/features/workspace/data/kyc-demo";

type Props = {
  open: boolean;
  onClose: () => void;
  onSubmit: (caseRecord: KycCase) => void;
  defaultOwner?: string;
};

export function KycNewCaseModal({ open, onClose, onSubmit, defaultOwner = "Priya Singh" }: Props) {
  const [values, setValues] = useState<KycCaseFormValues>({
    applicantName: "",
    company: "",
    email: "",
    verificationType: "individual_kyc",
    jurisdiction: "",
    owner: defaultOwner,
  });
  const [errors, setErrors] = useState<Partial<Record<keyof KycCaseFormValues, string>>>({});

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const parsed = kycCaseFormSchema.safeParse(values);
    if (!parsed.success) {
      const fieldErrors: Partial<Record<keyof KycCaseFormValues, string>> = {};
      for (const issue of parsed.error.issues) {
        const key = issue.path[0] as keyof KycCaseFormValues;
        if (!fieldErrors[key]) fieldErrors[key] = issue.message;
      }
      setErrors(fieldErrors);
      return;
    }
    setErrors({});
    const refNum = `KYC-2026-${1000 + Math.floor(Math.random() * 900)}`;
    const record: KycCase = {
      id: `kc${Date.now()}`,
      reference: refNum,
      applicant: parsed.data.applicantName,
      company: parsed.data.company,
      email: parsed.data.email,
      verificationType: parsed.data.verificationType,
      jurisdiction: parsed.data.jurisdiction,
      risk: "medium",
      status: "pending",
      owner: parsed.data.owner,
      provider: "Onfido",
      aiScore: 0,
      slaDue: "24h",
      createdAt: "Just now",
      pepHit: false,
      sanctionsHit: false,
      documentsComplete: 0,
      documentsTotal: parsed.data.verificationType === "corporate_kyb" ? 6 : 3,
    };
    onSubmit(record);
    setValues({
      applicantName: "",
      company: "",
      email: "",
      verificationType: "individual_kyc",
      jurisdiction: "",
      owner: defaultOwner,
    });
    onClose();
  };

  return (
    <EnterpriseFormModal
      open={open}
      onClose={onClose}
      title="Open verification case"
      description="Start individual KYC, corporate KYB, UBO, or enhanced due diligence."
      size="lg"
    >
      <form onSubmit={handleSubmit} className="grid gap-4" noValidate>
        <FormField label="Applicant name" htmlFor="kyc-name" error={errors.applicantName}>
          <input
            id="kyc-name"
            value={values.applicantName}
            onChange={(e) => setValues((v) => ({ ...v, applicantName: e.target.value }))}
            className={inputClassName}
          />
        </FormField>
        <FormField label="Company / entity" htmlFor="kyc-company" error={errors.company}>
          <input
            id="kyc-company"
            value={values.company}
            onChange={(e) => setValues((v) => ({ ...v, company: e.target.value }))}
            className={inputClassName}
          />
        </FormField>
        <FormField label="Email" htmlFor="kyc-email" error={errors.email}>
          <input
            id="kyc-email"
            type="email"
            value={values.email}
            onChange={(e) => setValues((v) => ({ ...v, email: e.target.value }))}
            className={inputClassName}
          />
        </FormField>
        <div className="grid gap-4 sm:grid-cols-2">
          <FormField label="Verification type" htmlFor="kyc-type" error={errors.verificationType}>
            <select
              id="kyc-type"
              value={values.verificationType}
              onChange={(e) =>
                setValues((v) => ({
                  ...v,
                  verificationType: e.target.value as VerificationType,
                }))
              }
              className={selectClassName}
            >
              {(Object.keys(VERIFICATION_TYPE_LABELS) as VerificationType[]).map((t) => (
                <option key={t} value={t}>
                  {VERIFICATION_TYPE_LABELS[t]}
                </option>
              ))}
            </select>
          </FormField>
          <FormField label="Jurisdiction" htmlFor="kyc-jurisdiction" error={errors.jurisdiction}>
            <input
              id="kyc-jurisdiction"
              value={values.jurisdiction}
              onChange={(e) => setValues((v) => ({ ...v, jurisdiction: e.target.value }))}
              className={inputClassName}
              placeholder="e.g. United Kingdom"
            />
          </FormField>
        </div>
        <FormField label="Case owner" htmlFor="kyc-owner" error={errors.owner}>
          <input
            id="kyc-owner"
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
            className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
          >
            Create case
          </button>
        </div>
      </form>
    </EnterpriseFormModal>
  );
}
