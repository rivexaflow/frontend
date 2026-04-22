"use client";

import Link from "next/link";
import { FormEvent } from "react";
import { useRouter } from "next/navigation";
import { authStore } from "@/stores/auth.store";
import { workspaceStore } from "@/stores/workspace.store";
import { encodeDemoJwt } from "@/lib/auth/session";

export default function PlatformLoginPage() {
  const router = useRouter();
  const setSession = authStore((s) => s.setSession);

  const onSubmit = (event: FormEvent) => {
    event.preventDefault();
    workspaceStore.getState().clearWorkspace();
    const token = encodeDemoJwt({ sub: "sa_1", role: "SUPER_ADMIN" });
    setSession({
      token,
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
    <main className="mx-auto flex min-h-[70vh] w-full max-w-md items-center px-4">
      <form
        onSubmit={onSubmit}
        className="w-full space-y-4 rounded-xl border border-[var(--rvx-midnight)]/20 bg-[var(--rvx-white)] p-6 shadow-sm"
      >
        <h1 className="text-xl font-semibold text-[var(--rvx-azure)]">Platform login</h1>
        <p className="text-sm text-[var(--rvx-midnight)]/70">Rivexaflow operators only.</p>
        <button className="w-full rounded-md bg-[var(--rvx-royal)] py-2 text-sm font-semibold text-[var(--rvx-white)] hover:bg-[var(--rvx-azure)]">
          Continue as platform admin
        </button>
        <Link href="/login" className="block text-center text-xs text-[var(--rvx-midnight)] underline">
          Back to workspace login
        </Link>
      </form>
    </main>
  );
}
