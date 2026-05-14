"use client";

import Link from "next/link";
import { FormEvent, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

import { authStore } from "@/stores/auth.store";
import { workspaceStore } from "@/stores/workspace.store";
import { clearSessionCookie } from "@/lib/auth/session";
import { postLoginPath } from "@/lib/auth/redirects";
import { appConfig } from "@/config/app";
import { loginUser } from "@/lib/api/auth";
import { loginSchema } from "@/schemas/auth.schema";
import { cn } from "@/lib/utils";

const TRUST_BADGES = ["SOC 2 Type II", "ISO 27001", "GDPR Ready"] as const;
const REGION_BADGES = ["SOC 2 Type II", "ISO 27001", "GDPR Ready", "HIPAA-aligned"] as const;

function MicrosoftLogo() {
  return (
    <svg width="18" height="18" viewBox="0 0 23 23" aria-hidden xmlns="http://www.w3.org/2000/svg">
      <rect x="1" y="1" width="10" height="10" fill="#F25022" />
      <rect x="12" y="1" width="10" height="10" fill="#7FBA00" />
      <rect x="1" y="12" width="10" height="10" fill="#00A4EF" />
      <rect x="12" y="12" width="10" height="10" fill="#FFB900" />
    </svg>
  );
}

function GoogleLogo() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden xmlns="http://www.w3.org/2000/svg">
      <path
        d="M21.6 12.227c0-.71-.064-1.394-.182-2.05H12v3.881h5.382a4.6 4.6 0 0 1-1.996 3.018v2.51h3.232c1.89-1.741 2.982-4.305 2.982-7.359Z"
        fill="#4285F4"
      />
      <path
        d="M12 22c2.7 0 4.964-.895 6.618-2.414l-3.232-2.51c-.896.6-2.041.955-3.386.955-2.605 0-4.81-1.759-5.598-4.122H3.064v2.59A9.997 9.997 0 0 0 12 22Z"
        fill="#34A853"
      />
      <path
        d="M6.402 13.909a6.013 6.013 0 0 1 0-3.818v-2.59H3.064a10.003 10.003 0 0 0 0 9l3.338-2.592Z"
        fill="#FBBC05"
      />
      <path
        d="M12 5.977c1.469 0 2.787.505 3.823 1.496l2.868-2.868C16.96 2.99 14.696 2 12 2A9.997 9.997 0 0 0 3.064 7.5l3.338 2.591C7.19 7.736 9.395 5.977 12 5.977Z"
        fill="#EA4335"
      />
    </svg>
  );
}

function SsoLogo() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden xmlns="http://www.w3.org/2000/svg" fill="none">
      <path
        d="M9 12.75a3.75 3.75 0 1 1 3.182-1.78l5.318 5.318V19.5h-2.25v-2.25h-2.25v-2.25H10.78A3.75 3.75 0 0 1 9 12.75Zm0-2.25a1.5 1.5 0 1 0-1.5-1.5 1.5 1.5 0 0 0 1.5 1.5Z"
        fill="#4338ca"
      />
    </svg>
  );
}

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

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const setSession = authStore((s) => s.setSession);
  const wantsSignout = searchParams.get("signout") === "1";
  const justRegistered = searchParams.get("registered") === "1";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [signedOutNotice, setSignedOutNotice] = useState(false);

  /** If we arrive via /login?signout=1, clear any stale persisted session before showing the form. */
  useEffect(() => {
    if (!wantsSignout) return;
    try {
      authStore.getState().logout();
      workspaceStore.getState().clearWorkspace();
      clearSessionCookie();
      if (typeof window !== "undefined") {
        window.localStorage.removeItem("rvx-auth");
      }
    } finally {
      setSignedOutNotice(true);
    }
  }, [wantsSignout]);

  const onSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setError(null);

    const parsed = loginSchema.safeParse({ email, password });
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? "Please check your email and password.");
      return;
    }

    setIsSubmitting(true);
    try {
      const result = await loginUser(parsed.data);

      const fallbackSlug = appConfig.defaultWorkspaceSlug;
      const slug = result.user.workspaceSlug ?? fallbackSlug;

      setSession({
        token: result.token,
        remember,
        user: {
          id: result.user.id,
          name: result.user.name,
          email: result.user.email,
          role: result.user.role,
          workspaceId: result.user.workspaceId,
          workspaceSlug: result.user.workspaceSlug,
        },
      });

      if (result.user.workspaceId || result.user.workspaceSlug) {
        workspaceStore.getState().setWorkspace({
          workspaceId: result.user.workspaceId ?? "",
          workspaceName: result.user.workspaceName ?? result.user.workspaceSlug ?? "Workspace",
          workspaceSlug: result.user.workspaceSlug ?? fallbackSlug,
          plan: result.user.plan,
        });
      }

      console.log("Login result:", { redirectTo: result.redirectTo, user: result.user });
      const destination = result.redirectTo || postLoginPath(result.user.role, slug);
      console.log("Redirecting to:", destination);
      router.push(destination);
    } catch (err) {
      setError(err instanceof Error ? err.message : "We couldn't sign you in. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const onSso = (provider: "microsoft" | "google" | "saml") => {
    void provider;
    setError("SSO is available on the Enterprise plan. Please contact your account team.");
  };

  return (
    <main className="grid min-h-screen w-full grid-cols-1 bg-white lg:grid-cols-[minmax(0,1.05fr)_minmax(0,1fr)] xl:grid-cols-[minmax(0,1.18fr)_minmax(0,1fr)]">
      {/* ─── Form pane ─── */}
      <section className="relative flex min-h-screen flex-col bg-white px-5 pb-10 pt-6 sm:px-10 lg:px-14 lg:pt-8 xl:px-20">
        <header className="flex items-center justify-between">
          <Link href="/" className="inline-flex items-center gap-2.5 outline-none focus-visible:ring-2 focus-visible:ring-[#2277FF]/40 rounded-md">
            <span
              className="grid h-9 w-9 place-items-center rounded-lg bg-gradient-to-br from-[#2277FF] to-[#6366f1] text-sm font-bold text-white shadow-sm"
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
          <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-[#2277FF]">Welcome back</p>
          <h1 className="mt-1.5 text-[1.85rem] font-semibold leading-[1.1] tracking-tight text-slate-900 sm:text-[2.05rem]">
            Sign in to your workspace
          </h1>
          <p className="mt-2 text-[15px] leading-relaxed text-slate-500">
            Continue to your governed enterprise AI workspace — CRM, KYC, billing, and workflows.
          </p>

          {signedOutNotice ? (
            <div
              role="status"
              className="mt-5 flex items-start gap-2 rounded-lg border border-emerald-200 bg-emerald-50 px-3.5 py-2.5 text-[12.5px] text-emerald-800"
            >
              <CheckIcon className="mt-0.5 text-emerald-600" />
              <span>
                <strong className="font-semibold">You&apos;ve been signed out.</strong> Sign in below to continue.
              </span>
            </div>
          ) : null}

          {justRegistered ? (
            <div
              role="status"
              className="mt-5 flex items-start gap-2 rounded-lg border border-emerald-200 bg-emerald-50 px-3.5 py-2.5 text-[12.5px] text-emerald-800"
            >
              <CheckIcon className="mt-0.5 text-emerald-600" />
              <span>
                <strong className="font-semibold">Account created.</strong> Sign in below with the email and password you just chose.
              </span>
            </div>
          ) : null}

          {/* SSO row */}
          <div className="mt-7 grid gap-2.5">
            <button
              type="button"
              onClick={() => onSso("microsoft")}
              disabled={isSubmitting}
              className="group flex h-11 w-full items-center justify-center gap-2.5 rounded-lg border border-slate-200 bg-white px-4 text-[14px] font-medium text-slate-800 transition-colors hover:border-slate-300 hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2277FF]/40 disabled:opacity-60"
            >
              <MicrosoftLogo />
              Continue with Microsoft
            </button>
            <button
              type="button"
              onClick={() => onSso("google")}
              disabled={isSubmitting}
              className="group flex h-11 w-full items-center justify-center gap-2.5 rounded-lg border border-slate-200 bg-white px-4 text-[14px] font-medium text-slate-800 transition-colors hover:border-slate-300 hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2277FF]/40 disabled:opacity-60"
            >
              <GoogleLogo />
              Continue with Google Workspace
            </button>
            <button
              type="button"
              onClick={() => onSso("saml")}
              disabled={isSubmitting}
              className="group flex h-11 w-full items-center justify-center gap-2.5 rounded-lg border border-slate-200 bg-white px-4 text-[14px] font-medium text-slate-800 transition-colors hover:border-slate-300 hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2277FF]/40 disabled:opacity-60"
            >
              <SsoLogo />
              Continue with SAML SSO
            </button>
          </div>

          {/* Divider */}
          <div className="my-7 flex items-center gap-3" aria-hidden>
            <span className="h-px flex-1 bg-slate-200" />
            <span className="text-[10.5px] font-semibold uppercase tracking-[0.2em] text-slate-400">or with email</span>
            <span className="h-px flex-1 bg-slate-200" />
          </div>

          {/* Credentials form */}
          <form onSubmit={onSubmit} noValidate className="grid gap-4">
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
                aria-invalid={!!error && !email.includes("@")}
                className="mt-1.5 h-11 w-full rounded-lg border border-slate-200 bg-white px-3.5 text-[14.5px] text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-[#2277FF] focus:ring-2 focus:ring-[#2277FF]/15"
              />
            </div>

            <div>
              <div className="flex items-center justify-between">
                <label htmlFor="password" className="text-[12.5px] font-semibold text-slate-700">
                  Password
                </label>
                <Link
                  href="/forgot-password"
                  className="text-[12px] font-semibold text-[#2277FF] hover:text-[#0056FF] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2277FF]/40 rounded"
                >
                  Forgot password?
                </Link>
              </div>
              <div className="relative mt-1.5">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  required
                  minLength={6}
                  aria-invalid={!!error && password.length === 0}
                  className="h-11 w-full rounded-lg border border-slate-200 bg-white pl-3.5 pr-11 text-[14.5px] text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-[#2277FF] focus:ring-2 focus:ring-[#2277FF]/15"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute inset-y-0 right-0 inline-flex w-11 items-center justify-center text-slate-400 transition-colors hover:text-slate-700 focus-visible:outline-none focus-visible:text-slate-900"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  aria-pressed={showPassword}
                  tabIndex={password ? 0 : -1}
                >
                  {showPassword ? <EyeOffIcon /> : <EyeIcon />}
                </button>
              </div>
            </div>

            <label className="-mt-1 inline-flex cursor-pointer items-center gap-2 text-[13px] text-slate-600 select-none">
              <input
                type="checkbox"
                className="h-4 w-4 rounded border-slate-300 text-[#2277FF] outline-none focus:ring-2 focus:ring-[#2277FF]/30"
                checked={remember}
                onChange={(e) => setRemember(e.target.checked)}
              />
              Keep me signed in for 30 days
            </label>

            {error ? (
              <div role="alert" className="-mt-1 rounded-md border border-rose-100 bg-rose-50 px-3 py-2 text-[12.5px] font-medium text-rose-700">
                {error}
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
                  Signing in…
                </>
              ) : (
                <>
                  Sign in to workspace
                  <ArrowRightIcon />
                </>
              )}
            </button>
          </form>

          <p className="mt-7 text-center text-[13px] text-slate-500">
            Don&apos;t have a workspace?{" "}
            <Link href="/signup" className="font-semibold text-[#2277FF] hover:text-[#0056FF]">
              Request access
            </Link>
            <span className="mx-2 text-slate-300" aria-hidden>·</span>
            <Link href="/admin/login" className="font-medium text-slate-500 hover:text-slate-800">
              Platform team login
            </Link>
          </p>
        </div>

        {/* Footer */}
        <footer className="mt-auto flex flex-col gap-3 border-t border-slate-100 pt-5 text-[11.5px] text-slate-500 sm:flex-row sm:items-center sm:justify-between">
          <ul className="flex flex-wrap items-center gap-x-3.5 gap-y-1">
            {TRUST_BADGES.map((b) => (
              <li key={b} className="inline-flex items-center gap-1.5">
                <CheckIcon className="text-emerald-500" />
                <span className="font-medium">{b}</span>
              </li>
            ))}
          </ul>
          <ul className="flex flex-wrap items-center gap-x-3.5 gap-y-1">
            <li>
              <Link href="#" className="hover:text-slate-700">Privacy</Link>
            </li>
            <li>
              <Link href="#" className="hover:text-slate-700">Terms</Link>
            </li>
            <li>
              <Link href="#" className="hover:text-slate-700">Status</Link>
            </li>
            <li className="text-slate-400">© {new Date().getFullYear()} Rivexaflow</li>
          </ul>
        </footer>
      </section>

      {/* ─── Brand pane (hidden < lg) ─── */}
      <aside className="relative hidden overflow-hidden lg:flex" aria-hidden>
        <div className="absolute inset-0 bg-gradient-to-br from-[#0b1432] via-[#121040] to-[#1f0f3f]" />
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(900px_540px_at_18%_18%,rgba(34,119,255,0.42),transparent_60%),radial-gradient(700px_440px_at_86%_82%,rgba(126,86,246,0.38),transparent_62%)]" />
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.16]"
          style={{
            backgroundImage: "radial-gradient(rgba(255,255,255,0.7) 1px, transparent 1px)",
            backgroundSize: "22px 22px",
            maskImage: "radial-gradient(circle at 50% 50%, black 0%, black 55%, transparent 78%)",
            WebkitMaskImage: "radial-gradient(circle at 50% 50%, black 0%, black 55%, transparent 78%)",
          }}
        />

        <div className="relative z-[1] flex w-full flex-col justify-between p-12 text-white xl:p-16">
          <div className="inline-flex items-center gap-2 self-start rounded-full border border-white/15 bg-white/[0.05] px-3 py-1.5 text-[10.5px] font-semibold uppercase tracking-[0.22em] text-white/85 backdrop-blur">
            <span className="inline-block h-1.5 w-1.5 animate-pulse rounded-full bg-[#7dd3fc] shadow-[0_0_10px_rgba(125,211,252,0.85)]" />
            Live · 99.99% uptime · 30+ countries
          </div>

          <div className="max-w-lg">
            <p className="text-[1.6rem] font-medium leading-[1.22] tracking-tight text-white xl:text-[1.85rem]">
              <span className="text-[#a5b4fc]">“</span>Rivexaflow standardized KYC, billing, and CRM into one governed surface — onboarding new entities now takes <span className="font-semibold text-white">11 days</span>, not 9 weeks.<span className="text-[#a5b4fc]">”</span>
            </p>
            <div className="mt-7 flex items-center gap-3.5">
              <span
                className="grid h-11 w-11 place-items-center rounded-full bg-gradient-to-br from-[#a5b4fc] to-[#c4b5fd] text-sm font-semibold text-[#0a0a14]"
              >
                AM
              </span>
              <div className="text-[13px] leading-tight">
                <p className="font-semibold text-white">Amelia Mensah</p>
                <p className="text-white/55">Chief Compliance Officer · Atlas Bank</p>
              </div>
            </div>
          </div>

          <div>
            <p className="text-[10.5px] font-semibold uppercase tracking-[0.22em] text-white/55">
              Enterprise-grade security
            </p>
            <ul className="mt-3 flex flex-wrap items-center gap-2">
              {REGION_BADGES.map((b) => (
                <li
                  key={b}
                  className="inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-white/[0.06] px-3 py-1 text-[11.5px] font-medium text-white/85 backdrop-blur"
                >
                  <span className="inline-block h-1.5 w-1.5 rounded-full bg-[#7dd3fc]" />
                  {b}
                </li>
              ))}
            </ul>
            <p className="mt-6 text-[12.5px] text-white/55">
              EU · UK · IN · US · APAC data residency · DPA / SCCs available on request.
            </p>
          </div>
        </div>
      </aside>
    </main>
  );
}
