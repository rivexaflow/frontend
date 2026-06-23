"use client";

import { FormEvent, useEffect, useState } from "react";
import {
  Check,
  ChevronLeft,
  ChevronRight,
  FileText,
  Globe,
  Image as ImageIcon,
  Shield,
  Upload,
} from "lucide-react";

import { EnterpriseFormModal, FormField, inputClassName, selectClassName } from "@/features/workspace/components/enterprise/enterprise-form-modal";
import {
  GRIEVANCE_CATEGORIES,
  type GrievanceCategory,
  type GrievanceEvidence,
  type GrievancePriority,
} from "@/features/workspace/data/hrm-grievances-demo";
import { cn } from "@/lib/utils/cn";

export type GrievanceSubmitValues = {
  category: GrievanceCategory;
  anonymous: boolean;
  language: string;
  subject: string;
  description: string;
  department: string;
  priority: GrievancePriority;
  evidence: GrievanceEvidence[];
};

const STEPS = ["Category", "Details", "Evidence", "Review"] as const;
const LANGUAGES = ["English", "Hindi", "Marathi", "Tamil", "Telugu"];
const DEPARTMENTS = ["Operations", "Marketing", "Finance", "Engineering", "HR", "Sales"];

const EMPTY: GrievanceSubmitValues = {
  category: "Policy concern",
  anonymous: false,
  language: "English",
  subject: "",
  description: "",
  department: "",
  priority: "medium",
  evidence: [],
};

type Props = {
  open: boolean;
  onClose: () => void;
  onSubmit: (values: GrievanceSubmitValues) => void;
};

export function GrievanceSubmitWizard({ open, onClose, onSubmit }: Props) {
  const [step, setStep] = useState(0);
  const [values, setValues] = useState<GrievanceSubmitValues>(EMPTY);
  const [errors, setErrors] = useState<Partial<Record<string, string>>>({});

  useEffect(() => {
    if (!open) return;
    setStep(0);
    setValues(EMPTY);
    setErrors({});
  }, [open]);

  const set = <K extends keyof GrievanceSubmitValues>(key: K, value: GrievanceSubmitValues[K]) => {
    setValues((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => ({ ...prev, [key]: undefined }));
  };

  const validateStep = () => {
    const next: Record<string, string> = {};
    if (step === 1) {
      if (!values.subject.trim()) next.subject = "Please add a short subject line";
      if (values.description.trim().length < 20) next.description = "Tell us a bit more — at least 20 characters helps HR respond faster";
      if (!values.department) next.department = "Select your department";
    }
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleNext = () => {
    if (step < STEPS.length - 1) {
      if (step === 1 && !validateStep()) return;
      setStep((s) => s + 1);
    }
  };

  const handleBack = () => setStep((s) => Math.max(0, s - 1));

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    onSubmit(values);
    onClose();
  };

  const handleFilePick = () => {
    const demo: GrievanceEvidence = {
      id: `ev-${Date.now()}`,
      name: "supporting-document.pdf",
      sizeLabel: "640 KB",
      mime: "application/pdf",
    };
    set("evidence", [...values.evidence, demo]);
  };

  return (
    <EnterpriseFormModal
      open={open}
      onClose={onClose}
      title="File a grievance"
      description="Your report is confidential. We'll guide you step by step — take your time."
      size="lg"
    >
      <div className="mb-6">
        <div className="flex items-center justify-between gap-2">
          {STEPS.map((label, i) => (
            <div key={label} className="flex flex-1 items-center">
              <div className="flex flex-col items-center">
                <span
                  className={cn(
                    "flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold",
                    i < step && "bg-emerald-500 text-white",
                    i === step && "bg-[#191970] text-white",
                    i > step && "bg-slate-100 text-slate-400",
                  )}
                >
                  {i < step ? <Check className="h-4 w-4" /> : i + 1}
                </span>
                <span className={cn("mt-1 text-[10px] font-semibold", i === step ? "text-[#191970]" : "text-slate-400")}>
                  {label}
                </span>
              </div>
              {i < STEPS.length - 1 ? (
                <div className={cn("mx-1 h-0.5 flex-1 rounded-full", i < step ? "bg-emerald-400" : "bg-slate-200")} />
              ) : null}
            </div>
          ))}
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        {step === 0 ? (
          <div className="space-y-4">
            <p className="rounded-lg bg-[#2277ff]/5 px-3 py-2 text-sm text-slate-600">
              Choose the category that best fits your concern. You can stay anonymous if you prefer.
            </p>
            <FormField label="Category" htmlFor="g-category">
              <select
                id="g-category"
                value={values.category}
                onChange={(e) => set("category", e.target.value as GrievanceCategory)}
                className={selectClassName}
              >
                {GRIEVANCE_CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </FormField>
            <FormField label="Preferred language" htmlFor="g-lang">
              <div className="relative">
                <Globe className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <select
                  id="g-lang"
                  value={values.language}
                  onChange={(e) => set("language", e.target.value)}
                  className={cn(selectClassName, "pl-9")}
                >
                  {LANGUAGES.map((l) => (
                    <option key={l} value={l}>
                      {l}
                    </option>
                  ))}
                </select>
              </div>
            </FormField>
            <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-slate-200 p-4 transition hover:border-[#2277ff]/30">
              <input
                type="checkbox"
                checked={values.anonymous}
                onChange={(e) => set("anonymous", e.target.checked)}
                className="mt-1 h-4 w-4 rounded border-slate-300 text-[#191970] focus:ring-[#191970]"
              />
              <div>
                <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-slate-800">
                  <Shield className="h-4 w-4 text-[#191970]" />
                  Report anonymously
                </span>
                <p className="mt-1 text-xs leading-relaxed text-slate-500">
                  Your name won't be shared with your manager. HR can still follow up through this ticket.
                </p>
              </div>
            </label>
          </div>
        ) : null}

        {step === 1 ? (
          <div className="space-y-4">
            <FormField label="Subject" htmlFor="g-subject" error={errors.subject}>
              <input
                id="g-subject"
                value={values.subject}
                onChange={(e) => set("subject", e.target.value)}
                placeholder="Brief summary of your concern"
                className={cn(inputClassName, errors.subject && "border-rose-300")}
              />
            </FormField>
            <FormField label="Tell us what happened" htmlFor="g-desc" error={errors.description}>
              <textarea
                id="g-desc"
                rows={5}
                value={values.description}
                onChange={(e) => set("description", e.target.value)}
                placeholder="Include dates, people involved (if comfortable), and what outcome you're hoping for…"
                className={cn(
                  "w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-[#191970] focus:ring-2 focus:ring-[#191970]/15",
                  errors.description && "border-rose-300",
                )}
              />
            </FormField>
            <div className="grid gap-4 sm:grid-cols-2">
              <FormField label="Department" htmlFor="g-dept" error={errors.department}>
                <select
                  id="g-dept"
                  value={values.department}
                  onChange={(e) => set("department", e.target.value)}
                  className={cn(selectClassName, errors.department && "border-rose-300")}
                >
                  <option value="">Select department</option>
                  {DEPARTMENTS.map((d) => (
                    <option key={d} value={d}>
                      {d}
                    </option>
                  ))}
                </select>
              </FormField>
              <FormField label="Priority" htmlFor="g-priority">
                <select
                  id="g-priority"
                  value={values.priority}
                  onChange={(e) => set("priority", e.target.value as GrievancePriority)}
                  className={selectClassName}
                >
                  <option value="low">Low — general feedback</option>
                  <option value="medium">Medium — needs attention</option>
                  <option value="high">High — urgent / sensitive</option>
                </select>
              </FormField>
            </div>
          </div>
        ) : null}

        {step === 2 ? (
          <div className="space-y-4">
            <p className="text-sm text-slate-600">
              Optional but helpful — attach photos, PDFs, or screenshots. JPG, PNG, PDF · max 10 MB each.
            </p>
            <button
              type="button"
              onClick={handleFilePick}
              className="flex w-full flex-col items-center justify-center rounded-xl border-2 border-dashed border-slate-200 bg-slate-50/50 px-4 py-10 transition hover:border-[#2277ff]/40 hover:bg-[#2277ff]/5"
            >
              <Upload className="h-8 w-8 text-[#2277ff]" />
              <span className="mt-2 text-sm font-semibold text-slate-700">Tap to upload evidence</span>
              <span className="mt-1 text-xs text-slate-400">or drag and drop files here</span>
            </button>
            {values.evidence.length > 0 ? (
              <ul className="space-y-2">
                {values.evidence.map((f) => (
                  <li
                    key={f.id}
                    className="flex items-center gap-3 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm"
                  >
                    {f.mime.startsWith("image/") ? (
                      <ImageIcon className="h-4 w-4 text-sky-500" />
                    ) : (
                      <FileText className="h-4 w-4 text-[#191970]" />
                    )}
                    <span className="flex-1 truncate font-medium">{f.name}</span>
                    <span className="text-xs text-slate-400">{f.sizeLabel}</span>
                  </li>
                ))}
              </ul>
            ) : null}
            <p className="text-xs text-slate-400">
              If upload fails, we'll let you know gently — you can always add files later from the ticket thread.
            </p>
          </div>
        ) : null}

        {step === 3 ? (
          <div className="space-y-4 rounded-xl border border-slate-200 bg-slate-50/50 p-4">
            <h3 className="text-sm font-bold text-slate-900">Review before submitting</h3>
            <dl className="grid gap-2 text-sm">
              <div className="flex justify-between gap-4">
                <dt className="text-slate-500">Category</dt>
                <dd className="font-medium text-slate-800">{values.category}</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-slate-500">Reporting as</dt>
                <dd className="font-medium text-slate-800">{values.anonymous ? "Anonymous" : "Named"}</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-slate-500">Subject</dt>
                <dd className="max-w-[60%] text-right font-medium text-slate-800">{values.subject}</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-slate-500">Priority</dt>
                <dd className="font-medium capitalize text-slate-800">{values.priority}</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-slate-500">Evidence</dt>
                <dd className="font-medium text-slate-800">{values.evidence.length} file(s)</dd>
              </div>
            </dl>
            <p className="text-xs leading-relaxed text-slate-500">
              After you submit, you'll receive a ticket ID and can track progress from Submitted → Under review → Assigned → Resolved.
            </p>
          </div>
        ) : null}

        <div className="mt-6 flex justify-between border-t border-slate-100 pt-4">
          <button
            type="button"
            onClick={step === 0 ? onClose : handleBack}
            className="inline-flex items-center gap-1 rounded-lg border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-50"
          >
            {step === 0 ? "Cancel" : (
              <>
                <ChevronLeft className="h-4 w-4" />
                Back
              </>
            )}
          </button>
          {step < STEPS.length - 1 ? (
            <button
              type="button"
              onClick={handleNext}
              className="inline-flex items-center gap-1 rounded-lg bg-[#191970] px-4 py-2 text-sm font-semibold text-white hover:bg-[#12124a]"
            >
              Continue
              <ChevronRight className="h-4 w-4" />
            </button>
          ) : (
            <button
              type="submit"
              className="inline-flex items-center gap-1 rounded-lg bg-[#191970] px-4 py-2 text-sm font-semibold text-white hover:bg-[#12124a]"
            >
              Submit grievance
            </button>
          )}
        </div>
      </form>
    </EnterpriseFormModal>
  );
}
