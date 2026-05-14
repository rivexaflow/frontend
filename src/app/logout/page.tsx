"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";

import { authStore } from "@/stores/auth.store";
import { workspaceStore } from "@/stores/workspace.store";
import { clearSessionCookie } from "@/lib/auth/session";
import { logoutUser } from "@/lib/api/auth";

/**
 * Universal sign-out:
 *  1. Best-effort `POST /api/auth/logout` so the backend can invalidate the session.
 *  2. Clears Zustand auth + workspace state (and their persisted localStorage entries).
 *  3. Clears the access-token cookie.
 *  4. Redirects to `?next=` (defaults to `/login`).
 *
 * The server call is intentionally non-blocking — sign-out must succeed even
 * if the network is dead.
 */
export default function LogoutPage() {
  const router = useRouter();
  const params = useSearchParams();
  const next = params.get("next") || "/login";

  useEffect(() => {
    let cancelled = false;

    const finishLocalCleanup = () => {
      try {
        authStore.getState().logout();
        workspaceStore.getState().clearWorkspace();
        clearSessionCookie();
        if (typeof window !== "undefined") {
          window.localStorage.removeItem("rvx-auth");
          window.localStorage.removeItem("rvx-workspace");
        }
      } finally {
        if (!cancelled) router.replace(next);
      }
    };

    void logoutUser().finally(finishLocalCleanup);

    return () => {
      cancelled = true;
    };
  }, [next, router]);

  return (
    <main className="grid min-h-screen place-items-center bg-white px-6">
      <div className="text-center">
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#2277FF]">Signing you out</p>
        <p className="mt-2 text-sm text-slate-500">One moment…</p>
      </div>
    </main>
  );
}
