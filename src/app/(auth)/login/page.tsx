"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { authStore } from "@/stores/auth.store";
import { workspaceStore } from "@/stores/workspace.store";
import { encodeDemoJwt } from "@/lib/auth/session";
import { postLoginPath } from "@/lib/auth/redirects";
import { appConfig } from "@/config/app";

export default function LoginPage() {
  const router = useRouter();
  const setSession = authStore((s) => s.setSession);
  const [role, setRole] = useState<"ADMIN" | "USER">("ADMIN");

  const onSubmit = (event: FormEvent) => {
    event.preventDefault();
    const slug = appConfig.defaultWorkspaceSlug;
    const token = encodeDemoJwt({
      sub: "u_1",
      role,
      workspaceId: "ws_1",
      workspaceSlug: slug
    });
    setSession({
      token,
      user: {
        id: "u_1",
        name: "Demo User",
        email: "demo@rivexaflow.com",
        role,
        workspaceId: "ws_1",
        workspaceSlug: slug
      }
    });
    workspaceStore.getState().setWorkspace({
      workspaceId: "ws_1",
      workspaceName: "Acme Corporation",
      workspaceSlug: slug,
      plan: "Growth"
    });
    router.push(postLoginPath(role, slug));
  };

  return (
    <main className="mx-auto flex min-h-[70vh] w-full max-w-md items-center px-4">
      <form
        onSubmit={onSubmit}
        className="w-full space-y-4 rounded-xl border border-[var(--rvx-midnight)]/20 bg-[var(--rvx-white)] p-6 shadow-sm"
      >
        <h1 className="text-xl font-semibold text-[var(--rvx-azure)]">Workspace login</h1>
        <p className="text-sm text-[var(--rvx-midnight)]/70">Organization admins and users sign in here.</p>
        <select
          value={role}
          onChange={(e) => setRole(e.target.value as "ADMIN" | "USER")}
          className="w-full rounded-md border border-[var(--rvx-midnight)]/20 bg-[var(--rvx-white)] p-2 text-sm text-[var(--rvx-black)]"
        >
          <option value="ADMIN">Organization admin</option>
          <option value="USER">User</option>
        </select>
        <button className="w-full rounded-md bg-[var(--rvx-royal)] py-2 text-sm font-semibold text-[var(--rvx-white)] hover:bg-[var(--rvx-azure)]">
          Continue
        </button>
        <Link href="/admin/login" className="block text-center text-xs text-[var(--rvx-midnight)] underline">
          Platform team login
        </Link>
      </form>
    </main>
  );
}
