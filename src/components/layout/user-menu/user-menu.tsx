"use client";

import { authStore } from "@/stores/auth.store";
import { useRouter } from "next/navigation";

export function UserMenu() {
  const router = useRouter();
  const user = authStore((s) => s.user);
  const logout = authStore((s) => s.logout);

  return (
    <div className="flex items-center gap-2 rounded-md border border-[var(--rvx-midnight)]/15 bg-[var(--rvx-white)] px-3 py-1 text-xs text-[var(--rvx-midnight)]">
      <span className="max-w-[140px] truncate">{user?.email}</span>
      <button
        type="button"
        className="text-[var(--rvx-azure)] underline"
        onClick={() => {
          logout();
          router.push("/login");
        }}
      >
        Log out
      </button>
    </div>
  );
}
