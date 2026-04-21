"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { authStore } from "@/stores/auth-store";
import type { Role } from "@/lib/types";

const roleToRoute: Record<Role, string> = {
  SUPER_ADMIN: "/super-admin",
  ADMIN: "/dashboard",
  USER: "/agent"
};

export default function LoginPage() {
  const router = useRouter();
  const setSession = authStore((s) => s.setSession);
  const [role, setRole] = useState<"ADMIN" | "USER">("ADMIN");

  const onSubmit = (event: FormEvent) => {
    event.preventDefault();
    setSession({
      token: "workspace.demo.token",
      user: {
        id: "u_1",
        name: "Demo User",
        email: "demo@rivexaflow.com",
        role,
        workspaceId: "ws_1"
      }
    });
    router.push(roleToRoute[role]);
  };

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-md items-center px-4">
      <form
        onSubmit={onSubmit}
        className="w-full space-y-4 rounded-xl border border-[var(--rvx-midnight)]/20 bg-[var(--rvx-white)] p-6 shadow-sm"
      >
        <h1 className="text-xl font-semibold text-[var(--rvx-azure)]">Workspace Login</h1>
        <p className="text-sm text-[var(--rvx-midnight)]/70">
          This login is for Workspace Admin and Agent users. Super Admins should use `/admin/login`.
        </p>
        <select
          value={role}
          onChange={(e) => setRole(e.target.value as "ADMIN" | "USER")}
          className="w-full rounded-md border border-[var(--rvx-midnight)]/20 bg-[var(--rvx-white)] p-2 text-[var(--rvx-black)]"
        >
          <option value="ADMIN">Admin</option>
          <option value="USER">Agent</option>
        </select>
        <button className="w-full rounded-md bg-[var(--rvx-royal)] py-2 text-sm font-medium hover:bg-[var(--rvx-azure)]">
          Continue
        </button>
        <a href="/admin/login" className="block text-center text-xs text-[var(--rvx-midnight)] underline">
          Go to Super Admin Login
        </a>
      </form>
    </main>
  );
}
