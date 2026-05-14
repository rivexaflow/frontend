"use client";

import { FormEvent, useMemo, useState } from "react";

import { changePassword } from "@/lib/api/auth";
import {
  changePasswordSchema,
  toChangePasswordPayload,
  type ChangePasswordFormValues,
} from "@/schemas/change-password.schema";
import { cn } from "@/lib/utils";

type FieldKey = keyof ChangePasswordFormValues;
type FieldErrors = Partial<Record<FieldKey, string>>;

function EyeIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M2.036 12.323a1 1 0 0 1 0-.646C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.575 3.012 9.964 7.177a1 1 0 0 1 0 .646C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.575-3.012-9.964-7.177Z"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="1.6" />
    </svg>
  );
}

function EyeOffIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="m3 3 18 18M10.584 10.587a2 2 0 0 0 2.828 2.83M9.363 5.365A9.466 9.466 0 0 1 12 5c4.638 0 8.575 3.012 9.964 7.177a1 1 0 0 1 0 .646 10.477 10.477 0 0 1-4.184 5.169M6.61 6.61C4.62 7.91 3.106 9.83 2.036 11.677a1 1 0 0 0 0 .646A10.477 10.477 0 0 0 12 19c1.637 0 3.176-.376 4.523-1.05"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function CheckIcon({ className }: { className?: string }) {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      aria-hidden
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <path d="m5 12 4.5 4.5L19 7" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function passwordStrength(pw: string): { score: 0 | 1 | 2 | 3 | 4; label: string } {
  if (!pw) return { score: 0, label: "—" };
  const lengthBoost = Math.min(pw.length, 14) / 14;
  let classes = 0;
  if (/[a-z]/.test(pw)) classes += 1;
  if (/[A-Z]/.test(pw)) classes += 1;
  if (/[0-9]/.test(pw)) classes += 1;
  if (/[^A-Za-z0-9]/.test(pw)) classes += 1;
  const raw = lengthBoost * 2 + classes;
  if (pw.length < 8) return { score: 1, label: "Too short" };
  if (raw < 3) return { score: 1, label: "Weak" };
  if (raw < 4) return { score: 2, label: "Fair" };
  if (raw < 5) return { score: 3, label: "Strong" };
  return { score: 4, label: "Excellent" };
}

const STRENGTH_COLORS = [
  "bg-slate-200",
  "bg-rose-400",
  "bg-amber-400",
  "bg-emerald-500",
  "bg-emerald-600",
];

type Visibility = Record<FieldKey, boolean>;

export function ChangePasswordCard() {
  const [values, setValues] = useState<ChangePasswordFormValues>({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [visibility, setVisibility] = useState<Visibility>({
    currentPassword: false,
    newPassword: false,
    confirmPassword: false,
  });
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const strength = useMemo(() => passwordStrength(values.newPassword), [values.newPassword]);

  const setField = (key: FieldKey, value: string) => {
    setValues((prev) => ({ ...prev, [key]: value }));
    if (fieldErrors[key]) {
      setFieldErrors((prev) => ({ ...prev, [key]: undefined }));
    }
    if (success) setSuccess(false);
  };

  const toggleVisibility = (key: FieldKey) =>
    setVisibility((prev) => ({ ...prev, [key]: !prev[key] }));

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setFormError(null);
    setFieldErrors({});
    setSuccess(false);

    const parsed = changePasswordSchema.safeParse(values);
    if (!parsed.success) {
      const errs: FieldErrors = {};
      for (const issue of parsed.error.issues) {
        const key = issue.path[0] as FieldKey | undefined;
        if (key && !errs[key]) errs[key] = issue.message;
      }
      setFieldErrors(errs);
      return;
    }

    setIsSubmitting(true);
    try {
      await changePassword(toChangePasswordPayload(parsed.data));
      setSuccess(true);
      setValues({ currentPassword: "", newPassword: "", confirmPassword: "" });
    } catch (err) {
      setFormError(err instanceof Error ? err.message : "We couldn't update your password.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderInput = (
    key: FieldKey,
    label: string,
    autoComplete: string,
    placeholder: string,
    describedBy?: string,
  ) => (
    <div>
      <label htmlFor={`cp-${key}`} className="text-[12.5px] font-semibold text-slate-700">
        {label}
      </label>
      <div className="relative mt-1.5">
        <input
          id={`cp-${key}`}
          name={key}
          type={visibility[key] ? "text" : "password"}
          autoComplete={autoComplete}
          value={values[key]}
          onChange={(e) => setField(key, e.target.value)}
          placeholder={placeholder}
          aria-invalid={!!fieldErrors[key]}
          aria-describedby={fieldErrors[key] ? `cp-${key}-error` : describedBy}
          className={cn(
            "h-11 w-full rounded-lg border bg-white pl-3.5 pr-11 text-[14.5px] text-slate-900 outline-none transition placeholder:text-slate-400",
            fieldErrors[key]
              ? "border-rose-300 focus:border-rose-400 focus:ring-2 focus:ring-rose-200/60"
              : "border-slate-200 focus:border-[#2277FF] focus:ring-2 focus:ring-[#2277FF]/15",
          )}
        />
        <button
          type="button"
          onClick={() => toggleVisibility(key)}
          className="absolute inset-y-0 right-0 inline-flex w-11 items-center justify-center text-slate-400 transition-colors hover:text-slate-700 focus-visible:text-slate-900 focus-visible:outline-none"
          aria-label={visibility[key] ? `Hide ${label.toLowerCase()}` : `Show ${label.toLowerCase()}`}
          aria-pressed={visibility[key]}
          tabIndex={values[key] ? 0 : -1}
        >
          {visibility[key] ? <EyeOffIcon /> : <EyeIcon />}
        </button>
      </div>
      {fieldErrors[key] ? (
        <p id={`cp-${key}-error`} className="mt-1 text-[12px] font-medium text-rose-600">
          {fieldErrors[key]}
        </p>
      ) : null}
    </div>
  );

  return (
    <section
      aria-labelledby="cp-heading"
      className="rounded-xl border border-slate-200 bg-white p-6 shadow-[0_1px_2px_rgba(15,23,42,0.04)] sm:p-7"
    >
      <header className="flex items-start justify-between gap-4">
        <div>
          <h2
            id="cp-heading"
            className="text-[1.05rem] font-semibold leading-tight tracking-tight text-slate-900"
          >
            Change password
          </h2>
          <p className="mt-1 text-[13px] leading-relaxed text-slate-500">
            Use at least 8 characters. A mix of letters, numbers and symbols is recommended.
          </p>
        </div>
        <span className="hidden shrink-0 rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-[10.5px] font-semibold uppercase tracking-[0.18em] text-slate-500 sm:inline-flex">
          Security
        </span>
      </header>

      <form onSubmit={onSubmit} noValidate className="mt-5 grid gap-4 sm:max-w-md">
        {renderInput("currentPassword", "Current password", "current-password", "Enter your current password")}

        <div>
          {renderInput("newPassword", "New password", "new-password", "At least 8 characters", "cp-strength")}
          <div id="cp-strength" className="mt-2" aria-live="polite">
            <div className="flex h-1.5 gap-1" aria-hidden>
              {[1, 2, 3, 4].map((tier) => (
                <span
                  key={tier}
                  className={cn(
                    "flex-1 rounded-full transition-colors",
                    strength.score >= tier ? STRENGTH_COLORS[strength.score] : "bg-slate-200",
                  )}
                />
              ))}
            </div>
            <p
              className={cn(
                "mt-1 text-[12px]",
                strength.score >= 3
                  ? "text-emerald-700"
                  : strength.score === 2
                    ? "text-amber-700"
                    : "text-slate-500",
              )}
            >
              {values.newPassword ? `Password strength: ${strength.label}` : "Strength meter updates as you type."}
            </p>
          </div>
        </div>

        {renderInput("confirmPassword", "Confirm new password", "new-password", "Re-enter your new password")}

        {formError ? (
          <div
            role="alert"
            className="rounded-md border border-rose-100 bg-rose-50 px-3 py-2 text-[12.5px] font-medium text-rose-700"
          >
            {formError}
          </div>
        ) : null}

        {success ? (
          <div
            role="status"
            className="flex items-start gap-2 rounded-md border border-emerald-200 bg-emerald-50 px-3 py-2 text-[12.5px] text-emerald-800"
          >
            <CheckIcon className="mt-0.5 text-emerald-600" />
            <span>
              <strong className="font-semibold">Password updated.</strong> You can keep using
              this session — your new password takes effect on next sign-in.
            </span>
          </div>
        ) : null}

        <div className="flex items-center gap-3 pt-1">
          <button
            type="submit"
            disabled={isSubmitting}
            className={cn(
              "inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-[#0a0e2c] px-4 text-[13.5px] font-semibold text-white shadow-[0_8px_18px_-10px_rgba(34,119,255,0.45)] transition",
              "hover:bg-[#101537] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2277FF]/40 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-70",
            )}
          >
            {isSubmitting ? (
              <>
                <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" aria-hidden fill="none">
                  <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2.4" strokeOpacity="0.3" />
                  <path d="M21 12a9 9 0 0 0-9-9" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" />
                </svg>
                Updating…
              </>
            ) : (
              "Update password"
            )}
          </button>
          <button
            type="button"
            onClick={() => {
              setValues({ currentPassword: "", newPassword: "", confirmPassword: "" });
              setFieldErrors({});
              setFormError(null);
              setSuccess(false);
            }}
            disabled={isSubmitting}
            className="inline-flex h-10 items-center rounded-lg px-3 text-[13px] font-medium text-slate-500 transition-colors hover:text-slate-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2277FF]/30 disabled:opacity-60"
          >
            Cancel
          </button>
        </div>
      </form>
    </section>
  );
}
