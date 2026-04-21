"use client";

import { FormEvent } from "react";
import { useRouter } from "next/navigation";
import { authStore } from "@/stores/auth-store";

export default function SuperAdminLoginPage() {
  const router = useRouter();
  const setSession = authStore((s) => s.setSession);

  const onSubmit = (event: FormEvent) => {
    event.preventDefault();
    setSession({
      token: "superadmin.demo.token",
      user: {
        id: "sa_1",
        name: "Platform Operator",
        email: "ops@rivexaflow.com",
        role: "SUPER_ADMIN"
      }
    });
    router.push("/super-admin");
  };

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-md items-center bg-[var(--rvx-white)] px-4">
      <form
        onSubmit={onSubmit}
        className="w-full space-y-4 rounded-xl border border-[var(--rvx-midnight)]/20 bg-[var(--rvx-white)] p-6 shadow-sm"
      >
        <h1 className="text-xl font-semibold text-[var(--rvx-azure)]">Super Admin Login</h1>
        <p className="text-sm text-[var(--rvx-midnight)]/70">
          Platform-level authentication for Rivexaflow operations team.
        </p>
        <button className="w-full rounded-md bg-[var(--rvx-royal)] py-2 text-sm font-medium hover:bg-[var(--rvx-azure)]">
          Continue as Super Admin
        </button>
        <a href="/login" className="block text-center text-xs text-[var(--rvx-midnight)] underline">
          Go to Workspace Login
        </a>
      </form>
    </main>
  );
}
