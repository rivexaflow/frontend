"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

import { LoginBrandPanel } from "@/components/auth/login-brand-panel";
import { authStore } from "@/stores/auth.store";
import { workspaceStore } from "@/stores/workspace.store";
import { superAdminLoginUser } from "@/lib/api/auth";
import { loginSchema } from "@/schemas/auth.schema";
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

export default function PlatformLoginPage() {
  const router = useRouter();
  const setSession = authStore((s) => s.setSession);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const onSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setError(null);

    const parsed = loginSchema.safeParse({ email, password });
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? "Please check your credentials.");
      return;
    }

    setIsSubmitting(true);
    try {
      workspaceStore.getState().clearWorkspace();
      const result = await superAdminLoginUser(parsed.data);

      if (result.user.role !== "SUPER_ADMIN") {
        setError("This portal is restricted to platform operators with SUPER_ADMIN access.");
        return;
      }

      setSession({
        token: result.token,
        remember,
        user: {
          id: result.user.id,
          name: result.user.name,
          email: result.user.email,
          role: result.user.role,
        },
      });

      router.push("/super-admin");
    } catch (err) {
      setError(err instanceof Error ? err.message : "We couldn't sign you in. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

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
            href="/login"
            prefetch={false}
            className="text-xs font-medium text-slate-500 transition-colors hover:text-slate-900"
          >
            Workspace login
          </Link>
        </header>

        <div className="mx-auto w-full max-w-[28rem] flex-1 py-10 sm:py-14 lg:py-16">
          <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-[#2277FF]">Platform control</p>
          <h1 className="mt-1.5 text-[1.85rem] font-semibold leading-[1.1] tracking-tight text-slate-900 sm:text-[2.05rem]">
            Super admin sign in
          </h1>
          <p className="mt-2 text-[15px] leading-relaxed text-slate-500">
            Govern users, companies, AI models, and workflows. Authorized operators only.
          </p>

          <form onSubmit={onSubmit} noValidate className="mt-8 grid gap-4">
            <div>
              <label htmlFor="admin-email" className="text-[12.5px] font-semibold text-slate-700">
                Operator email
              </label>
              <input
                id="admin-email"
                type="email"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="ops@rivexaflow.com"
                required
                className="mt-1.5 h-11 w-full rounded-lg border border-slate-200 bg-white px-3.5 text-[14.5px] text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-[#2277FF] focus:ring-2 focus:ring-[#2277FF]/15"
              />
            </div>

            <div>
              <label htmlFor="admin-password" className="text-[12.5px] font-semibold text-slate-700">
                Password
              </label>
              <div className="relative mt-1.5">
                <input
                  id="admin-password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  required
                  minLength={6}
                  className="h-11 w-full rounded-lg border border-slate-200 bg-white pl-3.5 pr-11 text-[14.5px] text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-[#2277FF] focus:ring-2 focus:ring-[#2277FF]/15"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute inset-y-0 right-0 inline-flex w-11 items-center justify-center text-slate-400 transition-colors hover:text-slate-700"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOffIcon /> : <EyeIcon />}
                </button>
              </div>
            </div>

            <label className="inline-flex items-center gap-2 text-[13px] text-slate-600">
              <input
                type="checkbox"
                checked={remember}
                onChange={(e) => setRemember(e.target.checked)}
                className="h-4 w-4 rounded border-slate-300 text-[#2277FF]"
              />
              Keep me signed in for 30 days
            </label>

            {error ? (
              <div
                role="alert"
                className="rounded-lg border border-rose-100 bg-rose-50 px-3.5 py-2.5 text-[12.5px] font-medium text-rose-700"
              >
                {error}
              </div>
            ) : null}

            <button
              type="submit"
              disabled={isSubmitting}
              className={cn(
                "mt-1 flex h-11 w-full items-center justify-center gap-2 rounded-lg bg-[#191970] text-[14.5px] font-semibold text-white transition hover:bg-[#050a1f] disabled:opacity-70",
              )}
            >
              {isSubmitting ? "Signing in…" : "Sign in to platform"}
              {!isSubmitting ? <ArrowRightIcon /> : null}
            </button>
          </form>

          <p className="mt-7 text-center text-[13px] text-slate-500">
            Not a platform operator?{" "}
            <Link href="/login" prefetch={false} className="font-semibold text-[#2277FF] hover:text-[#0056FF]">
              Workspace sign in
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
