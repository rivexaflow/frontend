"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { CurrentUser, Role } from "@/types/auth";
import { clearSessionCookie, setSessionCookie } from "@/lib/auth/session";

type AuthState = {
  user: CurrentUser | null;
  token: string | null;
  role: Role | null;
  setSession: (payload: { user: CurrentUser; token: string }) => void;
  logout: () => void;
};

export const authStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      role: null,
      setSession: ({ user, token }) => {
        setSessionCookie(token);
        set({ user, role: user.role, token });
      },
      logout: () => {
        clearSessionCookie();
        set({ user: null, role: null, token: null });
      }
    }),
    { name: "rvx-auth" }
  )
);
