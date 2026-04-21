"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { CurrentUser, Role } from "@/lib/types";

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
      setSession: ({ user, token }) => set({ user, role: user.role, token }),
      logout: () => set({ user: null, role: null, token: null })
    }),
    {
      name: "rvx-auth"
    }
  )
);
