"use client";

import { FormEvent, useEffect, useState } from "react";
import { Video } from "lucide-react";

import {
  EnterpriseFormModal,
  FormField,
  inputClassName,
  selectClassName,
} from "@/features/workspace/components/enterprise/enterprise-form-modal";
import type { HrmCandidate } from "@/features/workspace/data/hrm-recruitment-demo";
import { cn } from "@/lib/utils/cn";

export type ScheduleInterviewFormValues = {
  date: string;
  time: string;
  interviewType: string;
  meetingUrl: string;
  notes: string;
};

const INTERVIEW_TYPES = [
  "Screening call",
  "Technical round",
  "Panel interview",
  "Culture fit",
  "Final round",
];

type Props = {
  open: boolean;
  candidate: HrmCandidate | null;
  onClose: () => void;
  onSubmit: (values: ScheduleInterviewFormValues) => void;
};

export function RecruitmentScheduleInterviewModal({ open, candidate, onClose, onSubmit }: Props) {
  const [values, setValues] = useState<ScheduleInterviewFormValues>({
    date: new Date(2026, 5, 20).toISOString().slice(0, 10),
    time: "10:00",
    interviewType: "Screening call",
    meetingUrl: "",
    notes: "",
  });
  const [errors, setErrors] = useState<Partial<Record<keyof ScheduleInterviewFormValues, string>>>({});

  useEffect(() => {
    if (!open) return;
    setValues({
      date: new Date(2026, 5, 20).toISOString().slice(0, 10),
      time: "10:00",
      interviewType: "Screening call",
      meetingUrl: "",
      notes: "",
    });
    setErrors({});
  }, [open, candidate?.id]);

  const set = <K extends keyof ScheduleInterviewFormValues>(key: K, value: ScheduleInterviewFormValues[K]) => {
    setValues((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => ({ ...prev, [key]: undefined }));
  };

  const validate = () => {
    const next: Partial<Record<keyof ScheduleInterviewFormValues, string>> = {};
    if (!values.date) next.date = "Date is required";
    if (!values.time) next.time = "Time is required";
    if (!values.meetingUrl.trim()) {
      next.meetingUrl = "Google Meet link is required";
    } else if (!values.meetingUrl.includes("meet.google.com") && !values.meetingUrl.startsWith("http")) {
      next.meetingUrl = "Enter a valid Google Meet URL";
    }
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    onSubmit(values);
    onClose();
  };

  const fieldClass = (key: keyof ScheduleInterviewFormValues) =>
    cn(
      "focus:border-[#191970] focus:ring-[#191970]/15",
      errors[key] && "border-rose-300 focus:border-rose-500 focus:ring-rose-500/15",
    );

  return (
    <EnterpriseFormModal
      open={open}
      onClose={onClose}
      title="Schedule interview"
      description={
        candidate
          ? `Book a slot for ${candidate.name} · ${candidate.role}`
          : "Add interview details and Google Meet link"
      }
      size="lg"
    >
      {candidate ? (
        <div className="mb-4 rounded-xl border border-[#2277ff]/20 bg-[#2277ff]/5 px-4 py-3">
          <p className="text-sm font-semibold text-slate-900 dark:text-white">{candidate.name}</p>
          <p className="text-xs text-slate-500">{candidate.email}</p>
        </div>
      ) : null}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <FormField label="Date" htmlFor="int-date" error={errors.date}>
            <input
              id="int-date"
              type="date"
              value={values.date}
              onChange={(e) => set("date", e.target.value)}
              className={cn(inputClassName, fieldClass("date"))}
            />
          </FormField>
          <FormField label="Time" htmlFor="int-time" error={errors.time}>
            <input
              id="int-time"
              type="time"
              value={values.time}
              onChange={(e) => set("time", e.target.value)}
              className={cn(inputClassName, fieldClass("time"))}
            />
          </FormField>
        </div>

        <FormField label="Interview type" htmlFor="int-type">
          <select
            id="int-type"
            value={values.interviewType}
            onChange={(e) => set("interviewType", e.target.value)}
            className={cn(selectClassName, fieldClass("interviewType"))}
          >
            {INTERVIEW_TYPES.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </FormField>

        <FormField label="Google Meet link" htmlFor="int-meet" error={errors.meetingUrl}>
          <div className="relative">
            <Video className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              id="int-meet"
              value={values.meetingUrl}
              onChange={(e) => set("meetingUrl", e.target.value)}
              placeholder="https://meet.google.com/abc-defg-hij"
              className={cn(inputClassName, "pl-9", fieldClass("meetingUrl"))}
            />
          </div>
          <p className="mt-1 text-[11px] text-slate-400">
            Paste the Meet link from Google Calendar. It will appear in the Interviews panel.
          </p>
        </FormField>

        <FormField label="Notes for panel (optional)" htmlFor="int-notes">
          <textarea
            id="int-notes"
            rows={3}
            value={values.notes}
            onChange={(e) => set("notes", e.target.value)}
            placeholder="Scorecard focus, interviewer names, prep materials…"
            className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-[#191970] focus:ring-2 focus:ring-[#191970]/15 dark:border-slate-700 dark:bg-slate-950"
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
            className="inline-flex items-center gap-1.5 rounded-lg bg-[#191970] px-4 py-2 text-sm font-semibold text-white hover:bg-[#12124a]"
          >
            <Video className="h-4 w-4" />
            Schedule & add to interviews
          </button>
        </div>
      </form>
    </EnterpriseFormModal>
  );
}
