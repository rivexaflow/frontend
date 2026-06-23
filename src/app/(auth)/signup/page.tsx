"use client";

import Link from "next/link";
import { FormEvent, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import { registerUser } from "@/lib/api/auth";
import {
  applyOnboardingStateToAuthUser,
  syncOnboardingLane,
} from "@/lib/api/onboarding-sync";
import { registerSchema } from "@/schemas/auth.schema";
import { LoginBrandPanel } from "@/components/auth/login-brand-panel";
import { authStore } from "@/stores/auth.store";
import { cn } from "@/lib/utils";

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

function ArrowRightIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" aria-hidden fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M5 12h14m-5-6 6 6-6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function BackArrowIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" aria-hidden fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M19 12H5m6 6-6-6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

type FieldErrors = Partial<Record<"fullName" | "email" | "password" | "terms", string>>;

/**
 * Lightweight client-side password strength meter (purely advisory).
 *  - 0..1 length factor (capped at 14)
 *  - +1 for lowercase, uppercase, digit, symbol classes used
 *  Returns a 0..4 bucket used to label/colour the indicator.
 */
function passwordStrength(pw: string): { score: 0 | 1 | 2 | 3 | 4; label: string } {
  if (!pw) return { score: 0, label: "—" };
  const lengthBoost = Math.min(pw.length, 14) / 14; // 0..1
  let classes = 0;
  if (/[a-z]/.test(pw)) classes += 1;
  if (/[A-Z]/.test(pw)) classes += 1;
  if (/[0-9]/.test(pw)) classes += 1;
  if (/[^A-Za-z0-9]/.test(pw)) classes += 1;
  const raw = lengthBoost * 2 + classes; // 0..6
  if (pw.length < 8) return { score: 1, label: "Too short" };
  if (raw < 3) return { score: 1, label: "Weak" };
  if (raw < 4) return { score: 2, label: "Fair" };
  if (raw < 5) return { score: 3, label: "Strong" };
  return { score: 4, label: "Excellent" };
}

export default function SignupPage() {
  const router = useRouter();

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [acceptTerms, setAcceptTerms] = useState(false);

  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const strength = useMemo(() => passwordStrength(password), [password]);

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setFormError(null);
    setFieldErrors({});

    const parsed = registerSchema.safeParse({ fullName, email, password });
    const errs: FieldErrors = {};
    if (!parsed.success) {
      for (const issue of parsed.error.issues) {
        const key = issue.path[0];
        if (key === "fullName" || key === "email" || key === "password") {
          if (!errs[key]) errs[key] = issue.message;
        }
      }
    }
    if (!acceptTerms) {
      errs.terms = "Please accept the Terms and Privacy Policy to continue.";
    }
    if (Object.keys(errs).length > 0) {
      setFieldErrors(errs);
      return;
    }

    setIsSubmitting(true);
    try {
      const result = await registerUser({
        fullName: parsed.data!.fullName,
        email: parsed.data!.email,
        password: parsed.data!.password,
      });

      if (result.token && result.user) {
        // Auto-login after successful registration
        const rawUser = result.user as Record<string, unknown> | undefined;
        const profileRole =
          (rawUser?.profileRole as string | undefined) ??
          (rawUser?.profile_role as string | undefined);
        const onboardingStep =
          (result as { onboardingStep?: string }).onboardingStep ??
          (rawUser?.onboardingStep as string | undefined) ??
          (rawUser?.onboarding_step as string | undefined);

        authStore.getState().setSession({
          token: result.token,
          remember: true,
          user: {
            id: result.user.id || "unknown",
            name: result.user.fullName || result.user.full_name || result.user.name || parsed.data!.fullName,
            fullName: result.user.fullName || result.user.full_name || parsed.data!.fullName,
            email: result.user.email || parsed.data!.email,
            role: (result.user.role as "SUPER_ADMIN" | "ADMIN" | "USER") || "USER",
            workspaceId: result.user.workspaceId || result.user.workspace_id,
            workspaceSlug: result.user.workspaceSlug || result.user.workspace_slug,
            profileRole,
            onboardingStep,
          },
        });

        const onboardingState = await syncOnboardingLane({
          email: parsed.data!.email,
          password: parsed.data!.password,
        });
        if (onboardingState) {
          applyOnboardingStateToAuthUser(onboardingState);
        }

        const destination = result.redirectTo || "/onboarding";
        router.push(destination);
      } else {
        router.push("/login?registered=1");
      }
    } catch (err) {
      setFormError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const strengthBarColor = [
    "bg-slate-200",
    "bg-rose-400",
    "bg-amber-400",
    "bg-emerald-500",
    "bg-emerald-600",
  ];

  return (
    <main className="grid min-h-screen w-full grid-cols-1 bg-white font-sans lg:grid-cols-[minmax(0,1.05fr)_minmax(0,1fr)] xl:grid-cols-[minmax(0,1.18fr)_minmax(0,1fr)]">
      <section className="relative flex min-h-screen flex-col bg-white px-5 pb-10 pt-6 sm:px-10 lg:px-14 lg:pt-8 xl:px-20">
        <header className="flex items-center justify-between">
          <Link
            href="/"
            className="inline-flex items-center gap-2.5 rounded-md outline-none focus-visible:ring-2 focus-visible:ring-[#2277FF]/40"
          >
            <span
              className="grid h-9 w-9 place-items-center rounded-lg bg-gradient-to-br from-[#191970] to-[#2277FF] text-sm font-bold text-white shadow-sm"
              aria-hidden
            >
              R
            </span>
            <span className="text-[1.05rem] font-semibold tracking-tight text-slate-900">Rivexaflow</span>
          </Link>

          <Link
            href="/"
            className="hidden items-center gap-1.5 rounded-md px-2 py-1 text-xs font-medium text-slate-500 transition-colors hover:text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2277FF]/40 sm:inline-flex"
          >
            <BackArrowIcon /> Back to website
          </Link>
        </header>

        <div className="mx-auto w-full max-w-[28rem] flex-1 py-10 sm:py-14 lg:py-16">
          <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-[#2277FF]">Get started</p>
          <h1 className="mt-1.5 text-[1.85rem] font-semibold leading-[1.1] tracking-tight text-slate-900 sm:text-[2.05rem]">
            Create your Rivexaflow account
          </h1>
          <p className="mt-2 text-[15px] leading-relaxed text-slate-500">
            Set up your Rivexaflow workspace — CRM, KYC, billing, and workflows in one place.
          </p>

          <form onSubmit={onSubmit} noValidate className="mt-8 grid gap-4">
            <div>
              <label htmlFor="fullName" className="text-[12.5px] font-semibold text-slate-700">
                Full name
              </label>
              <input
                id="fullName"
                name="fullName"
                type="text"
                autoComplete="name"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Jane Doe"
                required
                aria-invalid={!!fieldErrors.fullName}
                aria-describedby={fieldErrors.fullName ? "fullName-error" : undefined}
                className={cn(
                  "mt-1.5 h-11 w-full rounded-lg border bg-white px-3.5 text-[14.5px] text-slate-900 outline-none transition placeholder:text-slate-400",
                  fieldErrors.fullName
                    ? "border-rose-300 focus:border-rose-400 focus:ring-2 focus:ring-rose-200/60"
                    : "border-slate-200 focus:border-[#2277FF] focus:ring-2 focus:ring-[#2277FF]/15",
                )}
              />
              {fieldErrors.fullName ? (
                <p id="fullName-error" className="mt-1 text-[12px] font-medium text-rose-600">
                  {fieldErrors.fullName}
                </p>
              ) : null}
            </div>

            <div>
              <label htmlFor="email" className="text-[12.5px] font-semibold text-slate-700">
                Work email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                inputMode="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@company.com"
                required
                aria-invalid={!!fieldErrors.email}
                aria-describedby={fieldErrors.email ? "email-error" : undefined}
                className={cn(
                  "mt-1.5 h-11 w-full rounded-lg border bg-white px-3.5 text-[14.5px] text-slate-900 outline-none transition placeholder:text-slate-400",
                  fieldErrors.email
                    ? "border-rose-300 focus:border-rose-400 focus:ring-2 focus:ring-rose-200/60"
                    : "border-slate-200 focus:border-[#2277FF] focus:ring-2 focus:ring-[#2277FF]/15",
                )}
              />
              {fieldErrors.email ? (
                <p id="email-error" className="mt-1 text-[12px] font-medium text-rose-600">
                  {fieldErrors.email}
                </p>
              ) : null}
            </div>

            <div>
              <label htmlFor="password" className="text-[12.5px] font-semibold text-slate-700">
                Password
              </label>
              <div className="relative mt-1.5">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="new-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="At least 8 characters"
                  required
                  minLength={8}
                  aria-invalid={!!fieldErrors.password}
                  aria-describedby={fieldErrors.password ? "password-error" : "password-hint"}
                  className={cn(
                    "h-11 w-full rounded-lg border bg-white pl-3.5 pr-11 text-[14.5px] text-slate-900 outline-none transition placeholder:text-slate-400",
                    fieldErrors.password
                      ? "border-rose-300 focus:border-rose-400 focus:ring-2 focus:ring-rose-200/60"
                      : "border-slate-200 focus:border-[#2277FF] focus:ring-2 focus:ring-[#2277FF]/15",
                  )}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute inset-y-0 right-0 inline-flex w-11 items-center justify-center text-slate-400 transition-colors hover:text-slate-700 focus-visible:text-slate-900 focus-visible:outline-none"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  aria-pressed={showPassword}
                  tabIndex={password ? 0 : -1}
                >
                  {showPassword ? <EyeOffIcon /> : <EyeIcon />}
                </button>
              </div>

              {/* Strength meter */}
              <div className="mt-2" aria-live="polite">
                <div className="flex h-1.5 gap-1" aria-hidden>
                  {[1, 2, 3, 4].map((tier) => (
                    <span
                      key={tier}
                      className={cn(
                        "flex-1 rounded-full transition-colors",
                        strength.score >= tier ? strengthBarColor[strength.score] : "bg-slate-200",
                      )}
                    />
                  ))}
                </div>
                <p
                  id="password-hint"
                  className={cn(
                    "mt-1 text-[12px]",
                    strength.score >= 3 ? "text-emerald-700" : strength.score === 2 ? "text-amber-700" : "text-slate-500",
                  )}
                >
                  {password
                    ? `Password strength: ${strength.label}`
                    : "Use 8+ characters. A mix of letters, numbers and symbols is recommended."}
                </p>
              </div>

              {fieldErrors.password ? (
                <p id="password-error" className="mt-1 text-[12px] font-medium text-rose-600">
                  {fieldErrors.password}
                </p>
              ) : null}
            </div>

            <label className="-mt-1 inline-flex cursor-pointer items-start gap-2 text-[12.5px] leading-snug text-slate-600 select-none">
              <input
                type="checkbox"
                className="mt-[3px] h-4 w-4 rounded border-slate-300 text-[#2277FF] outline-none focus:ring-2 focus:ring-[#2277FF]/30"
                checked={acceptTerms}
                onChange={(e) => setAcceptTerms(e.target.checked)}
                aria-invalid={!!fieldErrors.terms}
              />
              <span>
                I agree to Rivexaflow&apos;s{" "}
                <Link href="#" className="font-semibold text-[#2277FF] hover:text-[#0056FF]">
                  Terms of Service
                </Link>{" "}
                and{" "}
                <Link href="#" className="font-semibold text-[#2277FF] hover:text-[#0056FF]">
                  Privacy Policy
                </Link>
                .
              </span>
            </label>
            {fieldErrors.terms ? (
              <p className="-mt-2 text-[12px] font-medium text-rose-600">{fieldErrors.terms}</p>
            ) : null}

            {formError ? (
              <div
                role="alert"
                className="-mt-1 rounded-md border border-rose-100 bg-rose-50 px-3 py-2 text-[12.5px] font-medium text-rose-700"
              >
                {formError}
              </div>
            ) : null}

            <button
              type="submit"
              disabled={isSubmitting}
              className={cn(
                "mt-1 inline-flex h-11 w-full items-center justify-center gap-2 rounded-lg bg-[#0a0e2c] px-5 text-[14.5px] font-semibold text-white shadow-[0_10px_24px_-12px_rgba(34,119,255,0.55)] transition",
                "hover:bg-[#101537] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2277FF]/40 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-70",
              )}
            >
              {isSubmitting ? (
                <>
                  <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" aria-hidden fill="none">
                    <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2.4" strokeOpacity="0.3" />
                    <path d="M21 12a9 9 0 0 0-9-9" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" />
                  </svg>
                  Creating your account…
                </>
              ) : (
                <>
                  Create account
                  <ArrowRightIcon />
                </>
              )}
            </button>
          </form>

          <p className="mt-7 text-center text-[13px] text-slate-500">
            Already have an account?{" "}
            <Link href="/login" className="font-semibold text-[#2277FF] hover:text-[#0056FF]">
              Sign in
            </Link>
          </p>
        </div>

        <footer className="mt-auto flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-5 text-[11.5px] text-slate-500">
          <p className="text-slate-400">© {new Date().getFullYear()} Rivexaflow</p>
          <div className="flex items-center gap-3.5">
            <Link href="#" className="hover:text-slate-700">
              Privacy
            </Link>
            <Link href="#" className="hover:text-slate-700">
              Terms
            </Link>
          </div>
        </footer>
      </section>

      <LoginBrandPanel />
    </main>
  );
}
