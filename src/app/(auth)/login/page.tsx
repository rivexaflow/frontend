"use client";

import Link from "next/link";
import { FormEvent, Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

import { authStore } from "@/stores/auth.store";
import { syncWorkspaceContext } from "@/lib/workspace/company-context";
import { workspaceStore } from "@/stores/workspace.store";
import { clearSessionCookie } from "@/lib/auth/session";
import { appConfig } from "@/config/app";
import { loginUser, workspaceLoginUser } from "@/lib/api/auth";
import { onboardingApi } from "@/lib/api/onboarding";
import {
  mergeAuthWithOnboarding,
  resolveLoginDestination,
} from "@/lib/auth/post-auth-destination";
import { loginSchema } from "@/schemas/auth.schema";
import { LoginBrandPanel } from "@/components/auth/login-brand-panel";
import { cn } from "@/lib/utils";
import { apiClient } from "@/lib/api/client";

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

function isCustomDomain(hostname: string): boolean {
  const h = hostname.toLowerCase();
  if (h === "localhost" || h === "127.0.0.1") return false;
  if (h === "rivexaflow.com" || h === "rivexaflow.in") return false;
  if (h.endsWith(".rivexaflow.com") || h.endsWith(".rivexaflow.in")) return false;
  return true;
}

function hexToRgb(hex: string): string {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? `${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)}`
    : "34, 119, 255";
}

function darkenColor(hex: string, percent: number): string {
  let num = parseInt(hex.replace("#", ""), 16),
      amt = Math.round(2.55 * percent),
      r = (num >> 16) - amt,
      g = (num >> 8 & 0x00FF) - amt,
      b = (num & 0x0000FF) - amt;
  return "#" + (0x1000000 + (r < 0 ? 0 : r > 255 ? 255 : r) * 0x10000 + (g < 0 ? 0 : g > 255 ? 255 : g) * 0x100 + (b < 0 ? 0 : b > 255 ? 255 : b)).toString(16).slice(1);
}

function LoginPageFallback() {
  return (
    <main className="grid min-h-screen w-full place-items-center bg-white">
      <p className="text-sm text-slate-500">Loading sign in…</p>
    </main>
  );
}

type CompanyBranding = {
  id: string;
  name: string;
  slug: string;
  logo: string | null;
  brandName: string | null;
  themeConfig: Record<string, any> | null;
  modules?: string[];
};

function LoginPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const setSession = authStore((s) => s.setSession);
  const wantsSignout = searchParams.get("signout") === "1";
  const onboardingComplete = searchParams.get("onboarding") === "complete";
  const justRegistered = searchParams.get("registered") === "1";
  const companyParam = searchParams.get("companyId") || searchParams.get("company");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [signedOutNotice, setSignedOutNotice] = useState(false);

  // White-label states
  const [branding, setBranding] = useState<CompanyBranding | null>(null);
  const [isBrandingLoading, setIsBrandingLoading] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const [isBtnHovered, setIsBtnHovered] = useState(false);

  // Set mounted on client mount
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Fetch company branding if subdomain, custom domain, or query parameter is set
  useEffect(() => {
    if (typeof window === "undefined") return;
    const hostname = window.location.hostname;

    const shouldFetch = () => {
      if (companyParam) return true;
      const h = hostname.toLowerCase();
      if (h === "localhost" || h === "127.0.0.1") return false;
      if (h === "rivexaflow.com" || h === "www.rivexaflow.com") return false;
      if (h === "rivexaflow.in" || h === "www.rivexaflow.in") return false;
      return true;
    };

    if (shouldFetch()) {
      setIsBrandingLoading(true);
      apiClient.get("/company/public/branding", {
        params: companyParam ? { companyId: companyParam } : undefined
      })
        .then((res) => {
          if (res.data.success && res.data.data) {
            setBranding(res.data.data);
            if (res.data.data.themeConfig?.primaryColor) {
              const hex = res.data.data.themeConfig.primaryColor;
              document.documentElement.style.setProperty("--primary-color", hex);
              const rgb = hexToRgb(hex);
              if (rgb) {
                document.documentElement.style.setProperty("--primary-color-rgb", rgb);
              }
            }
          }
        })
        .catch((err) => {
          console.error("Failed to load branding info for login page:", err);
        })
        .finally(() => {
          setIsBrandingLoading(false);
        });
    }
  }, [companyParam]);

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
      const result = branding?.slug
        ? await workspaceLoginUser({ ...parsed.data, slug: branding.slug })
        : await loginUser(parsed.data);

      const fallbackSlug = appConfig.defaultWorkspaceSlug;
      const slug = result.user.workspaceSlug ?? fallbackSlug;

      let onboardingState = null;
      try {
        if (result.user.id) {
          onboardingState = await onboardingApi.getOnboardingState(result.user.id);
        }
      } catch {
        // Non-fatal: login still succeeds; dashboard uses auth profile data.
      }

      const { user: sessionUser } = mergeAuthWithOnboarding(result, onboardingState);

      setSession({
        token: result.token,
        remember,
        user: sessionUser,
      });

      const resolvedSlug = sessionUser.workspaceSlug ?? fallbackSlug;
      syncWorkspaceContext({
        token: result.token,
        workspaceId: sessionUser.workspaceId,
        workspaceSlug: resolvedSlug,
        workspaceName: (result.user as any).workspaceName ?? resolvedSlug ?? "Workspace",
        plan: (result.user as any).plan,
        logo: branding?.logo || (result.user as any).logo,
        brandName: branding?.brandName || (result.user as any).brandName,
        themeConfig: branding?.themeConfig || (result.user as any).themeConfig,
      });

      router.push(
        resolveLoginDestination(sessionUser, { redirectTo: result.redirectTo }),
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "We couldn't sign you in. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const primaryColor = branding?.themeConfig?.primaryColor || "#0a0e2c";
  const companyName = branding?.brandName || branding?.name || "Rivexaflow";

  const getModulesListString = () => {
    if (!branding?.modules || branding.modules.length === 0) {
      return "CRM, KYC, billing, and workflows";
    }

    const knownModulesMap: Record<string, string> = {
      crm: "CRM",
      crm_module: "CRM",
      kyc: "KYC",
      kyc_module: "KYC",
      hr: "HRM",
      hrm: "HRM",
      hrm_module: "HRM",
      billing: "billing",
      invoice: "billing",
      workflow: "workflows",
      workflows: "workflows",
      whatsapp: "WhatsApp",
      calling: "Calling Agent",
      ai: "AI Agents",
    };

    const formattedModules = new Set<string>();
    branding.modules.forEach((mod) => {
      const lower = mod.toLowerCase();
      if (knownModulesMap[lower]) {
        formattedModules.add(knownModulesMap[lower]);
      } else {
        if (mod.length > 2 && !["team", "ai"].includes(lower)) {
          formattedModules.add(mod);
        }
      }
    });

    const modulesArray = Array.from(formattedModules);
    if (modulesArray.length === 0) {
      return "CRM, KYC, billing, and workflows";
    }

    if (modulesArray.length === 1) {
      return modulesArray[0];
    }
    
    if (modulesArray.length === 2) {
      return `${modulesArray[0]} and ${modulesArray[1]}`;
    }

    const last = modulesArray.pop();
    return `${modulesArray.join(", ")}, and ${last}`;
  };

  if (!isMounted || isBrandingLoading) {
    return <LoginPageFallback />;
  }

  return (
    <main className="grid min-h-screen w-full grid-cols-1 bg-white font-sans lg:grid-cols-[minmax(0,1.05fr)_minmax(0,1fr)] xl:grid-cols-[minmax(0,1.18fr)_minmax(0,1fr)]">
      <section className="relative flex min-h-screen flex-col bg-white px-5 pb-10 pt-6 sm:px-10 lg:px-14 lg:pt-8 xl:px-20">
        <header className="flex items-center justify-between">
          <Link
            href="/"
            className="inline-flex items-center gap-2.5 rounded-md outline-none focus-visible:ring-2 focus-visible:ring-[#2277FF]/40"
          >
            {branding?.logo ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={branding.logo}
                alt={companyName}
                className="h-9 object-contain max-w-[200px]"
              />
            ) : (
              <>
                <span
                  className="grid h-9 w-9 place-items-center rounded-lg bg-gradient-to-br from-[#191970] to-[#2277FF] text-sm font-bold text-white shadow-sm"
                  style={{
                    background: branding?.themeConfig?.primaryColor
                      ? `linear-gradient(135deg, ${branding.themeConfig.primaryColor}, #2277ff)`
                      : undefined
                  }}
                  aria-hidden
                >
                  {companyName[0].toUpperCase()}
                </span>
                <span className="text-[1.05rem] font-semibold tracking-tight text-slate-900">
                  {companyName}
                </span>
              </>
            )}
          </Link>

          {!branding && (
            <Link
              href="/"
              className="hidden items-center gap-1.5 rounded-md px-2 py-1 text-xs font-medium text-slate-500 transition-colors hover:text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2277FF]/40 sm:inline-flex"
            >
              <BackArrowIcon /> Back to website
            </Link>
          )}
        </header>

        <div className="mx-auto w-full max-w-[28rem] flex-1 py-10 sm:py-14 lg:py-16">
          <p
            className="text-[11px] font-bold uppercase tracking-[0.22em] text-[#2277FF]"
            style={{ color: branding?.themeConfig?.primaryColor || undefined }}
          >
            Welcome back
          </p>
          <h1 className="mt-1.5 text-[1.85rem] font-semibold leading-[1.1] tracking-tight text-slate-900 sm:text-[2.05rem]">
            Sign in to your workspace
          </h1>
          <p className="mt-2 text-[15px] leading-relaxed text-slate-500">
            Access your {companyName} workspace — {getModulesListString()} in one place.
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
                <strong className="font-semibold">Account created.</strong> Sign in with the email and password you just chose.
              </span>
            </div>
          ) : null}

          {onboardingComplete ? (
            <div
              role="status"
              className="mt-5 flex items-start gap-2 rounded-lg border border-blue-200 bg-blue-50 px-3.5 py-2.5 text-[12.5px] text-blue-900"
            >
              <CheckIcon className="mt-0.5 text-blue-600" />
              <span>
                <strong className="font-semibold">Setup complete.</strong> Sign in to open your dashboard.
              </span>
            </div>
          ) : null}

          <form onSubmit={onSubmit} noValidate className="mt-8 grid gap-4">
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
                style={{
                  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                  // @ts-ignore
                  "--tw-focus-border": primaryColor,
                }}
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
                  style={{ color: branding?.themeConfig?.primaryColor || undefined }}
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
                style={{
                  accentColor: primaryColor,
                }}
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
              onMouseEnter={() => setIsBtnHovered(true)}
              onMouseLeave={() => setIsBtnHovered(false)}
              style={{
                backgroundColor: isBtnHovered ? darkenColor(primaryColor, 10) : primaryColor,
                boxShadow: branding?.themeConfig?.primaryColor
                  ? `0 10px 24px -12px rgba(${hexToRgb(branding.themeConfig.primaryColor)}, 0.55)`
                  : undefined
              }}
              className={cn(
                "mt-1 inline-flex h-11 w-full items-center justify-center gap-2 rounded-lg px-5 text-[14.5px] font-semibold text-white shadow-[0_10px_24px_-12px_rgba(34,119,255,0.55)] transition",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-70",
                !branding?.themeConfig?.primaryColor && "bg-[#0a0e2c] hover:bg-[#101537]"
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

          {!branding && (
            <p className="mt-7 text-center text-[13px] text-slate-500">
              New to Rivexaflow?{" "}
              <Link href="/signup" className="font-semibold text-[#2277FF] hover:text-[#0056FF]">
                Create an account
              </Link>
            </p>
          )}
        </div>

        <footer className="mt-auto flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-5 text-[11.5px] text-slate-500">
          <p className="text-slate-400">© {new Date().getFullYear()} {companyName}</p>
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

export default function LoginPage() {
  return (
    <Suspense fallback={<LoginPageFallback />}>
      <LoginPageContent />
    </Suspense>
  );
}
