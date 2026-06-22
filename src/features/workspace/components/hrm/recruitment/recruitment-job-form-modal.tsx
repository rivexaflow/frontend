"use client";

import { FormEvent, useEffect, useState } from "react";

import {
  EnterpriseFormModal,
  FormField,
  inputClassName,
  selectClassName,
} from "@/features/workspace/components/enterprise/enterprise-form-modal";
import type {
  HrmJobPriority,
  HrmJobStage,
  HrmRecruitmentJob,
} from "@/features/workspace/data/hrm-recruitment-demo";
import { cn } from "@/lib/utils/cn";

export type RecruitmentJobFormValues = {
  title: string;
  department: string;
  location: string;
  employmentType: HrmRecruitmentJob["employmentType"];
  openings: number;
  stage: HrmJobStage;
  priority: HrmJobPriority;
  hiringManager: string;
  salaryRange: string;
  description: string;
};

const EMPTY: RecruitmentJobFormValues = {
  title: "",
  department: "",
  location: "Mumbai HQ",
  employmentType: "Full-time",
  openings: 1,
  stage: "draft",
  priority: "medium",
  hiringManager: "",
  salaryRange: "",
  description: "",
};

const DEPARTMENTS = ["Engineering", "Sales", "HR", "Customer", "Operations", "Marketing", "Finance"];

type Props = {
  open: boolean;
  mode: "create" | "edit";
  initial?: HrmRecruitmentJob | null;
  departments?: string[];
  onClose: () => void;
  onSubmit: (values: RecruitmentJobFormValues) => void;
};

function jobToForm(job: HrmRecruitmentJob): RecruitmentJobFormValues {
  return {
    title: job.title,
    department: job.department,
    location: job.location,
    employmentType: job.employmentType,
    openings: job.openings,
    stage: job.stage,
    priority: job.priority,
    hiringManager: job.hiringManager,
    salaryRange: job.salaryRange ?? "",
    description: job.description,
  };
}

export function RecruitmentJobFormModal({
  open,
  mode,
  initial,
  departments = DEPARTMENTS,
  onClose,
  onSubmit,
}: Props) {
  const [values, setValues] = useState<RecruitmentJobFormValues>(EMPTY);
  const [errors, setErrors] = useState<Partial<Record<keyof RecruitmentJobFormValues, string>>>({});

  useEffect(() => {
    if (!open) return;
    setValues(initial ? jobToForm(initial) : EMPTY);
    setErrors({});
  }, [open, initial]);

  const set = <K extends keyof RecruitmentJobFormValues>(key: K, value: RecruitmentJobFormValues[K]) => {
    setValues((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => ({ ...prev, [key]: undefined }));
  };

  const validate = () => {
    const next: Partial<Record<keyof RecruitmentJobFormValues, string>> = {};
    if (!values.title.trim()) next.title = "Job title is required";
    if (!values.department.trim()) next.department = "Department is required";
    if (!values.hiringManager.trim()) next.hiringManager = "Hiring manager is required";
    if (values.openings < 1) next.openings = "At least one opening is required";
    if (!values.description.trim()) next.description = "Description is required";
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    onSubmit(values);
    onClose();
  };

  const fieldClass = (key: keyof RecruitmentJobFormValues) =>
    cn(
      "focus:border-[#191970] focus:ring-[#191970]/15",
      errors[key] && "border-rose-300 focus:border-rose-500 focus:ring-rose-500/15",
    );

  return (
    <EnterpriseFormModal
      open={open}
      onClose={onClose}
      title={mode === "create" ? "Post new job" : "Edit job opening"}
      description={
        mode === "create"
          ? "Create a role listing. Save as draft or publish immediately."
          : "Update openings, status, compensation, or hiring details."
      }
      size="xl"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <FormField label="Job title" htmlFor="job-title" error={errors.title}>
            <input
              id="job-title"
              value={values.title}
              onChange={(e) => set("title", e.target.value)}
              placeholder="e.g. Senior Frontend Engineer"
              className={cn(inputClassName, fieldClass("title"))}
            />
          </FormField>
          <FormField label="Department" htmlFor="job-dept" error={errors.department}>
            <select
              id="job-dept"
              value={values.department}
              onChange={(e) => set("department", e.target.value)}
              className={cn(selectClassName, fieldClass("department"))}
            >
              <option value="">Select department</option>
              {departments.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>
          </FormField>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <FormField label="Location" htmlFor="job-location">
            <input
              id="job-location"
              value={values.location}
              onChange={(e) => set("location", e.target.value)}
              placeholder="Mumbai HQ · Remote"
              className={cn(inputClassName, fieldClass("location"))}
            />
          </FormField>
          <FormField label="Employment type" htmlFor="job-type">
            <select
              id="job-type"
              value={values.employmentType}
              onChange={(e) => set("employmentType", e.target.value as HrmRecruitmentJob["employmentType"])}
              className={cn(selectClassName, fieldClass("employmentType"))}
            >
              <option value="Full-time">Full-time</option>
              <option value="Part-time">Part-time</option>
              <option value="Contract">Contract</option>
            </select>
          </FormField>
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          <FormField label="Openings" htmlFor="job-openings" error={errors.openings}>
            <input
              id="job-openings"
              type="number"
              min={1}
              value={values.openings}
              onChange={(e) => set("openings", Number(e.target.value))}
              className={cn(inputClassName, fieldClass("openings"))}
            />
          </FormField>
          <FormField label="Status" htmlFor="job-stage">
            <select
              id="job-stage"
              value={values.stage}
              onChange={(e) => set("stage", e.target.value as HrmJobStage)}
              className={cn(selectClassName, fieldClass("stage"))}
            >
              <option value="draft">Draft</option>
              <option value="published">Published</option>
              <option value="closed">Closed</option>
            </select>
          </FormField>
          <FormField label="Priority" htmlFor="job-priority">
            <select
              id="job-priority"
              value={values.priority}
              onChange={(e) => set("priority", e.target.value as HrmJobPriority)}
              className={cn(selectClassName, fieldClass("priority"))}
            >
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>
          </FormField>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <FormField label="Hiring manager" htmlFor="job-manager" error={errors.hiringManager}>
            <input
              id="job-manager"
              value={values.hiringManager}
              onChange={(e) => set("hiringManager", e.target.value)}
              placeholder="e.g. Anita Desai"
              className={cn(inputClassName, fieldClass("hiringManager"))}
            />
          </FormField>
          <FormField label="Salary range" htmlFor="job-salary">
            <input
              id="job-salary"
              value={values.salaryRange}
              onChange={(e) => set("salaryRange", e.target.value)}
              placeholder="₹12–18 LPA"
              className={cn(inputClassName, fieldClass("salaryRange"))}
            />
          </FormField>
        </div>

        <FormField label="Role description" htmlFor="job-desc" error={errors.description}>
          <textarea
            id="job-desc"
            rows={4}
            value={values.description}
            onChange={(e) => set("description", e.target.value)}
            placeholder="Responsibilities, requirements, and team context…"
            className={cn(
              "w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-[#191970] focus:ring-2 focus:ring-[#191970]/15 dark:border-slate-700 dark:bg-slate-950",
              fieldClass("description"),
            )}
          />
        </FormField>

        <div className="flex justify-end gap-2 border-t border-slate-100 pt-4 dark:border-slate-800">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-50 dark:border-slate-700"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="rounded-lg bg-[#191970] px-4 py-2 text-sm font-semibold text-white hover:bg-[#12124a]"
          >
            {mode === "create" ? "Post job" : "Save changes"}
          </button>
        </div>
      </form>
    </EnterpriseFormModal>
  );
}
