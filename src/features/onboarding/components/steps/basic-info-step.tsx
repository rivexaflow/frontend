"use client";

import { FormEvent, useEffect, useState } from "react";
import { Briefcase, UserRound } from "lucide-react";

import {
  basicInfoSchema,
  type BasicInfoForm,
} from "@/features/onboarding/schemas/onboarding.schema";
import type { ProfileRole } from "@/types/onboarding";
import { cn } from "@/lib/utils";

const ROLE_OPTIONS: { value: ProfileRole; label: string; hint: string }[] = [
  { value: "owner", label: "Business owner", hint: "Full workspace & team controls" },
  { value: "manager", label: "Manager", hint: "Operations, CRM, and reporting" },
  { value: "freelancer", label: "Freelancer / solo", hint: "Focused tools for individual work" },
];

type BasicInfoStepProps = {
  initialFullName?: string;
  initialRole?: string;
  isLoading: boolean;
  error: string | null;
  onSubmit: (values: BasicInfoForm) => Promise<void>;
};

export function BasicInfoStep({
  initialFullName = "",
  initialRole = "",
  isLoading,
  error,
  onSubmit,
}: BasicInfoStepProps) {
  const [fullName, setFullName] = useState(initialFullName);
  const [role, setRole] = useState<ProfileRole | "">(
    (initialRole as ProfileRole) || "",
  );
  const [fieldErrors, setFieldErrors] = useState<Partial<Record<keyof BasicInfoForm, string>>>({});

  // Bootstrap loads state after mount — sync prefilled values when they arrive.
  useEffect(() => {
    if (initialFullName) setFullName(initialFullName);
  }, [initialFullName]);

  useEffect(() => {
    if (initialRole && ROLE_OPTIONS.some((o) => o.value === initialRole)) {
      setRole(initialRole as ProfileRole);
    }
  }, [initialRole]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const parsed = basicInfoSchema.safeParse({ fullName, role });
    if (!parsed.success) {
      const errs: Partial<Record<keyof BasicInfoForm, string>> = {};
      for (const issue of parsed.error.issues) {
        const key = issue.path[0] as keyof BasicInfoForm;
        if (!errs[key]) errs[key] = issue.message;
      }
      setFieldErrors(errs);
      return;
    }
    setFieldErrors({});
    await onSubmit(parsed.data);
  };

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
          Personalize your experience
        </h2>
        <p className="mt-2 max-w-lg text-slate-500">
          Welcome to the future of enterprise AI. Tell us who you are so we can tailor your
          workspace and dashboard.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6" noValidate>
        <div className="space-y-2">
          <label htmlFor="fullName" className="text-sm font-semibold text-slate-700">
            Full name
          </label>
          <div className="relative">
            <UserRound className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              id="fullName"
              type="text"
              autoComplete="name"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="e.g. Alex Morgan"
              className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pl-10 pr-4 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
            />
          </div>
          {fieldErrors.fullName && (
            <p className="text-sm text-rose-600">{fieldErrors.fullName}</p>
          )}
        </div>

        <fieldset className="space-y-3">
          <legend className="text-sm font-semibold text-slate-700">Your role</legend>
          <div className="grid gap-3 sm:grid-cols-2">
            {ROLE_OPTIONS.map((opt) => {
              const selected = role === opt.value;
              return (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setRole(opt.value)}
                  className={cn(
                    "rounded-xl border-2 p-4 text-left transition-all",
                    selected
                      ? "border-blue-500 bg-blue-50/80 shadow-sm"
                      : "border-slate-100 bg-white hover:border-slate-200",
                  )}
                >
                  <div className="flex items-center gap-2">
                    <Briefcase className={cn("h-4 w-4", selected ? "text-blue-600" : "text-slate-400")} />
                    <span className="font-semibold text-slate-900">{opt.label}</span>
                  </div>
                  <p className="mt-1 text-xs text-slate-500">{opt.hint}</p>
                </button>
              );
            })}
          </div>
          {fieldErrors.role && <p className="text-sm text-rose-600">{fieldErrors.role}</p>}
        </fieldset>

        {error && (
          <p className="rounded-lg bg-rose-50 px-4 py-3 text-sm font-medium text-rose-700" role="alert">
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={isLoading}
          className="w-full rounded-xl bg-blue-600 py-3.5 text-sm font-bold text-white shadow-lg shadow-blue-500/25 transition hover:bg-blue-700 disabled:opacity-60"
        >
          {isLoading ? "Saving…" : "Continue to business setup"}
        </button>
      </form>
    </div>
  );
}
