"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import { authStore } from "@/stores/auth.store";

type HomeTarget = { href: string; label: string } | null;

export default function ForbiddenPage() {
  const [home, setHome] = useState<HomeTarget>(null);
  const [isAuthed, setIsAuthed] = useState(false);

  useEffect(() => {
    const apply = () => {
      const { user } = authStore.getState();
      if (!user) {
        setIsAuthed(false);
        setHome(null);
        return;
      }
      setIsAuthed(true);
      if (user.role === "SUPER_ADMIN") {
        setHome({ href: "/super-admin", label: "Go to platform admin" });
      } else if (user.workspaceSlug) {
        setHome({
          href: `/${user.workspaceSlug}/dashboard`,
          label: "Go to your dashboard",
        });
      } else {
        setHome(null);
      }
    };
    apply();
    const unsub = authStore.subscribe(apply);
    return () => unsub();
  }, []);

  return (
    <main className="grid min-h-screen w-full place-items-center bg-white px-6 py-16">
      <section className="w-full max-w-lg rounded-2xl border border-slate-100 bg-white p-8 shadow-[0_24px_60px_-30px_rgba(15,23,42,0.18)] sm:p-10">
        <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-[#2277FF]">403 · Restricted</p>
        <h1 className="mt-2 text-[1.75rem] font-semibold leading-[1.15] tracking-tight text-slate-900 sm:text-[2rem]">
          You don&apos;t have access to that area
        </h1>
        <p className="mt-3 text-[14.5px] leading-relaxed text-slate-500">
          Your current account doesn&apos;t have permission for the page you tried to open.
          You can return to your workspace, or sign in with a different account.
        </p>

        <div className="mt-7 flex flex-col gap-2.5 sm:flex-row">
          {home ? (
            <Link
              href={home.href}
              className="inline-flex h-11 flex-1 items-center justify-center rounded-lg bg-[#0a0e2c] px-5 text-[14px] font-semibold text-white shadow-[0_10px_24px_-12px_rgba(34,119,255,0.45)] transition hover:bg-[#101537] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2277FF]/40 focus-visible:ring-offset-2"
            >
              {home.label}
            </Link>
          ) : (
            <Link
              href="/login"
              className="inline-flex h-11 flex-1 items-center justify-center rounded-lg bg-[#0a0e2c] px-5 text-[14px] font-semibold text-white shadow-[0_10px_24px_-12px_rgba(34,119,255,0.45)] transition hover:bg-[#101537] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2277FF]/40 focus-visible:ring-offset-2"
            >
              Sign in
            </Link>
          )}

          <Link
            href="/"
            className="inline-flex h-11 flex-1 items-center justify-center rounded-lg border border-slate-200 bg-white px-5 text-[14px] font-semibold text-slate-800 transition hover:border-slate-300 hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2277FF]/30"
          >
            Back to homepage
          </Link>
        </div>

        {isAuthed ? (
          <p className="mt-6 text-[12.5px] text-slate-500">
            Using the wrong account?{" "}
            <Link
              href="/logout?next=/login"
              className="font-semibold text-[#2277FF] hover:text-[#0056FF]"
            >
              Sign out and switch accounts
            </Link>
          </p>
        ) : (
          <p className="mt-6 text-[12.5px] text-slate-500">
            Need help? Contact your workspace admin or{" "}
            <Link href="/contact" className="font-semibold text-[#2277FF] hover:text-[#0056FF]">
              reach our support team
            </Link>
            .
          </p>
        )}
      </section>
    </main>
  );
}
