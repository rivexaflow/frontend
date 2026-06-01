"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

import { authStore } from "@/stores/auth.store";
import { workspaceStore } from "@/stores/workspace.store";
import { loginUser } from "@/lib/api/auth";
import { loginSchema } from "@/schemas/auth.schema";
import { cn } from "@/lib/utils";

const TRUST_BADGES = ["SOC 2 Type II", "ISO 27001", "GDPR Ready"] as const;

function ShieldIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden xmlns="http://www.w3.org/2000/svg">
      <path
        d="M12 3 4 6v6c0 5 3.4 9.7 8 11 4.6-1.3 8-6 8-11V6l-8-3Z"
        stroke="#4338ca"
        strokeWidth="1.6"
        strokeLinejoin="round"
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
      />
      <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="1.6" />
    </svg>
  );
}

function EyeOffIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="m3 3 18 18M10.584 10.587a2 2 0 0 0 2.828 2.83M6.61 6.61C4.62 7.91 3.106 9.83 2.036 11.677a10.477 10.477 0 0 0 12 19c1.637 0 3.176-.376 4.523-1.05"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
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
      const result = await loginUser(parsed.data);

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
    <main className="grid min-h-screen w-full grid-cols-1 bg-white lg:grid-cols-[minmax(0,1.05fr)_minmax(0,1fr)]">
      <section className="relative flex min-h-screen flex-col bg-white px-5 pb-10 pt-6 sm:px-10 lg:px-14 lg:pt-8 xl:px-20">
        <header className="flex items-center justify-between">
          <Link href="/" className="inline-flex items-center gap-2.5">
            <span className="grid h-9 w-9 place-items-center rounded-lg bg-gradient-to-br from-[#191970] to-[#4338ca] text-sm font-bold text-white shadow-sm">
              R
            </span>
            <span className="text-[1.05rem] font-semibold tracking-tight text-slate-900">Rivexaflow</span>
          </Link>
          <Link href="/login" prefetch={false} className="text-xs font-medium text-slate-500 hover:text-slate-900">
            Workspace login
          </Link>
        </header>

        <div className="mx-auto w-full max-w-[28rem] flex-1 py-10 sm:py-14 lg:py-16">
          <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-[#4338ca]">Platform control</p>
          <h1 className="mt-1.5 text-[1.85rem] font-semibold leading-[1.1] tracking-tight text-slate-900 sm:text-[2.05rem]">
            Super admin sign in
          </h1>
          <p className="mt-2 text-[15px] leading-relaxed text-slate-500">
            Full platform governance — users, companies, AI models, and workflows. Authorized operators only.
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
                className="mt-1.5 h-11 w-full rounded-lg border border-slate-200 px-3.5 text-[14.5px] outline-none focus:border-[#4338ca] focus:ring-2 focus:ring-[#4338ca]/15"
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
                  required
                  minLength={6}
                  className="h-11 w-full rounded-lg border border-slate-200 pl-3.5 pr-11 text-[14.5px] outline-none focus:border-[#4338ca] focus:ring-2 focus:ring-[#4338ca]/15"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute inset-y-0 right-0 inline-flex w-11 items-center justify-center text-slate-400 hover:text-slate-700"
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
                className="h-4 w-4 rounded border-slate-300 text-[#4338ca]"
              />
              Keep me signed in
            </label>

            {error ? (
              <div role="alert" className="rounded-md border border-rose-100 bg-rose-50 px-3 py-2 text-[12.5px] font-medium text-rose-700">
                {error}
              </div>
            ) : null}

            <button
              type="submit"
              disabled={isSubmitting}
              className={cn(
                "mt-1 h-11 w-full rounded-lg bg-[#191970] text-[14.5px] font-semibold text-white transition hover:bg-[#0f0f4d] disabled:opacity-70",
              )}
            >
              {isSubmitting ? "Signing in…" : "Sign in to platform"}
            </button>
          </form>

          <p className="mt-7 text-center text-[13px] text-slate-500">
            Not a platform operator?{" "}
            <Link href="/login" prefetch={false} className="font-semibold text-[#2277FF] hover:text-[#0056FF]">
              Workspace sign in
            </Link>
          </p>
        </div>

        <footer className="mt-auto flex flex-wrap gap-3 border-t border-slate-100 pt-5 text-[11.5px] text-slate-500">
          {TRUST_BADGES.map((b) => (
            <span key={b} className="font-medium">
              {b}
            </span>
          ))}
        </footer>
      </section>

      <aside className="relative hidden overflow-hidden lg:flex" aria-hidden>
        <div className="absolute inset-0 bg-gradient-to-br from-[#0a0e2c] via-[#121040] to-[#1a0a3a]" />
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(900px_540px_at_18%_18%,rgba(67,56,202,0.45),transparent_60%)]" />
        <div className="relative z-[1] flex w-full flex-col justify-between p-12 text-white xl:p-16">
          <div className="inline-flex items-center gap-2 self-start rounded-full border border-white/15 bg-white/5 px-3 py-1.5 text-[10.5px] font-semibold uppercase tracking-[0.22em]">
            <ShieldIcon />
            SUPER_ADMIN · Full platform control
          </div>
          <div className="max-w-lg">
            <p className="text-[1.55rem] font-medium leading-snug tracking-tight">
              Govern users, companies, AI model keys, and workflows from a single international-grade command center.
            </p>
            <p className="mt-4 text-sm text-white/60">
              All actions are audited. API keys are encrypted at rest and never displayed in full after save.
            </p>
          </div>
          <p className="text-xs text-white/50">© {new Date().getFullYear()} Rivexaflow Platform</p>
        </div>
      </aside>
    </main>
  );
}
